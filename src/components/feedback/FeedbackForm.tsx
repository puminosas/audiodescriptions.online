import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { submitFeedback } from '@/utils/supabaseHelper';
import { useToast } from '@/hooks/use-toast';

type FeedbackType = 'suggestion' | 'bug' | 'other';

interface FeedbackFormProps {
  onSuccess?: () => void;
}

const FeedbackForm = ({ onSuccess }: FeedbackFormProps) => {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('suggestion');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      const result = await submitFeedback({
        user_id: user?.id || null,
        email: user?.email || email,
        type: feedbackType,
        message,
        status: 'new'
      });
      
      if (!result.success) {
        // Handle validation errors
        if (result.error?.details && Array.isArray(result.error.details)) {
          result.error.details.forEach(error => {
            toast({
              title: 'Validation Error',
              description: error,
              variant: 'destructive',
            });
          });
        } else {
          throw new Error(result.error?.message || 'Unknown error');
        }
        return;
      }
      
      toast({
        title: 'Feedback submitted',
        description: 'Thank you for your feedback. We appreciate your input!',
      });
      
      // Reset form
      setMessage('');
      setEmail('');
      setFeedbackType('suggestion');
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: error instanceof Error 
          ? `Failed to submit feedback: ${error.message}` 
          : 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="feedbackType">Feedback Type</Label>
        <Select 
          value={feedbackType} 
          onValueChange={(value) => setFeedbackType(value as FeedbackType)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type of feedback" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="suggestion">Suggestion</SelectItem>
            <SelectItem value="bug">Bug Report</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {!user && (
        <div>
          <Label htmlFor="email">Email (optional)</Label>
          <Input
            id="email"
            type="email"
            placeholder="Your email for follow-up"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      )}
      
      <div>
        <Label htmlFor="message">Your Feedback</Label>
        <Textarea
          id="message"
          placeholder="Please share your thoughts, suggestions, or report an issue..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          required
        />
      </div>
      
      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Submit Feedback
          </>
        )}
      </Button>
    </form>
  );
};

export default FeedbackForm;

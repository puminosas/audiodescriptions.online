import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Send } from 'lucide-react';
import { z } from 'zod';

// Define the feedback schema for validation
const feedbackSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  rating: z.number().min(1).max(5),
});

type FeedbackData = z.infer<typeof feedbackSchema>;

const FeedbackForm: React.FC = () => {
  const [formData, setFormData] = useState<Partial<FeedbackData>>({
    name: '',
    email: '',
    message: '',
    rating: 0,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FeedbackData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Reset status message after 5 seconds
  useEffect(() => {
    if (submitStatus !== 'idle') {
      const timer = setTimeout(() => {
        setSubmitStatus('idle');
        setStatusMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof FeedbackData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleRatingClick = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
    
    // Clear error for rating when user selects a rating
    if (errors.rating) {
      setErrors((prev) => ({ ...prev, rating: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      // Add default rating if not provided
      const dataToValidate = {
        ...formData,
        rating: formData.rating || 1,
      };
      
      feedbackSchema.parse(dataToValidate);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof FeedbackData, string>> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof FeedbackData;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setStatusMessage('');
    
    try {
      // Add retry logic with exponential backoff
      const maxRetries = 3;
      let retryCount = 0;
      let success = false;
      
      while (retryCount < maxRetries && !success) {
        try {
          const response = await fetch('/api/feedback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to submit feedback');
          }
          
          success = true;
        } catch (error) {
          retryCount++;
          if (retryCount >= maxRetries) {
            throw error;
          }
          
          // Exponential backoff: wait 2^retryCount * 1000 ms before retrying
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
      }
      
      // Reset form on success
      setFormData({
        name: '',
        email: '',
        message: '',
        rating: 0,
      });
      setSubmitStatus('success');
      setStatusMessage('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Feedback</h2>
          <p className="text-muted-foreground">
            We value your feedback! Please let us know what you think about our service.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Your name"
              value={formData.name || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />
            {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Your email address"
              value={formData.email || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />
            {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Your feedback message..."
              value={formData.message || ''}
              onChange={handleChange}
              className="min-h-[120px]"
            />
            {errors.message && <p className="text-destructive text-sm mt-1">{errors.message}</p>}
          </div>

          <div>
            <Label>Rating</Label>
            <div className="flex items-center space-x-2 mt-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  type="button"
                  variant={formData.rating === rating ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRatingClick(rating)}
                  className="w-10 h-10"
                >
                  {rating}
                </Button>
              ))}
            </div>
            {errors.rating && <p className="text-destructive text-sm mt-1">{errors.rating}</p>}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
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

          {submitStatus === 'success' && (
            <div className="p-3 bg-green-100 text-green-800 rounded-md">
              {statusMessage}
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md">
              {statusMessage}
            </div>
          )}
        </form>
      </div>
    </Card>
  );
};

export default FeedbackForm;

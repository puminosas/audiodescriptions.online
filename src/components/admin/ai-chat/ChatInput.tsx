import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Paperclip, Mic } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isMobile?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading,
  isMobile = false
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    onSendMessage(input);
    setInput('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="relative flex-1">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className={`flex-1 resize-none pr-10 ${isMobile ? 'min-h-[50px] text-sm p-2' : 'min-h-[60px]'}`}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        {!isMobile && (
          <div className="absolute right-2 bottom-2 text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for new line
          </div>
        )}
      </div>
      <div className={`flex ${isMobile ? 'gap-1' : 'gap-2'}`}>
        <Button 
          type="submit" 
          size={isMobile ? "sm" : "icon"}
          disabled={isLoading || !input.trim()}
          className={isMobile ? "h-9 w-9 p-0" : ""}
        >
          {isLoading ? (
            <Loader2 className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} animate-spin`} />
          ) : (
            <Send className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
          )}
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;

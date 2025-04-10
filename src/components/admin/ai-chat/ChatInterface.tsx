import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Send } from 'lucide-react';
import { Message } from '../types';
import ChatMessages from './ChatMessages';

interface ChatInterfaceProps {
  messages: Message[];
  isTyping: boolean;
  chatError: string | null;
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  sendMessage: (message: string) => void;
  retryLastMessage: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isTyping,
  chatError,
  isLoading,
  messagesEndRef,
  sendMessage,
  retryLastMessage
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Chat with AI Assistant</h2>
        <p className="text-sm text-muted-foreground">
          Ask questions about your project or get help with code
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <ChatMessages 
          messages={messages} 
          isTyping={isTyping} 
        />
        
        {chatError && (
          <div className="p-3 my-2 bg-destructive/10 text-destructive rounded-md flex items-center justify-between">
            <span>{chatError}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={retryLastMessage}
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-1" /> Retry
            </Button>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex items-end gap-2">
          <Textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 min-h-[80px] max-h-[200px]"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={!inputValue.trim() || isLoading}
            className="h-10"
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ChatInterface;

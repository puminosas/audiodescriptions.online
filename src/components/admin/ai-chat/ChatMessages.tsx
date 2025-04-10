import React from 'react';
import { Message } from '../types';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';

interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isTyping }) => {
  return (
    <div className="space-y-4">
      {messages.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No messages yet. Start a conversation!</p>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex items-start gap-3 rounded-lg p-3",
              message.role === 'user' ? "bg-muted/50" : "bg-background"
            )}
          >
            <Avatar className={cn(
              "h-8 w-8 rounded-full",
              message.role === 'user' ? "bg-primary" : "bg-secondary"
            )}>
              {message.role === 'user' ? (
                <User className="h-4 w-4 text-primary-foreground" />
              ) : (
                <Bot className="h-4 w-4 text-secondary-foreground" />
              )}
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">
                {message.role === 'user' ? 'You' : 'AI Assistant'}
              </p>
              <div className="prose prose-sm max-w-none">
                {message.content.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < message.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        ))
      )}
      
      {isTyping && (
        <div className="flex items-start gap-3 rounded-lg p-3 bg-background">
          <Avatar className="h-8 w-8 rounded-full bg-secondary">
            <Bot className="h-4 w-4 text-secondary-foreground" />
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">AI Assistant</p>
            <div className="mt-1">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;

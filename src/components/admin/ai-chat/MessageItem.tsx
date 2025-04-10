import React from 'react';
import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MessageItemProps {
  message: {
    role: string;
    content: string;
    id?: string;
  };
  isMobile?: boolean;
  isLastMessage?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  isMobile = false,
  isLastMessage = false 
}) => {
  const isUser = message.role === 'user';
  
  return (
    <div
      className={cn(
        "flex gap-2 md:gap-3 p-2 md:p-3 rounded-lg transition-colors",
        isUser ? "bg-primary/10" : "bg-muted",
        isLastMessage && "animate-in fade-in"
      )}
    >
      <div className="flex-shrink-0">
        <div className={cn(
          "w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary"
        )}>
          {isUser ? (
            <User className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
          ) : (
            <Bot className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm md:text-base">
          {isUser ? 'You' : 'AI Assistant'}
        </div>
        <div className="whitespace-pre-wrap text-xs md:text-sm mt-1 prose-sm max-w-full break-words">
          {isUser ? (
            message.content
          ) : (
            <ReactMarkdown
              components={{
                pre: ({ node, ...props }) => (
                  <div className="overflow-auto my-2 bg-background/80 p-2 rounded-md border">
                    <pre {...props} />
                  </div>
                ),
                code: ({ node, inline, ...props }) => (
                  inline ? 
                  <code className="bg-background/80 px-1 py-0.5 rounded text-xs" {...props} /> :
                  <code {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="mb-2" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc pl-4 mb-2" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal pl-4 mb-2" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="mb-1" {...props} />
                ),
                a: ({ node, ...props }) => (
                  <a className="text-primary underline" target="_blank" rel="noopener noreferrer" {...props} />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;

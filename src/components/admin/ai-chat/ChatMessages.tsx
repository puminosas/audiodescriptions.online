import React, { useRef, useEffect } from 'react';
import MessageItem from './MessageItem';
import EmptyChat from './EmptyChat';
import TypingIndicator from './TypingIndicator';

interface ChatMessagesProps {
  messages: any[];
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  isMobile?: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  isTyping, 
  messagesEndRef,
  isMobile = false
}) => {
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`space-y-${isMobile ? '3' : '4'}`}>
      {messages.length === 0 ? (
        <EmptyChat />
      ) : (
        messages.map((message, index) => (
          <MessageItem 
            key={message.id || index}
            message={message}
            isMobile={isMobile}
            isLastMessage={index === messages.length - 1}
          />
        ))
      )}
      {isTyping && <TypingIndicator />}
      <div ref={messagesEndRef} className="h-4" />
    </div>
  );
};

export default ChatMessages;

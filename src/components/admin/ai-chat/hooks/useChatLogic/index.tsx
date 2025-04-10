import React from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Message } from '../types';
import { useToast } from '@/hooks/use-toast';

interface UseChatLogicProps {
  initialMessages?: Message[];
  onSendMessage?: (message: string) => void;
}

export const useChatLogic = ({ initialMessages = [], onSendMessage }: UseChatLogicProps = {}) => {
  const [messages, setMessages] = React.useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = React.useState(false);
  const [chatError, setChatError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Scroll to bottom when messages change
  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (message: string) => {
    if (isLoading || !message.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = { 
      role: 'user', 
      content: message, 
      id: Date.now().toString(),
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    setIsLoading(true);
    setIsTyping(true);
    setChatError(null);
    
    try {
      // If external handler is provided, use it
      if (onSendMessage) {
        onSendMessage(message);
        return;
      }
      
      // Otherwise, handle internally with simulated response
      // In a real implementation, this would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add AI response
      const aiResponse: Message = { 
        role: 'assistant', 
        content: `I'll help you with that. Let me analyze the information about "${message}".`, 
        id: (Date.now() + 1).toString(),
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      setChatError('Failed to get response. Please try again.');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again."
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const retryLastMessage = async () => {
    // Find the last user message
    const lastUserMessageIndex = [...messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserMessageIndex === -1) return;
    
    const lastUserMessage = messages[messages.length - 1 - lastUserMessageIndex];
    
    // Remove all messages after the last user message
    setMessages(messages.slice(0, messages.length - lastUserMessageIndex));
    
    // Resend the last user message
    await sendMessage(lastUserMessage.content);
  };

  const clearChat = () => {
    setMessages([]);
    setChatError(null);
  };

  const addSystemMessage = (content: string) => {
    const systemMessage: Message = {
      role: 'system',
      content,
      id: Date.now().toString(),
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  return {
    messages,
    isTyping,
    chatError,
    isLoading,
    inputValue,
    messagesEndRef,
    isMobile,
    sendMessage,
    retryLastMessage,
    clearChat,
    addSystemMessage,
    setInputValue,
    setChatError
  };
};

export default useChatLogic;

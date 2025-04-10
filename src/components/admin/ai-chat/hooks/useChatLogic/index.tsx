import React, { useEffect, useState } from 'react';
import { Message } from '../../types';
import { useToast } from '@/hooks/use-toast';
import { useMediaQuery } from '@/hooks/use-media-query';
import { env } from '@/utils/env';

interface UseChatLogicProps {
  initialMessages?: Message[];
  onSendMessage?: (message: string) => void;
}

export const useChatLogic = ({ initialMessages = [], onSendMessage }: UseChatLogicProps = {}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
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
      
      // Call the AI chat API endpoint
      const response = await fetch(`${env.SUPABASE_URL}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ 
          message,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add AI response
      const aiResponse: Message = { 
        role: 'assistant', 
        content: data.response || "I'm sorry, I couldn't process that request.", 
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

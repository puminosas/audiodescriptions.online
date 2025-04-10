import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useChatLogic } from '../src/components/admin/ai-chat/hooks/useChatLogic';
import { useToast } from '@/hooks/use-toast';

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn().mockReturnValue({
    toast: jest.fn()
  })
}));

// Mock setTimeout
jest.useFakeTimers();

describe('useChatLogic Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializes with empty messages', () => {
    const TestComponent = () => {
      const { messages } = useChatLogic();
      return (
        <div>
          <div data-testid="messages-count">{messages.length}</div>
        </div>
      );
    };

    render(<TestComponent />);
    
    // Initially, messages should be empty
    expect(screen.getByTestId('messages-count').textContent).toBe('0');
  });

  test('adds user message and AI response when sending a message', async () => {
    const TestComponent = () => {
      const { messages, sendMessage, isLoading, isTyping } = useChatLogic();
      
      return (
        <div>
          <button onClick={() => sendMessage('Hello AI')}>
            Send Message
          </button>
          <div data-testid="messages-count">{messages.length}</div>
          {messages.map((msg, i) => (
            <div key={i} data-testid={`message-${i}`}>
              {msg.role}: {msg.content}
            </div>
          ))}
          {isLoading && <div data-testid="loading">Loading...</div>}
          {isTyping && <div data-testid="typing">AI is typing...</div>}
        </div>
      );
    };

    render(<TestComponent />);
    
    // Send a message
    fireEvent.click(screen.getByText('Send Message'));
    
    // Should show loading and typing states
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByTestId('typing')).toBeInTheDocument();
    
    // Should add user message immediately
    expect(screen.getByTestId('messages-count').textContent).toBe('1');
    expect(screen.getByTestId('message-0').textContent).toContain('user: Hello AI');
    
    // Fast-forward timers
    jest.runAllTimers();
    
    // Should add AI response after delay
    await waitFor(() => {
      expect(screen.getByTestId('messages-count').textContent).toBe('2');
      expect(screen.getByTestId('message-1').textContent).toContain('assistant:');
    });
    
    // Loading and typing states should be cleared
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('typing')).not.toBeInTheDocument();
  });

  test('handles retry functionality correctly', async () => {
    const TestComponent = () => {
      const { messages, sendMessage, retryLastMessage, chatError, setChatError } = useChatLogic();
      
      return (
        <div>
          <button onClick={() => sendMessage('Hello AI')}>
            Send Message
          </button>
          <button onClick={() => setChatError('Error occurred')}>
            Set Error
          </button>
          <button onClick={retryLastMessage}>
            Retry
          </button>
          <div data-testid="messages-count">{messages.length}</div>
          {messages.map((msg, i) => (
            <div key={i} data-testid={`message-${i}`}>
              {msg.role}: {msg.content}
            </div>
          ))}
          {chatError && <div data-testid="error">{chatError}</div>}
        </div>
      );
    };

    render(<TestComponent />);
    
    // Send a message
    fireEvent.click(screen.getByText('Send Message'));
    
    // Fast-forward timers
    jest.runAllTimers();
    
    // Set an error
    fireEvent.click(screen.getByText('Set Error'));
    expect(screen.getByTestId('error')).toBeInTheDocument();
    
    // Retry the message
    fireEvent.click(screen.getByText('Retry'));
    
    // Error should be cleared
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
    
    // Fast-forward timers again
    jest.runAllTimers();
    
    // Should have 3 messages now (original user + AI, then retry user)
    await waitFor(() => {
      expect(screen.getByTestId('messages-count').textContent).toBe('3');
    });
  });
});

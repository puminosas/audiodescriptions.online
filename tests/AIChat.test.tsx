import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AIChat from '../src/components/admin/ai-chat/AIChat';

// Mock the hooks
jest.mock('../src/hooks/use-media-query', () => ({
  useMediaQuery: jest.fn().mockReturnValue(false) // Default to desktop view
}));

jest.mock('../src/components/admin/ai-chat/hooks/useChatLogic', () => ({
  useChatLogic: jest.fn().mockReturnValue({
    messages: [],
    isTyping: false,
    chatError: null,
    isLoading: false,
    messagesEndRef: { current: null },
    sendMessage: jest.fn(),
    retryLastMessage: jest.fn(),
    clearChat: jest.fn(),
    addSystemMessage: jest.fn()
  })
}));

jest.mock('../src/components/admin/ai-chat/hooks/useFileLogic', () => ({
  useFileLogic: jest.fn().mockReturnValue({
    files: [],
    selectedFile: null,
    fileContent: '',
    isLoadingContent: false,
    fileError: null,
    isEditing: false,
    fetchFiles: jest.fn(),
    handleFileSelect: jest.fn(),
    handleSaveFile: jest.fn(),
    setFileContent: jest.fn(),
    setIsEditing: jest.fn(),
    setFileError: jest.fn()
  })
}));

describe('AIChat Component', () => {
  test('renders the AI Chat component', () => {
    render(
      <BrowserRouter>
        <AIChat />
      </BrowserRouter>
    );
    
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
  });
  
  // Add more tests as needed
});

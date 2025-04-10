import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FileExplorer from '../src/components/admin/ai-chat/FileExplorer';
import { useMediaQuery } from '@/hooks/use-media-query';

// Mock the hooks
jest.mock('../src/hooks/use-media-query', () => ({
  useMediaQuery: jest.fn()
}));

describe('FileExplorer Component', () => {
  const mockProps = {
    selectedFile: '/src/App.tsx',
    fileContent: 'const App = () => { return <div>Hello</div> }',
    isLoadingContent: false,
    fileError: null,
    handleFileSelect: jest.fn(),
    setFileContent: jest.fn(),
    setIsEditing: jest.fn(),
    handleSaveFile: jest.fn(),
    handleAnalyzeWithAI: jest.fn(),
    retryLastMessage: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders desktop layout when not on mobile', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false);
    
    render(
      <BrowserRouter>
        <FileExplorer {...mockProps} />
      </BrowserRouter>
    );
    
    // Should show file content
    expect(screen.getByText('const App = () => { return <div>Hello</div> }')).toBeInTheDocument();
    
    // Should not have mobile toggle button
    expect(screen.queryByLabelText('Show files')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Hide files')).not.toBeInTheDocument();
  });

  test('renders mobile layout with toggle functionality', async () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true);
    
    render(
      <BrowserRouter>
        <FileExplorer {...mockProps} />
      </BrowserRouter>
    );
    
    // Should have mobile toggle button
    const showFilesButton = screen.getByLabelText('Show files');
    expect(showFilesButton).toBeInTheDocument();
    
    // File browser should be hidden initially on mobile
    expect(screen.queryByText('Project Files')).not.toBeInTheDocument();
    
    // Click to show files
    fireEvent.click(showFilesButton);
    
    // File browser should now be visible
    expect(screen.getByText('Project Files')).toBeInTheDocument();
    
    // Should have close button
    const hideFilesButton = screen.getByLabelText('Close file browser');
    expect(hideFilesButton).toBeInTheDocument();
    
    // Click to hide files
    fireEvent.click(hideFilesButton);
    
    // File browser should be hidden again
    await waitFor(() => {
      expect(screen.queryByText('Project Files')).not.toBeInTheDocument();
    });
  });

  test('calls handleAnalyzeWithAI when analyze button is clicked', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false);
    
    render(
      <BrowserRouter>
        <FileExplorer {...mockProps} />
      </BrowserRouter>
    );
    
    // Find and click the analyze button
    const analyzeButton = screen.getByTitle('Analyze with AI');
    fireEvent.click(analyzeButton);
    
    // Should call handleAnalyzeWithAI
    expect(mockProps.handleAnalyzeWithAI).toHaveBeenCalled();
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FilePreviewPanel from '../src/components/admin/ai-chat/FilePreviewPanel';
import { useToast } from '@/hooks/use-toast';

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn().mockReturnValue({
    toast: jest.fn()
  })
}));

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve())
  }
});

describe('FilePreviewPanel Component', () => {
  const mockProps = {
    selectedFile: '/src/App.tsx',
    fileContent: 'const App = () => { return <div>Hello</div> }',
    isLoadingContent: false,
    setFileContent: jest.fn(),
    setIsEditing: jest.fn(),
    handleSaveFile: jest.fn(),
    handleAnalyzeWithAI: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders desktop view correctly', () => {
    render(<FilePreviewPanel {...mockProps} isMobile={false} />);
    
    // Should show file name and type
    expect(screen.getByText('App.tsx')).toBeInTheDocument();
    expect(screen.getByText('(TypeScript)')).toBeInTheDocument();
    
    // Should show file content
    expect(screen.getByText('const App = () => { return <div>Hello</div> }')).toBeInTheDocument();
    
    // Should show buttons with text
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  test('renders mobile view correctly', () => {
    render(<FilePreviewPanel {...mockProps} isMobile={true} />);
    
    // Should show file name
    expect(screen.getByText('App.tsx')).toBeInTheDocument();
    
    // Language indicator should be hidden on mobile
    expect(screen.queryByText('(TypeScript)')).not.toBeInTheDocument();
    
    // Should show file content
    expect(screen.getByText('const App = () => { return <div>Hello</div> }')).toBeInTheDocument();
    
    // Save text should be hidden, only icon visible
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });

  test('shows loading state when content is loading', () => {
    render(<FilePreviewPanel {...{...mockProps, isLoadingContent: true}} />);
    
    // Should show loading spinner
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Should not show file content
    expect(screen.queryByText('const App = () => { return <div>Hello</div> }')).not.toBeInTheDocument();
  });

  test('calls setFileContent and setIsEditing when editing content', () => {
    render(<FilePreviewPanel {...mockProps} />);
    
    // Get the textarea
    const textarea = screen.getByRole('textbox');
    
    // Edit the content
    fireEvent.change(textarea, { target: { value: 'New content' } });
    
    // Should call setFileContent with new value
    expect(mockProps.setFileContent).toHaveBeenCalledWith('New content');
    
    // Should call setIsEditing with true
    expect(mockProps.setIsEditing).toHaveBeenCalledWith(true);
  });

  test('copies content to clipboard when copy button is clicked', async () => {
    const { toast } = useToast();
    
    render(<FilePreviewPanel {...mockProps} />);
    
    // Find and click the copy button
    const copyButton = screen.getByTitle('Copy to clipboard');
    fireEvent.click(copyButton);
    
    // Should call clipboard.writeText
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockProps.fileContent);
    
    // Should show toast notification
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({
        description: "Content copied to clipboard"
      }));
    });
  });

  test('calls handleSaveFile when save button is clicked', () => {
    render(<FilePreviewPanel {...mockProps} />);
    
    // Find and click the save button
    const saveButton = screen.getByTitle('Save changes');
    fireEvent.click(saveButton);
    
    // Should call handleSaveFile
    expect(mockProps.handleSaveFile).toHaveBeenCalled();
  });

  test('calls handleAnalyzeWithAI when analyze button is clicked', () => {
    render(<FilePreviewPanel {...mockProps} />);
    
    // Find and click the analyze button
    const analyzeButton = screen.getByTitle('Analyze with AI');
    fireEvent.click(analyzeButton);
    
    // Should call handleAnalyzeWithAI
    expect(mockProps.handleAnalyzeWithAI).toHaveBeenCalled();
  });
});

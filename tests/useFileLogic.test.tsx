import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useFileLogic } from '../src/components/admin/ai-chat/hooks/useFileLogic';

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
) as jest.Mock;

// Mock setTimeout
jest.useFakeTimers();

describe('useFileLogic Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializes with empty files and null selected file', () => {
    const TestComponent = () => {
      const { files, selectedFile } = useFileLogic();
      return (
        <div>
          <div data-testid="files-count">{files.length}</div>
          <div data-testid="selected-file">{selectedFile || 'none'}</div>
        </div>
      );
    };

    render(<TestComponent />);
    
    // Initially, files should be empty and selectedFile should be null
    expect(screen.getByTestId('files-count').textContent).toBe('0');
    expect(screen.getByTestId('selected-file').textContent).toBe('none');
  });

  test('blocks access to sensitive files', async () => {
    const onFileSelect = jest.fn();
    
    const TestComponent = () => {
      const { handleFileSelect, fileError } = useFileLogic({ onFileSelect });
      
      return (
        <div>
          <button onClick={() => handleFileSelect('/config/api_key.json')}>
            Select Sensitive File
          </button>
          {fileError && <div data-testid="file-error">{fileError}</div>}
        </div>
      );
    };

    render(<TestComponent />);
    
    // Try to select a sensitive file
    fireEvent.click(screen.getByText('Select Sensitive File'));
    
    // Fast-forward timers
    jest.runAllTimers();
    
    // Should show error message about sensitive file
    await waitFor(() => {
      expect(screen.getByTestId('file-error').textContent).toContain('sensitive information');
    });
    
    // onFileSelect should not be called
    expect(onFileSelect).not.toHaveBeenCalled();
  });

  test('allows access to non-sensitive files', async () => {
    const onFileSelect = jest.fn();
    
    const TestComponent = () => {
      const { handleFileSelect, fileContent, isLoadingContent } = useFileLogic({ onFileSelect });
      
      return (
        <div>
          <button onClick={() => handleFileSelect('/src/App.tsx')}>
            Select Normal File
          </button>
          {isLoadingContent && <div data-testid="loading">Loading...</div>}
          {fileContent && <div data-testid="file-content">{fileContent}</div>}
        </div>
      );
    };

    render(<TestComponent />);
    
    // Try to select a normal file
    fireEvent.click(screen.getByText('Select Normal File'));
    
    // Should show loading state
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    
    // Fast-forward timers
    jest.runAllTimers();
    
    // Should show file content
    await waitFor(() => {
      expect(screen.getByTestId('file-content')).toBeInTheDocument();
    });
    
    // onFileSelect should be called with the file path and content
    expect(onFileSelect).toHaveBeenCalledWith('/src/App.tsx', expect.any(String));
  });
});

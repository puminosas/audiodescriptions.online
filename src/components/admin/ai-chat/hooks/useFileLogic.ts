import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/utils/env';

// Create a Supabase client
const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY
);

export const useFileLogic = () => {
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Fetch list of files from project-files directory
  const fetchFiles = async () => {
    try {
      // This would typically fetch from an API or database
      // For now, we'll use a mock list of files
      const mockFiles = [
        'README.md',
        'package.json',
        'src/App.tsx',
        'src/main.tsx',
        'src/components/admin/ai-chat/AIChat.tsx',
        'src/utils/env.ts',
        'supabase/functions/audio-proxy/index.ts'
      ];
      
      setFiles(mockFiles);
      
      // If no file is selected, select the first one
      if (!selectedFile && mockFiles.length > 0) {
        handleFileSelect(mockFiles[0]);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setFileError('Failed to fetch files. Please try again.');
    }
  };

  // Load file content when a file is selected
  const handleFileSelect = async (filename: string) => {
    setSelectedFile(filename);
    setIsLoadingContent(true);
    setFileError(null);
    
    try {
      // This would typically fetch from an API or database
      // For now, we'll use mock content
      let mockContent = '';
      
      if (filename === 'README.md') {
        mockContent = '# Audio Descriptions\n\nA web application for generating audio descriptions from text.';
      } else if (filename === 'package.json') {
        mockContent = '{\n  "name": "audio-descriptions",\n  "version": "1.0.0",\n  "description": "A web application for generating audio descriptions from text"\n}';
      } else {
        mockContent = `// File: ${filename}\n\n// This is a mock file content for demonstration purposes.\n// In a real application, this would be fetched from the server.`;
      }
      
      setFileContent(mockContent);
    } catch (error) {
      console.error('Error loading file content:', error);
      setFileError(`Failed to load content for ${filename}. Please try again.`);
      setFileContent('');
    } finally {
      setIsLoadingContent(false);
    }
  };

  // Save file content
  const handleSaveFile = async () => {
    if (!selectedFile) return;
    
    try {
      // This would typically save to an API or database
      console.log(`Saving file ${selectedFile} with content:`, fileContent);
      
      // Simulate successful save
      setIsEditing(false);
      
      // Show success message (in a real app, you might use a toast notification)
      console.log('File saved successfully');
    } catch (error) {
      console.error('Error saving file:', error);
      setFileError(`Failed to save ${selectedFile}. Please try again.`);
    }
  };

  // Fetch files on component mount
  useEffect(() => {
    fetchFiles();
  }, []);

  return {
    files,
    selectedFile,
    fileContent,
    isLoadingContent,
    fileError,
    isEditing,
    fetchFiles,
    handleFileSelect,
    handleSaveFile,
    setFileContent,
    setIsEditing,
    setFileError
  };
};

export default useFileLogic;

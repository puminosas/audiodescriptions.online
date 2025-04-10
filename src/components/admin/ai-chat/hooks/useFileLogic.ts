import React, { useState, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { FileType } from '@/types/file';

interface UseFileLogicProps {
  onFileSelect?: (filePath: string, content: string) => void;
}

export const useFileLogic = ({ onFileSelect }: UseFileLogicProps = {}) => {
  const [files, setFiles] = useState<FileType[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [sensitivePatterns] = useState([
    /api[_-]?key/i,
    /secret/i,
    /password/i,
    /token/i,
    /credential/i,
    /auth/i,
    /\.env/i,
    /config\.json/i
  ]);
  
  const isMobile = useMediaQuery('(max-width: 768px)');

  const fetchFiles = async () => {
    setIsLoadingFiles(true);
    setFileError(null);
    
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock file structure
      const mockFiles: FileType[] = [
        { path: '/src/components/App.tsx', type: 'file', size: '2.4 KB', lastModified: '2025-04-01' },
        { path: '/src/components/Header.tsx', type: 'file', size: '1.2 KB', lastModified: '2025-04-01' },
        { path: '/src/components/Footer.tsx', type: 'file', size: '0.8 KB', lastModified: '2025-04-01' },
        { path: '/src/styles/main.css', type: 'file', size: '3.5 KB', lastModified: '2025-04-01' },
        { path: '/src/utils/helpers.ts', type: 'file', size: '1.7 KB', lastModified: '2025-04-01' },
        { path: '/src/pages/Home.tsx', type: 'file', size: '2.1 KB', lastModified: '2025-04-01' },
        { path: '/src/pages/About.tsx', type: 'file', size: '1.5 KB', lastModified: '2025-04-01' },
        { path: '/README.md', type: 'file', size: '4.2 KB', lastModified: '2025-04-01' },
        { path: '/package.json', type: 'file', size: '1.8 KB', lastModified: '2025-04-01' },
        { path: '/tsconfig.json', type: 'file', size: '0.6 KB', lastModified: '2025-04-01' },
      ];
      
      setFiles(mockFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      setFileError('Failed to load project files');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleFileSelect = async (filePath: string) => {
    // Check if file is sensitive
    if (sensitivePatterns.some(pattern => pattern.test(filePath))) {
      setFileError('This file contains sensitive information and cannot be accessed');
      return;
    }
    
    setSelectedFile(filePath);
    setFileError(null);
    setIsLoadingContent(true);
    
    try {
      // Simulate API call to fetch file content
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock file content based on extension
      const ext = filePath.split('.').pop()?.toLowerCase();
      let mockContent = '';
      
      if (ext === 'js' || ext === 'jsx') {
        mockContent = `// ${filePath}\n\nconst Component = () => {\n  return <div>Hello World</div>;\n};\n\nexport default Component;`;
      } else if (ext === 'ts' || ext === 'tsx') {
        mockContent = `// ${filePath}\n\ninterface Props {\n  title: string;\n}\n\nconst Component: React.FC<Props> = ({ title }) => {\n  return <div>{title}</div>;\n};\n\nexport default Component;`;
      } else if (ext === 'css') {
        mockContent = `.container {\n  display: flex;\n  flex-direction: column;\n  padding: 1rem;\n}\n\n.header {\n  font-size: 1.5rem;\n  font-weight: bold;\n  margin-bottom: 1rem;\n}`;
      } else if (ext === 'md') {
        mockContent = `# ${filePath.split('/').pop()}\n\nThis is a markdown file.\n\n## Features\n\n- Feature 1\n- Feature 2\n- Feature 3\n\n## Usage\n\n\`\`\`js\nimport { Component } from './component';\n\nconst App = () => <Component />;\n\`\`\``;
      } else if (ext === 'json') {
        mockContent = `{\n  "name": "project",\n  "version": "1.0.0",\n  "description": "Project description",\n  "main": "index.js",\n  "scripts": {\n    "start": "react-scripts start",\n    "build": "react-scripts build",\n    "test": "react-scripts test"\n  }\n}`;
      } else {
        mockContent = `Content of ${filePath}`;
      }
      
      setFileContent(mockContent);
      setIsEditing(false);
      
      // Call the callback if provided
      if (onFileSelect) {
        onFileSelect(filePath, mockContent);
      }
    } catch (error) {
      console.error('Error fetching file:', error);
      setFileError('Failed to load file content');
    } finally {
      setIsLoadingContent(false);
    }
  };

  const handleSaveFile = async () => {
    if (!selectedFile || !fileContent) return;
    
    try {
      // Simulate API call to save file
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real implementation, this would call an API endpoint to save the file
      setIsEditing(false);
      
      return true;
    } catch (error) {
      console.error('Error saving file:', error);
      setFileError('Failed to save file');
      return false;
    }
  };

  const handleAnalyzeWithAI = () => {
    if (!selectedFile || !fileContent) return null;
    
    // Format the message for AI analysis
    const message = `Please analyze this file (${selectedFile}):\n\n\`\`\`\n${fileContent}\n\`\`\``;
    return message;
  };

  // Initialize files on mount
  useEffect(() => {
    fetchFiles();
  }, []);

  return {
    files,
    selectedFile,
    fileContent,
    isLoadingContent,
    isLoadingFiles,
    fileError,
    isEditing,
    isMobile,
    fetchFiles,
    handleFileSelect,
    handleSaveFile,
    handleAnalyzeWithAI,
    setFileContent,
    setIsEditing,
    setFileError
  };
};

export default useFileLogic;

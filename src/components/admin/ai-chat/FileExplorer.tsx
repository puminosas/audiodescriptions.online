import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import ProjectFilesPanel from './ProjectFilesPanel';
import FilePreviewPanel from './FilePreviewPanel';
import ErrorMessage from './ErrorMessage';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FileExplorerProps {
  selectedFile: string | null;
  fileContent: string;
  isLoadingContent: boolean;
  fileError: string | null;
  handleFileSelect: (filePath: string) => void;
  setFileContent: (content: string) => void;
  setIsEditing: (isEditing: boolean) => void;
  handleSaveFile: () => void;
  handleAnalyzeWithAI: () => void;
  retryLastMessage: () => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  selectedFile,
  fileContent,
  isLoadingContent,
  fileError,
  handleFileSelect,
  setFileContent,
  setIsEditing,
  handleSaveFile,
  handleAnalyzeWithAI,
  retryLastMessage
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [sidebarVisible, setSidebarVisible] = useState(!isMobile);
  
  return (
    <div className="relative flex flex-col md:grid md:grid-cols-4 gap-4 h-full">
      {/* Mobile toggle button */}
      {isMobile && (
        <Button
          variant="outline"
          size="sm"
          className="absolute top-0 right-0 z-10 m-2"
          onClick={() => setSidebarVisible(!sidebarVisible)}
          aria-label={sidebarVisible ? "Hide files" : "Show files"}
        >
          {sidebarVisible ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      )}
      
      {/* File browser - conditionally visible on mobile */}
      {(sidebarVisible || !isMobile) && (
        <Card className={`p-4 ${isMobile ? 'fixed inset-0 z-50 w-full h-full overflow-auto bg-background' : 'md:col-span-1 overflow-hidden flex flex-col'}`}>
          {/* Close button for mobile view */}
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => setSidebarVisible(false)}
              aria-label="Close file browser"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          
          <div className={`${isMobile ? 'overflow-auto pb-20' : 'flex-grow overflow-auto'}`}>
            <ProjectFilesPanel 
              onFileSelect={(path) => {
                handleFileSelect(path);
                if (isMobile) setSidebarVisible(false);
              }} 
              selectedFile={selectedFile}
              isMobile={isMobile}
            />
          </div>
        </Card>
      )}
      
      {/* File preview */}
      <Card className={`p-4 ${isMobile && sidebarVisible ? 'hidden' : ''} md:col-span-3 h-full flex flex-col overflow-hidden bg-background`}>
        {selectedFile ? (
          <FilePreviewPanel 
            selectedFile={selectedFile}
            fileContent={fileContent}
            isLoadingContent={isLoadingContent}
            setFileContent={setFileContent}
            setIsEditing={setIsEditing}
            handleSaveFile={handleSaveFile}
            handleAnalyzeWithAI={handleAnalyzeWithAI}
            isMobile={isMobile}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
            <p className="mb-4">Select a file to preview and edit</p>
            {isMobile && !sidebarVisible && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSidebarVisible(true)}
                className="mt-2"
              >
                <ChevronRight className="h-4 w-4 mr-2" />
                Browse Files
              </Button>
            )}
          </div>
        )}
        
        {fileError && (
          <ErrorMessage 
            error={fileError} 
            retryLastMessage={retryLastMessage}
          />
        )}
      </Card>
    </div>
  );
};

export default FileExplorer;

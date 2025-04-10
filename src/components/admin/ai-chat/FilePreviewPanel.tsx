import React from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Code, Save, X, Wand2, FileText, AlertCircle, Clipboard, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface FilePreviewPanelProps {
  selectedFile: string;
  fileContent: string;
  isLoadingContent: boolean;
  setFileContent: (content: string) => void;
  setIsEditing: (isEditing: boolean) => void;
  handleSaveFile: () => void;
  handleAnalyzeWithAI: () => void;
  isMobile?: boolean;
}

const FilePreviewPanel: React.FC<FilePreviewPanelProps> = ({
  selectedFile,
  fileContent,
  isLoadingContent,
  setFileContent,
  setIsEditing,
  handleSaveFile,
  handleAnalyzeWithAI,
  isMobile = false
}) => {
  const { toast } = useToast();
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(fileContent).then(
      () => {
        toast({
          description: "Content copied to clipboard",
          duration: 2000
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to copy to clipboard"
        });
      }
    );
  };

  const getFileExtension = () => {
    return selectedFile.split('.').pop() || '';
  };

  const getLanguage = () => {
    const ext = getFileExtension().toLowerCase();
    if (['js', 'jsx'].includes(ext)) return 'JavaScript';
    if (['ts', 'tsx'].includes(ext)) return 'TypeScript';
    if (['css', 'scss', 'less'].includes(ext)) return 'CSS';
    if (['html'].includes(ext)) return 'HTML';
    if (['json'].includes(ext)) return 'JSON';
    if (['md'].includes(ext)) return 'Markdown';
    return 'Text';
  };

  return (
    <Card className={`flex flex-col ${isMobile ? 'h-[calc(100vh-180px)]' : 'h-[calc(100vh-240px)]'}`}>
      <div className={`${isMobile ? 'p-2' : 'p-4'} border-b flex flex-wrap justify-between items-center gap-2`}>
        <div className="flex items-center min-w-0 mr-2">
          <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="font-medium truncate max-w-[150px] md:max-w-[400px]">
            {selectedFile.split('/').pop()}
          </span>
          <span className="ml-2 text-xs text-muted-foreground hidden sm:inline">
            ({getLanguage()})
          </span>
        </div>
        
        <div className="flex gap-1 md:gap-2">
          <Button 
            size={isMobile ? "icon" : "sm"} 
            variant="outline" 
            onClick={copyToClipboard}
            title="Copy to clipboard"
            className={isMobile ? "h-8 w-8 p-0" : ""}
          >
            <Clipboard className="h-4 w-4" />
          </Button>
          
          <Button 
            size={isMobile ? "icon" : "sm"} 
            variant="outline" 
            onClick={handleAnalyzeWithAI}
            title="Analyze with AI"
            className={isMobile ? "h-8 w-8 p-0" : ""}
          >
            <Wand2 className="h-4 w-4" />
          </Button>
          
          <Button 
            size={isMobile ? "icon" : "sm"} 
            variant="default" 
            onClick={handleSaveFile}
            title="Save changes"
            className={isMobile ? "h-8 w-8 p-0" : ""}
          >
            <Save className="h-4 w-4" />
            {!isMobile && <span className="ml-2">Save</span>}
          </Button>
        </div>
      </div>
      
      {isLoadingContent ? (
        <div className="flex justify-center items-center flex-1">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <Textarea
            value={fileContent}
            onChange={(e) => {
              setFileContent(e.target.value);
              setIsEditing(true);
            }}
            className="font-mono text-xs md:text-sm h-full border-0 rounded-none focus-visible:ring-0 resize-none"
            placeholder="File content will appear here..."
          />
        </div>
      )}
    </Card>
  );
};

export default FilePreviewPanel;

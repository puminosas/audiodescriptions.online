import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Folder, FileText, Search, RefreshCw, XCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';

interface ProjectFilesPanelProps {
  onFileSelect: (filePath: string) => void;
  selectedFile: string | null;
  isMobile?: boolean;
}

const ProjectFilesPanel: React.FC<ProjectFilesPanelProps> = ({ 
  onFileSelect, 
  selectedFile,
  isMobile: propIsMobile
}) => {
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  
  const mediaQueryIsMobile = useMediaQuery('(max-width: 768px)');
  const isMobile = propIsMobile !== undefined ? propIsMobile : mediaQueryIsMobile;

  const fetchFiles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/files');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to load project files');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const filteredFiles = files.filter((file) => 
    file.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className={`${isMobile ? 'h-[calc(100vh-180px)]' : 'h-[calc(100vh-200px)]'} flex flex-col shadow-md`}>
      <div className="p-3 md:p-4 border-b flex items-center justify-between">
        <h3 className="font-medium flex items-center text-sm md:text-base">
          <Folder className="h-4 w-4 mr-2" />
          Project Files
        </h3>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </div>
      
      {!collapsed && (
        <>
          <div className="p-2 md:p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-2.5"
                  aria-label="Clear search"
                >
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center p-4 text-destructive">
                <p className="text-sm">{error}</p>
                <button
                  onClick={fetchFiles}
                  className="mt-2 text-sm underline"
                >
                  Try again
                </button>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">
                <p className="text-sm">No files found</p>
              </div>
            ) : (
              <ul className="space-y-1">
                {filteredFiles.map((file, index) => (
                  <li key={index}>
                    <button
                      className={cn(
                        "w-full text-left px-2 py-1.5 rounded text-xs md:text-sm flex items-center",
                        selectedFile === file.path
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      )}
                      onClick={() => onFileSelect(file.path)}
                    >
                      <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{file.path.split('/').pop()}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="p-2 border-t">
            <button
              onClick={fetchFiles}
              className="w-full flex items-center justify-center p-1.5 text-xs md:text-sm bg-accent rounded"
              disabled={isLoading}
            >
              <RefreshCw className={cn(
                "h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2",
                isLoading && "animate-spin"
              )} />
              Refresh Files
            </button>
          </div>
        </>
      )}
    </Card>
  );
};

export default ProjectFilesPanel;

import React, { useState, useEffect } from 'react';
import { useChatLogic } from './hooks/useChatLogic';
import { useFileLogic } from './hooks/useFileLogic';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChatInterface from './ChatInterface';
import FileExplorer from './FileExplorer';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import { MessageSquare, FileText, Settings, RefreshCw } from 'lucide-react';

interface AIChatProps {
  // Add any props needed
}

const AIChat: React.FC<AIChatProps> = () => {
  // Use the useMediaQuery hook with a default value to prevent errors
  const isMobile = useMediaQuery('(max-width: 768px)') || false;
  const [activeTab, setActiveTab] = useState('chat');
  
  // Initialize chat logic with error handling
  const chatLogic = useChatLogic();
  
  // Initialize file logic with error handling
  const fileLogic = useFileLogic();
  
  // Safely destructure values with fallbacks to prevent undefined errors
  const {
    messages = [],
    isTyping = false,
    chatError = null,
    isLoading = false,
    messagesEndRef = React.createRef(),
    sendMessage = () => {},
    retryLastMessage = () => {},
    clearChat = () => {},
    addSystemMessage = () => {}
  } = chatLogic || {};
  
  const {
    files = [],
    selectedFile = null,
    fileContent = '',
    isLoadingContent = false,
    fileError = null,
    isEditing = false,
    fetchFiles = () => {},
    handleFileSelect = () => {},
    handleSaveFile = () => {},
    setFileContent = () => {},
    setIsEditing = () => {},
    setFileError = () => {}
  } = fileLogic || {};
  
  // Handle file analysis with AI
  const handleAnalyzeWithAI = () => {
    if (!selectedFile || !fileContent) return;
    
    const message = `Please analyze this file (${selectedFile}):\n\n\`\`\`\n${fileContent}\n\`\`\``;
    sendMessage(message);
    
    // Switch to chat tab on mobile
    if (isMobile) {
      setActiveTab('chat');
    }
  };

  return (
    <div className="container mx-auto p-2 md:p-6 h-[calc(100vh-80px)] flex flex-col">
      <h1 className="text-2xl font-bold mb-4">AI Assistant</h1>
      
      {isMobile ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="chat" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Files
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="flex-1 flex flex-col mt-0 data-[state=inactive]:hidden">
            {ChatInterface && (
              <ChatInterface
                messages={messages}
                isTyping={isTyping}
                chatError={chatError}
                sendMessage={sendMessage}
                retryLastMessage={retryLastMessage}
                messagesEndRef={messagesEndRef}
                isLoading={isLoading}
              />
            )}
          </TabsContent>
          
          <TabsContent value="files" className="flex-1 flex flex-col mt-0 data-[state=inactive]:hidden">
            {FileExplorer && (
              <FileExplorer
                selectedFile={selectedFile}
                fileContent={fileContent}
                isLoadingContent={isLoadingContent}
                fileError={fileError}
                handleFileSelect={handleFileSelect}
                setFileContent={setFileContent}
                setIsEditing={setIsEditing}
                handleSaveFile={handleSaveFile}
                handleAnalyzeWithAI={handleAnalyzeWithAI}
                retryLastMessage={retryLastMessage}
              />
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
          {ChatInterface && (
            <ChatInterface
              messages={messages}
              isTyping={isTyping}
              chatError={chatError}
              sendMessage={sendMessage}
              retryLastMessage={retryLastMessage}
              messagesEndRef={messagesEndRef}
              isLoading={isLoading}
            />
          )}
          
          {FileExplorer && (
            <FileExplorer
              selectedFile={selectedFile}
              fileContent={fileContent}
              isLoadingContent={isLoadingContent}
              fileError={fileError}
              handleFileSelect={handleFileSelect}
              setFileContent={setFileContent}
              setIsEditing={setIsEditing}
              handleSaveFile={handleSaveFile}
              handleAnalyzeWithAI={handleAnalyzeWithAI}
              retryLastMessage={retryLastMessage}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AIChat;

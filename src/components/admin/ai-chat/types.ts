import { FileType } from '@/types/file';

export interface FileTypes {
  file: FileType[];
  directory: FileType[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  title?: string;
  createdAt: number;
  updatedAt: number;
}

export interface FileContent {
  path: string;
  content: string;
  lastModified?: string;
  size?: string;
}

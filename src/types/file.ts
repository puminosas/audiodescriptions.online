export interface FileType {
  path: string;
  type: 'file' | 'directory';
  size?: string;
  lastModified?: string;
  children?: FileType[];
}

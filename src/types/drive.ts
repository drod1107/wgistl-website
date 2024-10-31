export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  thumbnailLink?: string;
  createdTime: string;
  description?: string;
}

export interface CreateFoldersOptions {
  orgName: string;
  orgEmail: string;
}

export interface FolderCreationResponse {
  privateFolder: string;  // Folder ID
  publicFolder: string;   // Folder ID
}

export enum DriveErrorType {
  UNAUTHORIZED = 'UNAUTHORIZED',
  UPLOAD_ERROR = 'UPLOAD_ERROR',
  FOLDER_ERROR = 'FOLDER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_ERROR = "PERMISSION_ERROR",
  VIDEO_DELETE_ERROR = "VIDEO_DELETE_ERROR",
}

export interface DriveErrorDetails {
  code?: number;
  status?: number;
  message?: string;
  error?: string;
  folderName?: string;
  userEmail?: string;
  orgName?: string;
  orgEmail?: string;
  folderId?: string;
  filename?: string;
  videoId?: string;
  fileId?: string;
}

export class DriveError extends Error {
  constructor(
    public type: DriveErrorType,
    message: string,
    public details?: DriveErrorDetails
  ) {
    super(message);
    this.name = 'DriveError';
  }
}

export interface DriveAPIResponse {
  type?: DriveErrorType;
  error?: string;
  message?: string;
  details?: DriveErrorDetails;
  files?: DriveFile[];
}
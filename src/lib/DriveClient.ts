// lib/DriveClient.ts
export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    webViewLink: string;
    thumbnailLink?: string;
    createdTime: string;
    description?: string;
  }
  
  interface DriveClientConfig {
    baseUrl: string;
    uploadUrl: string;
  }
  
  export interface DriveErrorDetails {
    status?: number;
    message?: string;
    error?: string;
    filename?: string;
    folderId?: string;
    context?: Record<string, unknown>;
  }
  
  export class DriveError extends Error {
    constructor(
      public readonly code: string,
      message: string,
      public readonly details?: DriveErrorDetails
    ) {
      super(message);
      this.name = 'DriveError';
    }
  }
  
  export class DriveClient {
    private config: DriveClientConfig = {
      baseUrl: 'https://www.googleapis.com/drive/v3',
      uploadUrl: 'https://www.googleapis.com/upload/drive/v3'
    };
  
    constructor(private token: string) {
      if (!token) {
        throw new DriveError('NO_TOKEN', 'No authentication token provided');
      }
    }
  
    private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
      const headers = new Headers(options.headers || {});
      headers.set('Authorization', `Bearer ${this.token}`);
  
      const response = await fetch(url, {
        ...options,
        headers
      });
  
      if (!response.ok) {
        let errorMessage: string;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || response.statusText;
        } catch {
          errorMessage = response.statusText;
        }
  
        throw new DriveError(
          response.status.toString(),
          errorMessage,
          { status: response.status }
        );
      }
  
      return response;
    }
  
    async listFiles(folderId: string): Promise<DriveFile[]> {
      const query = encodeURIComponent(`'${folderId}' in parents`);
      const fields = encodeURIComponent(
        'files(id,name,mimeType,webViewLink,thumbnailLink,createdTime,description)'
      );
      
      const response = await this.fetchWithAuth(
        `${this.config.baseUrl}/files?q=${query}&fields=${fields}`
      );
      
      const data = await response.json();
      return data.files;
    }
  
    async uploadFile(
      file: File,
      folderId: string,
      metadata: { title?: string; description?: string } = {}
    ): Promise<DriveFile> {
      // Initialize resumable upload
      const initResponse = await this.fetchWithAuth(
        `${this.config.uploadUrl}/files?uploadType=resumable`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Upload-Content-Type': file.type,
            'X-Upload-Content-Length': file.size.toString(),
          },
          body: JSON.stringify({
            name: metadata.title || file.name,
            description: metadata.description,
            parents: [folderId],
          }),
        }
      );
  
      const uploadUrl = initResponse.headers.get('Location');
      if (!uploadUrl) {
        throw new DriveError(
          'UPLOAD_ERROR', 
          'Failed to get upload URL',
          { filename: file.name }
        );
      }
  
      // Perform the actual upload
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
          'Content-Length': file.size.toString(),
        }
      });
  
      if (!uploadResponse.ok) {
        throw new DriveError(
          'UPLOAD_ERROR',
          'Failed to upload file',
          { 
            status: uploadResponse.status,
            filename: file.name,
            folderId 
          }
        );
      }
  
      return uploadResponse.json();
    }
  
    async deleteFile(fileId: string): Promise<void> {
      await this.fetchWithAuth(
        `${this.config.baseUrl}/files/${fileId}`,
        { method: 'DELETE' }
      );
    }
  
    async setFilePublic(fileId: string): Promise<void> {
      await this.fetchWithAuth(
        `${this.config.baseUrl}/files/${fileId}/permissions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: 'reader',
            type: 'anyone',
          }),
        }
      );
    }
  }
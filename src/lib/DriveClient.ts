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
    this.name = "DriveError";
  }
}

export class DriveClient {
  private config: DriveClientConfig = {
    baseUrl: "https://www.googleapis.com/drive/v3",
    uploadUrl: "https://www.googleapis.com/upload/drive/v3",
  };

  constructor(private token: string) {
    if (!token) {
      throw new DriveError("NO_TOKEN", "No authentication token provided");
    }
  }

  private async fetchWithAuth(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const headers = new Headers(options.headers || {});
    headers.set("Authorization", `Bearer ${this.token}`);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage: string;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || response.statusText;
      } catch {
        // Empty catch with no parameter
        errorMessage = response.statusText;
      }

      throw new DriveError(response.status.toString(), errorMessage, {
        status: response.status,
      });
    }

    return response;
  }

  async listFiles(folderId: string): Promise<DriveFile[]> {
    const query = encodeURIComponent(`'${folderId}' in parents`);
    const fields = encodeURIComponent(
      "files(id,name,mimeType,webViewLink,thumbnailLink,createdTime,description)"
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
    metadata: { title?: string; description?: string } = {},
    onProgress?: (progress: number) => void
  ): Promise<DriveFile> {
    // Initialize resumable upload
    const initResponse = await this.fetchWithAuth(
      `${this.config.uploadUrl}/files?uploadType=resumable`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Upload-Content-Type": file.type,
          "X-Upload-Content-Length": file.size.toString(),
        },
        body: JSON.stringify({
          name: metadata.title || file.name,
          description: metadata.description,
          parents: [folderId],
        }),
      }
    );

    const uploadUrl = initResponse.headers.get("Location");
    if (!uploadUrl) {
      throw new DriveError("UPLOAD_ERROR", "Failed to get upload URL", {
        filename: file.name,
      });
    }

    // Perform the upload with progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl, true);
      xhr.setRequestHeader("Content-Type", file.type);

      // Progress handler
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      };

      // Success handler
      xhr.onload = async () => {
        // No need for async here since we're not using await
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            reject(
              new DriveError("UPLOAD_ERROR", "Invalid response from server", {
                filename: file.name,
              })
            );
          }
        } else {
          reject(
            new DriveError("UPLOAD_ERROR", "Failed to upload file", {
              status: xhr.status,
              filename: file.name,
              folderId,
            })
          );
        }
      };

      // Error handler
      xhr.onerror = () => {
        reject(
          new DriveError("UPLOAD_ERROR", "Network error during upload", {
            filename: file.name,
          })
        );
      };

      // Send the file
      xhr.send(file);
    });
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.fetchWithAuth(`${this.config.baseUrl}/files/${fileId}`, {
      method: "DELETE",
    });
  }

  async deleteFolder(folderId: string): Promise<void> {
    // First, ensure folder is empty
    const files = await this.listFiles(folderId);
    for (const file of files) {
      await this.deleteFile(file.id);
    }
    // Then delete the folder itself
    await this.deleteFile(folderId);
  }
}

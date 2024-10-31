import { getGoogleAuthClient } from "./googleAuth";
import { createLogger } from "./logger";
import {
  DriveFile,
  CreateFoldersOptions,
  FolderCreationResponse,
  DriveErrorType,
  DriveError,
} from "@/types/drive";

const logger = createLogger("ServerDriveUtil");

const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
const UPLOAD_API_BASE = "https://www.googleapis.com/upload/drive/v3";

export class ServerDriveUtil {
  /**
   * Creates folders for a new organization
   */
  static async createOrganizationFolders({
    orgName,
    orgEmail,
  }: CreateFoldersOptions): Promise<FolderCreationResponse> {
    try {
      logger.info("Creating organization folders", { orgName, orgEmail });

      // Create private folder for raw content
      const privateFolder = await this.createFolder({
        name: `${orgName} - Raw Content`,
        userEmail: orgEmail,
      });

      // Create public folder for processed content
      const publicFolder = await this.createFolder({
        name: `${orgName} - Processed`,
        userEmail: orgEmail,
      });

      // Share both folders with editor access for your email
      await this.shareFolderWithAccount(privateFolder.id, "david@windrose.dev");
      await this.shareFolderWithAccount(publicFolder.id, "david@windrose.dev");

      return {
        privateFolder: privateFolder.id,
        publicFolder: publicFolder.id,
      };
    } catch (error) {
      logger.error("Failed to create organization folders", {
        error: error instanceof Error ? error.message : "Unknown error",
        orgName,
      });

      if (error instanceof DriveError) {
        throw error;
      }

      throw new DriveError(
        DriveErrorType.FOLDER_ERROR,
        "Failed to create organization folders",
        {
          error: error instanceof Error ? error.message : "Unknown error",
          orgName,
          orgEmail,
        }
      );
    }
  }

  /**
   * Lists contents of a Drive folder
   */
  static async listFolderContents(folderId: string): Promise<DriveFile[]> {
    try {
      const auth = await getGoogleAuthClient();
      const query = encodeURIComponent(`'${folderId}' in parents`);
      const fields = encodeURIComponent(
        "files(id,name,mimeType,webViewLink,thumbnailLink,createdTime,description)"
      );

      const response = await fetch(
        `${DRIVE_API_BASE}/files?q=${query}&fields=${fields}`,
        {
          headers: {
            Authorization: `Bearer ${(await auth.getAccessToken()).token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new DriveError(
            DriveErrorType.UNAUTHORIZED,
            "Access denied to folder",
            {
              status: response.status,
              code: response.status,
              message: await response.text(),
            }
          );
        }
        throw new DriveError(
          DriveErrorType.FOLDER_ERROR,
          `Failed to list folder contents: ${response.status}`,
          {
            status: response.status,
            message: await response.text(),
          }
        );
      }

      const data = await response.json();
      return data.files;
    } catch (error) {
      logger.error("Failed to list folder contents", {
        error: error instanceof Error ? error.message : "Unknown error",
        folderId,
      });

      if (error instanceof DriveError) {
        throw error;
      }

      throw new DriveError(
        DriveErrorType.NETWORK_ERROR,
        "Failed to access Drive API",
        {
          error: error instanceof Error ? error.message : "Unknown error",
          folderId,
        }
      );
    }
  }

  /**
   * Creates a new folder in Drive
   */
  private static async createFolder({
    name,
    userEmail,
  }: {
    name: string;
    userEmail: string;
  }): Promise<DriveFile> {
    try {
      const auth = await getGoogleAuthClient();

      const response = await fetch(`${DRIVE_API_BASE}/files`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${(await auth.getAccessToken()).token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          mimeType: "application/vnd.google-apps.folder",
        }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new DriveError(
            DriveErrorType.UNAUTHORIZED,
            "Unauthorized to create folder",
            {
              status: response.status,
              message: await response.text(),
            }
          );
        }
        throw new DriveError(
          DriveErrorType.FOLDER_ERROR,
          `Failed to create folder: ${response.status}`,
          {
            status: response.status,
            message: await response.text(),
            folderName: name,
          }
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof DriveError) {
        throw error;
      }

      throw new DriveError(
        DriveErrorType.FOLDER_ERROR,
        "Failed to create folder",
        {
          error: error instanceof Error ? error.message : "Unknown error",
          folderName: name,
          userEmail,
        }
      );
    }
  }

  /**
   * Shares a folder with an account
   */
  private static async shareFolderWithAccount(
    folderId: string,
    userEmail: string,
    retries: number = 3
  ): Promise<void> {
    try {
      const auth = await getGoogleAuthClient();
      const response = await fetch(
        `${DRIVE_API_BASE}/files/${folderId}/permissions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${(await auth.getAccessToken()).token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "user",
            role: "writer",
            emailAddress: userEmail,
          }),
        }
      );

      if (!response.ok) {
        throw new DriveError(
          DriveErrorType.PERMISSION_ERROR,
          `Failed to share folder: ${response.status}`,
          {
            status: response.status,
            message: await response.text(),
            folderId,
            userEmail,
          }
        );
      }

      logger.info(`Folder shared with ${userEmail}`, { folderId });
    } catch (error) {
      if (
        retries > 0 &&
        error instanceof DriveError &&
        error.details?.status === 500
      ) {
        logger.warn("Retrying folder sharing due to internal error", {
          folderId,
          retriesLeft: retries,
        });
        await new Promise((resolve) => setTimeout(resolve, 1000)); // wait for 1 second
        return this.shareFolderWithAccount(folderId, userEmail, retries - 1);
      }
      throw error; // rethrow if out of retries or non-retriable error
    }
  }

  /**
   * Uploads a video file to Drive
   */
  static async uploadVideo(
    file: Buffer,
    contentType: string,
    filename: string,
    folderId: string,
    description?: string
  ): Promise<DriveFile> {
    try {
      const auth = await getGoogleAuthClient();

      // Get upload URL
      const initResponse = await fetch(
        `${UPLOAD_API_BASE}/files?uploadType=resumable`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${(await auth.getAccessToken()).token}`,
            "Content-Type": "application/json",
            "X-Upload-Content-Type": contentType,
          },
          body: JSON.stringify({
            name: filename,
            description,
            parents: [folderId],
          }),
        }
      );

      if (!initResponse.ok) {
        if (initResponse.status === 401 || initResponse.status === 403) {
          throw new DriveError(
            DriveErrorType.UNAUTHORIZED,
            "Unauthorized to upload video",
            {
              status: initResponse.status,
              message: await initResponse.text(),
            }
          );
        }
        throw new DriveError(
          DriveErrorType.UPLOAD_ERROR,
          `Failed to initialize upload: ${initResponse.status}`,
          {
            status: initResponse.status,
            message: await initResponse.text(),
          }
        );
      }

      const uploadUrl = initResponse.headers.get("Location");
      if (!uploadUrl) {
        throw new DriveError(
          DriveErrorType.UPLOAD_ERROR,
          "No upload URL received",
          {
            status: initResponse.status,
          }
        );
      }

      // Upload the file
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Length": file.length.toString(),
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new DriveError(
          DriveErrorType.UPLOAD_ERROR,
          `Upload failed: ${uploadResponse.status}`,
          {
            status: uploadResponse.status,
            message: await uploadResponse.text(),
          }
        );
      }

      const uploadedFile = await uploadResponse.json();

      // Set the uploaded video to be publicly accessible
      await this.setFilePublic(uploadedFile.id);

      return uploadedFile;
    } catch (error) {
      logger.error("Failed to upload video", {
        error: error instanceof Error ? error.message : "Unknown error",
        filename,
        folderId,
      });

      if (error instanceof DriveError) {
        throw error;
      }

      throw new DriveError(
        DriveErrorType.UPLOAD_ERROR,
        "Failed to upload video",
        {
          error: error instanceof Error ? error.message : "Unknown error",
          filename,
          folderId,
        }
      );
    }
  }

  /**
   * Deletes a video from the Google Drive API by videoId
   *
   * @param videoId - The id of the video to delete
   */
  static async deleteVideo(videoId: string): Promise<void> {
    try {
      const auth = await getGoogleAuthClient();
      const response = await fetch(
        `${DRIVE_API_BASE}/files/${videoId}?supportsAllDrives=true`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${(await auth.getAccessToken()).token}`,
          },
        }
      );

      if (!response.ok) {
        throw new DriveError(
          DriveErrorType.VIDEO_DELETE_ERROR,
          `Failed to delete video: ${response.status}`,
          {
            status: response.status,
            message: await response.text(),
          }
        );
      }
    } catch (error) {
      logger.error("Failed to delete video", {
        error: error instanceof Error ? error.message : "Unknown error",
        videoId,
      });

      if (error instanceof DriveError) {
        throw error;
      }

      throw new DriveError(
        DriveErrorType.VIDEO_DELETE_ERROR,
        "Failed to delete video",
        {
          error: error instanceof Error ? error.message : "Unknown error",
          videoId,
        }
      );
    }
  }

  /**
   * Sets a file to be publicly accessible
   */
  static async setFilePublic(fileId: string): Promise<void> {
    const auth = await getGoogleAuthClient();
    try {
      const response = await fetch(
        `${DRIVE_API_BASE}/files/${fileId}/permissions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${(await auth.getAccessToken()).token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "anyone",
            role: "reader",
          }),
        }
      );

      if (!response.ok) {
        throw new DriveError(
          DriveErrorType.PERMISSION_ERROR,
          `Failed to set file to public: ${response.status}`,
          {
            status: response.status,
            message: await response.text(),
            fileId,
          }
        );
      }
    } catch (error) {
      console.error("Failed to set file public", { error, fileId });
      throw error;
    }
  }
}

export default ServerDriveUtil;

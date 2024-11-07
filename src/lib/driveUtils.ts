import { CreateFoldersOptions, FolderCreationResponse, DriveErrorType, DriveError, DriveFile } from "@/types/drive";
import { getGoogleAuthClient } from "./googleAuth";
import { createLogger } from "./logger";

const logger = createLogger("ServerDriveUtil");
const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";

export class ServerDriveUtil {
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

      if (error instanceof DriveError) throw error;

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
        throw new DriveError(
          response.status === 401 || response.status === 403
            ? DriveErrorType.UNAUTHORIZED
            : DriveErrorType.FOLDER_ERROR,
          `Failed to create folder: ${response.status}`,
          {
            status: response.status,
            message: await response.text(),
            folderName: name,
            userEmail,
          }
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof DriveError) throw error;

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
      throw error;
    }
  }
}

export default ServerDriveUtil;

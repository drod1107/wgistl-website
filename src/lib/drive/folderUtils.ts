// src/lib/drive/folderUtils.ts

import { getAuthToken } from "./authUtils";
import { DRIVE_API_BASE } from "./constants";
import { DriveError, DriveErrorType } from "@/types/drive";

export async function createFolder(name: string): Promise<unknown> {
  const token = await getAuthToken();
  const response = await fetch(`${DRIVE_API_BASE}/files`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, mimeType: "application/vnd.google-apps.folder" }),
  });

  if (!response.ok) {
    throw new DriveError(DriveErrorType.FOLDER_ERROR, `Failed to create folder: ${response.status}`);
  }

  return response.json();
}

export async function shareFolder(folderId: string, userEmail: string): Promise<void> {
  const token = await getAuthToken();
  const response = await fetch(`${DRIVE_API_BASE}/files/${folderId}/permissions`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type: "user", role: "writer", emailAddress: userEmail }),
  });

  if (!response.ok) {
    throw new DriveError(DriveErrorType.PERMISSION_ERROR, `Failed to share folder: ${response.status}`);
  }
}

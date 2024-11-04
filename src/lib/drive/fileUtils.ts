// src/lib/drive/fileUtils.ts

import { getAuthToken } from "./authUtils";
import { DRIVE_API_BASE, UPLOAD_API_BASE } from "./constants";
import { DriveError, DriveErrorType } from "@/types/drive";

export async function uploadVideo(file: Buffer, filename: string, folderId: string): Promise<unknown> {
  const token = await getAuthToken();

  // Step 1: Initialize upload session
  const initResponse = await fetch(`${UPLOAD_API_BASE}/files?uploadType=resumable`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
      "X-Upload-Content-Type": "video/mp4",
    },
    body: JSON.stringify({ name: filename, parents: [folderId] }),
  });

  const uploadUrl = initResponse.headers.get("Location");
  if (!uploadUrl) throw new DriveError(DriveErrorType.UPLOAD_ERROR, "Failed to initialize upload");

  // Step 2: Upload file data
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Length": file.length.toString() },
    body: file,
  });

  if (!uploadResponse.ok) throw new DriveError(DriveErrorType.UPLOAD_ERROR, `Upload failed: ${uploadResponse.status}`);

  const uploadedFile = await uploadResponse.json();

  // Set file to public
  await setFilePublic(uploadedFile.id);
  return uploadedFile;
}

export async function deleteVideo(videoId: string): Promise<void> {
  const token = await getAuthToken();
  const response = await fetch(`${DRIVE_API_BASE}/files/${videoId}?supportsAllDrives=true`, {
    method: "DELETE",
    headers: { Authorization: token },
  });

  if (!response.ok) {
    throw new DriveError(DriveErrorType.VIDEO_DELETE_ERROR, `Failed to delete video: ${response.status}`);
  }
}

export async function setFilePublic(fileId: string): Promise<void> {
  const token = await getAuthToken();
  const response = await fetch(`${DRIVE_API_BASE}/files/${fileId}/permissions`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type: "anyone", role: "reader" }),
  });

  if (!response.ok) {
    throw new DriveError(DriveErrorType.PERMISSION_ERROR, `Failed to set file public: ${response.status}`);
  }
}

import { NextResponse } from "next/server";
import { ServerDriveUtil } from "@/lib/driveUtil";
import { createLogger } from "@/lib/logger";
import { DriveErrorType, DriveError } from "@/types/drive";

export const dynamic = 'force-dynamic';

const logger = createLogger("UploadVideoAPI");

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const folderId = formData.get("folderId") as string;

    if (!file || !title || !folderId) {
      throw new DriveError(
        DriveErrorType.UPLOAD_ERROR,
        "Missing required fields",
        {
          code: 400,
          message: "File, title, and folder ID are required",
        }
      );
    }

    logger.info("Starting video upload", {
      filename: title,
      description: description || "No description provided",
    });

    // Convert File to Buffer for server-side upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
      const fileData = await ServerDriveUtil.uploadVideo(
        buffer,
        file.type,
        title,
        folderId,
        description
      );
      return NextResponse.json(fileData);
    } catch (error) {
      // Handle specific Drive API errors
      if (error instanceof DriveError) {
        throw error;
      }
      // Convert unknown errors to DriveError
      throw new DriveError(
        DriveErrorType.UPLOAD_ERROR,
        "Failed to upload video",
        {
          error: error instanceof Error ? error.message : "Unknown error",
          status: 500,
        }
      );
    }
  } catch (error) {
    logger.error("Error in createFolders route", {
      error:
        error instanceof DriveError
          ? {
              type: error.type,
              message: error.message,
              details: JSON.stringify(error.details),
            }
          : "Unknown error",
    });

    if (error instanceof DriveError) {
      return NextResponse.json(
        {
          error: error.message,
          type: error.type,
          details: error.details,
        },
        { status: error.details?.status || 500 }
      );
    }

    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        type: DriveErrorType.UPLOAD_ERROR,
      },
      { status: 500 }
    );
  }
}

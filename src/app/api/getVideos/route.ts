import { NextResponse } from "next/server";
import { ServerDriveUtil } from "@/lib/driveUtil";
import { createLogger } from "@/lib/logger";
import { DriveErrorType, DriveError } from "@/types/drive";

export const dynamic = "force-dynamic";

const logger = createLogger("GetVideosAPI");

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");

    if (!folderId) {
      throw new DriveError(
        DriveErrorType.FOLDER_ERROR,
        "Folder ID is required",
        {
          code: 400,
          message: "Missing folder ID parameter",
        }
      );
    }

    try {
      const files = await ServerDriveUtil.listFolderContents(folderId);
      const videos = (files ?? []).filter(
        (file) =>
          file.mimeType.startsWith("video/") ||
          file.mimeType === "application/vnd.google-apps.video"
      );

      return NextResponse.json({ files: videos });

      logger.info("Videos retrieved successfully", {
        folderId,
        count: videos.length,
      });

      return NextResponse.json(videos);
    } catch (error) {
      // If it's already a DriveError, rethrow it
      if (error instanceof DriveError) {
        throw error;
      }

      // Convert any other errors to DriveError
      throw new DriveError(
        DriveErrorType.FOLDER_ERROR,
        "Failed to fetch videos",
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
        error: "Failed to fetch videos",
        type: DriveErrorType.FOLDER_ERROR,
      },
      { status: 500 }
    );
  }
}

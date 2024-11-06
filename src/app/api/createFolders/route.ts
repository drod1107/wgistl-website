// app/api/createFolders/route.ts
import { NextResponse } from "next/server";
import { ServerDriveUtil } from "@/lib/driveUtils";
import { createLogger } from "@/lib/logger";
import { DriveErrorType, DriveError } from "@/types/drive";

export const dynamic = 'force-dynamic';
const logger = createLogger("CreateFoldersAPI");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orgName, orgEmail } = body;

    if (!orgName || !orgEmail) {
      throw new DriveError(
        DriveErrorType.FOLDER_ERROR,
        "Missing required fields",
        { code: 400, message: "Organization name and email are required" }
      );
    }

    logger.info("Creating folders for organization", { orgName, orgEmail });

    try {
      // Create folders and share them with specified Google account
      const { privateFolder, publicFolder } =
        await ServerDriveUtil.createOrganizationFolders({ orgName, orgEmail });

      return NextResponse.json({
        unlistedId: privateFolder,
        publicId: publicFolder,
      });
    } catch (error) {
      if (error instanceof DriveError) throw error;

      throw new DriveError(
        DriveErrorType.FOLDER_ERROR,
        "Failed to create folders",
        { error: error instanceof Error ? error.message : "Unknown error", status: 500 }
      );
    }
  } catch (error) {
    logger.error("Error in createFolders route", {
      error: error instanceof DriveError
        ? { type: error.type, message: error.message, details: JSON.stringify(error.details) }
        : "Unknown error"
    });

    if (error instanceof DriveError) {
      return NextResponse.json(
        { error: error.message, type: error.type, details: error.details },
        { status: error.details?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create folders", type: DriveErrorType.FOLDER_ERROR },
      { status: 500 }
    );
  }
}
// app/api/google/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { google } from 'googleapis';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = auth();
    
    if (!session.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL || 
        !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Create a new JWT client
    const client = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
      undefined,  // key file is not used, we're using the key directly
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/drive.file']
    );

    // Get the access token
    const token = await client.getAccessToken();

    if (!token.token) {
      throw new Error("Failed to get access token");
    }

    return NextResponse.json({
      access_token: token.token,
      expires_in: 3600 // Google tokens typically expire in 1 hour
    });
  } catch (error) {
    console.error("Error getting Google auth token:", error);
    return NextResponse.json(
      { error: "Failed to get authentication token" },
      { status: 500 }
    );
  }
}
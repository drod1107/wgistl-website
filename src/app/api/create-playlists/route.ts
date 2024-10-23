// app/api/create-playlists/route.ts
import { NextResponse } from 'next/server';
import { YouTubeOAuthManager } from '@/lib/youtubeAuth';

// Type for the expected request body
interface CreatePlaylistsRequest {
  orgName: string;
}

// Type for the response
interface CreatePlaylistsResponse {
  unlistedId: string;
  publicId: string;
}

export async function POST(request: Request) {
  try {
    // Validate environment variables
    if (!process.env.YOUTUBE_CLIENT_ID || 
        !process.env.YOUTUBE_CLIENT_SECRET || 
        !process.env.YOUTUBE_REFRESH_TOKEN) {
      console.error('Missing required YouTube API credentials');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Parse and validate request body
    const body: CreatePlaylistsRequest = await request.json();
    const { orgName } = body;

    if (!orgName) {
      return NextResponse.json(
        { error: 'Organization name is required' },
        { status: 400 }
      );
    }

    // Initialize YouTube OAuth manager
    const oauthManager = new YouTubeOAuthManager({
      clientId: process.env.YOUTUBE_CLIENT_ID,
      clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
      refreshToken: process.env.YOUTUBE_REFRESH_TOKEN,
    });

    // Get a valid token
    const token = await oauthManager.getValidToken();

    // Create unlisted playlist
    const unlistedResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/playlists?part=snippet,status',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          snippet: {
            title: `${orgName} - raw content and uploads`,
            description: 'Raw content and uploaded footage for use in WGISTL projects'
          },
          status: {
            privacyStatus: 'unlisted'
          }
        })
      }
    );

    if (!unlistedResponse.ok) {
      const error = await unlistedResponse.json();
      console.error('Failed to create unlisted playlist:', error);
      return NextResponse.json(
        { error: 'Failed to create unlisted playlist' },
        { status: unlistedResponse.status }
      );
    }

    const unlistedData = await unlistedResponse.json();
    const unlistedId = unlistedData.id;

    // Create public playlist
    const publicResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/playlists?part=snippet,status',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          snippet: {
            title: orgName,
            description: `WGISTL finished social media content for ${orgName}`
          },
          status: {
            privacyStatus: 'public'
          }
        })
      }
    );

    if (!publicResponse.ok) {
      const error = await publicResponse.json();
      console.error('Failed to create public playlist:', error);
      return NextResponse.json(
        { error: 'Failed to create public playlist' },
        { status: publicResponse.status }
      );
    }

    const publicData = await publicResponse.json();
    const publicId = publicData.id;

    // Return both playlist IDs
    const response: CreatePlaylistsResponse = {
      unlistedId,
      publicId
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in create-playlists route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Add rate limiting or additional security measures
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
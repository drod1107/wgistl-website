// app/api/getList/route.ts
import { NextResponse } from "next/server";
import { YouTubeOAuthManager } from "@/lib/youtubeAuth";

// Types for YouTube API response
interface YouTubeVideoSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: {
    default: { url: string; width: number; height: number };
    medium: { url: string; width: number; height: number };
    high: { url: string; width: number; height: number };
    standard?: { url: string; width: number; height: number };
    maxres?: { url: string; width: number; height: number };
  };
  channelTitle: string;
  playlistId: string;
  position: number;
  resourceId: {
    kind: string;
    videoId: string;
  };
}

interface PlaylistItem {
  kind: string;
  etag: string;
  id: string;
  snippet: YouTubeVideoSnippet;
}

interface PlaylistResponse {
  kind: string;
  etag: string;
  items: PlaylistItem[];
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  nextPageToken?: string;
}

interface VideoData {
  id: string;
  snippet: YouTubeVideoSnippet;
  embedUrl: string;
}

export async function GET(req: Request) {
  // Validate environment variables
  if (
    !process.env.YOUTUBE_CLIENT_ID ||
    !process.env.YOUTUBE_CLIENT_SECRET ||
    !process.env.YOUTUBE_REFRESH_TOKEN
  ) {
    console.error("Missing required YouTube API credentials");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const playlistId = searchParams.get("playlistId");

  if (!playlistId) {
    return NextResponse.json({ error: "Missing playlist ID" }, { status: 400 });
  }

  try {
    console.log("Fetching playlist:", playlistId);

    const youtube = new YouTubeOAuthManager({
      clientId: process.env.YOUTUBE_CLIENT_ID,
      clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
      refreshToken: process.env.YOUTUBE_REFRESH_TOKEN,
    });

    const token = await youtube.getValidToken();

    // First, verify the playlist exists and we can access it
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Playlist check response:", {
      status: playlistResponse.status,
      ok: playlistResponse.ok,
    });

    const playlistData = await playlistResponse.json();
    console.log("Playlist data:", playlistData);

    // Then fetch the playlist items
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails,status&playlistId=${playlistId}&maxResults=50`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("PlaylistItems response:", {
      status: response.status,
      ok: response.ok,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("YouTube API error:", error);
      return NextResponse.json(
        { error: error.error?.message || "Failed to fetch playlist items" },
        { status: response.status }
      );
    }

    const data: PlaylistResponse = await response.json();
    console.log("Full API Response:", data);

    if (!data.items?.length) {
      console.log("No items found in playlist");
      return NextResponse.json([]);
    }

    const videoData: VideoData[] = data.items.map((item) => ({
      id: item.snippet.resourceId.videoId,
      snippet: item.snippet,
      embedUrl: `https://www.youtube.com/embed/${item.snippet.resourceId.videoId}`,
    }));

    console.log("Processed video data:", {
      count: videoData.length,
      firstVideo: videoData[0],
    });

    return NextResponse.json(videoData);
  } catch (error) {
    console.error("Detailed error in getList route:", error);
    return NextResponse.json(
      { error: "Error fetching video data" },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

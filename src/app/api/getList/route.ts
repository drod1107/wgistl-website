// src/app/api/getList/route.ts

import { NextResponse } from "next/server";
import { refreshAccessToken } from "@/lib/utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const playlistId = searchParams.get("playlistId"); // Extract playlistId from query params

  if (!playlistId) {
    return NextResponse.json({ error: "Missing playlist ID" }, { status: 400 });
  }

  try {
    const token = await refreshAccessToken();

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const videoData = data.items.map((item: object | any) => ({
      id: item.snippet.resourceId.videoId,
      snippet: item.snippet,
    }));

    return NextResponse.json(videoData, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching video data' }, { status: 500 });
  }
}

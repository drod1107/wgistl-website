import { refreshAccessToken } from "@/lib/utils";

export const createPlaylist = async (title: string, description: string, privacyStatus: string): Promise<string> => {
    const accessToken = await refreshAccessToken();
  
    const response = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet,status', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        snippet: {
          title: title,
          description: description,
        },
        status: {
          privacyStatus: privacyStatus, // Can be 'private' or 'unlisted' as needed
        },
      }),
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(`Failed to create playlist: ${data.error.message}`);
    }
  
    return data.id; // Return the created playlist ID
  };
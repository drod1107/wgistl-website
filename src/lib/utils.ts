import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID as string;
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET as string;
const REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN as string;

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

/**
 * Utility function to refresh the YouTube OAuth2 access token.
 * This should be called before any API request to ensure you have a valid token.
 */
export const refreshAccessToken = async (): Promise<string> => {
  // Check if the access token is still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    // Return the existing token if it's still valid
    return accessToken;
  }

  // If no valid access token, request a new one using the refresh token
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to refresh access token: ${data.error}`);
  }

  // Store the new access token and its expiry time (in milliseconds)
  accessToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000; // 'expires_in' is in seconds

  if (accessToken === null) {
    throw new Error('Access token is null');
  }
  return accessToken;
};

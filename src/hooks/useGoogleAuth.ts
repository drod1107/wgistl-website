// hooks/useGoogleAuth.ts
import { useState, useEffect, useCallback } from 'react';

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

interface UseGoogleAuthResult {
  token: string | null;
  loading: boolean;
  error: Error | null;
  refreshToken: () => Promise<void>;
}

export function useGoogleAuth(): UseGoogleAuthResult {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [expiryTime, setExpiryTime] = useState<number | null>(null);

  const fetchToken = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/google');
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data: TokenResponse = await response.json();
      setToken(data.access_token);
      // Set expiry time to slightly before actual expiry (5 minutes)
      setExpiryTime(Date.now() + (data.expires_in - 300) * 1000);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch token'));
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    setLoading(true);
    await fetchToken();
  }, [fetchToken]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  // Set up automatic token refresh
  useEffect(() => {
    if (!expiryTime) return;

    const timeUntilExpiry = expiryTime - Date.now();
    if (timeUntilExpiry <= 0) {
      refreshToken();
      return;
    }

    const refreshTimeout = setTimeout(refreshToken, timeUntilExpiry);
    return () => clearTimeout(refreshTimeout);
  }, [expiryTime, refreshToken]);

  return { token, loading, error, refreshToken };
}
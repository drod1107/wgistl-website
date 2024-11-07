'use client';

import { useState, useEffect } from 'react';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { DriveClient, DriveFile, DriveError } from '@/lib/DriveClient';
import VideoPlayer from './VideoPlayerNoDel';
import { Loader2, AlertCircle } from 'lucide-react';

interface VideoGalleryNoDelProps {
  folderId: string;
}

export default function VideoGalleryNoDel({ folderId }: VideoGalleryNoDelProps) {
  const [videos, setVideos] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, loading: authLoading } = useGoogleAuth();

  useEffect(() => {
    const fetchVideos = async () => {
      if (!token || authLoading) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const driveClient = new DriveClient(token);
        const files = await driveClient.listFiles(folderId);
        const videoFiles = files.filter(file => 
          file.mimeType.startsWith('video/') || 
          file.mimeType === 'application/vnd.google-apps.video'
        );
        
        setVideos(videoFiles);
      } catch (err) {
        setError(err instanceof DriveError ? err.message : 'Failed to load videos.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [token, authLoading, folderId]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-content-secondary">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-hero" />
        <p className="text-sm">Loading your content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        <div className="card-raised bg-red-50 border-l-4 border-red-500 p-6 max-w-md w-full">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-red-700 mb-1">Error Loading Videos</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        <div className="card bg-surface-secondary/50 border-2 border-dashed border-gray-200 text-center max-w-md w-full">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-surface-tertiary flex items-center justify-center">
              <svg className="w-8 h-8 text-content-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-content-secondary font-medium">
              No videos yet.<br/> If you&apos;ve uploaded content, please be patient - we will have finished assets for you soon!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <VideoPlayer
          key={video.id}
          title={video.name}
          description={video.description || ''}
          thumbnailUrl={video.thumbnailLink}
          createdAt={video.createdTime}
          videoId={video.id}
        />
      ))}
    </div>
  );
}
// components/VideoGallery.tsx
'use client'

import { useState, useEffect } from 'react';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { DriveClient, DriveFile, DriveError } from '@/lib/DriveClient';
import VideoPlayer from './VideoPlayer';

interface VideoGalleryProps {
  folderId: string;
}

const VideoGallery = ({ folderId }: VideoGalleryProps) => {
  const [videos, setVideos] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { token, loading: authLoading, error: authError } = useGoogleAuth();

  useEffect(() => {
    const fetchVideos = async () => {
      if (!token || authLoading) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const driveClient = new DriveClient(token);
        const files = await driveClient.listFiles(folderId);
        
        // Filter for video files only
        const videoFiles = files.filter(file => 
          file.mimeType.startsWith('video/') || 
          file.mimeType === 'application/vnd.google-apps.video'
        );
        
        setVideos(videoFiles);
      } catch (err) {
        console.error('Error fetching videos:', err);
        if (err instanceof DriveError) {
          setError(err.message);
        } else {
          setError('Failed to load videos. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [token, authLoading, folderId]);

  const handleDelete = async (videoId: string) => {
    if (!token) return;

    try {
      const driveClient = new DriveClient(token);
      await driveClient.deleteFile(videoId);
      setVideos(prevVideos => prevVideos.filter(video => video.id !== videoId));
    } catch (err) {
      console.error('Error deleting video:', err);
      if (err instanceof DriveError) {
        setError(err.message);
      } else {
        setError('Failed to delete video. Please try again later.');
      }
    }
  };

  if (authLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center p-8">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="w-full h-full flex justify-center items-center p-8">
        <p className="text-red-500">Authentication error. Please try signing in again.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center p-8">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex justify-center items-center p-8">
        <div className="text-center">
          <p className="text-lg text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="w-full h-full flex justify-center items-center p-8">
        <p className="text-lg text-gray-600">No videos found in this folder</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {videos.map((video) => (
          <div key={video.id} className="w-full">
            <VideoPlayer
              title={video.name}
              description={video.description || ''}
              thumbnailUrl={video.thumbnailLink}
              createdAt={video.createdTime}
              videoId={video.id}
              onDelete={handleDelete}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoGallery;
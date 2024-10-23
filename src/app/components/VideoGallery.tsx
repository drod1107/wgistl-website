// components/VideoGallery.tsx
'use client'

import { useState, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';
import type { VideoData } from '@/types/youtube';

interface VideoGalleryProps {
  id: string;
}

const VideoGallery = ({ id }: VideoGalleryProps) => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/getList?playlistId=${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: VideoData[] = await response.json();
        console.log('VideoGallery received data:', {
          dataLength: data.length,
          firstItem: data[0]
        });
        setVideos(data);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setError('Error loading videos. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchVideos();
    }
  }, [id]);

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
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="w-full h-full flex justify-center items-center p-8">
        <p className="text-lg text-gray-600">No videos found in this playlist</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {videos.map((video) => (
          <div key={video.id} className="w-full">
            <VideoPlayer
              title={video.snippet.title}
              description={video.snippet.description}
              embedUrl={video.embedUrl}
              thumbnail={video.snippet.thumbnails.high}
              publishedAt={video.snippet.publishedAt}
              channelTitle={video.snippet.channelTitle}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoGallery;
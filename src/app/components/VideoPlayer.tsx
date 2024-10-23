// components/VideoPlayer.tsx
import { useState } from 'react';
import Image from 'next/image';

interface VideoPlayerProps {
  title: string;
  description: string;
  embedUrl: string;
  thumbnail: {
    url: string;
    width: number;
    height: number;
  };
  publishedAt: string;
  channelTitle: string;
}

export default function VideoPlayer({
  title,
  description,
  embedUrl,
  thumbnail,
  publishedAt,
  channelTitle
}: VideoPlayerProps) {
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative aspect-video">
        {/* Thumbnail as placeholder */}
        {!isIframeLoaded && (
          <Image
            src={thumbnail.url}
            alt={`Thumbnail for ${title}`}
            className="absolute top-0 left-0 w-full h-full object-cover"
            layout="fill"
          />
        )}
        {/* Play button overlay on thumbnail */}
        {!isIframeLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-black bg-opacity-70 rounded-full flex items-center justify-center">
              <div className="w-0 h-0 border-t-8 border-t-transparent border-l-16 border-l-white border-b-8 border-b-transparent ml-1" />
            </div>
          </div>
        )}
        <iframe
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-300 ${
            isIframeLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          onLoad={() => setIsIframeLoaded(true)}
        />
      </div>
      <div className="p-4 flex flex-col gap-2">
        <h3 className="text-lg font-semibold line-clamp-2" title={title}>
          {title}
        </h3>
        <div className="text-sm text-gray-600">
          <p>{channelTitle}</p>
          <p>{formatDate(publishedAt)}</p>
        </div>
        <p className="text-gray-700 line-clamp-3" title={description}>
          {description}
        </p>
      </div>
    </div>
  );
}
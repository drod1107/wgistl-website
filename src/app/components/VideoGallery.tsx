// VideoGallery.tsx

import VideoPlayer from './VideoPlayer';

interface VideoGalleryProps {
  id: string; // Playlist ID passed as a prop
}

interface VideoSnippet {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: {
      default: {
        url: string;
        width: number;
        height: number;
      };
    };
  };
}

const VideoGallery = async ({ id }: VideoGalleryProps) => {
  try {
    // Fetch the videos using the playlist ID
    const response = await fetch(`/api/getList?playlistId=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    return (
      <div className="w-full h-full flex flex-col justify-center items-center">
        {data.map((video: VideoSnippet) => (
          <VideoPlayer
            key={video.id.videoId}
            title={video.snippet.title}
            description={video.snippet.description}
            embedUrl={`https://www.youtube.com/embed/${video.id.videoId}`}
          />
        ))}
      </div>
    );
  } catch (error) {
    console.error(error);
    return (
      <div className="w-full h-full flex justify-center items-center">
        <p>Error loading videos</p>
      </div>
    );
  }
};

export default VideoGallery;

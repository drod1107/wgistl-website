// src/app/pages/Main.tsx

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import VideoGallery from "../VideoGallery";

export default function Main() {
  const { userId }: { userId: string | null } = auth();
  const playlistId = process.env.YOUTUBE_PLAYLIST_ID; // Define or dynamically set your playlist ID

  if (!userId) {
    return (
      <>
        <div className="flex justify-center items-center h-screen">
          <h1 className="text-4xl font-bold text-gray-800 font-oswald">
            Please sign in to continue:
          </h1>
          <SignUpButton />
          <SignInButton />
        </div>
      </>
    );
  } else if (!playlistId) {
    return (
      <>
        <div className="flex justify-center items-center h-screen">
          <h2 className="text-4xl font-bold text-gray-800 font-oswald">
            It appears that a playlist was not successfully created for you. Please contact admin@wgistl.com for assistance.<br/><br/>We should be able to resolve this issue quickly, and we thank you for your patience!
          </h2>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div className="flex justify-center items-center h-screen">
          <h1 className="text-4xl font-bold text-gray-800 font-oswald">
            Main Page
          </h1>
          {/* Pass the playlistId to VideoGallery */}
          <VideoGallery id={playlistId} />
        </div>
      </>
    );
  }
}

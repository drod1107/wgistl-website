// src/app/components/main/page.tsx
'use client'

import { SignInButton, SignUpButton, useAuth, useUser } from "@clerk/nextjs";
import VideoGallery from "../VideoGallery";

export default function Main() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();

  // Show loading state while Clerk loads
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show sign-in prompt for non-authenticated users
  if (!userId) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-6">
        <h1 className="text-4xl font-bold text-gray-800 font-oswald text-center px-4">
          Please sign in to continue:
        </h1>
        <div className="flex gap-4">
          <SignInButton mode="modal">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Sign Up
            </button>
          </SignUpButton>
        </div>
      </div>
    );
  }

  // Get the organization name and playlist ID from user metadata
  const orgName = user?.unsafeMetadata?.org_name as string;
  const unlistedId = user?.unsafeMetadata?.unlistedId as string;

  // Show error if no playlist ID is found
  if (!unlistedId) {
    return (
      <div className="flex justify-center items-center h-screen px-4">
        <div className="max-w-2xl text-center">
          <h2 className="text-4xl font-bold text-gray-800 font-oswald mb-6">
            Playlist Not Found
          </h2>
          <p className="text-xl text-gray-600 mb-4">
            It appears that a playlist was not successfully created for your organization.
          </p>
          <p className="text-xl text-gray-600">
            Please contact{' '}
            <a 
              href="mailto:admin@wgistl.com" 
              className="text-blue-600 hover:underline"
            >
              admin@wgistl.com
            </a>
            {' '}for assistance.
            <br />
            We should be able to resolve this issue quickly, and we thank you for your patience!
          </p>
        </div>
      </div>
    );
  }

  // Show the main content with VideoGallery
  return (
    <div className="flex flex-col min-h-screen p-4">
      <h1 className="text-3xl font-bold text-gray-800 font-oswald mb-8 text-center">
        {orgName}&apos;s Content Dashboard
      </h1>
      <div className="flex-grow">
        <VideoGallery id={unlistedId} />
      </div>
    </div>
  );
}
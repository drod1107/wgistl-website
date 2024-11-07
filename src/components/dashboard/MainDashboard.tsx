'use client';

import { SignInButton, useAuth, useUser } from "@clerk/nextjs";
import VideoGallery from "./VideoGallery";
import VideoUpload from "./VideoUpload";
import Link from "next/link";
export default function MainDashboard() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hero"></div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-surface-primary to-surface-secondary p-6">
        <div className="content-container-sm text-center space-y-8">
          <h1 className="text-5xl font-bold font-oswald">
            Welcome to Your{' '}
            <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="text-xl text-content-secondary font-montserrat">
            Please sign in to access your content dashboard. Amplify your impact with WGISTL by managing and sharing your resources.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignInButton mode="modal">
              <button className="px-8 py-3 rounded-lg border-2 border-blue text-blue hover:bg-blue hover:text-white transition-colors font-semibold w-full sm:w-auto">
                Sign In
              </button>
            </SignInButton>
            <Link href="/signup">
              <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orgName = user?.unsafeMetadata?.org_name as string;
  const unlistedId = user?.unsafeMetadata?.unlistedId as string;

  if (!unlistedId) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-surface-primary p-8">
        <div className="card-raised max-w-2xl text-center space-y-6">
          <h2 className="text-4xl font-bold font-oswald mb-4">Playlist Not Found</h2>
          <p className="text-lg text-content-secondary">
            It seems your playlist wasn&apos;t successfully created. Please reach out to support for assistance.
          </p>
          <a
            href="mailto:admin@wgistl.com"
            className="inline-block px-6 py-3 bg-blue hover:bg-blue-dark text-white rounded-lg transition-colors font-semibold"
          >
            Contact Support
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 pb-12 bg-gradient-to-br from-surface-primary to-surface-secondary">
      <div className="content-container">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold font-oswald text-gradient">
              {orgName}&apos;s Content Dashboard
            </h1>
            <p className="text-lg text-content-secondary">
              Please be aware that uploads may take a moment to process and preview.
            </p>
          </div>

          {/* Upload Section */}
          <div className="card-raised bg-gradient-to-br from-hero/5 to-blue/5">
            <VideoUpload folderId={unlistedId} />
          </div>

          {/* Beta Notice */}
          <div className="card border-l-4 border-gold bg-gold/5">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <span className="text-2xl">ℹ️</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">During our beta launch phase...</h3>
                <p className="text-content-secondary">
                  There may be delays in the appearance of preview thumbnails. You may be required to click through to view the content.
                  Also be aware that uploads will continue to process for some time after upload before they can be viewed.
                  Thank you for your patience as we grow and evolve!
                </p>
              </div>
            </div>
          </div>

          {/* Gallery Section */}
          <VideoGallery folderId={unlistedId} />
        </div>
      </div>
    </div>
  );
}
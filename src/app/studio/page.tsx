'use client';

import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { DriveClient } from '@/lib/DriveClient';
import VideoGallery from "@/components/dashboard/VideoGallery";
import VideoUpload from "@/components/dashboard/VideoUpload";
import Header from "@/components/layout/Header";
import { Loader2, FolderOpen } from 'lucide-react';

interface Folder {
  id: string;
  name: string;
  modifiedTime?: string;
  fileCount?: number;
}

export default function Page() {
  const router = useRouter();
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const { token, loading: authLoading } = useGoogleAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Debug log effect
  useEffect(() => {
    console.log('Auth State:', {
      isLoaded,
      userId,
      superuser: user?.unsafeMetadata?.superuser,
      token: !!token,
      authLoading
    });
  }, [isLoaded, userId, user, token, authLoading]);

  // Modified auth check with clearer logic
  useEffect(() => {
    if (!isLoaded) {
      console.log('Auth not loaded yet');
      return;
    }

    console.log('Checking superuser status:', {
      userId,
      superuser: user?.unsafeMetadata?.superuser
    });

    // Only redirect if we're definitely not a superuser
    if (userId && user && user?.unsafeMetadata?.superuser !== true) {
      console.log('Not a superuser, redirecting');
      router.push('/');
      return;
    }

    console.log('Superuser check passed');
  }, [isLoaded, userId, user, router]);

  // Fetch folders
  useEffect(() => {
    const fetchFolders = async () => {
      if (!token || authLoading || !userId || user?.unsafeMetadata?.superuser !== true) return;

      try {
        const driveClient = new DriveClient(token);
        const response = await driveClient.listFiles('root');
        const foldersList = response.filter(file =>
          file.mimeType === 'application/vnd.google-apps.folder'
        ).map(folder => ({
          id: folder.id,
          name: folder.name,
          modifiedTime: folder.createdTime,
        }));
        setFolders(foldersList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch folders');
      }
    };

    fetchFolders();
  }, [token, authLoading, userId, user]);

  // Show loading state while checking auth
  if (!isLoaded || authLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-surface-primary flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </>
    );
  }

  // If not superuser, show nothing
  if (!userId || user?.unsafeMetadata?.superuser !== true) {
    return null;
  }

  // Error state
  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-surface-primary flex items-center justify-center text-red-500">
          {error}
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen pt-16 pb-12 bg-gradient-to-br from-surface-primary to-surface-secondary">
        <div className="content-container">
          <h1 className="text-4xl md:text-5xl font-bold font-oswald text-gradient mb-8">
            WGISTL Studio Dashboard
          </h1>

          {/* Folders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {folders.length === 0 ? (
              <div className="col-span-full text-center text-content-secondary">
                No folders found
              </div>
            ) : folders.map((folder) => (
              <div
                key={folder.id}
                className="card hover:shadow-prominent transition-all duration-300 cursor-pointer"
                onClick={() => {
                  setSelectedFolder(folder);
                  setShowModal(true);
                }}
              >
                <div className="flex items-center gap-3">
                  <FolderOpen className="w-6 h-6 text-hero" />
                  <h3 className="text-xl font-semibold text-content-primary">{folder.name}</h3>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation(); // Prevent opening the folder
                      if (!token) return; // Early return if no token
                      if (window.confirm(`Are you sure you want to delete the folder "${folder.name}" and all its contents?`)) {
                        try {
                          const driveClient = new DriveClient(token);
                          await driveClient.deleteFolder(folder.id);
                          setFolders(folders.filter(f => f.id !== folder.id));
                        } catch (err) {
                          console.error('Failed to delete folder:', err);
                          alert('Failed to delete folder. Please try again.');
                        }
                      }
                    }}
                    className="ml-auto text-red-500 hover:text-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
                {folder.modifiedTime && (
                  <p className="text-sm text-content-secondary mt-2">
                    Last modified: {new Date(folder.modifiedTime).toLocaleDateString()}
                  </p>

                )}
              </div>
            ))}
          </div>

          {/* Folder Content Modal */}
          {showModal && selectedFolder && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 pt-28">
              <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">{selectedFolder.name}</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Close
                  </button>
                </div>

                <VideoUpload folderId={selectedFolder.id} />
                <div className="mt-8">
                  <VideoGallery folderId={selectedFolder.id} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
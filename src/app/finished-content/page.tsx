// components/dashboard/MainDashboard.tsx
'use client'

import { SignInButton, useAuth, useUser } from "@clerk/nextjs";
import VideoGalleryNoDel from "@/components/dashboard/VideoGalleryNoDel";
import Header from "@/components/layout/Header";
import Link from "next/link";

export default function MainDashboard() {
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
            <>
                <Header />
                <div className="flex flex-col justify-center items-center h-screen gap-6">
                    <h1 className="text-4xl font-bold text-gray-800 font-oswald text-center px-4">
                        Please sign in to continue:
                    </h1>
                    <div className="flex gap-4">
                        <SignInButton mode="modal">
                            <button className="px-6 py-2 bg-blue-light text-white rounded-lg hover:bg-blue-700 transition-colors">
                                Sign In
                            </button>
                        </SignInButton>
                        <Link href="/signup">
                            <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                Sign Up
                            </button>
                        </Link>
                    </div>
                </div></>
        );
    }

    // Get the organization name and folder IDs from user metadata
    const orgName = user?.unsafeMetadata?.org_name as string;
    const publicId = user?.unsafeMetadata?.publicId as string;  // This is for raw content

    // Show error if no folder ID is found
    if (!publicId) {
        return (
            <>
                <Header />
                <div className="flex justify-center items-center h-screen px-4">
                    <div className="max-w-2xl text-center">
                        <h2 className="text-4xl font-bold text-gray-800 font-oswald mb-6">
                            Playlist Not Found
                        </h2>
                        <p className="text-xl text-gray-600 mb-4">
                            It appears that a playlist for finished assets was not successfully created for your organization.
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
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="flex flex-col min-h-screen p-4 m-16">
                <h1 className="text-3xl font-bold text-gray-800 font-oswald mb-8 text-center">
                    {orgName}&apos;s Finished Assets Gallery
                </h1>
                <h2 className="text-2xl font-bold text-gray-800 font-oswald mb-4 text-center">
                    Note: During our beta launch phase,</h2>
                <p className="text-xl text-gray-600 mb-4">
                    ...all uploaded content is processed manually by our team, and as such, will not be immediately visible.<br /><br />
                    We plan to upgrade to a more automated process as we scale, but until then, finished content may take upwards of 1 - 2 weeks to process and upload to your gallery.<br /><br />
                    Please bear this in mind when uploading content. <br /><br />
                    If you have any questions, you can email the founder at: <a href="mailto:david@wgistl.com" className="text-blue-600 hover:underline">david@wgistl.com</a><br /><br />
                    Thank you for your patience as we grow and evolve!
                </p>
                <div className="flex-grow">
                    <VideoGalleryNoDel folderId={publicId} />
                </div>
            </div>
        </>
    );
}
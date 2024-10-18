
// app/page.tsx
// Importing necessary dependencies from Next.js
import Head from 'next/head'; // Allows adding metadata to the <head> section of the HTML document
// import Link from 'next/link'; // For linking between pages within the application
import Header from './components/Header'; // Importing the Header component for reuse on this page

// Defining the Home component which represents the landing page
export default function Home() {
  return (
    // Main container for the Home component with Tailwind CSS classes
    <div className="min-h-screen flex flex-col">
      {/* Adding metadata to the page */}
      <Head>
        <title>WGISTL - What&apos;s Good in St. Louis?</title>
        <meta name="description" content="Amplifying the voices of those making a positive difference in St. Louis." />
      </Head>
      {/* Reusing the Header component */}
      <Header />
      {/* Main content area with the background video */}
      <main className="flex-1 flex items-center justify-center relative">
        {/* Background video that plays automatically, muted, and loops */}
        <video autoPlay muted loop className="absolute top-0 left-0 w-full h-full object-cover">
          <source src="/video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Content overlaid on top of the video with a transparent background */}
        <div className="bg-black bg-opacity-50 p-8 rounded-lg text-center relative z-10">
          <h1 className="text-5xl font-bold text-white font-oswald">What&apos;s Good in St. Louis?</h1>
          <p className="text-xl text-white mt-4 font-montserrat">
            Amplifying voices, connecting resources, and ending the cycle of inequity in St. Louis&apos; nonprofit space.
          </p>
        </div>
      </main>
    </div>
  );
}
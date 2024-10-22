
// app/page.tsx
// Importing necessary dependencies from Next.js
import Head from 'next/head'; // Allows adding metadata to the <head> section of the HTML document
// import Link from 'next/link'; // For linking between pages within the application
import Header from './components/Header'; // Importing the Header component for reuse on this page
import { SignUpButton } from '@clerk/nextjs';

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
          <iframe width="auto" height="500" src="https://www.youtube.com/embed/QYp_N8CoNMc?si=PG_vGkfcWRHQxAEz" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen>Your browser does not support the video tag.</iframe>
        {/* Content overlaid on top of the video with a transparent background */}
      </main>
      <div className="bg-black bg-opacity-50 p-8 rounded-lg text-center relative z-10">
        <h1 className="text-5xl font-bold text-white font-oswald">What&apos;s Good in St. Louis?</h1>
        <p className="text-xl text-white mt-4 font-montserrat">
          Amplifying voices, connecting resources, and ending the cycle of inequity in St. Louis&apos; nonprofit space.
        </p>
        <p className="text-xl text-white mt-4 font-montserrat">
          Join us on our mission to make a positive difference in St. Louis&apos; nonprofit space.
        </p>
        <p className="text-xl text-white mt-4 font-montserrat">
          If your org could use FREE social media assets like the one above,<br /> <strong>click the button below to get started </strong><br />and see how we can help you to <br /><strong className="text-red-800">amplify your voice</strong><br /> and <br /><strong className="text-red-800">deepen your impact.</strong>
        </p>
        <p className="text-xl text-white text-bold mt-4 font-montserrat">
          <strong>...Without spending a penny.</strong>
        </p>
        <SignUpButton>
          <button className="bg-white text-black font-bold py-2 px-4 rounded my-5">Sign Up</button>
        </SignUpButton>
      </div>
    </div>
  );
}
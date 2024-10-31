// components/LandingContent.tsx
import { SignUpButton } from '@clerk/nextjs';

export default function LandingContent() {
  return (
    <>
      <main className="flex-1 flex items-center justify-center relative m-5">
        <iframe 
          width="auto" 
          height="500" 
          src="https://www.youtube.com/embed/QYp_N8CoNMc?si=PG_vGkfcWRHQxAEz" 
          title="YouTube video player" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          referrerPolicy="strict-origin-when-cross-origin" 
          allowFullScreen
        >
          Your browser does not support the video tag.
        </iframe>
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
          If your org could use FREE social media assets like the one above,<br /> 
          <strong>click the button below to get started </strong><br />
          and learn how we can help you to <br />
          <strong className="text-red-800">amplify your voice</strong><br /> 
          and <br />
          <strong className="text-red-800">deepen your impact.</strong>
        </p>
        <p className="text-xl text-white text-bold mt-4 font-montserrat">
          <strong>...Without spending a penny.</strong>
        </p>
        <SignUpButton>
          <button className="bg-white text-black font-bold py-2 px-4 rounded my-5">
            Sign Up
          </button>
        </SignUpButton>
      </div>
    </>
  );
}
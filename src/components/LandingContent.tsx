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
          Loud voices are drowning out the quiet servants of change. We aim to do something about it.
        </p>
        <h2 className="text-4xl text-white mt-4 font-oswald">TLDR: We do for free what others are paying money for so you can do what really matters instead.</h2>
        
        <p className="text-xl text-white mt-4 font-montserrat">
          WGISTL and the What&apos;s Good Network are devoted to helping organizations who are making <br/><strong className="text-red-800">real impact</strong><br/> in your city and connecting them with:
        </p>
        <ul className="text-xl text-white mt-4 font-montserrat">
          <li>Donors and Small Donation Networks</li>
          <li>Volunteers</li>
          <li>Other Orgs in Adjacent Missions</li>
          <li>Vetted Suppliers, Vendors, and Service Providers</li>
        </ul>
          <p className="text-xl text-white mt-4 font-montserrat">
          ...to amplify their voices, boost their impact, and help bring our ultimate vision to bear.
        </p>
        <h3 className="text-xl text-white mt-4 font-montserrat">What&apos;s Good Network believes we have all we need to solve the world&apos;s problems - if we just learn to work together.</h3>
        
        <p className="text-xl text-white mt-4 font-montserrat">
          Healthy Competition is for business - not public service. If you believe collaboration and communication are the key to overcoming our challenges, we invite you to join us in our mission to change how America does change.
        </p>
        <p className="text-xl text-white mt-4 font-montserrat">
          If your org could use FREE social media assets like the one above, or you want to be a part of the What&apos;s Good Movement, <br /> 
          <br/><strong>click the button below to get learn what that looks like and to get started </strong><br/><br />
          Let&apos;s <br />
          <br/><strong className="text-red-800">amplify your voice</strong><br/><br /> 
          and <br />
          <br/><strong className="text-red-800">deepen your impact.</strong><br/>
        </p>
        <p className="text-xl text-white text-bold mt-4 font-montserrat">
          <br/><strong>...Without spending a penny.</strong><br/>
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
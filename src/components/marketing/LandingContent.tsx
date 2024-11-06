'use client';

import { SignUpButton } from '@clerk/nextjs';

export default function LandingContent() {
  return (
    <>
      <header className="relative">
        {/* Header Content */}
        <div className="absolute inset-0 bg-white/50 z-0" /> {/* Overlay */}
        <div className="relative flex flex-col justify-center items-center bg-white/40 backdrop-blur-md rounded-2xl p-10">

          <h1 className="text-5xl md:text-7xl font-bold text-center font-oswald mb-8 mt-16">
            What&apos;s Good in{' '}
            <span className="text-gradient bg-gradient-to-r from-hero via-gold to-blue">
              St. Louis?
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-center max-w-3xl mb-12 font-montserrat">
            Amplifying voices, connecting resources, and ending the cycle of inequity in St. Louis&apos;s nonprofit space.
          </p>

          <p className="text-xl md:text-2xl text-center font-montserrat">
            Loud voices are drowning out the quiet servants of change. We aim to do something about it.
          </p>
        </div>
      </header>

      {/* Video Section */}
      <div className="video-container relative my-12">
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
      </div>

      {/* Mission Section */}
      <section className="section bg-surface-secondary">
        <div className="content-container">
          <h2 className="text-4xl md:text-5xl font-bold text-center font-oswald mb-8">
            TLDR: We do for free what others are paying money for so you can do what really matters instead.
          </h2>

          <div className="card-raised bg-gradient-to-br from-hero/5 to-blue/5 backdrop-blur-sm my-12">
            <p className="text-xl text-content-primary mb-8">
              WGISTL and the What&apos;s Good Network are devoted to helping organizations who are making{' '}
              <strong className="text-hero">real impact</strong> in your city and connecting them with:
            </p>

            <ul className="space-y-4 text-lg text-content-secondary mb-8">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-hero rounded-full"></span>
                <span>Donors and Small Donation Networks</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue rounded-full"></span>
                <span>Volunteers</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-gold rounded-full"></span>
                <span>Other Orgs in Adjacent Missions</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-hero rounded-full"></span>
                <span>Vetted Suppliers, Vendors, and Service Providers</span>
              </li>
            </ul>

            <p className="text-xl text-content-primary">
              ...to amplify their voices, boost their impact, and help bring our ultimate vision to bear.
            </p>
          </div>

          <h3 className="text-2xl md:text-3xl text-center font-oswald mb-8">
            What&apos;s Good Network believes we have all we need to solve the world&apos;s problems - if we just learn to work together.
          </h3>

          <div className="max-w-4xl mx-auto space-y-8">
            <p className="text-xl text-content-secondary text-center">
              Healthy Competition is for business - not public service. If you believe collaboration and communication are the key to overcoming our challenges, we invite you to join us in our mission to change how America does change.
            </p>

            <div className="text-center space-y-6">
              <p className="text-xl text-content-secondary">
                If your org could use FREE social media assets like the one above, or you want to be a part of the What&apos;s Good Movement,<br />
                <strong>click the button below to learn what that looks like or to get started</strong>
              </p>

              <p className="text-2xl font-oswald space-y-2">
                Let&apos;s<br />
                <strong className="text-hero">amplify your voice</strong><br />
                and<br />
                <strong className="text-blue">deepen your impact.</strong>
              </p>

              <p className="text-2xl font-bold">
                ...Without spending a penny.
              </p>

              <SignUpButton>
                <button className="bg-hero hover:bg-hero-dark text-white font-bold py-3 px-8 rounded-lg transform hover:scale-105 transition-all shadow-raised">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

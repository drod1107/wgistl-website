// components/Header.tsx
// Importing the Link component from Next.js for navigation
import Link from 'next/link';
import Image from 'next/image';
import { SignedIn, SignedOut, SignOutButton, SignInButton, SignUpButton } from '@clerk/nextjs';


// Header component definition, reused in multiple parts of the application
export default function Header() {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center" style={{ maxWidth: '100vw', margin: '0 auto' }}>
      {/* Site logo using the hero color and Oswald font */}
      <Link href="/" legacyBehavior>
        <div className="flex items-start flex-row gap-3">
          <Image
            src="/images/logo.png"
            alt="WGISTL logo"
            width={100}
            height={100}
          />
        </div>
      </Link>

      <h1 className="text-4xl mx-5 font-semibold text-gray-800 font-oswald header-title">What&apos;s Good in St. Louis?</h1>
      {/* Navigation links to LinkedIn and Sign Up page */}

      <>
        <nav className="flex gap-4">
          <Link href="https://www.linkedin.com/company/wgistl" legacyBehavior>
            <a target="_blank" className="text-blue-600 hover:underline font-montserrat">LinkedIn</a>
          </Link>
          <SignedOut>
            <SignInButton />
            <SignUpButton />
          </SignedOut>
          <SignedIn>
            <Link href="/" legacyBehavior>
              <a target="_blank" className="text-blue-600 hover:underline font-montserrat">Home</a>
            </Link>
            <SignOutButton />
          </SignedIn>
        </nav>
      </>
    </header>
  );
}
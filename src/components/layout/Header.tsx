// components/layout/Header.tsx
import Link from 'next/link';
import Image from 'next/image';
import { SignedIn, SignedOut, SignOutButton, SignInButton, SignUpButton } from '@clerk/nextjs';

export default function Header() {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center" style={{ maxWidth: '100vw', margin: '0 auto' }}>
      {/* Site logo */}
      <Link href="/" className="flex items-start flex-row gap-3">
        <Image
          src="/images/logo.png"
          alt="WGISTL logo"
          width={100}
          height={100}
          priority
        />
      </Link>

      <h1 className="text-4xl mx-5 font-semibold text-gray-800 font-oswald header-title">
        What&apos;s Good in St. Louis?
      </h1>

      {/* Navigation and Auth Buttons */}
      <nav className="flex items-center gap-4">
        <Link 
          href="https://www.linkedin.com/company/wgistl"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline font-montserrat"
        >
          LinkedIn
        </Link>
        
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-montserrat">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-montserrat">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
        
        <SignedIn>
          <Link 
            href="/"
            className="text-blue-600 hover:underline font-montserrat"
          >
            Home
          </Link>
          <SignOutButton>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-montserrat">
              Sign Out
            </button>
          </SignOutButton>
        </SignedIn>
      </nav>
    </header>
  );
}
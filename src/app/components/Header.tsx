// components/Header.tsx
// Importing the Link component from Next.js for navigation
import Link from 'next/link';
import Image from 'next/image';
import { useUser, SignedIn, SignedOut, SignOutButton,SignInButton, SignUpButton, ClerkProvider } from '@clerk/nextjs';


// Header component definition, reused in multiple parts of the application
export default function Header() {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
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

      <h1 className="text-4xl mx-5 font-semibold text-gray-800 font-oswald header-title">What's Good in St. Louis?</h1>
      {/* Navigation links to LinkedIn and Sign Up page */}

      <>
      <nav className="flex gap-4">
        <Link href="https://www.linkedin.com/company/wgistl" legacyBehavior>
          <a target="_blank" className="text-blue-600 hover:underline font-montserrat">LinkedIn</a>
        </Link>
      </nav>
      <SignedOut>
      <SignInButton />
      <SignUpButton />
      </SignedOut>
      <SignedIn>
      <SignOutButton />
      </SignedIn>
      </>
    </header>
  );
}
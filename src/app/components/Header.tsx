// components/Header.tsx
// Importing the Link component from Next.js for navigation
import Link from 'next/link';

// Header component definition, reused in multiple parts of the application
export default function Header() {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      {/* Site logo using the hero color and Oswald font */}
      <h1 className="text-2xl font-bold font-oswald text-hero">WGISTL</h1>
      {/* Navigation links to LinkedIn and Sign Up page */}
      <nav className="flex gap-4">
        <Link href="https://www.linkedin.com/company/wgistl" legacyBehavior>
          <a target="_blank" className="text-blue-600 hover:underline font-montserrat">LinkedIn</a>
        </Link>
        <Link href="/signup" legacyBehavior>
          <a className="text-blue-600 hover:underline font-montserrat">Sign Up</a>
        </Link>
      </nav>
    </header>
  );
}
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SignedIn, SignedOut, SignOutButton, useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoaded, user } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-sticky transition-all duration-300 ${
        isScrolled ? 'glass border-b border-gray-200/20 shadow-soft' : 'bg-transparent'
      }`}
    >
      <div className="content-container">
        <nav className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo - Same for all sizes */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Image
                src="/images/logo.png"
                alt="WGISTL logo"
                width={50}
                height={50}
                priority
                className="rounded-full border-2 border-white/20 group-hover:border-white/40 transition-colors shadow-raised"
              />
              {!isScrolled && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-hero/20 to-blue/20 blur-sm" />
              )}
            </div>
            <h1 className={`text-xl font-oswald font-semibold tracking-wide hidden sm:block transition-colors ${
              isScrolled ? 'text-content-primary' : 'text-slate-600'
            }`}>
              What&apos;s Good in St. Louis?
            </h1>
          </Link>

          {/* Navigation Links - Transform based on viewport */}
          <div className={`transition-all duration-300
            md:flex md:items-center md:gap-6
            ${isMenuOpen ? 'absolute top-full left-0 right-0 glass border-t border-gray-200/20 p-4' : 'hidden'}
            ${isMenuOpen ? 'flex flex-col space-y-2' : 'md:flex-row md:space-y-0'}
          `}>
            {/* Standard Links */}
            <Link 
              href="https://www.linkedin.com/company/wgistl"
              target="_blank"
              rel="noopener noreferrer"
              className={`font-montserrat transition-colors px-4 py-2 rounded-lg
                ${isScrolled ? 'text-content-secondary hover:text-content-primary' : 'text-slate-600/80 hover:text-blue-light'}
                ${isMenuOpen ? 'hover:bg-surface-secondary' : ''}
                w-full md:w-auto text-left
              `}
            >
              LinkedIn
            </Link>
            <Link 
              href="/"
              className={`font-montserrat transition-colors px-4 py-2 rounded-lg
                ${isScrolled ? 'text-content-secondary hover:text-content-primary' : 'text-slate-600/80 hover:text-blue-light'}
                ${isMenuOpen ? 'hover:bg-surface-secondary' : ''}
                w-full md:w-auto text-left
              `}
            >
              Home
            </Link>
            <Link 
              href="/finished-content"
              className={`font-montserrat transition-colors px-4 py-2 rounded-lg
                ${isScrolled ? 'text-content-secondary hover:text-content-primary' : 'text-slate-600/80 hover:text-blue-light'}
                ${isMenuOpen ? 'hover:bg-surface-secondary' : ''}
                w-full md:w-auto text-left
              `}
            >
              Finished Content
            </Link>

            {/* Conditional Studio Link */}
            {isLoaded && user && user.unsafeMetadata?.superuser === true && (
              <Link 
                href="/studio"
                className={`font-montserrat transition-colors px-4 py-2 rounded-lg
                  ${isScrolled ? 'text-content-secondary hover:text-content-primary' : 'text-slate-600/80 hover:text-blue-light'}
                  ${isMenuOpen ? 'hover:bg-surface-secondary' : ''}
                  w-full md:w-auto text-left
                `}
              >
                Studio
              </Link>
            )}

            {/* Auth Buttons */}
            <SignedIn>
              <SignOutButton>
                <button className={`transition-colors px-4 py-2 rounded-lg font-medium
                  bg-hero hover:bg-hero-dark text-white shadow-soft
                  w-full md:w-auto text-center
                `}>
                  Sign Out
                </button>
              </SignOutButton>
            </SignedIn>

            <SignedOut>
              <div className={`flex ${isMenuOpen ? 'flex-col' : 'flex-row'} gap-2`}>
                <Link href="/login" className="w-full md:w-auto">
                  <button className={`transition-colors px-4 py-2 rounded-lg font-medium
                    ${isMenuOpen ? 'w-full text-content-primary hover:bg-surface-secondary' : ''}
                  `}>
                    Sign In
                  </button>
                </Link>
                <Link href="/signup" className="w-full md:w-auto">
                  <button className="w-full px-4 py-2 bg-hero hover:bg-hero-dark text-white rounded-lg font-medium transition-colors shadow-soft">
                    Sign Up
                  </button>
                </Link>
              </div>
            </SignedOut>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg transition-colors text-content-primary hover:bg-surface-secondary"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
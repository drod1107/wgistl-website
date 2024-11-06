'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SignedIn, SignedOut, SignOutButton, SignInButton, SignUpButton } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          {/* Logo Section */}
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
              isScrolled ? 'text-content-primary' : 'text-white'
            }`}>
              What&apos;s Good in St. Louis?
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="https://www.linkedin.com/company/wgistl"
              target="_blank"
              rel="noopener noreferrer"
              className={`font-montserrat transition-colors ${
                isScrolled ? 'text-content-secondary hover:text-content-primary' : 'text-white/80 hover:text-white'
              }`}
            >
              LinkedIn
            </Link>
            
            <SignedOut>
              <div className="flex items-center gap-4">
                <SignInButton mode="modal">
                  <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isScrolled 
                      ? 'text-content-primary hover:bg-surface-secondary' 
                      : 'text-white hover:bg-white/10'
                  }`}>
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 py-2 bg-hero hover:bg-hero-dark text-white rounded-lg font-medium transition-colors shadow-soft">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>
            
            <SignedIn>
              <SignOutButton>
                <button className="px-4 py-2 bg-hero hover:bg-hero-dark text-white rounded-lg font-medium transition-colors shadow-soft">
                  Sign Out
                </button>
              </SignOutButton>
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg transition-colors text-content-primary hover:bg-surface-secondary"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="glass border-t border-gray-200/20 px-4 py-6 space-y-4">
              <Link 
                href="https://www.linkedin.com/company/wgistl"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 text-content-secondary hover:text-content-primary rounded-lg hover:bg-surface-secondary transition-colors"
              >
                LinkedIn
              </Link>
              
              <SignedOut>
                <div className="space-y-2 px-4">
                  <SignInButton mode="modal">
                    <button className="w-full px-4 py-2 text-content-primary hover:bg-surface-secondary rounded-lg transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="w-full px-4 py-2 bg-hero hover:bg-hero-dark text-white rounded-lg transition-colors">
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              </SignedOut>
              
              <SignedIn>
                <div className="px-4">
                  <SignOutButton>
                    <button className="w-full px-4 py-2 bg-hero hover:bg-hero-dark text-white rounded-lg transition-colors">
                      Sign Out
                    </button>
                  </SignOutButton>
                </div>
              </SignedIn>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}


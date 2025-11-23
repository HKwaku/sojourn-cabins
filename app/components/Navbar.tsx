'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Experiences', href: '/#experiences' },
    { name: 'Cabins', href: '/#cabins' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Rates', href: '/rates' },
    { name: 'Directions', href: '/getting-here' },
    { name: 'Terms & Conditions', href: '/terms-and-conditions' },
  ]

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-sm py-3'
            : 'bg-transparent py-4'
        }`}
      >
        {/* logo kept far left on mobile */}
        <div className="max-w-7xl mx-auto px-1 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo (size unchanged) */}
            <Link
              href="/"
              className={`flex items-center gap-3 transition-colors duration-300 ${
                scrolled ? 'text-black' : 'text-white'
              }`}
            >
              <div className="relative w-48 h-28">
                <Image
                  src="/logo.png"
                  alt="/logo.png"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm tracking-wider uppercase font-light transition-all duration-300 hover:opacity-60 ${
                    scrolled ? 'text-black' : 'text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right side: Book (desktop only) + social icons (all) + mobile menu button */}
            <div className="flex items-center gap-3">
              {/* Desktop Book button */}
              <Link
                href="/book-escape"
                className={`hidden lg:inline-flex px-6 py-3 text-sm tracking-[0.2em] uppercase font-medium transition-all duration-300 ${
                  scrolled
                    ? 'bg-black text-white hover:bg-gray-900'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Book
              </Link>

              {/* Social icons – visible on desktop & mobile */}
              <div className="flex items-center gap-3">
                {/* Instagram */}
                <a
                  href="https://instagram.com/sojourncabins"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`transition-opacity hover:opacity-70 ${
                    scrolled ? 'text-black' : 'text-white'
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3h10zm-5 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm4.5-.75a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z" />
                  </svg>
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@sojourncabins"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`transition-opacity hover:opacity-70 ${
                    scrolled ? 'text-black' : 'text-white'
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12.75 2h3.5c.1 1.6.8 2.8 2.1 3.7 1 .7 2.2 1 3.4 1v3.6c-1.6-.1-3-.6-4.4-1.6v6.4c0 2.9-2.4 5.3-5.3 5.3S6.2 18.9 6.2 16s2.4-5.3 5.3-5.3c.3 0 .6 0 .9.1V14c-.3-.1-.6-.2-.9-.2-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2V2z" />
                  </svg>
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/233547484568"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className={`transition-opacity hover:opacity-70 ${
                    scrolled ? 'text-black' : 'text-white'
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12.04 2C6.57 2 2.17 6.4 2.17 11.86c0 2.06.6 3.96 1.75 5.63L2 22l4.65-1.88a9.9 9.9 0 0 0 5.39 1.56h.01c5.47 0 9.87-4.4 9.87-9.86C21.92 6.4 17.5 2 12.04 2zm0 17.9c-1.66 0-3.28-.45-4.7-1.31l-.34-.2-2.76 1.11 1.06-2.84-.22-.29a7.78 7.78 0 0 1-1.54-4.71c0-4.28 3.48-7.76 7.76-7.76 4.28 0 7.76 3.48 7.76 7.76 0 4.28-3.48 7.76-7.76 7.76z" />
                  </svg>
                </a>
              </div>

              {/* Mobile Menu Button (shifted slightly left with mr-2) */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden mr-2 flex flex-col gap-1.5 w-8 transition-colors duration-300 ${
                  scrolled ? 'text-black' : 'text-white'
                }`}
                aria-label="Toggle menu"
              >
                <span
                  className={`h-0.5 w-full bg-current transition-transform duration-300 ${
                    mobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                  }`}
                />
                <span
                  className={`h-0.5 w-full bg-current transition-opacity duration-300 ${
                    mobileMenuOpen ? 'opacity-0' : ''
                  }`}
                />
                <span
                  className={`h-0.5 w-full bg-current transition-transform duration-300 ${
                    mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu (unchanged, no social icons inside) */}
      <div
        className={`fixed inset-0 z-40 bg-white transform transition-transform duration-500 lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-36 pb-8 px-6">
          <div className="flex-1 flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xl font-serif font-light text-black hover:opacity-60 transition-opacity"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <Link
            href="/book-escape"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full py-4 bg-black text-white text-center text-sm tracking-[0.2em] uppercase font-medium"
          >
            Book Your Escape
          </Link>
        </div>
      </div>
    </>
  )
}

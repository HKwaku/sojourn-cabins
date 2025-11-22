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
    { name: 'Our Cabins', href: '/#cabins' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Rates', href: '/rates' },
    { name: 'Getting Here', href: '/getting-here' },
    { name: 'Terms & Conditions', href: '/terms-and-conditions' },
  ]

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-sm py-3' // was py-4
            : 'bg-transparent py-4' // was py-6
        }`}
      >
        {/* reduced horizontal padding to nudge logo left */}
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
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
            <div className="hidden lg:flex items-center gap-8">
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

            {/* Book Button */}
            <div className="hidden lg:block">
              <Link
                href="/book-escape"
                className={`px-8 py-3 text-sm tracking-[0.2em] uppercase font-medium transition-all duration-300 ${
                  scrolled
                    ? 'bg-black text-white hover:bg-gray-900'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Book Now
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden flex flex-col gap-1.5 w-8 transition-colors duration-300 ${
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
      </nav>

      {/* Mobile Menu */}
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
                // smaller text size for mobile menu items
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

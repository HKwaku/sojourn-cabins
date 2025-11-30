'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'


export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 🔹 Start fade and navigation together
  const handleNav = (href: string) => {
  const page = document.querySelector('.page-transition') as HTMLElement | null

  const isAnchor = href.includes('#')
  const baseHref = href.split('#')[0] || '/'
  const isSameRoute = baseHref === pathname

  // 🔹 For anchor links or same route (e.g. clicking "Home" on "/"):
  // don't fade, just navigate and ensure blur is removed.
  if (isAnchor || isSameRoute) {
    if (page) page.classList.remove('fade-out')
    router.push(href)
    return
  }

  // 🔹 If wrapper missing, just navigate
  if (!page) {
    router.push(href)
    return
  }

  // 🔹 Normal page navigation: fade out + navigate
  page.classList.add('fade-out')
  router.push(href)
}


  // 🔹 When the route/path changes, fade back in
  useEffect(() => {
    const page = document.querySelector('.page-transition') as HTMLElement | null
    if (page) {
      // Remove fade-out so it transitions back to opacity: 1
      page.classList.remove('fade-out')
    }
  }, [pathname])

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
            ? 'bg-white/95 backdrop-blur-xl shadow-sm py-1'
            : 'bg-transparent py-1'
        }`}
      >
        {/* logo kept far left on mobile */}
        <div className="max-w-7xl mx-auto px-5 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo (size unchanged) */}
            <Link
              href="/"
              className={`flex items-center gap-3 transition-colors duration-300 ${
                scrolled ? 'text-black' : 'text-white'
              }`}
            >
              <div className="relative w-[150px] h-[85px]">
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
                <div
                  key={link.name}
                  onClick={() => handleNav(link.href)}
                  className={`cursor-pointer text-sm tracking-wider uppercase font-light transition-all duration-300 hover:opacity-60 ${
                    scrolled ? 'text-black' : 'text-white'
                  }`}
                >
                  {link.name}
                </div>
              ))}
            </div>

            {/* Right side: Book (desktop only) + social icons (all) + mobile menu button */}
            <div className="flex items-center gap-3">
              {/* Desktop Book button */}
              <div
                onClick={() => handleNav('/book-escape')}
                className={`hidden lg:inline cursor-pointer px-6 py-3 rounded-full text-sm tracking-[0.2em] uppercase font-medium transition-all duration-300 ${
                  scrolled
                    ? 'bg-black text-white hover:bg-gray-900'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Book
              </div>

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
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
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

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 bg-white transform transition-transform duration-500 lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-36 pb-8 px-6">
          <div className="flex-1 flex flex-col gap-6">
            {navLinks.map((link) => (
              <div
                key={link.name}
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleNav(link.href)
                }}
                className="text-2xl font-serif font-light text-black hover:opacity-60 transition-opacity"
              >
                {link.name}
              </div>
            ))}
          </div>

          <div
            onClick={() => {
              setMobileMenuOpen(false)
              handleNav('/book-escape')
            }}
            className="w-full py-4 rounded-full bg-black text-white text-center text-sm tracking-[0.2em] uppercase font-medium"
          >
            Book Your Escape
          </div>
        </div>
      </div>
    </>
  )
}
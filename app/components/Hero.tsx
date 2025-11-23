'use client'

import { useState, useEffect } from 'react'

export default function Hero() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Full-Screen Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/hero-fallback.jpg"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source 
            src="https://res.cloudinary.com/dszk8iplz/video/upload/q_auto:best,w_1920/v1762465861/hero-background.mp4_dx6ous.mp4" 
            type="video/mp4" 
          />
        </video>
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />
      </div>

      {/* Centered CTAs Only */}
      <div className="relative z-10 text-center px-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a 
            href="/book-escape" 
            className="w-full sm:w-auto px-14 py-5 rounded-full bg-white text-black text-sm md:text-base font-medium tracking-[0.25em] uppercase hover:bg-black hover:text-white transition-all duration-500 shadow-2xl hover:scale-105"
          >
            Book Your Escape
          </a>
          <a 
            href="#cabins" 
            className="w-full sm:w-auto px-14 py-5 rounded-full border-2 border-white text-white text-sm md:text-base font-medium tracking-[0.25em] uppercase hover:bg-white hover:text-black transition-all duration-500"
          >
            Explore Cabins
          </a>
        </div>
      </div>

      {/* Stats Bar - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-md border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-3 gap-3 text-center text-white">
            <div className="flex flex-col items-center">
              <div className="text-2xl md:text-3xl font-light mb-1">3</div>
              <div className="text-xs md:text-sm tracking-wider uppercase opacity-80">Luxury Cabins</div>
            </div>
            <div className="flex flex-col items-center border-x border-white/20">
              <div className="text-2xl md:text-3xl font-light mb-1">∞</div>
              <div className="text-xs md:text-sm tracking-wider uppercase opacity-80">Ocean Views</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl md:text-3xl font-light mb-1">✓</div>
              <div className="text-xs md:text-sm tracking-wider uppercase opacity-80">Concierge</div>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal Scroll Indicator */}
      <div className={`absolute bottom-24 left-1/2 -translate-x-1/2 transition-opacity duration-500 ${scrolled ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex flex-col items-center gap-2 text-white/60">
          <div className="w-px h-8 bg-gradient-to-b from-white/60 to-transparent animate-pulse" />
        </div>
      </div>
    </section>
  )
}
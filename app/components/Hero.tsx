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
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
      </div>

      {/* Centered Content */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        {/* Main Headline - Larger, More Dramatic */}
        <h1 className="font-serif font-light text-white mb-8 leading-[1.1] tracking-tight animate-fadeInUp">
          <span className="block text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-4">
            Welcome to an adventure
          </span>
          <span className="block text-4xl md:text-5xl lg:text-6xl xl:text-7xl opacity-90">
            that feels like home
          </span>
        </h1>
        
        {/* Subtitle - More Refined */}
        <p className="text-white/90 text-lg md:text-xl lg:text-2xl font-light max-w-3xl mx-auto mb-12 leading-relaxed tracking-wide animate-fadeIn" 
           style={{ animationDelay: '0.3s' }}>
          Beachfront mirror cabins. Contemporary architecture. Breathtaking landscapes.
        </p>

        {/* CTA - More Prominent */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeIn" style={{ animationDelay: '0.6s' }}>
          <a 
            href="/book-escape" 
            className="group relative px-12 py-5 bg-white text-black text-sm font-medium tracking-[0.2em] uppercase overflow-hidden transition-all duration-500 hover:bg-black hover:text-white"
          >
            <span className="relative z-10">Book Your Escape</span>
            <div className="absolute inset-0 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </a>
          <a 
            href="#cabins" 
            className="px-12 py-5 border-2 border-white text-white text-sm font-medium tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all duration-500"
          >
            Explore Cabins
          </a>
        </div>
      </div>

      {/* Scroll Indicator - More Elegant */}
      <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 transition-opacity duration-500 ${scrolled ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex flex-col items-center gap-3 text-white animate-bounce">
          <span className="text-xs tracking-[0.3em] uppercase font-light">Scroll</span>
          <div className="w-px h-16 bg-gradient-to-b from-white to-transparent" />
        </div>
      </div>

      {/* Floating Info Bar - Premium Touch */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent backdrop-blur-sm py-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
          <div>
            <div className="text-3xl font-light mb-1">3</div>
            <div className="text-xs tracking-widest uppercase opacity-80">Luxury Cabins</div>
          </div>
          <div>
            <div className="text-3xl font-light mb-1">★ 5.0</div>
            <div className="text-xs tracking-widest uppercase opacity-80">Guest Rating</div>
          </div>
          <div>
            <div className="text-3xl font-light mb-1">∞</div>
            <div className="text-xs tracking-widest uppercase opacity-80">Ocean Views</div>
          </div>
          <div>
            <div className="text-3xl font-light mb-1">24/7</div>
            <div className="text-xs tracking-widest uppercase opacity-80">Concierge</div>
          </div>
        </div>
      </div>
    </section>
  )
}
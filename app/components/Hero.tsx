import Image from 'next/image'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Video Background from Cloudinary */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/hero-fallback.jpg"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      >
        <source 
          src="https://res.cloudinary.com/dszk8iplz/video/upload/q_auto:low,w_1920/v1762465861/hero-background.mp4_dx6ous.mp4" 
          type="video/mp4" 
        />
      </video>
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white">
        <h1 className="font-light text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight mb-6 tracking-wide">
          Welcome to an adventure that feels like home
          <span className="block mt-4 text-2xl md:text-3xl lg:text-4xl opacity-90">
            ...built with your comfort in mind
          </span>
        </h1>
        
        <p className="text-base md:text-lg lg:text-xl font-light leading-relaxed max-w-4xl mx-auto mb-12 opacity-95">
          Our exquisitely designed beach-front mirror cabins offer a unique chance to rent a cabin 
          and disconnect and unwind surrounded by contemporary architecture of the highest standards 
          as well as breathtakingly beautiful landscapes and beaches.
        </p>

        {/* CTA Button */}
        <a 
          href="/book-escape" 
          className="inline-block px-10 py-4 bg-white text-black text-sm md:text-base font-medium tracking-widest uppercase hover:bg-gray-100 transition-all duration-300 hover:scale-105"
        >
          Book Your Escape
        </a>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg 
          className="w-6 h-6 text-white opacity-60" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </section>
  )
}
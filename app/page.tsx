import Hero from './components/Hero'
import AmenitiesSection from './components/AmenitiesSection'
import Image from 'next/image'

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Introduction Section - Magazine Style */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm tracking-[0.3em] uppercase text-gray-500 mb-6">
            Escape • Unwind • Reconnect
          </p>
          <h2 className="font-serif font-light text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-8 leading-tight">
            Barefoot Luxury on the
            <span className="block mt-2">Atlantic Coast</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 font-light leading-relaxed">
            Our exquisitely designed beachfront mirror cabins offer a unique sanctuary to disconnect and unwind, 
            surrounded by contemporary architecture and breathtakingly beautiful landscapes.
          </p>
        </div>
      </section>

      {/* Cabins Section - Full-Width Immersive */}
      <section id="cabins" className="bg-gray-50">
        {/* SUN Cabin */}
        <div className="relative h-screen">
          <Image
            src="/cabins/sun.jpg"
            alt="SUN Cabin"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">
              <div className="max-w-2xl">
                <div className="text-white/40 text-8xl md:text-9xl font-light mb-6">01</div>
                <h3 className="text-white text-4xl md:text-5xl lg:text-6xl font-serif font-light mb-6">
                  SUN Cabin
                </h3>
                <p className="text-white/90 text-lg md:text-xl font-light leading-relaxed mb-8 max-w-xl">
                  A luxurious one-storey mirror cabin escape with panoramic views of the Atlantic Ocean, 
                  your own personal balcony, private pool and lounge area
                </p>
                <div className="flex flex-wrap gap-3 mb-8">
                  {['Ocean View', 'Private Pool', 'Balcony', 'King Bed'].map((feature) => (
                    <span key={feature} className="px-4 py-2 border border-white/30 text-white text-sm tracking-wider uppercase backdrop-blur-sm">
                      {feature}
                    </span>
                  ))}
                </div>
                <a 
                  href="/book-escape" 
                  className="inline-block px-10 py-4 rounded-full bg-white text-black text-sm tracking-[0.2em] uppercase font-medium hover:bg-black hover:text-white transition-all duration-500"
                >
                  Reserve SUN
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* SEA Cabin */}
        <div className="relative h-screen">
          <Image
            src="/cabins/sea.jpg"
            alt="SEA Cabin"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/40 to-transparent" />
          
          <div className="relative z-10 h-full flex items-center justify-end">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full flex justify-end">
              <div className="max-w-2xl text-right">
                <div className="text-white/40 text-8xl md:text-9xl font-light mb-6">02</div>
                <h3 className="text-white text-4xl md:text-5xl lg:text-6xl font-serif font-light mb-6">
                  SEA Cabin
                </h3>
                <p className="text-white/90 text-lg md:text-xl font-light leading-relaxed mb-8 max-w-xl ml-auto">
                  A private mirror cabin escape with a stunning view of the Atlantic ocean, 
                  your own personal balcony, private pool and lounge area
                </p>
                <div className="flex flex-wrap gap-3 mb-8 justify-end">
                  {['Atlantic View', 'Private Pool', 'Terrace', 'Queen Bed'].map((feature) => (
                    <span key={feature} className="px-4 py-2 border border-white/30 text-white text-sm tracking-wider uppercase backdrop-blur-sm">
                      {feature}
                    </span>
                  ))}
                </div>
                <a 
                  href="/book-escape" 
                  className="inline-block px-10 py-4 rounded-full bg-white text-black text-sm tracking-[0.2em] uppercase font-medium hover:bg-black hover:text-white transition-all duration-500"
                >
                  Reserve SEA
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* SAND Cabin */}
        <div className="relative h-screen">
          <Image
            src="/cabins/sand.jpg"
            alt="SAND Cabin"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">
              <div className="max-w-2xl">
                <div className="text-white/40 text-8xl md:text-9xl font-light mb-6">03</div>
                <h3 className="text-white text-4xl md:text-5xl lg:text-6xl font-serif font-light mb-6">
                  SAND Cabin
                </h3>
                <p className="text-white/90 text-lg md:text-xl font-light leading-relaxed mb-8 max-w-xl">
                  A private mirror cabin escape with Atlantic views, 
                  your own personal balcony, private pool and lounge area
                </p>
                <div className="flex flex-wrap gap-3 mb-8">
                  {['Coastal View', 'Private Pool', 'Patio', 'King Bed'].map((feature) => (
                    <span key={feature} className="px-4 py-2 border border-white/30 text-white text-sm tracking-wider uppercase backdrop-blur-sm">
                      {feature}
                    </span>
                  ))}
                </div>
                <a 
                  href="/book-escape" 
                  className="inline-block px-10 py-4 rounded-full bg-white text-black text-sm tracking-[0.2em] uppercase font-medium hover:bg-black hover:text-white transition-all duration-500"
                >
                  Reserve SAND
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Divider - Immersive Image */}
      <section className="relative h-[60vh]">
        <Image
          src="/amenities-feature.jpg"
          alt="Sojourn experience"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="text-center text-white px-6">
            <p className="text-5xl md:text-6xl lg:text-7xl font-serif font-light mb-4">
              "A little piece of heaven"
            </p>
            <p className="text-lg tracking-[0.3em] uppercase opacity-80">Guest Testimonial</p>
          </div>
        </div>
      </section>

      {/* Amenities Section - UPDATED with new component */}
      <AmenitiesSection />

      {/* Experiences Section - Split Screen Layout */}
      <section id="experiences" className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-32 px-6">
          <div className="text-center mb-20">
            <p className="text-sm tracking-[0.3em] uppercase text-gray-500 mb-4">Indulge</p>
            <h2 className="text-4xl md:text-5xl font-serif font-light mb-6">
              Curated Experiences
            </h2>
            <p className="text-lg text-gray-600 font-light max-w-3xl mx-auto">
              From private chef services to wellness treatments and creative pursuits, 
              every moment is crafted for your perfect escape
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Private Chef */}
            <div className="group">
              <div className="relative h-96 mb-6 overflow-hidden">
                <Image
                  src="/experiences/chef.jpg"
                  alt="Private Chef Experience"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-6 left-6 w-16 h-16 bg-white/90 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-3xl">🍽️</span>
                </div>
              </div>
              <h3 className="text-2xl font-serif font-light mb-4">Private Chef Experience</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Indulge in a culinary journey with locally-sourced ingredients and international flavors, 
                personally curated by our executive chef.
              </p>
              <a href="/book-escape" className="text-sm tracking-wider uppercase underline underline-offset-4 hover:no-underline transition-all">
                Learn More →
              </a>
            </div>

            {/* Wellness */}
            <div className="group">
              <div className="relative h-96 mb-6 overflow-hidden">
                <Image
                  src="/experiences/wellness.jpg"
                  alt="Wellness Services"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-6 left-6 w-16 h-16 bg-white/90 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-3xl">🧘</span>
                </div>
              </div>
              <h3 className="text-2xl font-serif font-light mb-4">Wellness & Rejuvenation</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Choose from Swedish, Deep Tissue & Holistic Massages, Body Treatments, 
                Reflexology, and Restorative Facials.
              </p>
              <a href="/book-escape" className="text-sm tracking-wider uppercase underline underline-offset-4 hover:no-underline transition-all">
                View Services →
              </a>
            </div>

            {/* Creative */}
            <div className="group">
              <div className="relative h-96 mb-6 overflow-hidden">
                <Image
                  src="/experiences/paint.jpg"
                  alt="Creative Expression"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-6 left-6 w-16 h-16 bg-white/90 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-3xl">🎨</span>
                </div>
              </div>
              <h3 className="text-2xl font-serif font-light mb-4">Creative Expression</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Get bubbly and creative with our intimate sip & paint sessions, 
                guided by local artists.
              </p>
              <a href="/book-escape" className="text-sm tracking-wider uppercase underline underline-offset-4 hover:no-underline transition-all">
                Book Session →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section - Full Width */}
      <section className="relative h-[80vh]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source 
            src="https://res.cloudinary.com/dszk8iplz/video/upload/q_auto:best/v1762465861/hero-background.mp4_dx6ous.mp4" 
            type="video/mp4" 
          />
        </video>
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 text-white">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif font-light mb-8">
            Your escape awaits
          </h2>
          <p className="text-xl md:text-2xl font-light mb-12 max-w-2xl">
            Limited availability. Book your dates now.
          </p>
          <a 
            href="/book-escape" 
            className="px-16 py-6 rounded-full bg-white text-black text-sm tracking-[0.2em] uppercase font-medium hover:bg-transparent hover:text-white hover:border-2 hover:border-white transition-all duration-500"
          >
            Check Availability
          </a>
        </div>
      </section>
    </>
  )
}
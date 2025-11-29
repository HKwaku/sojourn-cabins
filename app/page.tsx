'use client'

import { useState } from 'react'
import Hero from './components/Hero'
import AmenitiesSection from './components/AmenitiesSection'
import Image from 'next/image'

export default function HomePage() {
  const [selectedExperience, setSelectedExperience] = useState<number | null>(null)

  const experiences = [
    {
      id: 1,
      title: 'Private Chef Experience',
      image: '/experiences/chef.jpg',
      shortDescription: 'Indulge in a culinary journey with locally-sourced ingredients and international flavors, personally curated by our executive chef.',
      fullDescription: 'Experience the epitome of culinary excellence with our private chef service. Our executive chef crafts personalized menus using the finest locally-sourced ingredients and international flavors. Each meal is a celebration of taste, artfully prepared and served in the comfort of your cabin or under the stars.',
      menuLink: "/chef-menu", 
      highlights: [
        'Personalized menu consultation',
        'Locally-sourced fresh ingredients',
        'International and local fusion cuisine',
        'In-cabin or outdoor dining setup',
        'Professional service and presentation'
      ]
    },
    {
      id: 2,
      title: 'Wellness & Rejuvenation',
      image: '/experiences/wellness.jpg',
      shortDescription: 'Choose from Swedish, Deep Tissue & Holistic Massages, Body Treatments, Reflexology, and Restorative Facials.',
      fullDescription: 'Restore balance and tranquility with our comprehensive wellness treatments. Our skilled therapists offer a range of services designed to rejuvenate your body and mind, from therapeutic massages to luxurious facials, all in the serene setting of your private retreat.',
      highlights: [
        'Swedish & Deep Tissue Massage',
        'Holistic Massage',
        'Reflexology sessions',
        'Restorative facial treatments',
        'Body scrubs and wraps',
      ]
    },
    {
      id: 3,
      title: 'Saxophone Experience',
      image: '/experiences/sax.jpg',
      shortDescription: 'Be serenaded by our exceptional professional saxophonist while you dine under the stars.',
      fullDescription: 'Elevate your evening with the soulful sounds of our professional saxophonist. Whether during a romantic dinner or a special celebration, live saxophone music creates an unforgettable ambiance that complements the natural beauty of the Atlantic coast.',
      highlights: [
        'Professional saxophonist performance',
        'Customizable song selection',
        'Perfect for romantic dinners',
        'Indoor or beachside performance',
        '1-2 hour performances available'
      ]
    },
    {
      id: 4,
      title: 'Dinner Under The Stars',
      image: '/experiences/dinner.jpg',
      shortDescription: 'Romantic dinner under the stars with that special someone along with our exquisite bon-fire experience.',
      fullDescription: 'Create magical memories with an intimate dinner under the African sky. Our team sets up a beautiful beachside dining experience complete with elegant table settings, ambient lighting, and a crackling bonfire. Perfect for proposals, anniversaries, or simply celebrating love.',
      highlights: [
        'Private beachside setup',
        'Gourmet multi-course meal',
        'Bonfire experience',
        'Romantic ambiance with lighting',
        'Personalized decorations available',
        'Wine pairings'
      ]
    },
    {
      id: 5,
      title: 'Tour Experience',
      image: '/experiences/tour.jpg',
      shortDescription: 'Immerse yourself in the history of Anomabo with our tour of Fort William in the town center!',
      fullDescription: 'Discover the rich history and culture of Anomabo with our guided tour of the historic Fort William. Built in the 18th century, this fortress offers fascinating insights into Ghana\'s colonial past and the trans-Atlantic trade routes. Our knowledgeable guides bring history to life with engaging stories and local perspectives.',
      highlights: [
        'Guided tour of Fort William',
        'Learn about local history and culture',
        'Expert local guides',
        'Photo opportunities',
        'Approximately 2-3 hours',
        'Transportation included'
      ]
    },
    {
      id: 6,
      title: 'Creative Expression',
      image: '/experiences/paint.jpg',
      shortDescription: 'Get bubbly and creative with our intimate sip & paint sessions, guided by local artists.',
      fullDescription: 'Unleash your inner artist in our relaxed sip and paint sessions. Guided by talented local artists, you\'ll create your own masterpiece while enjoying refreshing drinks. No experience necessary – just bring your creativity and sense of fun. Perfect for couples, friends, or solo travelers looking to try something new.',
      highlights: [
        'All materials provided',
        'Alchoholic/non-alcoholic beverages includes',
        'Take home your artwork',
        'Perfect for all skill levels',
        '2-3 hour sessions'
      ]
    }
  ]

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
            <p className="text-lg text-gray-600 font-light max-w-3xl mx-auto mb-4">
              From private chef services to wellness treatments and creative pursuits, 
              every moment is crafted for your perfect escape
            </p>
            <p className="text-sm text-orange-600 font-medium tracking-wide">
              *All experiences must be booked in advance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {experiences.map((experience) => (
              <div key={experience.id} className="group">
                <div className="relative h-96 mb-6 overflow-hidden">
                  <Image
                    src={experience.image}
                    alt={experience.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <h3 className="text-2xl font-serif font-light mb-4">{experience.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {experience.shortDescription}
                </p>
                <button
                  onClick={() => setSelectedExperience(experience.id)}
                  className="text-sm tracking-wider uppercase underline underline-offset-4 hover:no-underline transition-all"
                >
                  Learn More →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Lightbox Modal */}
        {selectedExperience !== null && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 py-8 overflow-y-auto"
            onClick={() => setSelectedExperience(null)}
          >
            <div 
              className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedExperience(null)}
                className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-lg transition-all"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {(() => {
                const exp = experiences.find(e => e.id === selectedExperience)
                if (!exp) return null

                return (
                  <>
                    {/* Hero Image */}
                    <div className="relative h-80 overflow-hidden rounded-t-3xl">
                      <Image
                        src={exp.image}
                        alt={exp.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-8">
                        <h2 className="text-white text-3xl md:text-4xl font-serif font-light">
                          {exp.title}
                        </h2>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-12">
                      <p className="text-gray-700 text-lg leading-relaxed mb-8">
                        {exp.fullDescription}
                      </p>

                      {/* Highlights */}
                      <div className="mb-10">
                        <h3 className="text-xl font-serif font-light text-gray-900 mb-4">
                          What's Included
                        </h3>
                        <ul className="space-y-3">
                          {exp.highlights.map((highlight, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-gray-600">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Chef's Menu Button (only for Private Chef) */}
                      {exp.menuLink && (
                        <div className="flex justify-center mb-6">
                          <a
                            href="/chef-menu"
                            className="inline-flex items-center gap-2 bg-white border-2 border-stone-300 text-stone-700 px-8 py-3 rounded-full font-medium tracking-wide uppercase text-sm hover:bg-stone-50 hover:border-stone-400 transition-all"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            View Chef's Menu
                          </a>
                        </div>
                      )}

                      {/* Book Now Button */}
                      <div className="flex justify-center">
                        <a
                          href="/book-escape"
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-full font-medium tracking-wide uppercase text-sm hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
                        >
                          Book Your Stay Now
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        )}
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
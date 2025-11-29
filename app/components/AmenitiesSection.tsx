export default function AmenitiesSection() {
  const amenities = [
    { 
      name: 'Refrigerator', 
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="5" y="3" width="14" height="18" rx="2" strokeWidth={1.2} />
          <line x1="5" y1="11" x2="19" y2="11" strokeWidth={1.2} />
          <line x1="8" y1="6" x2="8" y2="9" strokeWidth={1.2} strokeLinecap="round" />
          <line x1="8" y1="13" x2="8" y2="16" strokeWidth={1.2} strokeLinecap="round" />
        </svg>
      ),
      description: 'Fully stocked'
    },
    { 
      name: 'Breakfast', 
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M3 11h18M3 11c0-3.866 3.134-7 7-7h4c3.866 0 7 3.134 7 7M3 11v6c0 2.21 1.79 4 4 4h10c2.21 0 4-1.79 4-4v-6" />
          <circle cx="12" cy="8" r="1.5" fill="currentColor" />
          <circle cx="8" cy="8" r="1" fill="currentColor" />
          <circle cx="16" cy="8" r="1" fill="currentColor" />
        </svg>
      ),
      description: 'Daily included'
    },
    { 
      name: 'High-Speed Wifi', 
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
      ),
      description: 'Complimentary'
    },
    { 
      name: 'Outdoor Grill', 
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <ellipse cx="12" cy="11" rx="9" ry="3" strokeWidth={1.2} />
          <path strokeWidth={1.2} strokeLinecap="round" d="M3 11v2c0 1.66 4.03 3 9 3s9-1.34 9-3v-2M7 14v5M17 14v5M12 14v7" />
          <line x1="9" y1="21" x2="15" y2="21" strokeWidth={1.2} strokeLinecap="round" />
          <path strokeWidth={1.2} strokeLinecap="round" d="M8 8c.5-1.5 1.5-2.5 2.5-2.5M12 8c.5-1.5 1.5-2.5 2.5-2.5M16 8c.5-1.5 1.5-2.5 2.5-2.5" />
        </svg>
      ),
      description: 'BBQ ready'
    },
    { 
      name: 'Private Pool', 
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" d="M3 17c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1M3 12c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1" />
          <circle cx="8" cy="7" r="2" strokeWidth={1.2} />
          <path strokeWidth={1.2} strokeLinecap="round" d="M15 5l3 3-3 3" />
        </svg>
      ),
      description: 'Heated option'
    },
    { 
      name: 'Climate Control', 
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          <circle cx="12" cy="12" r="5" strokeWidth={1.2} />
          <path strokeWidth={1.2} strokeLinecap="round" d="M12 9v6M9.5 10.5c.83-.83 2.17-.83 3 0M14.5 13.5c-.83.83-2.17.83-3 0" />
        </svg>
      ),
      description: 'AC & Heating'
    }
  ]

  return (
    <section id="amenities" className="py-24 md:py-32 px-6 bg-gradient-to-b from-white via-stone-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <p className="text-xs tracking-[0.4em] uppercase text-stone-400 mb-4">
            Elevated Amenities
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-light text-stone-900 mb-6">
            Curated for Your Comfort
          </h2>
          <div className="w-16 h-px bg-stone-300 mx-auto mb-6" />
          <p className="text-base md:text-lg text-stone-600 font-light max-w-3xl mx-auto leading-relaxed">
            Every detail designed to help you unwind and connect. 
            We consciously do not have televisions in the cabins.
          </p>
        </div>

        {/* Amenities Grid - Premium card design */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-20">
          {amenities.map((amenity, index) => (
            <div 
              key={amenity.name} 
              className="group relative bg-white rounded-2xl border border-stone-100 p-8 md:p-10 hover:shadow-xl hover:border-stone-200 transition-all duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon Container */}
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 text-stone-400 group-hover:text-stone-600 group-hover:scale-110 transition-all duration-500">
                {amenity.icon}
              </div>
              
              {/* Text Content */}
              <div className="text-center">
                <h3 className="text-base md:text-lg font-serif font-light text-stone-900 mb-2">
                  {amenity.name}
                </h3>
                <p className="text-xs md:text-sm tracking-wider uppercase text-stone-500">
                  {amenity.description}
                </p>
              </div>

              {/* Subtle accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <p className="text-stone-600 font-light leading-relaxed">
            Our amenities are thoughtfully selected to enhance your stay. From daily breakfast to 
            on-demand private chef services, every convenience is designed for your ultimate relaxation.
          </p>
        </div>
      </div>

      {/* Feature Quote Section - Using gradient instead of image */}
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-stone-800 via-stone-900 to-black">
          {/* Decorative pattern overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }} />
          </div>
          
          {/* Content */}
          <div className="relative px-8 py-16 md:px-16 md:py-24 flex items-center justify-center">
            <div className="max-w-3xl text-center">
              <svg className="w-12 h-12 md:w-16 md:h-16 text-orange-400/30 mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-white text-xl md:text-2xl lg:text-3xl font-serif font-light leading-relaxed mb-6">
                Every corner exudes elegance and luxury
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="h-px w-12 bg-orange-400/50" />
                <p className="text-orange-400/70 text-sm tracking-widest uppercase">Guest Review</p>
                <div className="h-px w-12 bg-orange-400/50" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
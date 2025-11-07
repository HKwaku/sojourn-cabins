import Image from 'next/image'

export default function RatesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Enhanced with gradient overlay */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/cabins/sun.jpg"
          alt="/cabins/sea.jpg"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        <div className="relative z-10 text-center text-white px-6 max-w-4xl">
          <p className="text-sm tracking-[0.3em] uppercase mb-4 text-white/90">Exclusive Rates</p>
          <h1 className="text-5xl md:text-7xl font-serif font-light mb-6 leading-tight">Rates & Packages</h1>
          <p className="text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed text-white/90">
            All rates include complimentary walking tour of Anomabo and continental breakfast
          </p>
        </div>
      </section>

      {/* Cabin Rates Section - Enhanced cards */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-sm tracking-[0.3em] uppercase text-gray-500 mb-4">Accommodation</p>
          <h2 className="text-4xl md:text-5xl font-serif font-light mb-4">Cabin Rates</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Choose from our three distinctive mirror cabins, each offering a unique perspective of the coastline</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* SAND Cabin */}
          <div className="group bg-white border border-gray-200 hover:border-gray-300 hover:shadow-2xl transition-all duration-500 overflow-hidden">
            <div className="relative h-72 overflow-hidden">
              <Image
                src="/cabins/sand.jpg"
                alt="SAND Cabin"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-xs tracking-wider uppercase font-medium">Popular</span>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-serif font-light mb-2">SAND Cabin</h3>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">One-storey mirror cabin with queen-size bed and 180-degree panoramic ocean views</p>
              
              <div className="space-y-6 mb-8">
                <div className="flex justify-between items-center py-4 border-b border-gray-100">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-gray-600 mb-1 font-medium">Weekdays</p>
                    <p className="text-xs text-gray-400">Sunday — Thursday</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-light">GHS 2,600</p>
                    <p className="text-xs text-gray-400">per night</p>
                  </div>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-gray-100">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-gray-600 mb-1 font-medium">Weekends</p>
                    <p className="text-xs text-gray-400">Friday — Saturday</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-light">GHS 3,200</p>
                    <p className="text-xs text-gray-400">per night</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-xs text-gray-600 leading-relaxed">
                  <span className="font-medium">Occupancy:</span> Up to 2 guests • 
                  <span className="font-medium"> Min Stay:</span> 2 nights on weekends
                </p>
              </div>

              <a 
                href="/book?cabin=sand" 
                className="block w-full text-center px-6 py-3 bg-black text-white text-sm tracking-wider uppercase hover:bg-gray-800 transition-colors duration-300"
              >
                Reserve SAND
              </a>
            </div>
          </div>

          {/* SEA Cabin */}
          <div className="group bg-white border border-gray-200 hover:border-gray-300 hover:shadow-2xl transition-all duration-500 overflow-hidden">
            <div className="relative h-72 overflow-hidden">
              <Image
                src="/cabins/sea.jpg"
                alt="SEA Cabin"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-4 right-4 bg-blue-50/95 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-xs tracking-wider uppercase font-medium text-blue-900">Popular</span>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-serif font-light mb-2">SEA Cabin</h3>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">One-storey mirror cabin with queen-size bed and stunning coastal views</p>
              
              <div className="space-y-6 mb-8">
                <div className="flex justify-between items-center py-4 border-b border-gray-100">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-gray-600 mb-1 font-medium">Weekdays</p>
                    <p className="text-xs text-gray-400">Sunday — Thursday</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-light">GHS 2,600</p>
                    <p className="text-xs text-gray-400">per night</p>
                  </div>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-gray-100">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-gray-600 mb-1 font-medium">Weekends</p>
                    <p className="text-xs text-gray-400">Friday — Saturday</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-light">GHS 3,200</p>
                    <p className="text-xs text-gray-400">per night</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-xs text-gray-600 leading-relaxed">
                  <span className="font-medium">Occupancy:</span> Up to 2 guests • 
                  <span className="font-medium"> Min Stay:</span> 2 nights on weekends
                </p>
              </div>

              <a 
                href="/book?cabin=sea" 
                className="block w-full text-center px-6 py-3 bg-black text-white text-sm tracking-wider uppercase hover:bg-gray-800 transition-colors duration-300"
              >
                Reserve SEA
              </a>
            </div>
          </div>

          {/* SUN Cabin */}
          <div className="group bg-white border border-gray-200 hover:border-gray-300 hover:shadow-2xl transition-all duration-500 overflow-hidden">
            <div className="relative h-72 overflow-hidden">
              <Image
                src="/cabins/sun.jpg"
                alt="SUN Cabin"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-4 right-4 bg-amber-50/95 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-xs tracking-wider uppercase font-medium text-amber-900">Premium</span>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-serif font-light mb-2">SUN Cabin</h3>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">Luxury one-storey cabin with private pool, lounge area, and expansive ocean vistas</p>
              
              <div className="space-y-6 mb-8">
                <div className="flex justify-between items-center py-4 border-b border-gray-100">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-gray-600 mb-1 font-medium">Weekdays</p>
                    <p className="text-xs text-gray-400">Sunday — Thursday</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-light">GHS 3,200</p>
                    <p className="text-xs text-gray-400">per night</p>
                  </div>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-gray-100">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-gray-600 mb-1 font-medium">Weekends</p>
                    <p className="text-xs text-gray-400">Friday — Saturday</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-light">GHS 3,500</p>
                    <p className="text-xs text-gray-400">per night</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-xs text-gray-600 leading-relaxed">
                  <span className="font-medium">Occupancy:</span> Up to 2 guests • 
                  <span className="font-medium"> Min Stay:</span> 2 nights on weekends
                </p>
              </div>

              <a 
                href="/book?cabin=sun" 
                className="block w-full text-center px-6 py-3 bg-black text-white text-sm tracking-wider uppercase hover:bg-gray-800 transition-colors duration-300"
              >
                Reserve SUN
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Extras & Add-ons Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-sm tracking-[0.3em] uppercase text-gray-500 mb-4">Enhance Your Experience</p>
            <h2 className="text-4xl md:text-5xl font-serif font-light mb-4">Extras & Add-ons</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Elevate your stay with our curated selection of premium services</p>
          </div>

          {/* Culinary Experience */}
          <div className="mb-16">
            <h3 className="text-2xl font-serif font-light mb-8 pb-4 border-b border-gray-200 flex items-center gap-3">
              <span className="text-3xl">👨‍🍳</span>
              Culinary Experience
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="group border border-gray-200 p-8 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-medium mb-2">Private Chef Service</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Enjoy restaurant-quality dining in the privacy of your cabin. Our chef prepares a two-course lunch and two-course dinner using fresh, locally-sourced ingredients.
                    </p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Per day</span>
                  <span className="text-2xl font-light">GHS 2,200</span>
                </div>
              </div>
            </div>
          </div>

          {/* Wellness Packages */}
          <div className="mb-16">
            <h3 className="text-2xl font-serif font-light mb-8 pb-4 border-b border-gray-200 flex items-center gap-3">
              <span className="text-3xl">💆</span>
              Wellness Packages
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Relax Package */}
              <div className="group border border-gray-200 p-8 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-xl font-medium">Relax Package</h4>
                  <div className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                    Popular
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">Choose any two spa treatments to unwind and rejuvenate</p>
                <ul className="space-y-2 mb-6 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Any two treatments
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Perfect for short stays
                  </li>
                </ul>
                <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Package price</span>
                  <span className="text-2xl font-light">GHS 1,250</span>
                </div>
              </div>

              {/* Rejuvenate Package */}
              <div className="group border-2 border-amber-200 bg-amber-50/30 p-8 hover:border-amber-300 hover:shadow-xl transition-all duration-300 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs px-4 py-1 rounded-full font-medium">
                  Best Value
                </div>
                <div className="flex items-start justify-between mb-4 mt-2">
                  <h4 className="text-xl font-medium">Rejuvenate Package</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">Choose any four spa treatments for a comprehensive wellness experience</p>
                <ul className="space-y-2 mb-6 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Any four treatments
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Most popular choice
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Save GHS 225
                  </li>
                </ul>
                <div className="pt-6 border-t border-amber-200 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Package price</span>
                  <span className="text-2xl font-light">GHS 2,275</span>
                </div>
              </div>

              {/* Indulge Package */}
              <div className="group border border-gray-200 p-8 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-xl font-medium">Indulge Package</h4>
                  <div className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-medium">
                    Ultimate
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">Choose any six spa treatments for the ultimate luxury retreat</p>
                <ul className="space-y-2 mb-6 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Any six treatments
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Full spa experience
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Save GHS 450
                  </li>
                </ul>
                <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Package price</span>
                  <span className="text-2xl font-light">GHS 3,300</span>
                </div>
              </div>
            </div>
          </div>

          {/* Entertainment & Activities */}
          <div>
            <h3 className="text-2xl font-serif font-light mb-8 pb-4 border-b border-gray-200 flex items-center gap-3">
              <span className="text-3xl">🎭</span>
              Entertainment & Activities
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Outdoor Movie */}
              <div className="group border border-gray-200 p-8 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl mb-4">🎬</div>
                <h4 className="text-xl font-medium mb-2">Outdoor Movie Experience</h4>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  Watch your favorite film under the stars with our premium outdoor cinema setup
                </p>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Per night</span>
                  <span className="text-2xl font-light">GHS 420</span>
                </div>
              </div>

              {/* Saxophone Player */}
              <div className="group border border-gray-200 p-8 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl mb-4">🎷</div>
                <h4 className="text-xl font-medium mb-2">Professional Saxophone Player</h4>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  Enjoy live jazz music during your dinner or sunset viewing session
                </p>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm text-gray-500">One session</span>
                  <span className="text-2xl font-light">GHS 1,250</span>
                </div>
              </div>

              {/* Sip & Paint - Alcohol */}
              <div className="group border border-gray-200 p-8 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl mb-4">🎨</div>
                <h4 className="text-xl font-medium mb-2">Sip & Paint</h4>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  Unleash your creativity with guided painting and refreshments
                </p>
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">With Alcohol</span>
                    <span className="text-xl font-light">GHS 600</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Non-Alcoholic</span>
                    <span className="text-xl font-light">GHS 450</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="py-16 px-6 bg-amber-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-amber-900">Important Information</h3>
          </div>
          <p className="text-amber-800 leading-relaxed max-w-2xl mx-auto">
            ** Prices may be higher during peak periods including holidays and special events. 
            Please contact us for specific pricing during your desired dates. All extras must be booked at least 48 hours in advance to ensure availability.
          </p>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-light mb-4">What's Included</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Every stay comes with carefully curated experiences and amenities</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-2xl">🍳</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Continental Breakfast</h3>
              <p className="text-sm text-gray-600">Freshly prepared each morning</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-2xl">🚶</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Guided Walking Tour</h3>
              <p className="text-sm text-gray-600">Explore historic Anomabo</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-2xl">🧘</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Beach Access</h3>
              <p className="text-sm text-gray-600">Private path to pristine shores</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-2xl">🛎️</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Concierge Service</h3>
              <p className="text-sm text-gray-600">guest assistance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Policies Section */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-light mb-4">Booking Information</h2>
        </div>

        <div className="space-y-8">
          <div className="border-l-2 border-gray-300 pl-6">
            <h3 className="text-xl font-medium mb-3">Check-in & Check-out</h3>
            <p className="text-gray-600 leading-relaxed">Check-in is from 2:00 PM and check-out is by 11:00 AM. Early check-in and late check-out are subject to availability and may incur additional charges.</p>
          </div>

          <div className="border-l-2 border-gray-300 pl-6">
            <h3 className="text-xl font-medium mb-3">Cancellation Policy</h3>
            <p className="text-gray-600 leading-relaxed">Free cancellation up to 7 days before arrival. Cancellations within 7 days of arrival will incur a 50% charge. No-shows will be charged the full booking amount.</p>
          </div>

          <div className="border-l-2 border-gray-300 pl-6">
            <h3 className="text-xl font-medium mb-3">Payment Terms</h3>
            <p className="text-gray-600 leading-relaxed">A 50% deposit is required to confirm your reservation, with the balance due 14 days prior to arrival. We accept bank transfers and mobile money payments.</p>
          </div>

          <div className="border-l-2 border-gray-300 pl-6">
            <h3 className="text-xl font-medium mb-3">Additional Guests</h3>
            <p className="text-gray-600 leading-relaxed">Maximum occupancy is 2 guests per cabin. Additional guests are not permitted to maintain the intimate atmosphere of our retreat.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-light mb-6">Ready to Experience Sojourn?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Begin your coastal escape. Contact our team to check availability and reserve your preferred cabin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/book" 
              className="px-8 py-4 bg-white text-black text-sm tracking-wider uppercase hover:bg-gray-100 transition-colors duration-300"
            >
              Check Availability
            </a>
            <a 
              href="/contact" 
              className="px-8 py-4 border border-white text-white text-sm tracking-wider uppercase hover:bg-white hover:text-black transition-all duration-300"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
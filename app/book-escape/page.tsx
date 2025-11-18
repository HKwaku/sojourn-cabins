'use client'

import { useState } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
const BookingWidget = dynamic(() => import('@/app/components/BookingWidget'), { ssr: false })
import PackagesModal from '@/app/components/PackagesModal'

export default function Page() {
  const [packagesOpen, setPackagesOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
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
          <p className="text-sm tracking-[0.3em] uppercase mb-4 text-white/90">Plan Your Stay</p>
          <h1 className="text-5xl md:text-7xl font-serif font-light mb-6 leading-tight text-white">Book Your Escape</h1>
          <p className="text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed text-white/90">
            Select your dates and cabin to begin your coastal retreat
          </p>
        </div>
      </section>

      {/* Booking Widget Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* New copy + curated packages button */}
          <div className="flex flex-col items-center text-center space-y-4">
            <p className="text-xs tracking-[0.3em] uppercase text-gray-400">
              Choose Your Experience
            </p>
            <div className="text-base text-gray-700 leading-relaxed">
              <button
                type="button"
                onClick={() => setPackagesOpen(true)}
                className="inline-flex items-center px-8 py-3 bg-black text-white text-sm tracking-wider uppercase hover:bg-gray-800 transition-colors duration-300 mr-2"
              >
                View Packages
              </button>
              <span className="text-gray-600">
                or customize your experience below
              </span>
            </div>
          </div>

          <div>
            <BookingWidget />
          </div>
        </div>

        {/* Packages modal */}
        <PackagesModal
          isOpen={packagesOpen}
          onClose={() => setPackagesOpen(false)}
        />
      </section>

      {/* Quick Info Cards */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 p-8">
              <div className="w-12 h-12 bg-gray-50 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Flexible Booking</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Free cancellation up to 7 days before arrival</p>
            </div>

            <div className="bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 p-8">
              <div className="w-12 h-12 bg-gray-50 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7l9-4 9 4-9 4-9-4zm0 6l9 4 9-4m-9 4v6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Curated Amenities</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Premium extras to elevate your coastal stay</p>
            </div>

            <div className="bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 p-8">
              <div className="w-12 h-12 bg-gray-50 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5V4H2v16h5m10 0l-4-4m0 0l-4 4m4-4v-5" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Seamless Check-In</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Self check-in details shared before arrival</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
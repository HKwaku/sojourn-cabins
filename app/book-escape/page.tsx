'use client'

import dynamic from 'next/dynamic'
const BookingWidget = dynamic(() => import('@/app/components/BookingWidget'), { ssr: false })

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm tracking-[0.3em] uppercase mb-4 text-white/80">Reserve Your Escape</p>
          <h1 className="text-5xl md:text-6xl font-serif font-light mb-6 leading-tight">Book Your Stay</h1>
          <p className="text-lg md:text-xl font-light text-white/90 max-w-2xl mx-auto leading-relaxed">
            Select your dates and cabin to begin your coastal retreat at Sojourn
          </p>
        </div>
      </section>

      {/* Booking Widget Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <BookingWidget />
        </div>
      </section>

      {/* Quick Info Cards */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Flexible Booking</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Free cancellation up to 7 days before arrival</p>
            </div>

            <div className="bg-white p-8 border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Secure Payment</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Safe and encrypted payment processing</p>
            </div>

            <div className="bg-white p-8 border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">24/7 Support</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Our team is here to assist you anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-light mb-4">Need Assistance?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Our team is available to help with special requests, group bookings, or any questions about your stay.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:theteam@sojourngh.com" 
              className="px-8 py-3 bg-black text-white text-sm tracking-wider uppercase hover:bg-gray-800 transition-colors duration-300"
            >
              Email Us
            </a>
            <a 
              href="tel:+233547484568" 
              className="px-8 py-3 border border-gray-300 text-gray-700 text-sm tracking-wider uppercase hover:border-black hover:text-black transition-all duration-300"
            >
              Call Us
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
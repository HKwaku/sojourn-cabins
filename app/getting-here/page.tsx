import Image from 'next/image'
import Section from '../components/Section'

export default function GettingHerePage() {
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
          <p className="text-sm tracking-[0.3em] uppercase mb-4 text-white/90">Travel Information</p>
          <h1 className="text-5xl md:text-7xl font-serif font-light mb-6 leading-tight text-white">Getting Here</h1>
          <p className="text-lg md:text-xl font-light text-white/90 max-w-2xl mx-auto leading-relaxed">
            Your cabin is within a 10-minute drive from Fort William, Anomabo, Ghana
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Location Overview */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-6">Finding Sojourn Cabins</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Located on the scenic Accra – Cape Coast road, we're easily accessible from major cities while offering a peaceful coastal escape.
            </p>
          </div>

          {/* GPS & Maps */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 mb-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-medium mb-3">GPS Coordinates & Navigation</h3>
                <p className="text-gray-600 mb-4">
                  If you use Google Maps, enter <span className="font-mono bg-white px-3 py-1 rounded border border-gray-300 font-medium">5VCF+Q8 Anomabo, Ghana</span> or search <span className="italic font-medium">Sojourn Cabins</span>. You can also drop the map pin and navigate directly.
                </p>
              </div>
            </div>
          </div>

          {/* Driving Directions */}
          <div className="mb-12">
            <h3 className="text-2xl font-serif font-light mb-8 pb-4 border-b border-gray-200">Driving Directions</h3>
            
            {/* Distance Overview */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <h4 className="text-lg font-medium">From Accra</h4>
                </div>
                <p className="text-3xl font-light text-gray-900 mb-2">2.5 hours</p>
                <p className="text-sm text-gray-600">Approximately 145 km via coastal route</p>
              </div>

              <div className="border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <h4 className="text-lg font-medium">From Cape Coast</h4>
                </div>
                <p className="text-3xl font-light text-gray-900 mb-2">30 minutes</p>
                <p className="text-sm text-gray-600">Approximately 22 km along the coast</p>
              </div>
            </div>

            {/* Step-by-step Directions */}
            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <h4 className="text-lg font-medium mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Detailed Directions from Accra
              </h4>
              
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-gray-700 leading-relaxed">
                      Take the <span className="font-medium">Accra – Cape Coast road</span> heading west from Accra
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-gray-700 leading-relaxed">
                      Look for the <span className="font-medium">Anomabo Beach Resort junction</span> and turn left
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-gray-700 leading-relaxed">
                      Turn left <span className="font-medium">just before the resort entrance</span>
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium">
                    4
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-gray-700 leading-relaxed">
                      Follow the <span className="font-medium">directional signage</span> for Sojourn Cabins
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-gray-700 leading-relaxed">
                      Sojourn Cabins is approximately <span className="font-medium">3 minutes' drive</span> from Anomabo Beach Resort
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </div>

          {/* Map Section */}
          <div className="mb-12">
            <h3 className="text-2xl font-serif font-light mb-8 pb-4 border-b border-gray-200">Interactive Map</h3>
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
              <iframe
                title="Sojourn Cabins Location Map"
                className="w-full h-[450px]"
                loading="lazy"
                src="https://www.google.com/maps?q=5VCF%2BQ8%20Anomabo%2C%20Ghana&output=embed"
                style={{ border: 0 }}
                allowFullScreen
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Sojourn Cabins</p>
                    <p className="text-sm text-gray-600">Anomabo, Central Region, Ghana</p>
                  </div>
                  <a 
                    href="https://www.google.com/maps?q=5VCF%2BQ8%20Anomabo%2C%20Ghana"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors duration-300"
                  >
                    Open in Maps
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Parking */}
            <div className="border border-gray-200 rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium">Parking</h4>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Free on-site parking is available for all guests. Our secure parking area can accommodate multiple vehicles.
              </p>
            </div>

            {/* Airport Transfer */}
            <div className="border border-gray-200 rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium">Airport Transfer</h4>
              </div>
              <p className="text-gray-600 leading-relaxed">
                We can arrange private transportation from Accra airport. Please contact us at least 48 hours before arrival.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Need Help Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-light mb-4">Need Directions Assistance?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Having trouble finding us? Our team is happy to provide additional guidance or arrange to meet you at a landmark.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="tel:+233547484568" 
              className="px-8 py-3 rounded-full bg-black text-white text-sm tracking-wider uppercase hover:bg-gray-800 transition-colors duration-300"
            >
              Call Us
            </a>
            <a 
              href="https://wa.me/233547484568" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-full border border-gray-300 text-gray-700 text-sm tracking-wider uppercase hover:border-black hover:text-black transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
import Hero from './components/Hero'
import Section from './components/Section'
import Card from './components/Card'
import Image from 'next/image'

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Explore Our Cabins Section */}
      <Section 
        id="cabins" 
        title="Explore Our Cabins"
        background="light"
      >
        <div className="grid gap-12 md:gap-16">
          {/* SUN Cabin */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <div className="text-6xl md:text-7xl lg:text-8xl font-light text-gray-200 mb-4">1</div>
              <h3 className="text-2xl md:text-3xl font-light mb-6 tracking-wide">SUN Cabin</h3>
              <p className="text-gray-600 text-base md:text-lg font-light leading-relaxed mb-8">
                A luxurious one-storey mirror cabin escape with panoramic views of the Atlantic Ocean, 
                your own personal balcony, private pool and lounge area
              </p>
              <a 
                href="/book-escape" 
                className="inline-block px-8 py-3 border border-black text-black text-sm font-medium tracking-widest uppercase hover:bg-black hover:text-white transition-all duration-300"
              >
                Book Now
              </a>
            </div>
            <div className="order-1 md:order-2 relative h-64 md:h-96 overflow-hidden">
              <Image
                src="/cabins/sun.jpg"
                alt="SUN Cabin with panoramic ocean views"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>

          {/* SEA Cabin */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative h-64 md:h-96 overflow-hidden">
              <Image
                src="/cabins/sea.jpg"
                alt="SEA Cabin with stunning Atlantic views"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div>
              <div className="text-6xl md:text-7xl lg:text-8xl font-light text-gray-200 mb-4">2</div>
              <h3 className="text-2xl md:text-3xl font-light mb-6 tracking-wide">SEA Cabin</h3>
              <p className="text-gray-600 text-base md:text-lg font-light leading-relaxed mb-8">
                A private mirror cabin escape with a stunning view of the Atlantic ocean, 
                your own personal balcony, private pool and lounge area
              </p>
              <a 
                href="/book-escape" 
                className="inline-block px-8 py-3 border border-black text-black text-sm font-medium tracking-widest uppercase hover:bg-black hover:text-white transition-all duration-300"
              >
                Book Now
              </a>
            </div>
          </div>

          {/* SAND Cabin */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <div className="text-6xl md:text-7xl lg:text-8xl font-light text-gray-200 mb-4">3</div>
              <h3 className="text-2xl md:text-3xl font-light mb-6 tracking-wide">SAND Cabin</h3>
              <p className="text-gray-600 text-base md:text-lg font-light leading-relaxed mb-8">
                A private mirror cabin escape with a stunning view of the Atlantic ocean, 
                your own personal balcony, private pool and lounge area
              </p>
              <a 
                href="/book-escape" 
                className="inline-block px-8 py-3 border border-black text-black text-sm font-medium tracking-widest uppercase hover:bg-black hover:text-white transition-all duration-300"
              >
                Book Now
              </a>
            </div>
            <div className="order-1 md:order-2 relative h-64 md:h-96 overflow-hidden">
              <Image
                src="/cabins/sand.jpg"
                alt="SAND Cabin with Atlantic views"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Our Amenities Section */}
      <Section 
        title="Our Amenities"
        background="white"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 md:gap-8 mb-12">
          {[
            { name: "Refrigerator", image: "/amenities/refrigerator.jpg" },
            { name: "Breakfast", image: "/amenities/breakfast.png" },
            { name: "Private Chef", image: "/amenities/chef.png" },
            { name: "Wellness", image: "/amenities/wellness.png" },
            { name: "Wifi", image: "/amenities/wifi.png" },
            { name: "Outdoor Grill", image: "/amenities/grill.png" },
            { name: "Private Pool", image: "/amenities/pool.png" },
            { name: "Air Con", image: "/amenities/aircon.png" }
          ].map((amenity) => (
            <div 
              key={amenity.name} 
              className="flex flex-col items-center text-center group"
            >
              <div className="relative w-full aspect-square mb-4 overflow-hidden bg-gray-100">
                <Image
                  src={amenity.image}
                  alt={amenity.name}
                  fill
                  className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <p className="text-sm md:text-base font-light tracking-wide">{amenity.name}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-600 text-base md:text-lg font-light leading-relaxed max-w-3xl mx-auto">
          Our amenities are designed to help you unwind, and connect with your loved one and your thoughts. 
          We consciously do not have a television in the cabins.
        </p>

        {/* Featured Amenity Image */}
        <div className="relative h-64 md:h-96 mt-12 overflow-hidden">
          <Image
            src="/amenities-feature.jpg"
            alt="Our amenities"
            fill
            className="object-cover"
          />
        </div>
      </Section>

      {/* Discover our Experiences Section */}
      <Section 
        title="Discover our Experiences"
        subtitle="Get a glimpse of the captivating spaces and experiences at Sojourn Cabins. From our stylish cabins to our awe-inspiring chef service and wellness services, every corner exudes urban elegance and luxury."
        background="light"
      >
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {/* Private Chef Experience */}
          <div className="group">
            <div className="relative h-48 md:h-64 mb-6 overflow-hidden">
              <Image
                src="/experiences/chef.jpg"
                alt="Private chef preparing meal"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <p className="text-gray-600 text-base md:text-lg font-light leading-relaxed">
              Indulge in a culinary journey with our private chef service. Savor delicious dishes 
              with a touch of local flavors.
            </p>
          </div>

          {/* Wellness Services */}
          <div className="group">
            <div className="relative h-48 md:h-64 mb-6 overflow-hidden">
              <Image
                src="/experiences/wellness.jpg"
                alt="Wellness and spa services"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <p className="text-gray-600 text-base md:text-lg font-light leading-relaxed">
              Relax and select a treatment from our menu of wellness packages including Swedish, 
              Deep Tissue & Holistic Massages, Body Scrub, Body Wrap, Reflexology and Facials
            </p>
          </div>

          {/* Sip & Paint */}
          <div className="group">
            <div className="relative h-48 md:h-64 mb-6 overflow-hidden">
              <Image
                src="/experiences/paint.jpg"
                alt="Sip and paint experience"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <p className="text-gray-600 text-base md:text-lg font-light leading-relaxed">
              Get bubbly and creative with our sip and paint services with that special someone. 
              Time to channel your inner Picasso!
            </p>
          </div>
        </div>
      </Section>
    </>
  )
}

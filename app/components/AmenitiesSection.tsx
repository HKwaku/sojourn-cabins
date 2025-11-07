import Image from 'next/image'

export default function AmenitiesSection() {
  const amenities = [
    { 
      name: 'Refrigerator', 
      image: '/amenities/refrigerator.jpg',
      description: 'Fully stocked'
    },
    { 
      name: 'Breakfast', 
      image: '/amenities/breakfast.png',
      description: 'Daily included'
    },
    { 
      name: 'Private Chef', 
      image: '/amenities/chef.png',
      description: 'On request'
    },
    { 
      name: 'Wellness', 
      image: '/amenities/wellness.png',
      description: 'Spa services'
    },
    { 
      name: 'High-Speed Wifi', 
      image: '/amenities/wifi.png',
      description: 'Complimentary'
    },
    { 
      name: 'Outdoor Grill', 
      image: '/amenities/grill.png',
      description: 'BBQ ready'
    },
    { 
      name: 'Private Pool', 
      image: '/amenities/pool.png',
      description: 'Heated option'
    },
    { 
      name: 'Climate Control', 
      image: '/amenities/aircon.png',
      description: 'AC & Heating'
    }
  ]

  return (
    <section id="amenities" className="py-32 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-sm tracking-[0.3em] uppercase text-gray-500 mb-4">
            Elevated Amenities
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-light mb-6">
            Curated for Your Comfort
          </h2>
          <p className="text-lg text-gray-600 font-light max-w-3xl mx-auto leading-relaxed">
            Every detail designed to help you unwind and connect. 
            We consciously do not have televisions in the cabins.
          </p>
        </div>

        {/* Amenities Grid - No gaps, uniform squares */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200 mb-16">
          {amenities.map((amenity) => (
            <div 
              key={amenity.name} 
              className="group relative bg-white aspect-square overflow-hidden"
            >
              {/* Image */}
              <div className="absolute inset-0 p-8 md:p-12">
                <div className="relative w-full h-full">
                  <Image
                    src={amenity.image}
                    alt={amenity.name}
                    fill
                    className="object-contain group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
              </div>
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-end p-6">
                <p className="text-white text-base md:text-lg font-light mb-1 text-center">
                  {amenity.name}
                </p>
                <p className="text-white/80 text-xs tracking-wider uppercase text-center">
                  {amenity.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-gray-600 font-light leading-relaxed">
            Our amenities are thoughtfully selected to enhance your stay. From daily breakfast to 
            on-demand private chef services, every convenience is designed for your ultimate relaxation.
          </p>
        </div>
      </div>

      {/* Feature Image Section */}
      <div className="max-w-7xl mx-auto mt-20">
        <div className="relative h-[60vh] overflow-hidden">
          <Image
            src="/amenities-feature.jpg"
            alt="Sojourn Cabins amenities"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center p-12">
            <p className="text-white text-2xl md:text-3xl font-serif font-light text-center max-w-3xl">
              "Every corner exudes urban elegance and luxury"
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
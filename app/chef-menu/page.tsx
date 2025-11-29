export default function ChefMenuPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-stone-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs tracking-[0.4em] uppercase text-orange-400 mb-4">
            Private Chef Experience
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light mb-6">
            Our Menu
          </h1>
          <div className="w-16 h-px bg-orange-400 mx-auto mb-6" />
          <p className="text-lg text-stone-300 font-light max-w-2xl mx-auto">
            Menu is curated and inspired by home-based and sustainable resources
          </p>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        
        {/* Starters */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-2">
              Starters
            </h2>
            <p className="text-sm text-stone-500 italic">Available for both lunch and dinner</p>
            <div className="w-12 h-px bg-orange-400 mt-4" />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-100 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-serif text-stone-900 mb-2">Crispy Calamari</h3>
              <p className="text-stone-600 text-sm">Deep-fried coated calamari with tangy hot mayonnaise</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-100 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-serif text-stone-900 mb-2">Firestorm Chicken Wings</h3>
              <p className="text-stone-600 text-sm">Hot spicy chicken wings</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-100 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-serif text-stone-900 mb-2">Savory Sizzle Pork Medley</h3>
              <p className="text-stone-600 text-sm">Succulent and spicy slow-cooked pork fried to perfection</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-100 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-serif text-stone-900 mb-2">West African Salad</h3>
              <p className="text-stone-600 text-sm">Pasta, potatoes, egg, tuna, chicken, mixed veggies, lettuce and dressing</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-100 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-serif text-stone-900 mb-2">Verdant Delight Salad</h3>
              <p className="text-stone-600 text-sm">Green salad with mustard dressing</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-100 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-serif text-stone-900 mb-2">Savory Bites</h3>
              <p className="text-stone-600 text-sm">Samosa, vegetable spring rolls, meaty yam balls, gizzard kebab</p>
            </div>
          </div>
        </section>

        {/* Local Mains */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-2">
              Local Mains
            </h2>
            <p className="text-sm text-orange-600 italic">Welcome to our motherland!</p>
            <div className="w-12 h-px bg-orange-400 mt-4" />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-100 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-serif text-stone-900 mb-2">Ewe Pepper</h3>
              <p className="text-stone-600 text-sm">With Anomabo abobi and firewood smoked fish</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-100 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-serif text-stone-900 mb-2">Surf and Turf Okra Stew</h3>
              <p className="text-stone-600 text-sm">Assorted seafood and cow meat in okra stew</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-100 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-serif text-stone-900 mb-2">Spicy Chargrilled Tilapia</h3>
              <p className="text-stone-600 text-sm">Fresh tilapia grilled to perfection</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-100 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-serif text-stone-900 mb-2">Elmina Seasonal Fish Chargrilled</h3>
              <p className="text-stone-600 text-sm">Fresh catch of the day</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-100 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-serif text-stone-900 mb-2">Elmina Fisherman Pepper Soup</h3>
              <p className="text-stone-600 text-sm">Seasonal fishes cooked in light spicy soup</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-100 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-serif text-stone-900 mb-2">Majestic Goat Light Soup</h3>
              <p className="text-stone-600 text-sm">Traditional goat soup</p>
            </div>
          </div>

          {/* Local Sides */}
          <div className="mt-8 bg-stone-50 p-6 rounded-2xl">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-600 mb-3">Our Motherland Sides</h4>
            <div className="flex flex-wrap gap-3">
              {['Banku', 'Akple', 'Pilaf Rice', 'Neat Fufu'].map((side) => (
                <span key={side} className="px-4 py-2 bg-white rounded-full text-sm text-stone-700 border border-stone-200">
                  {side}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Continental Mains */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-2">
              Continental Mains
            </h2>
            <p className="text-sm text-orange-600 italic">We're outside!</p>
            <div className="w-12 h-px bg-orange-400 mt-4" />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-100 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-serif text-stone-900 mb-2">Oceanic Delight Stir-Fry</h3>
              <p className="text-stone-600 text-sm">Stir-fry pasta packed with shrimps, calamari and fish combined with colourful vegetables</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-100 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-serif text-stone-900 mb-2">Mini Sliders</h3>
              <p className="text-stone-600 text-sm">Beef patty or chicken or lobster in freshly baked buns</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-100 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-serif text-stone-900 mb-2">Char-Grilled Chicken Temptation</h3>
              <p className="text-stone-600 text-sm">Marinated chicken grilled to perfection</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-100 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-serif text-stone-900 mb-2">Bold Beef Spice Symphony</h3>
              <p className="text-stone-600 text-sm">Beef toast with colourful vegetables cooked in a brown spicy sauce</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-100 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-serif text-stone-900 mb-2">Beef Sauce with Fried Rice</h3>
              <p className="text-stone-600 text-sm">Classic combination</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-100 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-serif text-stone-900 mb-2">Vegetable Fish Stew</h3>
              <p className="text-stone-600 text-sm">With buttered potatoes</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-100 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-serif text-stone-900 mb-2">Vegetable Chicken Pasta</h3>
              <p className="text-stone-600 text-sm">Fresh pasta with chicken and vegetables</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-100 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-serif text-stone-900 mb-2">Spaghetti Bolognaise</h3>
              <p className="text-stone-600 text-sm">Classic Italian favorite</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-100 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-serif text-stone-900 mb-2">Seafood Fried Rice</h3>
              <p className="text-stone-600 text-sm">Rice with assorted seafood</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-100 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-serif text-stone-900 mb-2">Chicken Salad</h3>
              <p className="text-stone-600 text-sm">Fresh and healthy</p>
            </div>
          </div>

          {/* Continental Sides */}
          <div className="mt-8 bg-stone-50 p-6 rounded-2xl">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-600 mb-3">Continental Sides</h4>
            <div className="flex flex-wrap gap-3">
              {['French Fries', 'Fried Rice', 'Jollof Rice', 'Plain Rice', 'Golden Yam Crisps'].map((side) => (
                <span key={side} className="px-4 py-2 bg-white rounded-full text-sm text-stone-700 border border-stone-200">
                  {side}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center bg-gradient-to-br from-stone-800 to-stone-900 rounded-3xl p-12 mt-16">
          <h3 className="text-2xl md:text-3xl font-serif font-light text-white mb-4">
            Ready to Experience Our Culinary Excellence?
          </h3>
          <p className="text-stone-300 mb-8 max-w-2xl mx-auto">
            Book your private chef experience and let us create a memorable dining journey for you
          </p>
          <a
            href="/book-escape"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-full font-medium tracking-wide uppercase text-sm hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
          >
            Book Your Stay
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}
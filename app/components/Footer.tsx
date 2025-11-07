import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <h3 className="text-3xl font-serif font-light mb-6">Sojourn Cabins</h3>
            <p className="text-gray-400 font-light leading-relaxed mb-6 max-w-md">
              Beachfront mirror cabins offering a unique sanctuary to disconnect and unwind, 
              surrounded by contemporary architecture and breathtaking landscapes.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://instagram.com/sojourncabins" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 border border-gray-700 flex items-center justify-center hover:border-white hover:bg-white hover:text-black transition-all duration-300"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a 
                href="https://tiktok.com/@sojourncabins" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 border border-gray-700 flex items-center justify-center hover:border-white hover:bg-white hover:text-black transition-all duration-300"
                aria-label="TikTok"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm tracking-[0.2em] uppercase mb-6 font-medium">Explore</h4>
            <ul className="space-y-3">
              {[
                { name: 'Our Cabins', href: '#cabins' },
                { name: 'Experiences', href: '#experiences' },
                { name: 'Amenities', href: '#amenities' },
                { name: 'Rates', href: '/rates' },
                { name: 'Getting Here', href: '/getting-here' },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors font-light"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm tracking-[0.2em] uppercase mb-6 font-medium">Contact</h4>
            <ul className="space-y-3 text-gray-400 font-light">
              <li>
                <a 
                  href="mailto:theteam@sojourngh.com" 
                  className="hover:text-white transition-colors"
                >
                  theteam@sojourngh.com
                </a>
              </li>
              <li>
                <a 
                  href="tel:+233547484568" 
                  className="hover:text-white transition-colors"
                >
                  +233-54-748-4568
                </a>
              </li>
              <li className="text-sm">
                Enquiries: 7am–7pm
              </li>
              <li className="pt-2">
                <p className="text-sm">Anomabo, Ghana</p>
                <a 
                  href="https://maps.google.com/?q=5VCF+Q8+Anomabo,+Ghana"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors inline-flex items-center gap-1 mt-1"
                >
                  View Map →
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p className="font-light">
              © {new Date().getFullYear()} Sojourn Cabins. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/terms-and-conditions" className="hover:text-white transition-colors">
                Terms & Conditions
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
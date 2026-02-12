import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export const metadata: Metadata = {
  title: 'Sojourn Cabins',
  description: 'Beach-front mirror cabins in Anomabo, Ghana',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />

        {/* 👇 ADD THIS WRAPPER */}
        <div className="page-transition">
          <main>{children}</main>
        </div>

        <Footer />
      </body>
    </html>
  )
}

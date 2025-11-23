'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
const BookingWidget = dynamic(() => import('@/app/components/BookingWidget'), { ssr: false })
import PackagesModal from '@/app/components/PackagesModal'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const HEADERS: HeadersInit = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: HEADERS })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed (${res.status})`)
  }
  return res.json()
}

type FeaturedPackage = {
  id: number
  code: string | null
  name: string
  package_price: number | null
  currency: string | null
  nights: number | null
  nextAvailable: string | null
  image_url?: string | null
}

export default function Page() {
  const [packagesOpen, setPackagesOpen] = useState(false)

  const [featuredPackages, setFeaturedPackages] = useState<FeaturedPackage[]>([])
  const [loadingPackages, setLoadingPackages] = useState(true)
  const [packagesError, setPackagesError] = useState<string | null>(null)

  useEffect(() => {
    async function loadFeaturedPackages() {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        setPackagesError('Packages are temporarily unavailable.')
        setLoadingPackages(false)
        return
      }

      try {
        setLoadingPackages(true)
        setPackagesError(null)

        // 1) Featured + active packages including image_url and validity window
        const pkgUrl =
          `${SUPABASE_URL}/rest/v1/packages` +
          `?select=id,name,package_price,currency,nights,is_active,is_featured,image_url,valid_from,valid_until` +
          `&is_active=eq.true&is_featured=eq.true&order=sort_order`

        const pkgs = await fetchJSON<
          {
            id: number
            code: string | null
            name: string | null
            package_price: number | null
            currency: string | null
            nights: number | null
            valid_from: string | null
            valid_until: string | null
            image_url: string | null
          }[]
        >(pkgUrl)

        if (!pkgs || pkgs.length === 0) {
          setFeaturedPackages([])
          return
        }

        const pkgIds = pkgs.map((p) => p.id)

        // 2) Load rooms attached to these packages (same mapping idea as PackagesModal)
        const roomsUrl =
          `${SUPABASE_URL}/rest/v1/packages_rooms` +
          `?select=package_id,room_type_id&package_id=in.(${pkgIds.join(',')})`

        const pkgRooms = await fetchJSON<
          { package_id: number; room_type_id: number | null }[]
        >(roomsUrl)

        const roomsByPackage: Record<number, number[]> = {}
        const roomIdSet = new Set<number>()

        pkgRooms.forEach((pr) => {
          if (pr.room_type_id == null) return
          roomIdSet.add(pr.room_type_id)
          if (!roomsByPackage[pr.package_id]) roomsByPackage[pr.package_id] = []
          roomsByPackage[pr.package_id].push(pr.room_type_id)
        })

        const roomTypeIds = Array.from(roomIdSet)
        const todayISO = new Date().toISOString().slice(0, 10)

        // 3) Fetch reservations for those room types (future only)
        const reservationsByRoom: Record<
          number,
          {
            room_type_id: number | null
            check_in: string | null
            check_out: string | null
            status: string | null
          }[]
        > = {}

        if (roomTypeIds.length > 0) {
          const idList = roomTypeIds.join(',')
          const resUrl =
            `${SUPABASE_URL}/rest/v1/reservations` +
            `?select=room_type_id,check_in,check_out,status` +
            `&room_type_id=in.(${idList})` +
            `&check_out=gte.${todayISO}`

          const resvs = await fetchJSON<
            {
              room_type_id: number | null
              check_in: string | null
              check_out: string | null
              status: string | null
            }[]
          >(resUrl)

          ;(resvs || []).forEach((r) => {
            if (r.room_type_id == null) return
            if (r.status === 'cancelled' || r.status === 'no_show') return
            if (!reservationsByRoom[r.room_type_id]) {
              reservationsByRoom[r.room_type_id] = []
            }
            reservationsByRoom[r.room_type_id].push(r)
          })
        }

        // Helpers copied from PackagesModal patterns
        function addDaysISO(iso: string, days: number): string {
          const d = new Date(iso)
          if (Number.isNaN(d.getTime())) return iso
          d.setDate(d.getDate() + days)
          return d.toISOString().slice(0, 10)
        }

        function rangesOverlap(
          aStart: string | null,
          aEnd: string | null,
          bStart: string,
          bEnd: string
        ): boolean {
          if (!aStart || !aEnd) return false
          const A = new Date(aStart)
          const B = new Date(aEnd)
          const C = new Date(bStart)
          const D = new Date(bEnd)
          if (
            Number.isNaN(A.getTime()) ||
            Number.isNaN(B.getTime()) ||
            Number.isNaN(C.getTime()) ||
            Number.isNaN(D.getTime())
          ) {
            return false
          }
          // overlap if existingStart < newEnd AND existingEnd > newStart
          return A < D && B > C
        }

        // 4) Compute *next date with availability* per package
        const horizonDays = 365

        const withAvailability: FeaturedPackage[] = pkgs.map((pkg) => {
          const nights = pkg.nights && pkg.nights > 0 ? pkg.nights : 1
          const roomIdsForPkg = roomsByPackage[pkg.id] || []
          let nextAvailable: string | null = null

          if (roomIdsForPkg.length) {
            for (let offset = 0; offset < horizonDays; offset++) {
              const ci = addDaysISO(todayISO, offset)
              const co = addDaysISO(ci, nights)

              // Respect valid_from / valid_until like in PackagesModal
              if (pkg.valid_from && ci < pkg.valid_from) continue
              if (pkg.valid_until && co > pkg.valid_until) continue

              let hasFreeRoom = false

              for (const roomId of roomIdsForPkg) {
                const resvs = reservationsByRoom[roomId] || []
                const hasOverlap = resvs.some((r) =>
                  rangesOverlap(r.check_in, r.check_out, ci, co)
                )
                if (!hasOverlap) {
                  hasFreeRoom = true
                  break
                }
              }

              if (hasFreeRoom) {
                nextAvailable = ci
                break
              }
            }
          }

          return {
            id: pkg.id,
            code: pkg.code,
            name: pkg.name || '',
            package_price: pkg.package_price,
            currency: pkg.currency,
            nights: pkg.nights,
            image_url: pkg.image_url,
            nextAvailable,
          }
        })

        setFeaturedPackages(withAvailability)
      } catch (err) {
        console.error(err)
        setPackagesError('Unable to load featured packages.')
      } finally {
        setLoadingPackages(false)
      }
    }

    loadFeaturedPackages()
  }, [])

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

      {/* Booking + Packages Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Featured packages ABOVE booking */}
          <div className="mt-6">
            {loadingPackages && (
              <p className="text-sm text-gray-500 text-center">
                Loading featured packages…
              </p>
            )}

            {packagesError && (
              <p className="text-sm text-red-500 text-center">
                {packagesError}
              </p>
            )}

            {!loadingPackages && !packagesError && featuredPackages.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl md:text-2xl font-medium text-gray-900">
                    Featured Packages
                  </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  {featuredPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 flex flex-col"
                    >
                      {/* Package image uses <img> to avoid next/image domain config */}
                      {pkg.image_url ? (
                        <div className="w-full h-48 overflow-hidden">
                          <img
                            src={pkg.image_url}
                            alt={pkg.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                          No Image
                        </div>
                      )}

                      <div className="p-6 flex flex-col flex-1 justify-between">
                        <div className="space-y-2">
                          <p className="text-[0.65rem] tracking-[0.25em] uppercase text-gray-400">
                            Featured Package
                          </p>

                          <h3 className="text-lg font-medium text-gray-900">
                            {pkg.name}
                          </h3>

                          {pkg.nights && (
                            <p className="text-sm text-gray-600">
                              {pkg.nights} night{pkg.nights > 1 ? 's' : ''}{' '}
                              {pkg.code ? `• ${pkg.code.toUpperCase()}` : ''}
                            </p>
                          )}

                          {pkg.package_price != null && (
                            <p className="text-sm text-gray-800">
                              From{' '}
                              <span className="font-semibold">
                                {pkg.currency || 'GHS'} {pkg.package_price.toFixed(2)}
                              </span>
                            </p>
                          )}
                        </div>

                        <div className="mt-4 space-y-3">
                          <div className="text-xs text-gray-600">
                            {pkg.nextAvailable ? (
                              <>
                                Next availability:{' '}
                                <span className="font-medium text-gray-900">
                                  {new Date(pkg.nextAvailable).toLocaleDateString('en-GB', {
                                    weekday: 'short',
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </span>
                              </>
                            ) : (
                              'No upcoming availability within the next year.'
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => setPackagesOpen(true)}
                            className="inline-flex items-center px-8 py-3 rounded-full bg-black hover:bg-black
 text-white text-sm tracking-wider uppercase hover:bg-gray-800 transition-colors duration-300 mr-2"
                          >
                            Book Package
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Copy + Button above widget */}
          <div className="flex flex-col items-center text-center space-y-4">
            <p className="text-xs tracking-[0.3em] uppercase text-gray-400">
              Choose Your Experience
            </p>
            <div className="text-base text-gray-700 leading-relaxed">
              <button
                type="button"
                onClick={() => setPackagesOpen(true)}
                className="inline-flex items-center px-8 py-3 rounded-full bg-orange-500 text-white text-sm tracking-wider uppercase hover:bg-orange-600 transition-colors duration-300 mr-2"
              >
                View More Packages
              </button>
              <span className="text-gray-600">
                or customize your experience below
              </span>
            </div>
          </div>

          {/* Visual separator between packages and booking widget */}
          <div className="border-t border-gray-200 pt-10"></div>

          {/* Booking widget */}
          <div>
            <BookingWidget />
          </div>

          <PackagesModal
            isOpen={packagesOpen}
            onClose={() => setPackagesOpen(false)}
          />
        </div>
      </section>

      {/* Quick Info Cards (unchanged) */}
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

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
  name: string | null
  package_price: number | null
  currency: string | null
  nights: number | null
  nextAvailable: string | null
  image_url?: string | null
  appliesTo?: string | null
  extrasSummary?: string | null
  valid_from?: string | null
  valid_until?: string | null
}

export default function Page() {
  const [packagesOpen, setPackagesOpen] = useState(false)

  const [featuredPackages, setFeaturedPackages] = useState<FeaturedPackage[]>([])
  const [initialPackageId, setInitialPackageId] = useState<number | null>(null)
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

        // 2) Load rooms attached to these packages (packages_rooms + room_types)
        const roomsUrl =
          `${SUPABASE_URL}/rest/v1/packages_rooms` +
          `?select=package_id,room_type_id&package_id=in.(${pkgIds.join(',')})`

        const pkgRooms = await fetchJSON<
          { package_id: number; room_type_id: number | null }[]
        >(roomsUrl)

        const roomIdSet = new Set<number>()
        const roomIdsByPackage: Record<number, number[]> = {}

        ;(pkgRooms || []).forEach((pr) => {
          if (pr.room_type_id == null) return
          roomIdSet.add(pr.room_type_id)
          if (!roomIdsByPackage[pr.package_id]) roomIdsByPackage[pr.package_id] = []
          roomIdsByPackage[pr.package_id].push(pr.room_type_id)
        })

        // ✅ IMPORTANT: build this AFTER roomIdSet is populated
        const roomTypeIds = Array.from(roomIdSet)


        let roomsDisplayByPackage: Record<
          number,
          { code: string | null; name: string | null }[]
        > = {}

        let roomCodes: string[] = []
        const roomIdByCode: Record<string, number> = {}
        const normalizeCode = (s: string) => (s || '').trim().toUpperCase()



        if (roomIdSet.size) {
          const roomIds = Array.from(roomIdSet)
          const roomsMetaUrl =
            `${SUPABASE_URL}/rest/v1/room_types` +
            `?select=id,code,name&id=in.(${roomIds.join(',')})`

          const roomsMeta = await fetchJSON<
            { id: number; code: string | null; name: string | null }[]
          >(roomsMetaUrl)

          const roomById: Record<
            number,
            { id: number; code: string | null; name: string | null }
          > = {}
          ;(roomsMeta || []).forEach((r) => {
            roomById[r.id] = r
          })

        roomCodes = (roomsMeta || [])
          .map((r) => (r.code || '').trim())
          .filter(Boolean)


        for (const k in roomIdByCode) delete roomIdByCode[k]
        ;(roomsMeta || []).forEach((r) => {
          const c = (r.code || '').trim()
          if (!c) return
          roomIdByCode[normalizeCode(c)] = r.id
        })





          const map: typeof roomsDisplayByPackage = {}
          ;(pkgRooms || []).forEach((pr) => {
            if (pr.room_type_id == null) return
            const meta = roomById[pr.room_type_id]
            if (!meta) return
            if (!map[pr.package_id]) map[pr.package_id] = []
            map[pr.package_id].push({ code: meta.code, name: meta.name })
          })
          roomsDisplayByPackage = map
        }

        // 3) Load extras linked to packages (package_extras + extras)
        const pkgExtrasUrl =
          `${SUPABASE_URL}/rest/v1/package_extras` +
          `?select=package_id,extra_id,quantity,code&package_id=in.(${pkgIds.join(',')})`

        const pkgExtras = await fetchJSON<
          { package_id: number; extra_id: number | null; quantity: number | null; code: string | null }[]
        >(pkgExtrasUrl)

        const extraIdSet = new Set<number>()
        ;(pkgExtras || []).forEach((px) => {
          if (px.extra_id == null) return
          extraIdSet.add(px.extra_id)
        })

        let extrasByPackage: Record<
          number,
          { name: string | null; code: string | null; quantity: number | null }[]
        > = {}

        if (extraIdSet.size) {
          const extraIds = Array.from(extraIdSet)
          const extrasMetaUrl =
            `${SUPABASE_URL}/rest/v1/extras` +
            `?select=id,name,code,price,currency&id=in.(${extraIds.join(',')})`

          const extrasMeta = await fetchJSON<
            { id: number; name: string | null; code: string | null }[]
          >(extrasMetaUrl)

          const extraById: Record<
            number,
            { id: number; name: string | null; code: string | null }
          > = {}
          ;(extrasMeta || []).forEach((e) => {
            extraById[e.id] = e
          })

          const map: typeof extrasByPackage = {}
          ;(pkgExtras || []).forEach((px) => {
            if (px.extra_id == null) return
            const ex = extraById[px.extra_id]
            if (!ex) return
            if (!map[px.package_id]) map[px.package_id] = []
            map[px.package_id].push({
              name: ex.name,
              code: ex.code,
              quantity: px.quantity,
            })
          })
          extrasByPackage = map
        }


        // Helper functions
        function toLocalISO(d: Date): string {
          const yyyy = d.getFullYear()
          const mm = String(d.getMonth() + 1).padStart(2, '0')
          const dd = String(d.getDate()).padStart(2, '0')
          return `${yyyy}-${mm}-${dd}`
        }

        function addDaysISO(isoDate: string, days: number): string {
          const d = new Date(isoDate + 'T00:00:00')
          if (isNaN(d.getTime())) return toLocalISO(new Date())
          d.setDate(d.getDate() + days)
          return toLocalISO(d)
        }

        // ---- Compute "Available from" using CORRECT calendar logic ----
        const todayISO = toLocalISO(new Date())
        const horizonDays = 365
        const horizonEndISO = addDaysISO(todayISO, horizonDays)

        // Fetch reservations
        const resUrl =
          `${SUPABASE_URL}/rest/v1/reservations` +
          `?select=room_type_id,room_type_code,check_in,check_out,status` +
          `&check_in=lt.${horizonEndISO}&check_out=gt.${todayISO}` +
          `&status=not.in.("cancelled","no_show")`

        const resvs = await fetchJSON<{
          room_type_id: string | number | null
          room_type_code: string | null
          check_in: string | null
          check_out: string | null
          status: string | null
        }[]>(resUrl)

        // Fetch blocked dates
        let blocked: { room_type_id: number | string | null; blocked_date: string | null }[] = []
        if (roomTypeIds.length > 0) {
          const blockedUrl =
            `${SUPABASE_URL}/rest/v1/blocked_dates` +
            `?select=room_type_id,blocked_date` +
            `&room_type_id=in.(${roomTypeIds.join(',')})` +
            `&blocked_date=gte.${todayISO}&blocked_date=lt.${horizonEndISO}`

          blocked = await fetchJSON<
            { room_type_id: number | string | null; blocked_date: string | null }[]
          >(blockedUrl) || []
        }

        // Compute nextAvailable for each package using CORRECT logic
        const withAvailability: FeaturedPackage[] = pkgs.map((pkg) => {
          const nights = pkg.nights ?? 1
          const roomIdsForPkg = roomIdsByPackage[pkg.id] || []
          let nextAvailable: string | null = null

          if (!roomIdsForPkg.length) {
            return {
              ...pkg,
              nextAvailable: null,
              appliesTo: null,
              extrasSummary: null,
            }
          }

          // Build lookup maps (CORRECT logic)
          const roomKeyById: Record<string, string> = {}
          const roomKeyByCode: Record<string, string> = {}
          const occupancy: Record<string, Set<string>> = {}

          roomIdsForPkg.forEach((id) => {
            const key = String(id)
            occupancy[key] = new Set<string>()
            roomKeyById[String(id)] = key
            const code = Object.keys(roomIdByCode).find((c) => roomIdByCode[c] === id)
            if (code) roomKeyByCode[code] = key
          })

          // Add reservations to occupancy
          ;(resvs || []).forEach((r) => {
            if (!r.check_in || !r.check_out) return

            const idKey = r.room_type_id ? roomKeyById[String(r.room_type_id)] : undefined
            const codeKey = r.room_type_code ? roomKeyByCode[r.room_type_code] : undefined

            const key = idKey ?? codeKey
            if (!key) return

            let cur = new Date(r.check_in + 'T00:00:00')
            const end = new Date(r.check_out + 'T00:00:00')
            if (isNaN(cur.getTime()) || isNaN(end.getTime())) return

            const set = occupancy[key]
            if (!set) return

            while (cur < end) {
              set.add(toLocalISO(cur))
              cur.setDate(cur.getDate() + 1)
            }
          })

          // Add blocked dates to occupancy
          ;(blocked || []).forEach((b) => {
            const key = roomKeyById[String(b.room_type_id)]
            if (!key || !b.blocked_date) return
            occupancy[key]?.add(String(b.blocked_date).slice(0, 10))
          })

          // Find first available date (CORRECT logic)
          const startFrom = pkg.valid_from && pkg.valid_from > todayISO ? pkg.valid_from : todayISO
          const ciCursor = new Date(startFrom + 'T00:00:00')
          const horizonEnd = new Date(todayISO + 'T00:00:00')
          horizonEnd.setFullYear(horizonEnd.getFullYear() + 1)

          while (ciCursor <= horizonEnd) {
            const ciStr = toLocalISO(ciCursor)

            // Enforce package validity
            if (pkg.valid_from && ciStr < pkg.valid_from) {
              ciCursor.setDate(ciCursor.getDate() + 1)
              continue
            }

            const coStr = addDaysISO(ciStr, nights)

            if (pkg.valid_until && coStr > pkg.valid_until) {
              break
            }

            let hasAvailableRoom = false

            for (const roomId of roomIdsForPkg) {
              const key = String(roomId)
              const occ = occupancy[key] ?? new Set<string>()
              let roomFree = true

              for (let i = 0; i < nights; i++) {
                const d = new Date(ciCursor)
                d.setDate(d.getDate() + i)
                const dStr = toLocalISO(d)
                if (occ.has(dStr)) {
                  roomFree = false
                  break
                }
              }

              if (roomFree) {
                hasAvailableRoom = true
                break
              }
            }

            if (hasAvailableRoom) {
              nextAvailable = ciStr
              break
            }

            ciCursor.setDate(ciCursor.getDate() + 1)
          }

          // Build appliesTo and extrasSummary
          const roomsForPkg = roomsDisplayByPackage[pkg.id] || []
          let appliesTo: string | null = null
          if (roomsForPkg.length) {
            const labels = roomsForPkg
              .map((r) => (r.code || r.name || '').trim())
              .filter(Boolean)
            if (labels.length) {
              if (labels.length === 1) {
                appliesTo = `Applies to ${labels[0]} Cabin`
              } else {
                const last = labels[labels.length - 1]
                const rest = labels.slice(0, -1)
                appliesTo = `Applies to ${rest.join(', ')} and ${last} Cabins`
              }
            }
          }

          const extrasForPkg = extrasByPackage[pkg.id] || []
          let extrasSummary: string | null = null
          if (extrasForPkg.length) {
            extrasSummary = extrasForPkg
              .map((e) =>
                `${e.quantity && e.quantity > 1 ? `${e.quantity}× ` : ''}${
                  (e.name || e.code || '').trim()
                }`.trim()
              )
              .filter(Boolean)
              .join(', ')
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
            appliesTo,
            extrasSummary,
            valid_from: pkg.valid_from,
            valid_until: pkg.valid_until,
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
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <Image
          src="/cabins/sun.jpg"
          alt="/cabins/sea.jpg"
          fill
          className="object-cover scale-105 transition-transform duration-[2s]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        <div className="relative z-10 text-center text-white px-6 max-w-4xl animate-fadeIn">
          <p className="text-xs md:text-sm tracking-[0.4em] uppercase mb-6 text-white/80 font-light">
            Plan Your Stay
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white/90 font-serif font-light mb-8 leading-[1.1] tracking-tight">
            Book Your Escape
          </h1>
          <p className="text-base md:text-lg font-light max-w-xl mx-auto leading-relaxed text-white/90">
            Select your dates and cabin to begin your coastal retreat
          </p>
        </div>
        {/* Decorative scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/60 rounded-full" />
          </div>
        </div>
      </section>

      {/* Choose Package or Customise Section */}
      <section className="py-20 md:py-24 px-6 md:px-8 lg:px-12 bg-gradient-to-b from-white via-amber-50/30 to-white">
        <div className="max-w-5xl mx-auto">
          {/* Decorative top element */}
          <div className="flex items-center justify-center mb-10">
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
            <div className="mx-4 w-1.5 h-1.5 rounded-full bg-amber-400" />
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
          </div>

          {/* Main heading with link */}
          <h2 className="text-center text-3xl md:text-4xl lg:text-5xl font-serif font-light leading-tight tracking-wide mb-3">
            <a 
              href="#featured-packages"
              className="group inline-flex items-center gap-2 text-stone-900 hover:text-amber-700 transition-colors duration-300"
            >
              <span>Choose from one of our packages</span>
              <svg 
                className="w-5 h-5 md:w-6 md:h-6 transform transition-transform duration-300 group-hover:translate-x-1 text-amber-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </h2>
          
          {/* Divider text */}
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
            <span className="text-xs tracking-[0.3em] uppercase text-amber-600 font-medium">or</span>
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
          </div>

          {/* Customise link */}
          <div className="text-center">
            <a 
              href="#booking-widget" 
              className="group inline-flex items-center gap-2 text-2xl md:text-3xl font-serif font-light text-stone-900 hover:text-amber-700 transition-colors duration-300"
            >
              <span>customise your stay</span>
              <svg 
                className="w-5 h-5 md:w-6 md:h-6 transform transition-transform duration-300 group-hover:translate-x-1 text-amber-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          {/* Decorative bottom element */}
          <div className="flex items-center justify-center mt-10">
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
            <div className="mx-4 w-1.5 h-1.5 rounded-full bg-amber-400" />
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
          </div>
        </div>
      </section>

      {/* Featured Packages Section */}
      <section id="featured-packages" className="py-20 md:py-28 px-6 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.4em] uppercase text-stone-400 mb-4">
              Curated Experiences
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-light text-stone-900 mb-4">
              Featured Packages
            </h2>
            <div className="w-16 h-px bg-stone-300 mx-auto" />
          </div>

          {/* Loading State */}
          {loadingPackages && (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin" />
                <p className="text-sm text-stone-500 tracking-wide">Loading packages...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {packagesError && (
            <div className="text-center py-16">
              <p className="text-sm text-red-500 bg-red-50 inline-block px-6 py-3 rounded-lg">
                {packagesError}
              </p>
            </div>
          )}

          {/* Packages Grid */}
          {!loadingPackages && !packagesError && featuredPackages.length > 0 && (
            <div className={`grid gap-8 ${
              featuredPackages.length === 1
                ? 'md:grid-cols-1 max-w-2xl mx-auto'
                : featuredPackages.length === 2
                ? 'md:grid-cols-2 max-w-4xl mx-auto'
                : featuredPackages.length === 4
                ? 'md:grid-cols-2 lg:grid-cols-2 max-w-5xl mx-auto'
                : 'md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {featuredPackages.map((pkg, index) => (
                <div
                  key={pkg.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col border border-stone-100"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Package Image */}
                  <div className="relative h-56 overflow-hidden">
                    {pkg.image_url ? (
                      <>
                        <img
                          src={pkg.image_url}
                          alt={pkg.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
                        <svg className="w-12 h-12 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {/* Featured Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] tracking-[0.15em] uppercase bg-white/95 backdrop-blur-sm text-stone-700 font-medium shadow-sm">
                        Featured
                      </span>
                    </div>
                  </div>

                  {/* Package Content */}
                  <div className="p-5 md:p-6 flex flex-col flex-1">
                    {/* Package Name */}
                    <h3 className="text-xl md:text-2xl font-serif font-light text-stone-900 leading-tight mb-2">
                      {pkg.name}
                    </h3>

                    {/* Price immediately under name */}
                    {pkg.package_price != null && (
                      <p className="font-bold text-2xl text-stone-900 mb-4">
                        {pkg.currency || 'GHS'} {pkg.package_price.toLocaleString()}
                      </p>
                    )}

                    {/* Separator */}
                    <div className="h-px bg-stone-200 mb-4" />

                    {/* Package Details - Nights & Room Types on same line */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-sm text-stone-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        <span>{pkg.nights!} night{pkg.nights! > 1 ? 's' : ''}</span>
                        {pkg.appliesTo && (
                          <>
                            <span className="text-stone-300">•</span>
                            <span>
                              {pkg.appliesTo
                                .replace('Applies to ', '')
                                .replace(/ and /i, ' or ')
                                .replace(/ Cabins?/i, ' Cabin')
                                .trim()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Separator */}
                    <div className="h-px bg-stone-200 mb-4" />

                    {/* Includes Section with background */}
                    {pkg.extrasSummary && (
                      <>
                        <div className="mb-4 p-3 bg-emerald-50 rounded-lg">
                          <p className="text-xs tracking-widest uppercase text-stone-500 mb-2">Includes</p>
                          <ul className="space-y-1.5">
                            {pkg.extrasSummary.split(', ').map((extra, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-stone-700">
                                <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>{extra.trim()}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {/* Separator */}
                        <div className="h-px bg-stone-200 mb-4" />
                      </>
                    )}

                    {/* Validity Period with background */}
                    {(pkg.valid_from || pkg.valid_until) && (
                      <>
                        <div className="mb-4 p-3 bg-amber-50 rounded-lg">
                          <p className="text-xs tracking-widest uppercase text-stone-500 mb-1.5">Valid Period</p>
                          <p className="text-sm text-stone-700 font-medium">
                            {pkg.valid_from && new Date(pkg.valid_from).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                            {pkg.valid_from && pkg.valid_until && ' – '}
                            {pkg.valid_until && new Date(pkg.valid_until).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        {/* Separator */}
                        <div className="h-px bg-stone-200 mb-4" />
                      </>
                    )}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Footer - Availability & Button */}
                    <div className="space-y-3">
                      {/* Availability */}
                      <div className="flex items-center gap-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${pkg.nextAvailable ? 'bg-emerald-400' : 'bg-stone-300'}`} />
                        {pkg.nextAvailable ? (
                          <span className="text-stone-600">
                            Available from{' '}
                            <span className="font-medium text-stone-900">
                              {new Date(pkg.nextAvailable).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </span>
                        ) : (
                          <span className="text-stone-400">No availability soon</span>
                        )}
                      </div>

                      {/* Book Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setInitialPackageId(pkg.id)
                          setPackagesOpen(true)
                        }}
                        className="w-full py-3.5 rounded-xl bg-stone-900 text-white text-sm tracking-wide font-medium hover:bg-stone-800 active:scale-[0.98] transition-all duration-300"
                        >
                        Book Package
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View More Packages CTA */}
          {!loadingPackages && !packagesError && (
            <div className="mt-16 text-center">
              <button
                type="button"
                onClick={() => {
                  setInitialPackageId(null)
                  setPackagesOpen(true)
                }}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm tracking-wide font-medium hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 active:scale-[0.98] transition-all duration-300"
              >
                <span>View All Packages</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <p className="mt-4 text-sm text-stone-500">
                or customize your experience below
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Booking Widget Section */}
      <section id="booking-widget" className="py-20 md:py-28 px-3 md:px-8 lg:px-12 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.4em] uppercase text-stone-400 mb-4">
              Custom Booking
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-light text-stone-900 mb-4">
              Create Your Stay
            </h2>
            <div className="w-16 h-px bg-stone-300 mx-auto mb-6" />
            <p className="text-stone-600 max-w-lg mx-auto">
              Select your preferred dates, cabin, and extras to build your perfect retreat
            </p>
          </div>

          {/* Booking Widget Container */}
          <BookingWidget />
        </div>
      </section>

      {/* Quick Info Cards */}
      <section className="py-20 md:py-28 px-6 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Flexible Booking Card */}
            <div className="group bg-white rounded-2xl border border-stone-100 p-8 md:p-10 hover:shadow-lg hover:border-stone-200 transition-all duration-500">
              <div className="w-14 h-14 rounded-2xl bg-stone-50 group-hover:bg-stone-100 flex items-center justify-center mb-6 transition-colors duration-300">
                <svg
                  className="w-7 h-7 text-stone-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-serif font-light text-stone-900 mb-3">Flexible Booking</h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                Free cancellation up to 7 days before arrival. Plans change—we understand.
              </p>
            </div>

            {/* Curated Amenities Card */}
            <div className="group bg-white rounded-2xl border border-stone-100 p-8 md:p-10 hover:shadow-lg hover:border-stone-200 transition-all duration-500">
              <div className="w-14 h-14 rounded-2xl bg-stone-50 group-hover:bg-stone-100 flex items-center justify-center mb-6 transition-colors duration-300">
                <svg
                  className="w-7 h-7 text-stone-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-serif font-light text-stone-900 mb-3">Curated Amenities</h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                Premium extras thoughtfully selected to elevate your coastal experience.
              </p>
            </div>

            {/* Seamless Check-In Card */}
            <div className="group bg-white rounded-2xl border border-stone-100 p-8 md:p-10 hover:shadow-lg hover:border-stone-200 transition-all duration-500">
              <div className="w-14 h-14 rounded-2xl bg-stone-50 group-hover:bg-stone-100 flex items-center justify-center mb-6 transition-colors duration-300">
                <svg
                  className="w-7 h-7 text-stone-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-serif font-light text-stone-900 mb-3">Seamless Check-In</h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                Check-in details shared before arrival. Your retreat starts smoothly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Modal */}
            <PackagesModal
        isOpen={packagesOpen}
        initialPackageId={initialPackageId}
        onClose={() => {
          setPackagesOpen(false)
          setInitialPackageId(null)
        }}
      />
    </div>
  )
}
import Link from 'next/link'

type PromoBannerProps = {
  /** Use `book` on /book-escape (scrolls to calendar); `rates` on /rates (links to book flow). */
  context: 'rates' | 'book'
}

/**
 * Marketing strip for time-bound offers. Copy is static — adjust here when the promo ends or changes.
 */
const ctaButtonClass =
  'inline-flex items-center justify-center gap-2 shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold tracking-wide text-white shadow-md shadow-amber-600/25 transition-all duration-200 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.98]'

export function PromoBanner({ context }: PromoBannerProps) {
  const cta =
    context === 'rates' ? (
      <Link href="/book-escape#booking-widget" className={ctaButtonClass}>
        Book with promo pricing
        <span aria-hidden className="text-base leading-none">
          →
        </span>
      </Link>
    ) : (
      <a href="#booking-widget" className={ctaButtonClass}>
        View calendar and prices
        <span aria-hidden className="text-base leading-none">
          →
        </span>
      </a>
    )

  return (
    <div className="border-y border-amber-200/80 bg-gradient-to-r from-amber-50 via-orange-50/90 to-amber-50">
      <div className="max-w-5xl mx-auto px-6 py-4 md:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-6">
        <div className="flex items-start gap-3">
          <span
            className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white text-sm font-bold shadow-sm"
            aria-hidden
          >
            %
          </span>
          <div>
            <p className="text-sm font-semibold tracking-wide text-amber-950">
              May 2026 weekday promotion
            </p>
            <p className="mt-1 text-sm text-amber-900/85 leading-relaxed">
              Get up to 20% off all weekday bookings (Sunday–Thursday) in May 2026! Book Now!
            </p>
          </div>
        </div>
        {cta}
      </div>
    </div>
  )
}

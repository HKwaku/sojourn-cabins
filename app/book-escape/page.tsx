'use client'

import dynamic from 'next/dynamic'
const BookingWidget = dynamic(() => import('@/app/components/BookingWidget'), { ssr: false })

export default function Page() {
  return <BookingWidget />
}

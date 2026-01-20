'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

interface MenuItem {
  id: string
  category: string
  name: string
  description: string
}

interface ReservationExtra {
  id: string
  extra_id: string
  extra_code: string
  extra_name: string
  quantity: number
  selection_status: string
  selection_data: any
}

interface Reservation {
  id: string
  confirmation_code: string
  check_in: string
  check_out: string
  nights: number
  adults: number
  children: number
  guest_first_name: string
  guest_last_name: string
  guest_email: string
  reservation_extras: ReservationExtra[]
}

export default function ExtraSelectionsPage() {
  const searchParams = useSearchParams()
  const confirmationCode = searchParams.get('code')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selections, setSelections] = useState<Record<string, any>>({})
  const [message, setMessage] = useState({ type: '', text: '' })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  useEffect(() => {
    if (confirmationCode) {
      loadData()
    }
  }, [confirmationCode])

  const loadData = async () => {
    try {
      setLoading(true)

      const { data: resData, error: resError } = await supabase
        .from('reservations')
        .select(`
          *,
          reservation_extras (
            id,
            extra_id,
            extra_code,
            extra_name,
            quantity,
            selection_status,
            selection_data
          )
        `)
        .eq('confirmation_code', confirmationCode)
        .single()

      if (resError) throw resError
      setReservation(resData)

      const { data: menuData, error: menuError} = await supabase
        .from('chef_menu_items')
        .select('*')
        .eq('available', true)
        .order('category')
        .order('name')

      if (menuError) throw menuError
      setMenuItems(menuData || [])

      const initialSelections: Record<string, any> = {}
      resData.reservation_extras.forEach((extra: ReservationExtra) => {
        if (extra.selection_data && Object.keys(extra.selection_data).length > 0) {
          initialSelections[extra.id] = extra.selection_data
        } else {
          initialSelections[extra.id] = { dates: {} }
        }
      })
      setSelections(initialSelections)

    } catch (error) {
      console.error('Error loading data:', error)
      setMessage({ type: 'error', text: 'Unable to load your reservation. Please check your confirmation code.' })
    } finally {
      setLoading(false)
    }
  }

  const isChefService = (extraCode: string, extraName: string) => {
    return extraCode.toLowerCase().includes('chef') || extraName.toLowerCase().includes('chef')
  }

  const getDatesForExtra = (extra: ReservationExtra) => {
    if (!reservation) return []
    
    const dates: string[] = []
    const checkIn = new Date(reservation.check_in)
    const numDays = Math.min(extra.quantity, reservation.nights)

    for (let i = 0; i < numDays; i++) {
      const date = new Date(checkIn)
      date.setDate(date.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }

    return dates
  }

  const getTotalGuests = () => {
    if (!reservation) return 1
    return (reservation.adults || 1) + (reservation.children || 0)
  }

  const updateSelection = (extraId: string, date: string, field: string, value: any) => {
    setSelections(prev => ({
      ...prev,
      [extraId]: {
        dates: {
          ...prev[extraId]?.dates,
          [date]: {
            ...prev[extraId]?.dates?.[date],
            [field]: value
          }
        }
      }
    }))
  }

  const updateGuestSelection = (extraId: string, date: string, guestIndex: number, field: string, value: any) => {
    setSelections(prev => {
      const currentGuests = prev[extraId]?.dates?.[date]?.guests || []
      const newGuests = [...currentGuests]
      
      if (!newGuests[guestIndex]) {
        newGuests[guestIndex] = {}
      }
      
      newGuests[guestIndex] = {
        ...newGuests[guestIndex],
        [field]: value
      }

      return {
        ...prev,
        [extraId]: {
          dates: {
            ...prev[extraId]?.dates,
            [date]: {
              ...prev[extraId]?.dates?.[date],
              guests: newGuests
            }
          }
        }
      }
    })
  }

  const selectMenuItem = (extraId: string, date: string, guestIndex: number, category: string, itemId: string) => {
    // Single selection - replace the current selection
    updateGuestSelection(extraId, date, guestIndex, category, itemId)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage({ type: '', text: '' })

      for (const extra of reservation!.reservation_extras) {
        const { error } = await supabase
          .from('reservation_extras')
          .update({
            selection_data: selections[extra.id] || { dates: {} },
            selection_status: 'completed',
            selected_at: new Date().toISOString()
          })
          .eq('id', extra.id)

        if (error) throw error
      }

      setMessage({ 
        type: 'success', 
        text: 'Your selections have been saved successfully! We look forward to welcoming you.' 
      })
      
      setTimeout(() => loadData(), 2000)

    } catch (error) {
      console.error('Error saving:', error)
      setMessage({ type: 'error', text: 'Failed to save your selections. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const getMenuItemsByCategory = (category: string) => {
    return menuItems.filter(item => item.category === category)
  }

  if (!confirmationCode) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-stone-50 to-white flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-serif text-stone-900 mb-4">Invalid Link</h1>
          <p className="text-stone-600">Please use the link provided in your confirmation email.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-stone-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-600">Loading your reservation...</p>
        </div>
      </div>
    )
  }

  if (!reservation || reservation.reservation_extras.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-stone-50 to-white flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-serif text-stone-900 mb-4">No Extras to Configure</h1>
          <p className="text-stone-600">There are no extras requiring selection for this reservation.</p>
        </div>
      </div>
    )
  }

  const totalGuests = getTotalGuests()

  return (
  <div className="min-h-screen bg-gradient-to-b from-white via-stone-50 to-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white pt-28 pb-8 px-6 shadow-md mb-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs tracking-[0.4em] uppercase text-orange-400 mb-2">
            {confirmationCode}
          </p>
          <h1 className="text-2xl md:text-3xl font-serif font-light mb-2">
            Configure Your Extras
          </h1>
          <p className="text-stone-300 text-sm">
            Hello {reservation.guest_first_name}, please select your preferences
            {totalGuests > 1 && ` for ${totalGuests} guests`}
          </p>
        </div>
      </div>

      {/* Messages */}
      {message.text && (
        <div className="max-w-4xl mx-auto px-6 mb-6">
          <div className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 pb-12">
        <div className="space-y-6">
          {reservation.reservation_extras.map((extra) => {
            const dates = getDatesForExtra(extra)
            const isChef = isChefService(extra.extra_code, extra.extra_name)

            return (
              <div key={extra.id} className="bg-white rounded-2xl border border-stone-200 p-4 md:p-8 shadow-lg">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 mb-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-serif text-stone-900 mb-2">
                      {extra.extra_name}
                    </h2>
                    <p className="text-stone-600 text-sm">
                      {isChef 
                        ? `Select menu for ${dates.length} ${dates.length === 1 ? 'day' : 'days'}`
                        : `Configure ${dates.length} ${dates.length === 1 ? 'service' : 'services'}`
                      }
                    </p>
                  </div>
                  {extra.selection_status === 'completed' && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs md:text-sm rounded-full whitespace-nowrap self-start">
                      ✓ Saved
                    </span>
                  )}
                </div>

                {isChef ? (
                  <div className="space-y-6">
                    {dates.map((date, idx) => {
                      const dateSelection = selections[extra.id]?.dates?.[date] || {}
                      
                      return (
                        <div key={date} className="border border-stone-200 rounded-xl p-4 md:p-6">
                          <h3 className="text-base md:text-lg font-serif mb-4">
                            Day {idx + 1} - {new Date(date).toLocaleDateString('en-US', {
                              weekday: 'long', month: 'long', day: 'numeric'
                            })}
                          </h3>

                          {/* Meal Type */}
                          <div className="mb-6">
                            <label className="block text-sm font-medium text-stone-700 mb-2">
                              Meal Service
                            </label>
                            <div className="flex gap-2 md:gap-3 flex-wrap">
                              {['lunch', 'dinner', 'both'].map(type => (
                                <button
                                  key={type}
                                  onClick={() => updateSelection(extra.id, date, 'meal_type', type)}
                                  className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition ${
                                    dateSelection.meal_type === type
                                      ? 'bg-orange-500 text-white'
                                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                                  }`}
                                >
                                  {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Per-Guest Selections */}
                          {Array.from({ length: totalGuests }).map((_, guestIndex) => {
                            const guestSelection = dateSelection.guests?.[guestIndex] || {}
                            
                            return (
                              <div key={guestIndex} className="mb-8 pb-8 border-b last:border-b-0">
                                <h4 className="text-base font-semibold text-stone-900 mb-4">
                                  Guest {guestIndex + 1}
                                  {guestIndex === 0 && ` (${reservation.guest_first_name})`}
                                </h4>

                                {/* Starters */}
                                <div className="mb-6">
                                  <h5 className="text-xs md:text-sm font-semibold uppercase tracking-wider text-stone-600 mb-3">
                                    Select One Starter
                                  </h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {getMenuItemsByCategory('starters').map(item => (
                                      <button
                                        key={item.id}
                                        onClick={() => selectMenuItem(extra.id, date, guestIndex, 'starter', item.id)}
                                        className={`text-left p-3 md:p-4 rounded-lg border transition ${
                                          guestSelection.starter === item.id
                                            ? 'border-orange-500 bg-orange-50'
                                            : 'border-stone-200 hover:border-stone-300'
                                        }`}
                                      >
                                        <p className="font-medium text-stone-900 text-sm">{item.name}</p>
                                        <p className="text-xs text-stone-600 mt-1 line-clamp-2">{item.description}</p>
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Mains */}
                                <div className="mb-6">
                                  <h5 className="text-xs md:text-sm font-semibold uppercase tracking-wider text-stone-600 mb-3">
                                    Select One Main Course
                                  </h5>
                                  <p className="text-xs text-orange-600 mb-2">Local Mains</p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                    {getMenuItemsByCategory('local_mains').map(item => (
                                      <button
                                        key={item.id}
                                        onClick={() => selectMenuItem(extra.id, date, guestIndex, 'main', item.id)}
                                        className={`text-left p-3 md:p-4 rounded-lg border transition ${
                                          guestSelection.main === item.id
                                            ? 'border-orange-500 bg-orange-50'
                                            : 'border-stone-200 hover:border-stone-300'
                                        }`}
                                      >
                                        <p className="font-medium text-stone-900 text-sm">{item.name}</p>
                                        <p className="text-xs text-stone-600 mt-1 line-clamp-2">{item.description}</p>
                                      </button>
                                    ))}
                                  </div>
                                  <p className="text-xs text-orange-600 mb-2">Continental Mains</p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {getMenuItemsByCategory('continental_mains').map(item => (
                                      <button
                                        key={item.id}
                                        onClick={() => selectMenuItem(extra.id, date, guestIndex, 'main', item.id)}
                                        className={`text-left p-3 md:p-4 rounded-lg border transition ${
                                          guestSelection.main === item.id
                                            ? 'border-orange-500 bg-orange-50'
                                            : 'border-stone-200 hover:border-stone-300'
                                        }`}
                                      >
                                        <p className="font-medium text-stone-900 text-sm">{item.name}</p>
                                        <p className="text-xs text-stone-600 mt-1 line-clamp-2">{item.description}</p>
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Sides */}
                                <div className="mb-6">
                                  <h5 className="text-xs md:text-sm font-semibold uppercase tracking-wider text-stone-600 mb-3">
                                    Select One Side
                                  </h5>
                                  <p className="text-xs text-stone-600 mb-2">Local Sides</p>
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    {getMenuItemsByCategory('local_sides').map(item => (
                                      <button
                                        key={item.id}
                                        onClick={() => selectMenuItem(extra.id, date, guestIndex, 'side', item.id)}
                                        className={`px-3 md:px-4 py-2 rounded-full text-xs md:text-sm transition ${
                                          guestSelection.side === item.id
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-white border border-stone-200 text-stone-700 hover:border-stone-300'
                                        }`}
                                      >
                                        {item.name}
                                      </button>
                                    ))}
                                  </div>
                                  <p className="text-xs text-stone-600 mb-2">Continental Sides</p>
                                  <div className="flex flex-wrap gap-2">
                                    {getMenuItemsByCategory('continental_sides').map(item => (
                                      <button
                                        key={item.id}
                                        onClick={() => selectMenuItem(extra.id, date, guestIndex, 'side', item.id)}
                                        className={`px-3 md:px-4 py-2 rounded-full text-xs md:text-sm transition ${
                                          guestSelection.side === item.id
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-white border border-stone-200 text-stone-700 hover:border-stone-300'
                                        }`}
                                      >
                                        {item.name}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Special Requests per Guest */}
                                <div>
                                  <label className="block text-sm font-medium text-stone-700 mb-2">
                                    Dietary Restrictions or Special Requests for Guest {guestIndex + 1}
                                  </label>
                                  <textarea
                                    value={guestSelection.special_requests || ''}
                                    onChange={e => updateGuestSelection(extra.id, date, guestIndex, 'special_requests', e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                    placeholder="Any allergies or preferences..."
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dates.map((date, idx) => {
                      const dateSelection = selections[extra.id]?.dates?.[date] || {}
                      
                      return (
                        <div key={date} className="border border-stone-200 rounded-xl p-4 md:p-6">
                          <h3 className="text-base md:text-lg font-serif mb-4">Service {idx + 1}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-stone-700 mb-2">
                                Preferred Date
                              </label>
                              <input
                                type="date"
                                value={dateSelection.date || date}
                                onChange={e => updateSelection(extra.id, date, 'date', e.target.value)}
                                min={reservation.check_in}
                                max={reservation.check_out}
                                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-stone-700 mb-2">
                                Preferred Time
                              </label>
                              <input
                                type="time"
                                value={dateSelection.time || ''}
                                onChange={e => updateSelection(extra.id, date, 'time', e.target.value)}
                                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                              />
                            </div>
                          </div>
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-stone-700 mb-2">
                              Special Requests
                            </label>
                            <textarea
                              value={dateSelection.special_requests || ''}
                              onChange={e => updateSelection(extra.id, date, 'special_requests', e.target.value)}
                              rows={3}
                              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                              placeholder="Any preferences..."
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Save Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl text-base md:text-lg font-medium"
          >
            {saving ? 'Saving...' : 'Save All Selections'}
          </button>
        </div>
      </div>
    </div>
  )
}
'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
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
  room_name?: string
  group_reservation_code?: string
  reservation_extras: ReservationExtra[]
}

interface GroupRoom {
  id: string
  room_name?: string | null
  adults: number
  children: number
}


function ExtraSelectionsContent() {
  const searchParams = useSearchParams()
  const confirmationCode = searchParams.get('code')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selections, setSelections] = useState<Record<string, any>>({})
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [completionMessage, setCompletionMessage] = useState('')
  const [guestNames, setGuestNames] = useState<Record<string, string>>({})
  const [groupRooms, setGroupRooms] = useState<GroupRoom[]>([])
  const [activeAllocDate, setActiveAllocDate] = useState<Record<string, string>>({})

  
  // Workflow tracking per extra
  const [currentStep, setCurrentStep] = useState<Record<string, number>>({})
  const [currentGuest, setCurrentGuest] = useState<Record<string, number>>({})
  const [currentDate, setCurrentDate] = useState<Record<string, number>>({})
  const [currentMeal, setCurrentMeal] = useState<Record<string, 'lunch' | 'dinner'>>({})
  const [editMode, setEditMode] = useState<Record<string, boolean>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [groupTotalGuests, setGroupTotalGuests] = useState<number | null>(null)

  const supabase = useMemo(() => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
  }, [])

  useEffect(() => {
    if (confirmationCode) {
      loadData()
    }
  }, [confirmationCode])

  const isChefService = (code: string, name: string) =>
    code?.toLowerCase().includes('chef') || name?.toLowerCase().includes('chef')

  const getGuestKey = (extraId: string) => {
    const idx = currentGuest[extraId] || 0
    return `guest_${idx}`
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      
      // Validate all extras are complete before submitting
      if (reservation?.reservation_extras) {
        const incompleteExtras: string[] = []
        
        reservation.reservation_extras.forEach(extra => {
          if (!isExtraComplete(extra)) {
            incompleteExtras.push(extra.extra_name)
          }
        })
        
        if (incompleteExtras.length > 0) {
          setSubmitting(false)
          setMessage({
            type: 'error',
            text: `Please complete the following before submitting: ${incompleteExtras.join(', ')}`
          })
          setTimeout(() => setMessage({ type: '', text: '' }), 8000)
          return
        }
      }
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
      
      const updates = Object.entries(selections).map(([extraId, selectionData]) => {
        // Add guest names to the saved data
        const dataWithNames = {
          ...selectionData,
          guest_names: Object.keys(guestNames)
            .filter(key => key.startsWith(`${extraId}_guest_`))
            .reduce((acc, key) => {
              const guestIndex = key.split('_guest_')[1]
              acc[`guest_${guestIndex}`] = guestNames[key]
              return acc
            }, {} as Record<string, string>)
        }
        
        return supabase
          .from('reservation_extras')
          .update({
            selection_data: dataWithNames,
            selection_status: 'submitted'
          })
          .eq('id', extraId)
      })

      const results = await Promise.all(updates)
      const errors = results.filter(result => result.error)
      const hasErrors = errors.length > 0

      if (hasErrors) {
        // Log detailed error information
        console.error('Submit errors:', errors)
        errors.forEach((err, index) => {
          console.error(`Error ${index + 1}:`, err.error)
        })
        
        // Show user-friendly error
        setMessage({ 
          type: 'error', 
          text: 'Unable to submit due to a technical issue. Please try again or contact support.' 
        })
        setTimeout(() => setMessage({ type: '', text: '' }), 8000)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      console.log('Successfully submitted all selections')
      setIsSubmitted(true)

      // Show success modal
      setCompletionMessage('🎉 Success! Your selections have been submitted and locked.')
      setShowCompletionModal(true)
      
      setTimeout(() => {
        setShowCompletionModal(false)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        setMessage({ type: 'success', text: 'All selections submitted successfully!' })
        setTimeout(() => setMessage({ type: '', text: '' }), 5000)
      }, 2500)
    } catch (error) {
      console.error('Error submitting selections:', error)
      setMessage({ 
        type: 'error', 
        text: 'Unable to submit. Please check your internet connection and try again, or contact support if the issue persists.' 
      })
      setTimeout(() => setMessage({ type: '', text: '' }), 8000)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSubmitting(false)
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      let groupGuestCount: number | null = null
      let { data: resData, error: resError } = await supabase
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

      if (resError && (resError as any).code === 'PGRST116') {
        const { data: groupData, error: groupError } = await supabase
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
          .eq('group_reservation_code', confirmationCode)
          .limit(1)
          .single()

        if (groupError) throw groupError
        resData = groupData
      } else if (resError) {
        throw resError
      }

      setReservation(resData)
      
      // Check if this is a group booking and calculate total guests
      if (resData.group_reservation_code) {
        console.log('Group booking detected:', resData.group_reservation_code)

        const { data: groupBookings, error: groupError } = await supabase
          .from('reservations')
          .select('id, room_name, adults, children')
          .eq('group_reservation_code', resData.group_reservation_code)

        if (!groupError && groupBookings) {
          const rooms: GroupRoom[] = (groupBookings || []).map(b => ({
            id: b.id,
            room_name: b.room_name || null,
            adults: b.adults || 0,
            children: b.children || 0
          }))

          setGroupRooms(rooms)

          const totalGuests = rooms.reduce((sum, r) => sum + (r.adults || 0) + (r.children || 0), 0)
            console.log('Group total guests:', totalGuests, 'from rooms:', rooms)
            setGroupTotalGuests(totalGuests)
            groupGuestCount = totalGuests


        } else {
          console.error('Error fetching group bookings:', groupError)
        }
      } else {
        setGroupRooms([])
        console.log('Not a group booking')
      }

      
      // Check if already submitted
      const hasSubmittedExtras = resData.reservation_extras?.some(
        (e: ReservationExtra) => e.selection_status === 'submitted'
      )
      setIsSubmitted(hasSubmittedExtras || false)

      const { data: menuData, error: menuError } = await supabase
        .from('chef_menu_items')
        .select('*')
        .eq('available', true)
        .order('category')
        .order('name')

      if (menuError) throw menuError
      setMenuItems(menuData || [])

      const initialSelections: Record<string, any> = {}
      const initialNames: Record<string, string> = {}
      
      // Default guest count = this reservation
      let guestCount =
        groupGuestCount ??
        ((resData.adults || 0) + (resData.children || 0))

      
      if (resData.reservation_extras) {
        resData.reservation_extras.forEach((extra: ReservationExtra) => {
          if (extra.selection_data && Object.keys(extra.selection_data).length > 0) {
            initialSelections[extra.id] = extra.selection_data
            
            // Load saved guest names if they exist
            if (extra.selection_data.guest_names) {
              Object.entries(extra.selection_data.guest_names).forEach(([guestKey, name]) => {
                const guestIndex = guestKey.split('_')[1]
                initialNames[`${extra.id}_guest_${guestIndex}`] = name as string
              })
            }
          } else {
            initialSelections[extra.id] = { shared_dates: [], guests: {} }
          }
          
          // Initialize guest names for any missing guests - primary guest gets full name, others get Guest 2, Guest 3, etc
          for (let i = 0; i < guestCount; i++) {
            const key = `${extra.id}_guest_${i}`
            if (!initialNames[key]) {
              if (i === 0) {
                initialNames[key] = `${resData.guest_first_name} ${resData.guest_last_name}`
              } else {
                initialNames[key] = `Guest ${i + 1}`
              }
            }
          }
        })
      }
      
      setSelections(initialSelections)
      setGuestNames(initialNames)
      
      // Auto-submit if past deadline and not yet submitted
      const daysRemaining = getDaysRemaining()
      if (daysRemaining && daysRemaining.isPastDeadline && !hasSubmittedExtras) {
        // Check if there are any selections made
        const hasSelections = Object.values(initialSelections).some((sel: any) => 
          sel?.shared_dates?.length > 0 || sel?.dates
        )
        
        if (hasSelections) {
          console.log('Auto-submitting past deadline')
          await handleSubmit()
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setMessage({ type: 'error', text: 'Unable to load your reservation' })
    } finally {
      setLoading(false)
    }
  }

  const getDeadline = () => {
    if (!reservation) return null
    const checkInDate = new Date(reservation.check_in)
    const deadline = new Date(checkInDate)
    deadline.setHours(deadline.getHours() - 24) // 24 hours before check-in
    return deadline
  }

  const getDaysRemaining = () => {
    const deadline = getDeadline()
    if (!deadline) return null
    
    const now = new Date()
    const diffMs = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    
    return {
      days: diffDays,
      hours: Math.ceil(diffMs / (1000 * 60 * 60)),
      isPastDeadline: diffMs < 0
    }
  }

  const getAllAvailableDates = () => {
    if (!reservation) return []
    const dates: string[] = []
    const checkIn = new Date(reservation.check_in)
    const checkOut = new Date(reservation.check_out)
    const current = new Date(checkIn)

    while (current < checkOut) {
      dates.push(current.toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }

    return dates
  }

  const getMinDateTime = () => {
    if (!reservation) return ''
    const checkIn = new Date(reservation.check_in)
    checkIn.setHours(14, 0, 0, 0) // 2PM check-in
    return checkIn.toISOString().slice(0, 16)
  }

  const getMaxDateTime = () => {
    if (!reservation) return ''
    const checkOut = new Date(reservation.check_out)
    checkOut.setHours(11, 0, 0, 0) // 11AM checkout
    return checkOut.toISOString().slice(0, 16)
  }

  const getMinDate = () => {
    if (!reservation) return ''
    return reservation.check_in
  }

  const getMaxDate = () => {
    if (!reservation) return ''
    return reservation.check_out // Include checkout day
  }

  const getMinTimeForDate = (dateStr: string) => {
    if (!reservation || !dateStr) return '00:00'
    const selectedDate = new Date(dateStr)
    const checkInDate = new Date(reservation.check_in)
    
    // If it's check-in day, minimum time is 2PM
    if (selectedDate.toDateString() === checkInDate.toDateString()) {
      return '14:00'
    }
    return '00:00'
  }

  const getMaxTimeForDate = (dateStr: string) => {
    if (!reservation || !dateStr) return '23:59'
    const selectedDate = new Date(dateStr)
    const checkOutDate = new Date(reservation.check_out)
    
    // If it's checkout day, maximum time is 11AM
    if (selectedDate.toDateString() === checkOutDate.toDateString()) {
      return '11:00'
    }
    return '23:59'
  }

  const getSharedDates = (extraId: string) => {
    return selections[extraId]?.shared_dates || []
  }

  const getGuestCount = () => {
    // Use group total if this is a group booking
    if (groupTotalGuests !== null) {
      return groupTotalGuests
    }
    // Otherwise use this reservation's guest count
    if (!reservation) return 2
    return (reservation.adults || 0) + (reservation.children || 0)
  }

  const getRoomsForAllocation = (): GroupRoom[] => {
  if (groupRooms.length > 0) return groupRooms
  if (!reservation) return []
  return [{
    id: reservation.id,
    room_name: reservation.room_name || 'Room',
    adults: reservation.adults || 0,
    children: reservation.children || 0
  }]
}

// Map each guest index -> roomId (stable ordering)
const guestRoomMap = useMemo(() => {
  const rooms = getRoomsForAllocation()
  const map: string[] = []
  rooms.forEach(r => {
    const n = (r.adults || 0) + (r.children || 0)
    for (let i = 0; i < n; i++) map.push(r.id)
  })
  return map
}, [reservation, groupRooms])

// ---- Allocation model ----
// selection_data.allocations = { [date: string]: string[] }  // array of roomIds selected for that date

const getAllocations = (extraId: string): Record<string, string[]> => {
  const alloc = selections[extraId]?.allocations
  if (alloc && typeof alloc === 'object') return alloc

  // Back-compat fallback: if old shared_dates exists, assume ALL rooms get service on those dates
  const sharedDates: string[] = selections[extraId]?.shared_dates || []
  const roomIds = getRoomsForAllocation().map(r => r.id)
  return sharedDates.reduce((acc, d) => {
    acc[d] = [...roomIds]
    return acc
  }, {} as Record<string, string[]>)
}

const getSelectedDatesFromAllocations = (extraId: string) => {
  const alloc = getAllocations(extraId)
  return Object.keys(alloc)
    .filter(d => Array.isArray(alloc[d]) && alloc[d].length > 0)
    .sort()
}

const getTotalUnitsSelected = (extraId: string) => {
  const alloc = getAllocations(extraId)
  return Object.values(alloc).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0)
}

const isGuestServedOnDate = (extraId: string, guestIndex: number, date: string) => {
  const alloc = getAllocations(extraId)
  const roomId = guestRoomMap[guestIndex]
  return !!roomId && Array.isArray(alloc[date]) && alloc[date].includes(roomId)
}

const getGuestServiceDates = (extraId: string, guestIndex: number) => {
  return getSelectedDatesFromAllocations(extraId).filter(d => isGuestServedOnDate(extraId, guestIndex, d))
}

// Toggle room allocation for a specific date; enforce total units <= extra.quantity
const toggleRoomAllocation = (extraId: string, date: string, roomId: string) => {
  setSelections(prev => {
    const extra = reservation?.reservation_extras?.find(e => e.id === extraId)
    const limit = extra?.quantity || 1

    const current = prev[extraId] || {}
    const allocations: Record<string, string[]> = { ...(current.allocations || {}) }
    const arr = Array.isArray(allocations[date]) ? [...allocations[date]] : []

    const isSelected = arr.includes(roomId)
    let nextArr = isSelected ? arr.filter(x => x !== roomId) : [...arr, roomId]
    allocations[date] = nextArr

    // remove empty date bucket
    if (allocations[date].length === 0) delete allocations[date]

    // enforce overall unit limit by dropping the oldest allocation(s)
    const flatten = () => {
      const dates = Object.keys(allocations).sort()
      const flat: { date: string; roomId: string }[] = []
      dates.forEach(d => {
        (allocations[d] || []).forEach(rid => flat.push({ date: d, roomId: rid }))
      })
      return flat
    }

    let flat = flatten()
    while (flat.length > limit) {
      const drop = flat[0]
      allocations[drop.date] = (allocations[drop.date] || []).filter(rid => rid !== drop.roomId)
      if (allocations[drop.date].length === 0) delete allocations[drop.date]
      flat = flatten()
    }

    // keep shared_dates in sync for the rest of the component (ordering, etc.)
    const shared_dates = Object.keys(allocations)
      .filter(d => (allocations[d] || []).length > 0)
      .sort()

    return {
      ...prev,
      [extraId]: {
        ...current,
        allocations,
        shared_dates
      }
    }
  })
}


  const getCurrentStep = (extraId: string) => currentStep[extraId] || 1
  const getCurrentGuest = (extraId: string) => currentGuest[extraId] || 0
  const getCurrentDateIndex = (extraId: string) => currentDate[extraId] || 0
  const getCurrentMeal = (extraId: string) => currentMeal[extraId] || 'lunch'

  const scrollToExtra = (extraId: string) => {
    setTimeout(() => {
      const element = document.getElementById(`extra-${extraId}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  const goToNextStep = (extraId: string) => {
    setCurrentStep(prev => ({ ...prev, [extraId]: (prev[extraId] || 1) + 1 }))
    scrollToExtra(extraId)
  }

  const goToPreviousStep = (extraId: string) => {
    setCurrentStep(prev => ({ ...prev, [extraId]: Math.max(1, (prev[extraId] || 1) - 1) }))
    scrollToExtra(extraId)
  }

  const startNextGuest = (extraId: string) => {
    setCurrentGuest(prev => ({ ...prev, [extraId]: (prev[extraId] || 0) + 1 }))
    setCurrentStep(prev => ({ ...prev, [extraId]: 2 })) // Go directly to meal selection
    setCurrentDate(prev => ({ ...prev, [extraId]: 0 }))
    setCurrentMeal(prev => ({ ...prev, [extraId]: 'lunch' }))
    scrollToExtra(extraId)
  }

  const goToMealSelection = (extraId: string) => {
    setCurrentStep(prev => ({ ...prev, [extraId]: 2 }))
    setCurrentDate(prev => ({ ...prev, [extraId]: 0 }))
    setCurrentMeal(prev => ({ ...prev, [extraId]: 'lunch' }))
    scrollToExtra(extraId)
  }

  const jumpToGuest = (extraId: string, guestIndex: number) => {
    setCurrentGuest(prev => ({ ...prev, [extraId]: guestIndex }))
    setCurrentStep(prev => ({ ...prev, [extraId]: 2 }))
    setCurrentDate(prev => ({ ...prev, [extraId]: 0 }))
    setCurrentMeal(prev => ({ ...prev, [extraId]: 'lunch' }))
    
    // Scroll to the extra section after state updates
    setTimeout(() => {
      const element = document.getElementById(`extra-${extraId}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  const goToNextMeal = (extraId: string) => {
    const sharedDates = getSharedDates(extraId)
    const dateIndex = getCurrentDateIndex(extraId)
    const meal = getCurrentMeal(extraId)
    const currentGuestIndex = getCurrentGuest(extraId)

    // Scroll to the extra section
    scrollToExtra(extraId)

    // Always do: Day 1 Lunch → Day 1 Dinner → Day 2 Lunch → Day 2 Dinner
    if (meal === 'lunch') {
      // After lunch, go to dinner for same date
      setCurrentMeal(prev => ({ ...prev, [extraId]: 'dinner' }))
    } else {
      // After dinner, check if it's the last date
      if (dateIndex < sharedDates.length - 1) {
        // Show completion message for current day
        const dayNumber = dateIndex + 1
        const ordinal = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'][dateIndex] || `${dayNumber}th`
        setCompletionMessage(`🎉 Congrats! Your selection is complete for your ${ordinal} day.`)
        setShowCompletionModal(true)
        
        // Move to next date's lunch
        setTimeout(() => {
          setShowCompletionModal(false)
          setCurrentDate(prev => ({ ...prev, [extraId]: dateIndex + 1 }))
          setCurrentMeal(prev => ({ ...prev, [extraId]: 'lunch' }))
        }, 2000)
      } else {
        // All dates complete for this guest
        const guestIndex = getCurrentGuest(extraId)
        const guestName = guestNames[`${extraId}_guest_${guestIndex}`] || `Guest ${guestIndex + 1}`
        
        // Check if ALL guests are complete
        const allGuestsComplete = Array(getGuestCount()).fill(null).every((_, idx) => 
          isGuestComplete(extraId, idx)
        )
        
        if (allGuestsComplete) {
          // All guests complete - exit edit mode and show summary
          setEditMode(prev => ({ ...prev, [extraId]: false }))
          setCompletionMessage(`🎊 Amazing! All menu selections are complete!`)
          setShowCompletionModal(true)
          
          setTimeout(() => {
            setShowCompletionModal(false)
            goToNextStep(extraId)
          }, 2500)
        } else {
          // This guest complete, but others remain - just show message, don't auto-advance
          setCompletionMessage(`✅ ${guestName}'s menu selections are complete! Click another guest to continue.`)
          setShowCompletionModal(true)
          
          setTimeout(() => {
            setShowCompletionModal(false)
          }, 2500)
        }
      }
    }
  }

  const goToPreviousMeal = (extraId: string) => {
    const sharedDates = getSharedDates(extraId)
    const dateIndex = getCurrentDateIndex(extraId)
    const meal = getCurrentMeal(extraId)

    // Always reverse: Day 2 Dinner → Day 2 Lunch → Day 1 Dinner → Day 1 Lunch
    if (meal === 'dinner') {
      // Go back to lunch for same date
      setCurrentMeal(prev => ({ ...prev, [extraId]: 'lunch' }))
    } else {
      // Go back to previous date's dinner
      if (dateIndex > 0) {
        setCurrentDate(prev => ({ ...prev, [extraId]: dateIndex - 1 }))
        setCurrentMeal(prev => ({ ...prev, [extraId]: 'dinner' }))
      }
    }
  }

  const getGuestDisplayName = (extraId: string, guestIndex: number) => {
    const customName = guestNames[`${extraId}_guest_${guestIndex}`]
    if (customName && customName.trim()) {
      return customName
    }
    return `Guest ${guestIndex + 1}`
  }

  const isGuestComplete = (extraId: string, guestIndex: number) => {
  const datesForGuest = getGuestServiceDates(extraId, guestIndex)
  const guestKey = `guest_${guestIndex}`

  // If this guest has no service on any date, they're trivially complete
  if (datesForGuest.length === 0) return true

  return datesForGuest.every(date => {
    const guestData = selections[extraId]?.guests?.[guestKey]?.[date]
    if (!guestData) return false

    const lunchComplete = guestData.lunch?.appetizer && guestData.lunch?.main && guestData.lunch?.side
    const dinnerComplete = guestData.dinner?.appetizer && guestData.dinner?.main && guestData.dinner?.side
    return lunchComplete && dinnerComplete
  })
}


  const getNextButtonText = (extraId: string) => {
    const sharedDates = getSharedDates(extraId)
    const dateIndex = getCurrentDateIndex(extraId)
    const meal = getCurrentMeal(extraId)
    
    if (meal === 'lunch') {
      return 'Now Select Your Dinner →'
    } else if (dateIndex < sharedDates.length - 1) {
      return 'Continue to Next Day →'
    } else {
      // Last meal of last day for current guest
      return 'Complete Guest Selections ✓'
    }
  }

  const isLastGuest = (extraId: string) => getCurrentGuest(extraId) >= getGuestCount() - 1

  const canProceedToMealSelection = (extraId: string) => {
  const extra = reservation?.reservation_extras?.find(e => e.id === extraId)
  if (!extra) return false

  const dates = getSelectedDatesFromAllocations(extraId)
  const units = getTotalUnitsSelected(extraId)

  // Must allocate ALL purchased units before proceeding
  return dates.length >= 1 && units === (extra.quantity || 1)
}

  const isExtraComplete = (extra: ReservationExtra) => {
    // Chef service: complete when ALL purchased units are allocated (room-nights)
    // and every guest served on their allocated dates has completed menus.
    if (isChefService(extra.extra_code, extra.extra_name)) {
      const totalGuests = getGuestCount()
      const dates = getSelectedDatesFromAllocations(extra.id)
      const units = getTotalUnitsSelected(extra.id)

      if (dates.length === 0) return false
      if (units !== (extra.quantity || 1)) return false

      return Array(totalGuests).fill(null).every((_, guestIndex) => {
        // Only require completion for guests that are actually served on at least one date
        const servedDates = getGuestServiceDates(extra.id, guestIndex)
        if (servedDates.length === 0) return true
        return isGuestComplete(extra.id, guestIndex)
      })
    }

    // Non-chef extras: complete when each experience slot has a date + time
    const dates = Array(extra.quantity || 1).fill(null).map((_, i) => `experience-${i}`)
    return dates.every(date => {
      const dateSelection = selections[extra.id]?.dates?.[date]
      return !!(dateSelection?.date && dateSelection?.time)
    })
  }

 const toggleDateSelection = (extraId: string, date: string) => {
    setSelections(prev => {
      const sharedDates = prev[extraId]?.shared_dates || []
      const isSelected = sharedDates.includes(date)
      const extra = reservation?.reservation_extras?.find(e => e.id === extraId)
      const limit = extra?.quantity || 1

      if (isSelected) {
        return {
          ...prev,
          [extraId]: {
            ...prev[extraId],
            shared_dates: sharedDates.filter((d: string) => d !== date)
          }
        }
      }

      if (sharedDates.length >= limit) {
        const newDates = [...sharedDates.slice(1), date]
        return {
          ...prev,
          [extraId]: {
            ...prev[extraId],
            shared_dates: newDates
          }
        }
      }

      return {
        ...prev,
        [extraId]: {
          ...prev[extraId],
          shared_dates: [...sharedDates, date]
        }
      }
    })
  }

  const toggleMealType = (extraId: string, date: string, mealType: 'include_lunch' | 'include_dinner') => {
    setSelections(prev => ({
      ...prev,
      [extraId]: {
        ...prev[extraId],
        shared_dates_config: {
          ...prev[extraId]?.shared_dates_config,
          [date]: {
            ...prev[extraId]?.shared_dates_config?.[date],
            [mealType]: !prev[extraId]?.shared_dates_config?.[date]?.[mealType]
          }
        }
      }
    }))
  }

  const selectMealItem = (
    extraId: string,
    date: string,
    mealType: 'lunch' | 'dinner',
    category: string,
    itemId: string
  ) => {
    const guestKey = getGuestKey(extraId)
    
    setSelections(prev => ({
      ...prev,
      [extraId]: {
        ...prev[extraId],
        guests: {
          ...prev[extraId]?.guests,
          [guestKey]: {
            ...prev[extraId]?.guests?.[guestKey],
            [date]: {
              ...prev[extraId]?.guests?.[guestKey]?.[date],
              [mealType]: {
                ...prev[extraId]?.guests?.[guestKey]?.[date]?.[mealType],
                [category]: itemId
              }
            }
          }
        }
      }
    }))
  }

  const updateMealSelection = (
    extraId: string,
    date: string,
    mealType: 'lunch' | 'dinner',
    field: string,
    value: any
  ) => {
    const guestKey = getGuestKey(extraId)
    
    setSelections(prev => ({
      ...prev,
      [extraId]: {
        ...prev[extraId],
        guests: {
          ...prev[extraId]?.guests,
          [guestKey]: {
            ...prev[extraId]?.guests?.[guestKey],
            [date]: {
              ...prev[extraId]?.guests?.[guestKey]?.[date],
              [mealType]: {
                ...prev[extraId]?.guests?.[guestKey]?.[date]?.[mealType],
                [field]: value
              }
            }
          }
        }
      }
    }))
  }

  const updateNonChefSelection = (extraId: string, date: string, field: string, value: any) => {
    setSelections(prev => ({
      ...prev,
      [extraId]: {
        ...prev[extraId],
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

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
      
      const updates = Object.entries(selections).map(([extraId, selectionData]) => {
        // Add guest names to the saved data
        const dataWithNames = {
          ...selectionData,
          guest_names: Object.keys(guestNames)
            .filter(key => key.startsWith(`${extraId}_guest_`))
            .reduce((acc, key) => {
              const guestIndex = key.split('_guest_')[1]
              acc[`guest_${guestIndex}`] = guestNames[key]
              return acc
            }, {} as Record<string, string>)
        }
        
        return supabase
          .from('reservation_extras')
          .update({
            selection_data: dataWithNames,
            selection_status: 'completed'
          })
          .eq('id', extraId)
      })

      const results = await Promise.all(updates)
      const errors = results.filter(result => result.error)
      const hasErrors = errors.length > 0

      if (hasErrors) {
        console.error('Save errors:', errors)
        throw new Error('Failed to save some selections')
      }

      console.log('Successfully saved all selections')

      // Show success modal
      setCompletionMessage('🎉 Success! All your selections have been saved.')
      setShowCompletionModal(true)
      
      setTimeout(() => {
        setShowCompletionModal(false)
        // Ensure we're at the top after modal closes
        window.scrollTo({ top: 0, behavior: 'smooth' })
        setMessage({ type: 'success', text: 'All selections saved successfully!' })
        setTimeout(() => setMessage({ type: '', text: '' }), 5000)
      }, 2500)
    } catch (error) {
      console.error('Error saving selections:', error)
      setMessage({ type: 'error', text: 'Failed to save selections. Please try again.' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  const getMenuItemsByCategory = (category: string) => {
    return menuItems.filter(item => item.category === category)
  }

  const getMenuItem = (itemId: string) => {
    return menuItems.find(item => item.id === itemId)
  }

 const guestCount = useMemo(() => getGuestCount(), [reservation, groupTotalGuests])

  const chefExtras = useMemo(
    () => reservation?.reservation_extras?.filter(e => isChefService(e.extra_code, e.extra_name)) || [],
    [reservation]
  )
  const nonChefExtras = useMemo(
    () => reservation?.reservation_extras?.filter(e => !isChefService(e.extra_code, e.extra_name)) || [],
    [reservation]
  )

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

  if (!reservation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-stone-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-serif mb-2">Reservation Not Found</h1>
          <p className="text-stone-600 mb-6">We couldn't find a reservation with that confirmation code.</p>
          <a href="/" className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
            Return Home
          </a>
        </div>
      </div>
    )
  }
  const displayConfirmationCode =
  reservation.group_reservation_code || reservation.confirmation_code

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-stone-50 to-white">
      <div className="bg-stone-900 py-24 md:py-32 mb-8 md:mb-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-serif mb-3 md:mb-4 bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">
              Complete Your Experience
            </h1>
            <p className="text-base md:text-lg text-stone-300 mb-2">
                Confirmation:{' '}
                <span className="font-semibold text-white">
                  {displayConfirmationCode}
                </span>
              </p>

            <p className="text-sm md:text-base text-stone-400">
              {reservation.guest_first_name} {reservation.guest_last_name} • {formatDate(reservation.check_in)} - {formatDate(reservation.check_out)}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-8 md:pb-12">
        {/* Deadline Banner */}
        {!isSubmitted && (() => {
          const daysInfo = getDaysRemaining()
          if (!daysInfo) return null
          
          return (
            <div className={`mb-6 p-4 rounded-xl border-2 ${
              daysInfo.isPastDeadline 
                ? 'bg-red-50 border-red-300'
                : daysInfo.days <= 2
                ? 'bg-orange-50 border-orange-300'
                : 'bg-blue-50 border-blue-300'
            }`}>
              <div className="text-center">
                <p className="font-semibold text-lg mb-1">
                  {daysInfo.isPastDeadline 
                    ? '⚠️ Selection Deadline Passed'
                    : daysInfo.days <= 1
                    ? '⏰ Less than 24 hours remaining!'
                    : `📅 ${daysInfo.days} ${daysInfo.days === 1 ? 'day' : 'days'} remaining`
                  }
                </p>
                <p className="text-sm text-stone-600">
                  Deadline: {getDeadline()?.toLocaleString('en-GB', { 
                    weekday: 'short', 
                    day: 'numeric', 
                    month: 'short', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          )
        })()}

        {/* Save and Submit Buttons - Top */}
        {!isSubmitted && (
          <div className="mb-6 flex flex-wrap gap-3 justify-center">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-stone-600 text-white rounded-xl hover:bg-stone-700 disabled:opacity-50 transition-all shadow-md text-base font-semibold"
            >
              {saving ? 'Saving...' : '💾 Save All Selections'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition-all shadow-lg text-base font-semibold"
            >
              {submitting ? 'Submitting...' : '✓ Submit Final Selections'}
            </button>
          </div>
        )}

        {/* Submitted Banner */}
        {isSubmitted && (
          <div className="mb-6 p-6 rounded-xl bg-green-50 border-2 border-green-300">
            <div className="text-center">
              <div className="text-4xl mb-2">🔒</div>
              <p className="font-semibold text-xl text-green-800 mb-1">Selections Submitted</p>
              <p className="text-sm text-green-700">Your selections have been locked and submitted to our team.</p>
            </div>
          </div>
        )}

        {/* Completion Modal */}
        {showCompletionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-8 md:p-12 max-w-md text-center animate-bounce-in shadow-2xl">
              <p className="text-2xl md:text-3xl font-serif mb-4">{completionMessage}</p>
              <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          </div>
        )}

        {/* Progress Tracker */}
        {reservation?.reservation_extras && reservation.reservation_extras.length > 0 && (
          <div className="mb-6 bg-white rounded-xl shadow-md border border-stone-200 p-4 md:p-6">
            <h3 className="text-lg font-serif mb-4">Your Experience Checklist</h3>
            <div className="space-y-3">
              {reservation.reservation_extras.map(extra => {
                const scrollToExtra = () => {
                  const element = document.getElementById(`extra-${extra.id}`)
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }
                
                return (
                  <button
                    key={extra.id}
                    onClick={scrollToExtra}
                    className="flex items-center gap-3 w-full text-left hover:bg-stone-50 p-2 rounded-lg transition cursor-pointer"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isExtraComplete(extra)
                        ? 'bg-green-500'
                        : 'bg-stone-300'
                    }`}>
                      {isExtraComplete(extra) ? (
                        <span className="text-white font-bold text-lg">✓</span>
                      ) : (
                        <span className="text-white font-bold">○</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-stone-900">{extra.extra_name}</p>
                      <p className="text-xs text-stone-500">
                        {isExtraComplete(extra) ? 'Complete' : 'Incomplete'}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )
              })}
              
              {/* Submission Status */}
              <div className="pt-3 border-t border-stone-200">
                <div className="flex items-center gap-3 p-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isSubmitted ? 'bg-green-500' : 'bg-stone-300'
                  }`}>
                    {isSubmitted ? (
                      <span className="text-white font-bold text-lg">✓</span>
                    ) : (
                      <span className="text-white font-bold">○</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-stone-900">Final Submission</p>
                    <p className="text-xs text-stone-500">
                      {isSubmitted ? 'Submitted' : 'Not submitted'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl ${
            message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p className="text-sm md:text-base text-center font-medium">{message.text}</p>
          </div>
        )}

        <div className="space-y-6 md:space-y-8">
          {chefExtras.map(extra => {
            const step = getCurrentStep(extra.id)
            const currentGuestIndex = getCurrentGuest(extra.id)
            const guestKey = getGuestKey(extra.id)
            const sharedDates = getGuestServiceDates(extra.id, currentGuestIndex)
            const allDates = getAllAvailableDates()
            const totalGuests = guestCount
            
            // Check if all guests have actually completed their selections
            const allGuestsComplete = sharedDates.length > 0 && Array(totalGuests).fill(null).every((_, idx) => 
              isGuestComplete(extra.id, idx)
            )
            
            // Show edit form if in edit mode OR if selections aren't complete
            const showEditForm = editMode[extra.id] || !allGuestsComplete

            const currentDateIndex = getCurrentDateIndex(extra.id)
            const currentMealType = getCurrentMeal(extra.id)
            const currentDateStr = sharedDates[currentDateIndex]
            const dateConfig = selections[extra.id]?.shared_dates_config?.[currentDateStr] || {}
            const guestMealData = selections[extra.id]?.guests?.[guestKey]?.[currentDateStr]?.[currentMealType] || {}

            if (showEditForm) {
              return (
                <div key={extra.id} id={`extra-${extra.id}`} className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-stone-200 scroll-mt-24">
                  <div className="mb-6">
                    <h2 className="text-xl md:text-2xl font-serif mb-2">{extra.extra_name}</h2>
                    <p className="text-sm md:text-base text-stone-600 mb-4">
                      {extra.quantity} {extra.quantity === 1 ? 'night' : 'nights'} of service purchased for {totalGuests} {totalGuests === 1 ? 'guest' : 'guests'}
                    </p>

                    {/* Guest Navigation Tabs (only show after dates selected) */}
                    {step > 1 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {Array(totalGuests).fill(null).map((_, idx) => {
                          const isCurrentGuest = idx === currentGuestIndex
                          const guestComplete = isGuestComplete(extra.id, idx)
                          const displayName = getGuestDisplayName(extra.id, idx)
                          
                          return (
                            <button
                              key={idx}
                              onClick={() => jumpToGuest(extra.id, idx)}
                              className={`px-4 py-2 rounded-lg font-medium transition cursor-pointer ${
                                isCurrentGuest
                                  ? 'bg-orange-500 text-white shadow-md hover:bg-orange-600'
                                  : guestComplete
                                  ? 'bg-green-100 text-green-700 border-2 border-green-300 hover:bg-green-200'
                                  : 'bg-stone-200 text-stone-700 border-2 border-stone-300 hover:bg-stone-300'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                {guestComplete && !isCurrentGuest && <span>✓</span>}
                                {displayName}
                                {isCurrentGuest && <span className="text-xs">(Current)</span>}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Step 1: Select Dates (Only for first guest) */}
                  {step === 1 && (
                  <div>
                    <h3 className="text-lg md:text-xl font-serif mb-2">Allocate Chef Service</h3>

                    <p className="text-sm text-stone-600 mb-2">
                      You purchased <span className="font-semibold">{extra.quantity}</span> chef service {extra.quantity === 1 ? 'unit' : 'units'}.
                      Each unit covers <span className="font-semibold">one room</span> for <span className="font-semibold">one night</span>.
                    </p>

                    <p className="text-xs text-stone-500 mb-6">
                      Example: 2 rooms for 1 night = 2 units. Or 1 room across 2 nights = 2 units.
                    </p>

                    {/* Dates */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
                      {allDates.map(date => {
                        const alloc = getAllocations(extra.id)
                        const hasAny = (alloc[date] || []).length > 0
                        const dateObj = new Date(date)
                        const isActive = (activeAllocDate[extra.id] || '') === date

                        return (
                          <button
                            key={date}
                            onClick={() => !isSubmitted && setActiveAllocDate(prev => ({ ...prev, [extra.id]: date }))}
                            disabled={isSubmitted}
                            className={`p-3 rounded-lg border-2 transition text-center ${
                              isSubmitted ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                            } ${
                              isActive
                                ? 'border-orange-500 bg-orange-50'
                                : hasAny
                                ? 'border-green-400 bg-green-50 hover:border-green-500'
                                : 'border-stone-200 hover:border-orange-300 hover:bg-orange-50'
                            }`}
                          >
                            <div className="text-xs text-stone-500 mb-1">
                              {dateObj.toLocaleDateString('en-GB', { weekday: 'short' })}
                            </div>
                            <div className={`text-lg font-semibold ${isActive ? 'text-orange-600' : 'text-stone-900'}`}>
                              {dateObj.getDate()}
                            </div>
                            <div className="text-xs text-stone-500">
                              {dateObj.toLocaleDateString('en-GB', { month: 'short' })}
                            </div>
                            {hasAny && (
                              <div className="mt-2 text-[11px] font-medium text-green-700">
                                {(getAllocations(extra.id)[date] || []).length} unit{(getAllocations(extra.id)[date] || []).length === 1 ? '' : 's'}
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>

                    {/* Rooms for active date */}
                    {(() => {
                      const activeDate = activeAllocDate[extra.id] || allDates[0]
                      const rooms = getRoomsForAllocation()
                      const alloc = getAllocations(extra.id)
                      const selectedRooms = alloc[activeDate] || []
                      const unitsSelected = getTotalUnitsSelected(extra.id)
                      const unitsRemaining = Math.max((extra.quantity || 1) - unitsSelected, 0)

                      return (
                        <div className="border border-stone-200 rounded-xl p-4 mb-6 bg-white">
                          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                            <div>
                              <p className="text-sm font-medium text-stone-900">
                                Rooms for {formatDate(activeDate)}
                              </p>
                              <p className="text-xs text-stone-500">
                                Select which room(s) get chef service on this date.
                              </p>
                            </div>
                            <div className="text-xs font-medium text-stone-700">
                              Units selected: <span className="font-semibold">{unitsSelected}</span> / {extra.quantity}
                              {unitsRemaining > 0 ? (
                                <span className="text-stone-500"> • {unitsRemaining} remaining</span>
                              ) : (
                                <span className="text-green-600"> • complete ✓</span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {rooms.map(r => {
                              const label = r.room_name || 'Room'
                              const roomGuests = (r.adults || 0) + (r.children || 0)
                              const isOn = selectedRooms.includes(r.id)

                              return (
                                <button
                                  key={r.id}
                                  disabled={isSubmitted}
                                  onClick={() => !isSubmitted && toggleRoomAllocation(extra.id, activeDate, r.id)}
                                  className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition ${
                                    isOn
                                      ? 'border-orange-500 bg-orange-50 text-orange-800'
                                      : 'border-stone-200 hover:border-orange-300 hover:bg-orange-50 text-stone-800'
                                  }`}
                                >
                                  {label}
                                  <span className="ml-2 text-xs text-stone-500">({roomGuests} guests)</span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })()}

                    <div className="flex justify-between items-center">
                      <p className="text-xs md:text-sm text-stone-500">
                        {getTotalUnitsSelected(extra.id)} / {extra.quantity} units allocated
                      </p>
                      <button
                        onClick={() => goToMealSelection(extra.id)}
                        disabled={!canProceedToMealSelection(extra.id) || isSubmitted}
                        className={`px-6 py-3 rounded-lg font-medium transition ${
                          canProceedToMealSelection(extra.id) && !isSubmitted
                            ? 'bg-orange-500 text-white hover:bg-orange-600'
                            : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        }`}
                      >
                        Start Menu Selection →
                      </button>
                    </div>
                  </div>
                )}

                  {/* Step 2: Meal Selection for Current Guest */}
                  {step === 2 && sharedDates.length > 0 && currentDateStr && (
                    <div className={isSubmitted ? 'pointer-events-none opacity-60' : ''}>
                      {/* Guest & Progress Info */}
                      <div className="mb-6 bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-300 rounded-xl p-4 md:p-6">
                        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl md:text-2xl font-serif text-orange-900 mb-3">
                              Guest {currentGuestIndex + 1} of {totalGuests}
                            </h3>
                            <div className="max-w-md">
                              <label className="block text-sm font-medium text-orange-800 mb-2">Guest Name</label>
                              <input
                                type="text"
                                value={guestNames[`${extra.id}_guest_${currentGuestIndex}`] || ''}
                                onChange={e => setGuestNames(prev => ({ ...prev, [`${extra.id}_guest_${currentGuestIndex}`]: e.target.value }))}
                                placeholder={currentGuestIndex === 0 ? 'Primary guest' : `Guest ${currentGuestIndex + 1} name`}
                                className="w-full p-2 md:p-3 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                              />
                            </div>
                            <p className="text-xs md:text-sm text-orange-700 mt-3">
                              Date {currentDateIndex + 1} of {sharedDates.length} • {currentMealType === 'lunch' ? '🍽️ Lunch' : '🌙 Dinner'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {Array(totalGuests).fill(null).map((_, idx) => (
                              <div
                                key={idx}
                                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm md:text-base font-bold ${
                                  idx < currentGuestIndex
                                    ? 'bg-green-500 text-white'
                                    : idx === currentGuestIndex
                                    ? 'bg-orange-500 text-white ring-4 ring-orange-200'
                                    : 'bg-stone-200 text-stone-500'
                                }`}
                              >
                                {idx < currentGuestIndex ? '✓' : idx + 1}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Current Meal Selection */}
                      <div className={`rounded-xl p-6 md:p-8 border-2 ${
                        currentMealType === 'lunch' ? 'bg-orange-50 border-orange-300' : 'bg-stone-100 border-stone-300'
                      }`}>
                        <div className="mb-6">
                          <h4 className="text-2xl md:text-3xl font-serif mb-2 flex items-center gap-3">
                            {currentMealType === 'lunch' ? '🍽️ Lunch' : '🌙 Dinner'} Menu
                          </h4>
                          <p className="text-base md:text-lg font-medium text-stone-700">
                            {formatDate(currentDateStr)}
                          </p>
                        </div>

                        <div className="space-y-6">
                          {/* Appetizer/Starter */}
                          <div>
                            <h5 className="text-base md:text-lg font-semibold mb-4 text-stone-800">Select Your Starter</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {getMenuItemsByCategory('starters')
                                .filter((item, index, self) => 
                                  index === self.findIndex(i => i.id === item.id)
                                )
                                .map(item => (
                                <button
                                  key={item.id}
                                  onClick={() => !isSubmitted && selectMealItem(extra.id, currentDateStr, currentMealType, 'appetizer', item.id)}
                                  disabled={isSubmitted}
                                  className={`text-left p-4 rounded-xl border-2 transition ${
                                    isSubmitted ? 'cursor-not-allowed opacity-60' : ''
                                  } ${
                                    guestMealData.appetizer === item.id
                                      ? 'border-orange-500 bg-white shadow-md'
                                      : 'border-stone-200 bg-white hover:border-orange-300'
                                  }`}
                                >
                                  <p className="font-semibold text-stone-900">{item.name}</p>
                                  <p className="text-sm text-stone-600 mt-1">{item.description}</p>
                                  {guestMealData.appetizer === item.id && (
                                    <div className="mt-2 text-orange-600 text-sm font-semibold">✓ Selected</div>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Main Course */}
                          <div>
                            <h5 className="text-base md:text-lg font-semibold mb-4 text-stone-800">Select Your Main Course</h5>
                            
                            {/* Local Mains */}
                            {getMenuItemsByCategory('local_mains').length > 0 && (
                              <div className="mb-4">
                                <p className="text-sm font-semibold text-orange-700 mb-3">🇬🇭 Local Cuisine</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {getMenuItemsByCategory('local_mains').map(item => (
                                    <button
                                      key={item.id}
                                      onClick={() => selectMealItem(extra.id, currentDateStr, currentMealType, 'main', item.id)}
                                      className={`text-left p-4 rounded-xl border-2 transition ${
                                        guestMealData.main === item.id
                                          ? 'border-orange-500 bg-white shadow-md'
                                          : 'border-stone-200 bg-white hover:border-orange-300'
                                      }`}
                                    >
                                      <p className="font-semibold text-stone-900">{item.name}</p>
                                      <p className="text-sm text-stone-600 mt-1">{item.description}</p>
                                      {guestMealData.main === item.id && (
                                        <div className="mt-2 text-orange-600 text-sm font-semibold">✓ Selected</div>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Continental Mains */}
                            {getMenuItemsByCategory('continental_mains').length > 0 && (
                              <div>
                                <p className="text-sm font-semibold text-blue-700 mb-3">🌍 Continental Cuisine</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {getMenuItemsByCategory('continental_mains').map(item => (
                                    <button
                                      key={item.id}
                                      onClick={() => selectMealItem(extra.id, currentDateStr, currentMealType, 'main', item.id)}
                                      className={`text-left p-4 rounded-xl border-2 transition ${
                                        guestMealData.main === item.id
                                          ? 'border-orange-500 bg-white shadow-md'
                                          : 'border-stone-200 bg-white hover:border-orange-300'
                                      }`}
                                    >
                                      <p className="font-semibold text-stone-900">{item.name}</p>
                                      <p className="text-sm text-stone-600 mt-1">{item.description}</p>
                                      {guestMealData.main === item.id && (
                                        <div className="mt-2 text-orange-600 text-sm font-semibold">✓ Selected</div>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Side */}
                          <div>
                            <h5 className="text-base md:text-lg font-semibold mb-4 text-stone-800">Select Your Side</h5>
                            
                            {/* Local Sides */}
                            {getMenuItemsByCategory('local_sides').length > 0 && (
                              <div className="mb-4">
                                <p className="text-sm font-semibold text-orange-700 mb-3">🇬🇭 Local Sides</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {getMenuItemsByCategory('local_sides').map(item => (
                                    <button
                                      key={item.id}
                                      onClick={() => selectMealItem(extra.id, currentDateStr, currentMealType, 'side', item.id)}
                                      className={`text-center p-3 rounded-lg border-2 transition ${
                                        guestMealData.side === item.id
                                          ? 'border-orange-500 bg-white shadow-md'
                                          : 'border-stone-200 bg-white hover:border-orange-300'
                                      }`}
                                    >
                                      <p className="font-medium text-sm text-stone-900">{item.name}</p>
                                      {guestMealData.side === item.id && (
                                        <div className="mt-1 text-orange-600 text-xs font-semibold">✓</div>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Continental Sides */}
                            {getMenuItemsByCategory('continental_sides').length > 0 && (
                              <div>
                                <p className="text-sm font-semibold text-blue-700 mb-3">🌍 Continental Sides</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {getMenuItemsByCategory('continental_sides').map(item => (
                                    <button
                                      key={item.id}
                                      onClick={() => selectMealItem(extra.id, currentDateStr, currentMealType, 'side', item.id)}
                                      className={`text-center p-3 rounded-lg border-2 transition ${
                                        guestMealData.side === item.id
                                          ? 'border-orange-500 bg-white shadow-md'
                                          : 'border-stone-200 bg-white hover:border-orange-300'
                                      }`}
                                    >
                                      <p className="font-medium text-sm text-stone-900">{item.name}</p>
                                      {guestMealData.side === item.id && (
                                        <div className="mt-1 text-orange-600 text-xs font-semibold">✓</div>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Special Requests */}
                          <div>
                            <h5 className="text-base md:text-lg font-semibold mb-3 text-stone-800">Special Requests</h5>
                            <textarea
                              value={guestMealData.special_requests || ''}
                              onChange={e => updateMealSelection(extra.id, currentDateStr, currentMealType, 'special_requests', e.target.value)}
                              className="w-full p-4 border-2 border-stone-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                              rows={3}
                              placeholder="Any dietary restrictions, allergies, or preferences..."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Navigation */}
                      <div className="flex justify-between items-center mt-6">
                        <button
                          onClick={() => {
                            if (currentDateIndex === 0 && currentMealType === 'lunch' && currentGuestIndex === 0) {
                              goToPreviousStep(extra.id)
                            } else {
                              goToPreviousMeal(extra.id)
                            }
                          }}
                          className="px-6 py-3 bg-white border-2 border-stone-300 text-stone-700 rounded-lg font-semibold hover:bg-stone-50"
                        >
                          ← Back
                        </button>

                        <button
                          onClick={() => goToNextMeal(extra.id)}
                          disabled={!guestMealData.appetizer || !guestMealData.main || !guestMealData.side}
                          className={`px-8 py-3 rounded-lg font-semibold transition ${
                            guestMealData.appetizer && guestMealData.main && guestMealData.side
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg'
                              : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                          }`}
                        >
                          {getNextButtonText(extra.id)}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            }

            return (
              <div key={extra.id} id={`extra-${extra.id}`} className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border-2 border-green-200 scroll-mt-24">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl md:text-2xl font-serif text-green-700 flex items-center gap-2">
                        <span className="text-3xl">✓</span> {extra.extra_name}
                      </h2>
                      <p className="text-sm text-stone-600 mt-1">All selections complete</p>
                    </div>
                    <button
                      onClick={() => {
                        if (!isSubmitted) {
                          setEditMode(prev => ({ ...prev, [extra.id]: true }))
                          setCurrentStep(prev => ({ ...prev, [extra.id]: 2 }))
                          setCurrentGuest(prev => ({ ...prev, [extra.id]: 0 }))
                          setCurrentDate(prev => ({ ...prev, [extra.id]: 0 }))
                          setCurrentMeal(prev => ({ ...prev, [extra.id]: 'lunch' }))
                          scrollToExtra(extra.id)
                        }
                      }}
                      disabled={isSubmitted}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        isSubmitted 
                          ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                          : 'bg-orange-500 text-white hover:bg-orange-600'
                      }`}
                    >
                      {isSubmitted ? '🔒 Locked' : '✏️ Edit Selections'}
                    </button>
                  </div>
                </div>

                {/* Selections Summary */}
                <div className="space-y-6">
                  {Array(totalGuests).fill(null).map((_, guestIndex) => {
                    const guestKey = `guest_${guestIndex}`
                    const guestName = getGuestDisplayName(extra.id, guestIndex)
                    
                    return (
                      <div key={guestIndex} className="border-2 border-stone-200 rounded-xl p-4 md:p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-serif text-stone-900">{guestName}</h3>
                          {!isSubmitted && (
                            <button
                              onClick={() => {
                                setEditMode(prev => ({ ...prev, [extra.id]: true }))
                                jumpToGuest(extra.id, guestIndex)
                              }}
                              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                            >
                              Edit →
                            </button>
                          )}
                        </div>

                        <div className="space-y-4">
                          {sharedDates.map(date => {
                            const guestData = selections[extra.id]?.guests?.[guestKey]?.[date]
                            if (!guestData) return null

                            return (
                              <div key={date} className="bg-stone-50 rounded-lg p-4">
                                <h4 className="font-medium text-stone-900 mb-3">{formatDate(date)}</h4>
                                
                                {/* Lunch */}
                                {guestData.lunch && (
                                  <div className="mb-3">
                                    <p className="text-sm font-semibold text-orange-700 mb-2">🍽️ Lunch</p>
                                    <div className="text-sm text-stone-700 space-y-1 pl-4">
                                      <p>• Starter: {getMenuItem(guestData.lunch.appetizer)?.name || 'Not selected'}</p>
                                      <p>• Main: {getMenuItem(guestData.lunch.main)?.name || 'Not selected'}</p>
                                      <p>• Side: {getMenuItem(guestData.lunch.side)?.name || 'Not selected'}</p>
                                      {guestData.lunch.special_requests && (
                                        <p className="text-xs text-stone-600 italic">Note: {guestData.lunch.special_requests}</p>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Dinner */}
                                {guestData.dinner && (
                                  <div>
                                    <p className="text-sm font-semibold text-stone-700 mb-2">🌙 Dinner</p>
                                    <div className="text-sm text-stone-700 space-y-1 pl-4">
                                      <p>• Starter: {getMenuItem(guestData.dinner.appetizer)?.name || 'Not selected'}</p>
                                      <p>• Main: {getMenuItem(guestData.dinner.main)?.name || 'Not selected'}</p>
                                      <p>• Side: {getMenuItem(guestData.dinner.side)?.name || 'Not selected'}</p>
                                      {guestData.dinner.special_requests && (
                                        <p className="text-xs text-stone-600 italic">Note: {guestData.dinner.special_requests}</p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {nonChefExtras.map(extra => {
            const dates = Array(extra.quantity).fill(null).map((_, i) => `experience-${i}`)
            
            return (
              <div key={extra.id} id={`extra-${extra.id}`} className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-stone-200 scroll-mt-24">
                <div className="mb-6">
                  <h2 className="text-xl md:text-2xl font-serif mb-2">{extra.extra_name}</h2>
                  <p className="text-sm md:text-base text-stone-600">
                    Quantity: {extra.quantity} {extra.quantity === 1 ? 'experience' : 'experiences'}
                  </p>
                </div>

                <div className="space-y-4">
                  {dates.map((date, idx) => {
                    const dateSelection = selections[extra.id]?.dates?.[date] || {}
                    const selectedDate = dateSelection.date || ''
                    
                    return (
                      <div key={date} className="border border-stone-200 rounded-xl p-4 md:p-6">
                        <h3 className="text-base md:text-lg font-serif mb-4">Experience {idx + 1}</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-stone-700">Date</label>
                            <input
                              type="date"
                              value={selectedDate}
                              min={getMinDate()}
                              max={getMaxDate()}
                              onChange={e => updateNonChefSelection(extra.id, date, 'date', e.target.value)}
                              disabled={isSubmitted}
                              className={`w-full p-2 md:p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                                isSubmitted ? 'bg-stone-100 cursor-not-allowed opacity-60' : ''
                              }`}
                            />
                            {selectedDate && (
                              <p className="text-xs text-stone-500 mt-1">
                                Available during your stay: {formatDate(getMinDate())} - {formatDate(getMaxDate())}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2 text-stone-700">Time</label>
                            <input
                              type="time"
                              value={dateSelection.time || ''}
                              min={selectedDate ? getMinTimeForDate(selectedDate) : '00:00'}
                              max={selectedDate ? getMaxTimeForDate(selectedDate) : '23:59'}
                              onChange={e => updateNonChefSelection(extra.id, date, 'time', e.target.value)}
                              disabled={isSubmitted}
                              className={`w-full p-2 md:p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                                isSubmitted ? 'bg-stone-100 cursor-not-allowed opacity-60' : ''
                              }`}
                            />
                            {selectedDate && (
                              <p className="text-xs text-stone-500 mt-1">
                                {selectedDate === getMinDate() && 'Check-in day: Available from 2:00 PM onwards'}
                                {selectedDate === reservation.check_out && 'Checkout day: Available until 11:00 AM only'}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2 text-stone-700">Special Requests</label>
                            <textarea
                              value={dateSelection.special_requests || ''}
                              onChange={e => updateNonChefSelection(extra.id, date, 'special_requests', e.target.value)}
                              className="w-full p-2 md:p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                              rows={3}
                              placeholder="Any specific requirements..."
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Save and Submit Buttons - Bottom */}
        {!isSubmitted && (
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-4 bg-stone-600 text-white rounded-xl hover:bg-stone-700 disabled:opacity-50 transition-all shadow-md text-lg font-semibold"
            >
              {saving ? 'Saving...' : '💾 Save All Selections'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition-all shadow-lg text-lg font-semibold"
            >
              {submitting ? 'Submitting...' : '✓ Submit Final Selections'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ExtraSelectionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-white via-stone-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-600">Loading...</p>
        </div>
      </div>
    }>
      <ExtraSelectionsContent />
    </Suspense>
  )
}
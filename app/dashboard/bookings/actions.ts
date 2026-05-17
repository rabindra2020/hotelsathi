'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createBooking(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: hotel } = await supabase
    .from('hotels')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!hotel) throw new Error('Hotel not found')

  const room_id = formData.get('room_id') as string
  const guest_name = formData.get('guest_name') as string
  const phone = formData.get('phone') as string
  const nationality = formData.get('nationality') as string
  const check_in = formData.get('check_in') as string
  const check_out = formData.get('check_out') as string
  const status = formData.get('status') as string || 'confirmed'

  // Validation: Check-out must be after check-in
  if (check_in >= check_out) {
    throw new Error('Check-out date must be after check-in date')
  }

  // 1. Prevent double booking logic
  // Check if there are overlapping bookings for the SAME room
  // An overlapping booking is one where:
  // (new_check_in < existing_check_out) AND (new_check_out > existing_check_in)
  // And it must not be a cancelled booking
  const { data: overlappingBookings, error: checkError } = await supabase
    .from('bookings')
    .select('id')
    .eq('room_id', room_id)
    .neq('status', 'cancelled')
    .lt('check_in', check_out)
    .gt('check_out', check_in)

  if (checkError) throw new Error(checkError.message)

  if (overlappingBookings && overlappingBookings.length > 0) {
    throw new Error('Double Booking Alert: This room is already booked for the selected dates!')
  }

  // 2. Insert/Update guest in CRM (automatically increment visit count)
  if (phone) {
    const { data: existingGuest, error: guestFetchError } = await supabase
      .from('guests')
      .select('id, visit_count')
      .eq('hotel_id', hotel.id)
      .eq('phone', phone)
      .maybeSingle()

    if (guestFetchError) console.error('Error fetching guest:', guestFetchError)

    if (existingGuest) {
      // Update and increment visit count
      const { error: guestUpdateError } = await supabase
        .from('guests')
        .update({
          name: guest_name,
          nationality: nationality || null,
          visit_count: existingGuest.visit_count + 1
        })
        .eq('id', existingGuest.id)

      if (guestUpdateError) console.error('Error updating guest count:', guestUpdateError)
    } else {
      // Insert new guest
      const { error: guestInsertError } = await supabase
        .from('guests')
        .insert({
          hotel_id: hotel.id,
          name: guest_name,
          phone: phone,
          nationality: nationality || null,
          visit_count: 1
        })

      if (guestInsertError) console.error('Error inserting guest:', guestInsertError)
    }
  }

  // 3. Create the booking
  const { error: bookingError } = await supabase.from('bookings').insert({
    hotel_id: hotel.id,
    room_id,
    guest_name,
    phone,
    nationality,
    check_in,
    check_out,
    status
  })

  if (bookingError) throw new Error(bookingError.message)

  revalidatePath('/dashboard/bookings')
  revalidatePath('/dashboard/guests')
  revalidatePath('/dashboard')
}

export async function updateBookingStatus(id: string, status: string) {
  const supabase = await createClient()

  // Find the booking details first
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('*, guests(id, visit_count)')
    .eq('id', id)
    .single()

  if (fetchError) throw new Error(fetchError.message)

  // If status is being updated to anything active (confirmed/checked_in) from pending,
  // we might want to check double booking overlapping before updating.
  if (status === 'confirmed' || status === 'checked_in') {
    const { data: overlappingBookings, error: checkError } = await supabase
      .from('bookings')
      .select('id')
      .eq('room_id', booking.room_id)
      .neq('id', booking.id)
      .neq('status', 'cancelled')
      .lt('check_in', booking.check_out)
      .gt('check_out', booking.check_in)

    if (checkError) throw new Error(checkError.message)

    if (overlappingBookings && overlappingBookings.length > 0) {
      throw new Error('Cannot update booking status. Overlapping booking exists!')
    }
  }

  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/bookings')
  revalidatePath('/dashboard')
}

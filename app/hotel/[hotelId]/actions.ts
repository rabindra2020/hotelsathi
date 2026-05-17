'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPublicBookingRequest(formData: FormData) {
  const supabase = await createClient()

  const hotel_id = formData.get('hotel_id') as string
  const room_id = formData.get('room_id') as string
  const guest_name = formData.get('guest_name') as string
  const phone = formData.get('phone') as string
  const nationality = formData.get('nationality') as string
  const check_in = formData.get('check_in') as string
  const check_out = formData.get('check_out') as string

  // Validations
  if (check_in >= check_out) {
    throw new Error('Check-out date must be after check-in date')
  }

  // 1. Prevent double booking logic
  const { data: overlappingBookings, error: checkError } = await supabase
    .from('bookings')
    .select('id')
    .eq('room_id', room_id)
    .neq('status', 'cancelled')
    .lt('check_in', check_out)
    .gt('check_out', check_in)

  if (checkError) throw new Error(checkError.message)

  if (overlappingBookings && overlappingBookings.length > 0) {
    throw new Error('This room is already booked for the selected dates. Please choose another room or date.')
  }

  // 2. Automate Guest Profile creation/update
  if (phone) {
    const { data: existingGuest } = await supabase
      .from('guests')
      .select('id, visit_count')
      .eq('hotel_id', hotel_id)
      .eq('phone', phone)
      .maybeSingle()

    if (existingGuest) {
      await supabase
        .from('guests')
        .update({
          name: guest_name,
          nationality: nationality || null,
          visit_count: existingGuest.visit_count + 1
        })
        .eq('id', existingGuest.id)
    } else {
      await supabase
        .from('guests')
        .insert({
          hotel_id,
          name: guest_name,
          phone,
          nationality: nationality || null,
          visit_count: 1
        })
    }
  }

  // 3. Save as 'pending' booking request
  const { error: bookingError } = await supabase.from('bookings').insert({
    hotel_id,
    room_id,
    guest_name,
    phone,
    nationality,
    check_in,
    check_out,
    status: 'pending' // default for public form
  })

  if (bookingError) throw new Error(bookingError.message)

  revalidatePath(`/hotel/${hotel_id}`)
  revalidatePath('/dashboard')
}

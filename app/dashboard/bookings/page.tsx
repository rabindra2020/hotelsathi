import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BookingsClient from './BookingsClient'

export default async function BookingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: hotel } = await supabase
    .from('hotels')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!hotel) redirect('/login?error=Hotel not found')

  // Fetch all rooms
  const { data: rooms } = await supabase
    .from('rooms')
    .select('id, name, type, price, status')
    .eq('hotel_id', hotel.id)

  // Fetch all bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, rooms(name)')
    .eq('hotel_id', hotel.id)
    .order('check_in', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bookings & Calendar</h1>
        <p className="text-gray-500">Manage manually entered bookings, direct booking requests, and calendar view.</p>
      </div>

      <BookingsClient rooms={rooms || []} bookings={bookings || []} />
    </div>
  )
}

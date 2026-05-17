import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RoomsClient from './RoomsClient'

export default async function RoomsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: hotel } = await supabase
    .from('hotels')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!hotel) redirect('/login?error=Hotel not found')

  const { data: rooms } = await supabase
    .from('rooms')
    .select('*')
    .eq('hotel_id', hotel.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Room Management</h1>
        <p className="text-gray-500">Configure your rooms, pricing, and current availability status.</p>
      </div>

      <RoomsClient initialRooms={rooms || []} />
    </div>
  )
}

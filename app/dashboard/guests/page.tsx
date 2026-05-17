import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GuestsClient from './GuestsClient'

export default async function GuestsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: hotel } = await supabase
    .from('hotels')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!hotel) redirect('/login?error=Hotel not found')

  // Fetch all guests for this hotel
  const { data: guests } = await supabase
    .from('guests')
    .select('*')
    .eq('hotel_id', hotel.id)
    .order('visit_count', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Guest CRM</h1>
        <p className="text-gray-500">Track guest profile details, contact information, nationalities, and total visit history count.</p>
      </div>

      <GuestsClient initialGuests={guests || []} />
    </div>
  )
}

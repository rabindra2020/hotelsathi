import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import QRCodeClient from './QRCodeClient'
import { headers } from 'next/headers'

export default async function QRCodePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: hotel } = await supabase
    .from('hotels')
    .select('id, name')
    .eq('owner_id', user.id)
    .single()

  if (!hotel) redirect('/login?error=Hotel not found')

  // Construct URL dynamically
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const publicPageUrl = `${protocol}://${host}/hotel/${hotel.id}`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">QR Code & Public Page</h1>
        <p className="text-gray-500">
          Display or download a customizable QR code. Guests can scan this to see rooms and book directly commission-free!
        </p>
      </div>

      <QRCodeClient hotelName={hotel.name} publicUrl={publicPageUrl} />
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Building2, Phone, Mail, Award, MessageSquare } from 'lucide-react'
import PublicBookingFormClient from './PublicBookingFormClient'

interface PageProps {
  params: Promise<{ hotelId: string }>
}

export default async function PublicHotelPage({ params }: PageProps) {
  const { hotelId } = await params
  const supabase = await createClient()

  // Fetch hotel details
  const { data: hotel } = await supabase
    .from('hotels')
    .select('*')
    .eq('id', hotelId)
    .single()

  if (!hotel) {
    notFound()
  }

  // Fetch active available rooms
  const { data: rooms } = await supabase
    .from('rooms')
    .select('*')
    .eq('hotel_id', hotelId)
    .eq('status', 'available')

  const whatsAppLink = hotel.phone 
    ? `https://wa.me/${hotel.phone.replace(/[^0-9]/g, '')}?text=Hi,%20I'm%20interested%20in%20booking%20a%20room%20at%20${encodeURIComponent(hotel.name)}.`
    : '#'

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-12">
      {/* Hotel Hero / Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-indigo-600">
            <Building2 size={24} />
            <h1 className="text-xl font-bold tracking-tight">{hotel.name}</h1>
          </div>
          {hotel.phone && (
            <a
              href={`tel:${hotel.phone}`}
              className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100 flex items-center gap-1 hover:bg-indigo-100 transition"
            >
              <Phone size={12} />
              Call Now
            </a>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        {/* Short intro */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Award className="text-indigo-600" size={24} />
            <h2 className="text-lg font-bold">Welcome to {hotel.name}</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Book your stay directly with us for guaranteed lowest prices, custom services, and fast support. No commissions, no middleman!
          </p>

          <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-500 pt-2">
            {hotel.phone && (
              <span className="flex items-center gap-1">
                <Phone size={14} className="text-gray-400" /> {hotel.phone}
              </span>
            )}
            {hotel.email && (
              <span className="flex items-center gap-1">
                <Mail size={14} className="text-gray-400" /> {hotel.email}
              </span>
            )}
          </div>
        </div>

        {/* WhatsApp Quick Chat */}
        {hotel.phone && (
          <div className="bg-green-50 border border-green-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <h3 className="font-bold text-green-900 flex items-center gap-1.5 text-sm">
                <MessageSquare size={16} />
                Have Questions? Chat on WhatsApp
              </h3>
              <p className="text-xs text-green-700 mt-1">
                Ask about current discounts, special rooms, or customized packages.
              </p>
            </div>
            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition shadow-sm shrink-0"
            >
              Chat on WhatsApp
            </a>
          </div>
        )}

        {/* Booking Form Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-lg text-gray-900">Direct Booking Request</h3>
          <p className="text-xs text-gray-500">
            Submit your reservation request. We will review availability and contact you shortly to confirm your booking.
          </p>

          <PublicBookingFormClient hotelId={hotelId} rooms={rooms || []} />
        </div>
      </main>

      <footer className="max-w-4xl mx-auto px-4 mt-12 text-center text-xs text-gray-400">
        <p>Direct Booking System powered by HotelSathi</p>
      </footer>
    </div>
  )
}

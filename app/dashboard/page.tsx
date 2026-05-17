import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BedDouble, CalendarCheck, CalendarRange, Percent } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: hotel } = await supabase
    .from('hotels')
    .select('id, name')
    .eq('owner_id', user.id)
    .single()

  if (!hotel) redirect('/login?error=Hotel not found')

  // Fetch Rooms
  const { data: rooms } = await supabase
    .from('rooms')
    .select('id, status')
    .eq('hotel_id', hotel.id)

  const totalRooms = rooms?.length || 0

  // Fetch today's bookings and active bookings
  const today = new Date().toISOString().split('T')[0]

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, check_in, check_out, status')
    .eq('hotel_id', hotel.id)

  // Active bookings are those currently checked in or confirmed and overlapping today
  const activeBookings = bookings?.filter(b => 
    b.status === 'checked_in' || 
    (b.status === 'confirmed' && b.check_in <= today && b.check_out >= today)
  ).length || 0

  // Today check-ins
  const todayCheckIns = bookings?.filter(b => b.check_in === today).length || 0

  // Occupancy % calculation
  const occupancyRate = totalRooms > 0 ? Math.round((activeBookings / totalRooms) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Namaste, {hotel.name}</h1>
          <p className="text-gray-500">Welcome to your dashboard. Here's your operations overview today.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/bookings" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-center shadow-sm">
            + New Booking
          </Link>
          <Link href="/dashboard/rooms" className="border border-gray-300 hover:bg-gray-50 text-gray-700 bg-white px-4 py-2 rounded-lg font-medium text-center shadow-sm">
            Manage Rooms
          </Link>
        </div>
      </div>

      {/* Analytics Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Rooms</p>
            <h3 className="text-2xl font-bold mt-1">{totalRooms}</h3>
          </div>
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
            <BedDouble size={20} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Bookings</p>
            <h3 className="text-2xl font-bold mt-1">{activeBookings}</h3>
          </div>
          <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
            <CalendarCheck size={20} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm text-gray-500 font-medium">Today's Check-ins</p>
            <h3 className="text-2xl font-bold mt-1">{todayCheckIns}</h3>
          </div>
          <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
            <CalendarRange size={20} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm text-gray-500 font-medium">Occupancy %</p>
            <h3 className="text-2xl font-bold mt-1">{occupancyRate}%</h3>
          </div>
          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
            <Percent size={20} />
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Pending Booking Requests</h2>
          {/* List pending requests */}
          <PendingBookingsList hotelId={hotel.id} />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Today's Check-Ins/Outs</h2>
          <DailyActivityList hotelId={hotel.id} today={today} />
        </div>
      </div>
    </div>
  )
}

async function PendingBookingsList({ hotelId }: { hotelId: string }) {
  const supabase = await createClient()
  const { data: pendings } = await supabase
    .from('bookings')
    .select('*, rooms(name)')
    .eq('hotel_id', hotelId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5)

  if (!pendings || pendings.length === 0) {
    return <p className="text-gray-500 text-sm py-4">No pending direct booking requests.</p>
  }

  return (
    <div className="space-y-4">
      {pendings.map((b) => (
        <div key={b.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div>
            <h4 className="font-semibold text-sm">{b.guest_name}</h4>
            <p className="text-xs text-gray-500">
              Room: {b.rooms?.name} | {b.check_in} to {b.check_out}
            </p>
          </div>
          <Link href="/dashboard/bookings" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
            Review Request
          </Link>
        </div>
      ))}
    </div>
  )
}

async function DailyActivityList({ hotelId, today }: { hotelId: string, today: string }) {
  const supabase = await createClient()
  const { data: activities } = await supabase
    .from('bookings')
    .select('*, rooms(name)')
    .eq('hotel_id', hotelId)
    .or(`check_in.eq.${today},check_out.eq.${today}`)
    .order('check_in')

  if (!activities || activities.length === 0) {
    return <p className="text-gray-500 text-sm py-4">No activity scheduled for today.</p>
  }

  return (
    <div className="space-y-4">
      {activities.map((b) => {
        const isCheckIn = b.check_in === today
        return (
          <div key={b.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div>
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 ${
                isCheckIn ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {isCheckIn ? 'CHECK-IN' : 'CHECK-OUT'}
              </span>
              <h4 className="font-semibold text-sm">{b.guest_name}</h4>
              <p className="text-xs text-gray-500">Room: {b.rooms?.name} | {b.phone}</p>
            </div>
            <Link href="/dashboard/bookings" className="text-xs font-semibold text-gray-600 hover:text-gray-800 border border-gray-300 rounded px-2.5 py-1">
              View
            </Link>
          </div>
        )
      })}
    </div>
  )
}

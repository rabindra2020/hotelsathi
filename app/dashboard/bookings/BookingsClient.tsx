'use client'

import { useState } from 'react'
import { Plus, X, Calendar, List, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { createBooking, updateBookingStatus } from './actions'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isWithinInterval } from 'date-fns'

interface Room {
  id: string
  name: string
  type: string
  price: number
  status: string
}

interface Booking {
  id: string
  room_id: string
  guest_name: string
  phone: string
  nationality: string
  check_in: string
  check_out: string
  status: string
  rooms: { name: string } | null
}

export default function BookingsClient({ rooms, bookings }: { rooms: Room[], bookings: Booking[] }) {
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Calendar dates setup
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  const handleCreateBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    try {
      await createBooking(formData)
      setIsModalOpen(false)
      window.location.reload()
    } catch (err: any) {
      setError(err.message || 'Overlap detected or input is invalid!')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateBookingStatus(id, newStatus)
      window.location.reload()
    } catch (err: any) {
      alert(err.message || 'Could not update status')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        {/* Tab switcher */}
        <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition ${
              activeTab === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List size={16} />
            Bookings List
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition ${
              activeTab === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar size={16} />
            Calendar View
          </button>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-sm transition w-full sm:w-auto justify-center"
        >
          <Plus size={18} />
          New Reservation
        </button>
      </div>

      {/* Tabs Content */}
      {activeTab === 'list' ? (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {bookings.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 mb-4">No reservations recorded yet.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-lg font-medium transition"
              >
                Create Reservation
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Guest Name</th>
                    <th className="px-6 py-4">Room</th>
                    <th className="px-6 py-4">Check In/Out</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-semibold text-gray-900">{booking.guest_name}</td>
                      <td className="px-6 py-4">{booking.rooms?.name || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-800">{booking.check_in}</span>
                        <span className="text-gray-400 mx-1">→</span>
                        <span className="font-medium text-gray-800">{booking.check_out}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p>{booking.phone || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{booking.nationality || ''}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'checked_in' ? 'bg-green-100 text-green-800' :
                          booking.status === 'checked_out' ? 'bg-gray-100 text-gray-800' :
                          booking.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                            className="bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-2 py-1 rounded text-xs font-semibold"
                          >
                            Approve
                          </button>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(booking.id, 'checked_in')}
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded text-xs font-semibold"
                          >
                            Check-In
                          </button>
                        )}
                        {booking.status === 'checked_in' && (
                          <button
                            onClick={() => handleUpdateStatus(booking.id, 'checked_out')}
                            className="bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 px-2 py-1 rounded text-xs font-semibold"
                          >
                            Check-Out
                          </button>
                        )}
                        {booking.status !== 'cancelled' && booking.status !== 'checked_out' && (
                          <button
                            onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                            className="text-red-600 hover:text-red-800 px-2 py-1 text-xs font-semibold"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Calendar / Visual Room Rack Grid */
        <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft size={20} />
              </button>
              <h3 className="font-bold text-lg text-gray-900">{format(currentMonth, 'MMMM yyyy')}</h3>
              <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> Confirmed</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-sm"></div> Checked-In</div>
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <div className="min-w-[800px]">
              {/* Header row */}
              <div className="grid grid-cols-[150px_1fr] bg-gray-50 border-b border-gray-200">
                <div className="p-3 font-semibold text-xs text-gray-500 border-r border-gray-200">ROOMS</div>
                <div className="flex" style={{ width: `${daysInMonth.length * 40}px` }}>
                  {daysInMonth.map((day) => (
                    <div key={day.toString()} className="w-10 p-2 text-center text-[10px] font-bold text-gray-600 border-r border-gray-100 shrink-0">
                      <div>{format(day, 'd')}</div>
                      <div className="text-gray-400 font-normal">{format(day, 'EE').slice(0, 2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rows */}
              {rooms.map((room) => (
                <div key={room.id} className="grid grid-cols-[150px_1fr] border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                  <div className="p-3 font-semibold text-sm text-gray-900 border-r border-gray-200 bg-white">
                    {room.name}
                    <div className="text-[10px] text-gray-400 font-normal">{room.type}</div>
                  </div>
                  <div className="flex" style={{ width: `${daysInMonth.length * 40}px` }}>
                    {daysInMonth.map((day) => {
                      const dayStr = format(day, 'yyyy-MM-dd')
                      // Find if any booking for this room overlaps this day
                      const activeBooking = bookings.find((b) => {
                        if (b.room_id !== room.id || b.status === 'cancelled') return false
                        return dayStr >= b.check_in && dayStr < b.check_out
                      })

                      const isCheckInDay = activeBooking?.check_in === dayStr

                      return (
                        <div key={day.toString()} className="w-10 h-12 border-r border-gray-100 shrink-0 relative flex items-center justify-center p-0.5">
                          {activeBooking && (
                            <div className={`w-full h-8 flex items-center justify-center text-[9px] font-bold text-white rounded transition shadow-sm ${
                              activeBooking.status === 'checked_in' ? 'bg-green-500' : 'bg-blue-500'
                            }`} title={`${activeBooking.guest_name} (${activeBooking.status})`}>
                              {isCheckInDay ? activeBooking.guest_name.slice(0, 5) : '•'}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reservation Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">New Reservation</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2 mb-4 text-xs font-semibold">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Room</label>
                  <select
                    name="room_id"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select a Room</option>
                    {rooms.filter(r => r.status === 'available').map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.type} - Rs. {r.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="checked_in">Checked In</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guest Full Name</label>
                <input
                  name="guest_name"
                  type="text"
                  required
                  placeholder="e.g. Rabindra Shrestha"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guest Phone</label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    placeholder="e.g. 9841234567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                  <input
                    name="nationality"
                    type="text"
                    placeholder="Nepali / Indian / German"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-In Date</label>
                  <input
                    name="check_in"
                    type="date"
                    required
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-Out Date</label>
                  <input
                    name="check_out"
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-lg transition"
                >
                  {loading ? 'Creating Booking...' : 'Create Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

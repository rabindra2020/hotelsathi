'use client'

import { useState } from 'react'
import { createPublicBookingRequest } from './actions'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface Room {
  id: string
  name: string
  type: string
  price: number
}

export default function PublicBookingFormClient({ hotelId, rooms }: { hotelId: string, rooms: Room[] }) {
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append('hotel_id', hotelId)

    try {
      await createPublicBookingRequest(formData)
      setSuccess(true)
      e.currentTarget.reset()
    } catch (err: any) {
      setError(err.message || 'Overlapping reservation exists for selected room. Please choose different dates.')
    } finally {
      setLoading(false)
    }
  }

  if (rooms.length === 0) {
    return (
      <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 text-sm">
        Sorry! There are no available rooms registered right now. Please check back later.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-start gap-3">
          <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={18} />
          <div>
            <h4 className="font-bold text-sm">Booking Request Sent Successfully!</h4>
            <p className="text-xs text-green-700 mt-1">
              We received your reservation request and will contact you via phone shortly to confirm.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-start gap-3 text-xs font-semibold">
          <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Select Room
            </label>
            <select
              name="room_id"
              required
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="">Choose a Room Type</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} ({room.type} - Rs. {room.price}/night)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              name="guest_name"
              type="text"
              required
              placeholder="Your Full Name"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Mobile Phone
            </label>
            <input
              name="phone"
              type="tel"
              required
              placeholder="e.g. 9841XXXXXX"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Nationality
            </label>
            <input
              name="nationality"
              type="text"
              required
              placeholder="e.g. Nepali, Indian"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Check-In Date
            </label>
            <input
              name="check_in"
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Check-Out Date
            </label>
            <input
              name="check_out"
              type="date"
              required
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 px-4 rounded-xl transition duration-150 shadow-sm"
        >
          {loading ? 'Submitting Request...' : 'Book Room Now'}
        </button>
      </form>
    </div>
  )
}

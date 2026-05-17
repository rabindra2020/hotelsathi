'use client'

import { useState } from 'react'
import { Search, UserCheck, Phone, Globe } from 'lucide-react'

interface Guest {
  id: string
  name: string
  phone: string
  nationality: string
  visit_count: number
  created_at: string
}

export default function GuestsClient({ initialGuests }: { initialGuests: Guest[] }) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredGuests = initialGuests.filter((guest) => {
    const term = searchTerm.toLowerCase()
    return (
      guest.name.toLowerCase().includes(term) ||
      (guest.phone && guest.phone.includes(term)) ||
      (guest.nationality && guest.nationality.toLowerCase().includes(term))
    )
  })

  return (
    <div className="space-y-4">
      {/* Search & Actions */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by guest name, phone, or nationality..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <div className="text-sm font-semibold text-gray-500 self-end md:self-auto">
          Showing {filteredGuests.length} of {initialGuests.length} Guests
        </div>
      </div>

      {filteredGuests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-500">No guests match your search or no guests are in CRM yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Guest Name</th>
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4">Nationality</th>
                  <th className="px-6 py-4 text-center">Visits (History count)</th>
                  <th className="px-6 py-4 text-right">Relationship</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                {filteredGuests.map((guest) => {
                  const isLoyal = guest.visit_count >= 3
                  return (
                    <tr key={guest.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-2">
                        {guest.name}
                        {isLoyal && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            Loyal Client
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {guest.phone ? (
                          <span className="flex items-center gap-1.5">
                            <Phone size={14} className="text-gray-400" />
                            {guest.phone}
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {guest.nationality ? (
                          <span className="flex items-center gap-1.5">
                            <Globe size={14} className="text-gray-400" />
                            {guest.nationality}
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block font-bold text-sm px-2.5 py-0.5 rounded-full ${
                          isLoyal ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {guest.visit_count}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xs text-gray-400">
                          First check-in: {new Date(guest.created_at).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

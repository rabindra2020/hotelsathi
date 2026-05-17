'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react'
import { addRoom, updateRoom, deleteRoom } from './actions'

interface Room {
  id: string
  name: string
  type: string
  price: number
  status: string
}

export default function RoomsClient({ initialRooms }: { initialRooms: Room[] }) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleOpenAddModal = () => {
    setEditingRoom(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (room: Room) => {
    setEditingRoom(room)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    try {
      if (editingRoom) {
        formData.append('id', editingRoom.id)
        await updateRoom(formData)
      } else {
        await addRoom(formData)
      }
      setIsModalOpen(false)
      // Quick window reload to fetch fresh server component data (simplest way to keep things synchronized)
      window.location.reload()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this room? This will also remove associated bookings.')) return
    
    try {
      await deleteRoom(id)
      window.location.reload()
    } catch (err: any) {
      alert(err.message || 'Failed to delete room')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-700">{rooms.length} Rooms Total</h2>
        <button
          onClick={handleOpenAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition"
        >
          <Plus size={18} />
          Add Room
        </button>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 mb-4">No rooms added yet. Start by adding your first hotel room.</p>
          <button
            onClick={handleOpenAddModal}
            className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-lg font-medium transition"
          >
            Add First Room
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Room Name / No.</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Price / Night</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-semibold text-gray-900">{room.name}</td>
                    <td className="px-6 py-4">{room.type}</td>
                    <td className="px-6 py-4">Rs. {room.price}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        room.status === 'available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {room.status === 'available' ? 'Available' : 'Maintenance'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(room)}
                        className="text-indigo-600 hover:text-indigo-900 inline-flex items-center justify-center p-1 rounded-md hover:bg-indigo-50"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        className="text-rose-600 hover:text-rose-900 inline-flex items-center justify-center p-1 rounded-md hover:bg-rose-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingRoom ? 'Edit Room Details' : 'Add New Room'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2 mb-4 text-sm">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Name / Number</label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={editingRoom?.name || ''}
                  placeholder="e.g. Deluxe Room 101"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                <select
                  name="type"
                  required
                  defaultValue={editingRoom?.type || 'Single'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Single">Single Room</option>
                  <option value="Double">Double Room</option>
                  <option value="Deluxe">Deluxe Room</option>
                  <option value="Suite">Suite</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per Night (Rs.)</label>
                <input
                  name="price"
                  type="number"
                  required
                  min="0"
                  defaultValue={editingRoom?.price || ''}
                  placeholder="e.g. 2500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  required
                  defaultValue={editingRoom?.status || 'available'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="available">Available</option>
                  <option value="maintenance">Maintenance</option>
                </select>
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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition"
                >
                  {loading ? 'Saving...' : 'Save Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addRoom(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: hotel } = await supabase
    .from('hotels')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!hotel) throw new Error('Hotel not found')

  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const price = parseFloat(formData.get('price') as string)
  const status = formData.get('status') as string

  const { error } = await supabase.from('rooms').insert({
    hotel_id: hotel.id,
    name,
    type,
    price,
    status
  })

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/rooms')
}

export async function updateRoom(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const price = parseFloat(formData.get('price') as string)
  const status = formData.get('status') as string

  const { error } = await supabase
    .from('rooms')
    .update({ name, type, price, status })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/rooms')
}

export async function deleteRoom(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('rooms')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/rooms')
}

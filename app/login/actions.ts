'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // Need hotel name to create the hotel profile
  const hotelName = formData.get('hotelName') as string

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/login?error=Could not create user')
  }

  // Also create a hotel record for this user
  if (authData.user) {
    const { error: hotelError } = await supabase.from('hotels').insert({
      owner_id: authData.user.id,
      name: hotelName || 'My Hotel',
      email: data.email
    })
    
    if (hotelError) {
        console.error("Failed to create hotel:", hotelError)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

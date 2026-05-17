import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: hotel } = await supabase
    .from('hotels')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!hotel) {
    // Hotel not found, might need to create one
    redirect('/login?error=Hotel not found. Please sign up again.')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar hotelName={hotel.name} />
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

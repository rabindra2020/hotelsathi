import Link from 'next/link';
import { Building2, CalendarCheck, Users, QrCode } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-indigo-600">
            <Building2 size={28} />
            <span className="text-xl font-bold">HotelSathi</span>
          </div>
          <Link
            href="/login"
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Login / Sign Up
          </Link>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Manage your hotel operations <br className="hidden md:block" />
            <span className="text-indigo-600">and get direct bookings.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            HotelSathi is the simplest way for small hotels in Nepal to manage rooms, track guests, and generate a QR-code page for commission-free bookings.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/login"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition shadow-lg"
            >
              Start for Free
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Everything you need to run your hotel</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-xl text-center">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarCheck size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Booking System</h3>
                <p className="text-gray-600">Manage all your reservations in one place. Never double-book a room again.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl text-center">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Guest CRM</h3>
                <p className="text-gray-600">Keep track of your guests and know when they return to provide better service.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl text-center">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Direct QR Bookings</h3>
                <p className="text-gray-600">Get a public link and QR code for your hotel so guests can book directly without OTA commissions.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-8 text-center">
        <p className="text-gray-400">© {new Date().getFullYear()} HotelSathi. Built for hotels in Nepal.</p>
      </footer>
    </div>
  );
}

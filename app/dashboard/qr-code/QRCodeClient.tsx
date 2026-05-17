'use client'

import { useRef, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Download, Copy, Check, ExternalLink } from 'lucide-react'

export default function QRCodeClient({ hotelName, publicUrl }: { hotelName: string, publicUrl: string }) {
  const qrRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!qrRef.current) return
    const canvas = qrRef.current.querySelector('canvas')
    if (!canvas) return

    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream')

    const downloadLink = document.createElement('a')
    downloadLink.href = pngUrl
    downloadLink.download = `${hotelName.toLowerCase().replace(/\s+/g, '-')}-qr.png`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* QR Code Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
        <h3 className="font-bold text-lg text-gray-900">{hotelName} Booking QR</h3>
        <p className="text-sm text-gray-500 max-w-xs">
          Print this out and place it on your reception desk or restaurant tables.
        </p>

        <div ref={qrRef} className="p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-inner flex items-center justify-center">
          <QRCodeCanvas
            value={publicUrl}
            size={200}
            bgColor="#ffffff"
            fgColor="#1f2937"
            level="H"
            includeMargin={true}
          />
        </div>

        <button
          onClick={handleDownload}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition w-full sm:w-auto justify-center"
        >
          <Download size={18} />
          Download PNG
        </button>
      </div>

      {/* Sharing Details Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-gray-900">Your Booking Page Link</h3>
          <p className="text-sm text-gray-600">
            Share this link via Facebook, WhatsApp, or SMS so guests can check availability and book directly.
          </p>

          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
            <span className="text-xs text-gray-500 font-mono truncate select-all flex-1">
              {publicUrl}
            </span>
            <button
              onClick={handleCopyLink}
              className="text-gray-500 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-md transition"
              title="Copy link to clipboard"
            >
              {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-sm text-indigo-900">Why Direct Bookings?</h4>
          <ul className="text-xs text-indigo-700 space-y-2 list-disc list-inside">
            <li>0% commission (Save up to 15-20% compared to OTAs)</li>
            <li>Direct contact with guests via WhatsApp and Phone</li>
            <li>Guests build directly loyal relationship with your brand</li>
          </ul>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 pt-1"
          >
            Visit Public Page <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  )
}

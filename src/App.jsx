import { useState } from 'react'
import { Link, Routes, Route, useNavigate } from 'react-router-dom'
import SignupSetup from './components/SignupSetup'
import ProductManager from './components/ProductManager'
import Storefront from './components/Storefront'
import ThankYou from './components/ThankYou'

function Home() {
  const [setupDone, setSetupDone] = useState(!!localStorage.getItem('storeSlug'))
  const navigate = useNavigate()
  const shareUrl = localStorage.getItem('shareUrl')
  const slug = localStorage.getItem('storeSlug')

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-3xl mx-auto p-4 space-y-6">
        <header className="flex items-center justify-between">
          <div className="text-xl font-bold">Microstore</div>
          {slug && <Link className="text-emerald-700 underline" to={`/s/${slug}`}>View store</Link>}
        </header>

        {!setupDone ? (
          <SignupSetup onComplete={() => { setSetupDone(true); navigate('/dashboard') }} />
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow">
              <h2 className="text-xl font-semibold mb-2">Your store is ready</h2>
              <p className="text-sm text-gray-600">Share your link on WhatsApp and start selling:</p>
              <div className="mt-2 flex items-center gap-2">
                <input value={shareUrl || `/s/${slug}`} readOnly className="flex-1 border p-2 rounded"/>
                <button onClick={() => navigator.clipboard.writeText(window.location.origin + (shareUrl || `/s/${slug}`))} className="px-3 py-2 bg-emerald-600 text-white rounded">Copy</button>
                <a href={`https://wa.me/?text=${encodeURIComponent('Shop here: ' + window.location.origin + (shareUrl || `/s/${slug}`))}`} className="px-3 py-2 bg-green-600 text-white rounded">Share</a>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow">
              <h3 className="text-lg font-semibold mb-3">Products</h3>
              <ProductManager />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Home />} />
      <Route path="/s/:slug" element={<Storefront />} />
      <Route path="/thank-you" element={<ThankYou />} />
    </Routes>
  )
}

export default App

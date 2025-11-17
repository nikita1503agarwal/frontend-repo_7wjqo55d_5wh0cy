import { useState } from 'react'

const apiBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function SignupSetup({ onComplete }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('2547')
  const [whatsapp, setWhatsapp] = useState('')

  const [storeName, setStoreName] = useState('')
  const [slug, setSlug] = useState('')

  const suggestSlug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleSignup = async () => {
    setError(''); setLoading(true)
    try {
      const res = await fetch(`${apiBase}/auth/quick-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, whatsapp_number: whatsapp || phone })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Signup failed')
      localStorage.setItem('userId', data.user_id)
      setStep(2)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStore = async () => {
    setError(''); setLoading(true)
    try {
      const userId = localStorage.getItem('userId')
      const res = await fetch(`${apiBase}/stores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner_user_id: userId, name: storeName, slug, whatsapp_number: whatsapp || phone })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Store creation failed')
      localStorage.setItem('storeSlug', slug)
      localStorage.setItem('shareUrl', data.share_url)
      onComplete?.({ slug, shareUrl: data.share_url })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Create your micro-store</h2>
        <p className="text-sm text-gray-500">Takes under 2 minutes. Kenya-first, MPesa-ready.</p>
      </div>

      {error && <div className="p-3 text-sm bg-red-50 text-red-700 rounded">{error}</div>}

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Your name</label>
            <input className="w-full mt-1 p-3 border rounded" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Phone (MPesa)</label>
            <input className="w-full mt-1 p-3 border rounded" value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="2547XXXXXXXX" />
          </div>
          <div>
            <label className="text-sm text-gray-600">WhatsApp number (optional)</label>
            <input className="w-full mt-1 p-3 border rounded" value={whatsapp} onChange={(e)=>setWhatsapp(e.target.value)} placeholder="2547XXXXXXXX" />
          </div>
          <button onClick={handleSignup} disabled={loading || !name || phone.length<10} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded">
            {loading ? 'Creating...' : 'Continue'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Store name</label>
            <input className="w-full mt-1 p-3 border rounded" value={storeName} onChange={(e)=>{setStoreName(e.target.value); if(!slug) setSlug(suggestSlug(e.target.value))}} placeholder="Mama Mboga" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Store link</label>
            <div className="flex mt-1">
              <span className="inline-flex items-center px-3 rounded-l border bg-gray-50 text-gray-600">/s/</span>
              <input className="w-full p-3 border rounded-r" value={slug} onChange={(e)=>setSlug(suggestSlug(e.target.value))} placeholder="mama-mboga" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Share it on WhatsApp once created.</p>
          </div>
          <button onClick={handleCreateStore} disabled={loading || !storeName || !slug} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded">
            {loading ? 'Creating...' : 'Create Store'}
          </button>
        </div>
      )}
    </div>
  )
}

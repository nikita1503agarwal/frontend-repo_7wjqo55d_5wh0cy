import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const apiBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function Storefront() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [store, setStore] = useState(null)
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [checkingOut, setCheckingOut] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { fetchStore() }, [slug])

  const fetchStore = async () => {
    try {
      const res = await fetch(`${apiBase}/stores/${slug}`)
      const data = await res.json()
      if (res.ok) {
        setStore(data.store)
        setProducts(data.products || [])
      }
    } catch (e) {}
  }

  const addToCart = (p) => {
    setCart(prev => {
      const existing = prev.find(x => x.product_id === p.id)
      if (existing) return prev.map(x => x.product_id === p.id ? { ...x, quantity: x.quantity + 1 } : x)
      return [...prev, { product_id: p.id, name: p.name, price: p.price, quantity: 1 }]
    })
  }

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0)

  const checkout = async (e) => {
    e.preventDefault()
    setCheckingOut(true)
    setMessage('')
    const form = new FormData(e.target)
    const name = form.get('name')
    const phone = form.get('phone')

    try {
      const items = cart.map(i => ({ product_id: i.product_id, quantity: i.quantity }))
      const res = await fetch(`${apiBase}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ store_slug: slug, customer_name: name, customer_phone: phone, items }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Checkout failed')
      navigate(`/thank-you?order=${data.order_id}`)
    } catch (e) {
      setMessage(e.message)
    } finally { setCheckingOut(false) }
  }

  if (!store) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow">
          <div className="text-2xl font-bold">{store.name}</div>
          <div className="text-sm text-gray-500">Simple micro-store. Pay via MPesa.</div>
        </div>

        <div className="space-y-3">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-xl p-3 shadow flex gap-3 items-center">
              {p.image_url ? <img src={p.image_url} className="w-16 h-16 rounded object-cover"/> : <div className="w-16 h-16 bg-gray-200 rounded"/>}
              <div className="flex-1">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-500">KES {p.price}</div>
              </div>
              <button onClick={() => addToCart(p)} className="px-3 py-1 bg-emerald-600 text-white rounded">Add</button>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow space-y-3 sticky bottom-0">
            <div className="font-semibold">Cart</div>
            {cart.map(i => (
              <div key={i.product_id} className="flex justify-between text-sm"><span>{i.name} x{i.quantity}</span><span>KES {i.price * i.quantity}</span></div>
            ))}
            <div className="flex justify-between font-semibold"><span>Total</span><span>KES {total}</span></div>
            <form onSubmit={checkout} className="space-y-2">
              <input name="name" className="w-full border p-2 rounded" placeholder="Your name" required/>
              <input name="phone" className="w-full border p-2 rounded" placeholder="2547XXXXXXXX" required/>
              <button disabled={checkingOut} className="w-full bg-emerald-600 text-white py-2 rounded">{checkingOut ? 'Processing...' : 'Checkout with MPesa'}</button>
              {message && <div className="text-sm text-red-600">{message}</div>}
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'

const apiBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function ProductManager() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const slug = localStorage.getItem('storeSlug')
  const [store, setStore] = useState(null)

  useEffect(() => { fetchStore() }, [])

  const fetchStore = async () => {
    if (!slug) return
    try {
      const res = await fetch(`${apiBase}/stores/${slug}`)
      const data = await res.json()
      if (res.ok) {
        setStore(data.store)
        setProducts(data.products || [])
      }
    } catch (e) {}
  }

  const addProduct = async () => {
    setError(''); setLoading(true)
    try {
      const res = await fetch(`${apiBase}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_id: store.id, name, price: parseFloat(price || '0'), description, image_url: imageUrl })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed')
      setName(''); setPrice(''); setDescription(''); setImageUrl('')
      fetchStore()
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  const toggleAvailability = async (p) => {
    try {
      const res = await fetch(`${apiBase}/products/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ available: !p.available })})
      const data = await res.json()
      if (res.ok) {
        setProducts(prev => prev.map(x => x.id === p.id ? data : x))
      }
    } catch (e) {}
  }

  if (!slug) return <div className="p-4 text-center text-gray-600">Create your store first.</div>

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-4 shadow">
        <h3 className="font-semibold mb-2">Add a product</h3>
        {error && <div className="p-2 text-sm bg-red-50 text-red-700 rounded mb-2">{error}</div>}
        <div className="grid grid-cols-1 gap-3">
          <input className="border p-2 rounded" placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
          <input className="border p-2 rounded" placeholder="Price (KES)" type="number" value={price} onChange={(e)=>setPrice(e.target.value)} />
          <input className="border p-2 rounded" placeholder="Image URL (optional)" value={imageUrl} onChange={(e)=>setImageUrl(e.target.value)} />
          <textarea className="border p-2 rounded" placeholder="Short description" value={description} onChange={(e)=>setDescription(e.target.value)} />
          <button onClick={addProduct} disabled={loading || !name || !price} className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded">{loading ? 'Saving...' : 'Save product'}</button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow">
        <h3 className="font-semibold mb-3">Your products</h3>
        <div className="space-y-3">
          {products.map(p => (
            <div key={p.id} className="flex items-center gap-3 border rounded p-2">
              {p.image_url ? <img src={p.image_url} className="w-12 h-12 rounded object-cover"/> : <div className="w-12 h-12 bg-gray-200 rounded"/>}
              <div className="flex-1">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-500">KES {p.price}</div>
              </div>
              <button onClick={() => toggleAvailability(p)} className={`px-3 py-1 rounded text-sm ${p.available ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{p.available ? 'Disable' : 'Enable'}</button>
            </div>
          ))}
          {products.length === 0 && <div className="text-sm text-gray-500">No products yet.</div>}
        </div>
      </div>
    </div>
  )
}

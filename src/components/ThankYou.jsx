import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

const apiBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function ThankYou() {
  const [params] = useSearchParams()
  const orderId = params.get('order')
  const [status, setStatus] = useState('pending')
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const res = await fetch(`${apiBase}/orders/${orderId}`)
        const data = await res.json()
        if (res.ok) {
          setStatus(data.payment_status)
          setTotal(data.total)
          if (data.payment_status === 'paid') clearInterval(t)
        }
      } catch (e) {}
    }, 3000)
    return () => clearInterval(t)
  }, [orderId])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl p-6 shadow w-full max-w-md text-center space-y-2">
        <h1 className="text-2xl font-bold">Thank you!</h1>
        <p className="text-gray-600">Your order has been placed.</p>
        <p className="text-gray-800 font-semibold">Total: KES {total}</p>
        <div className={`inline-block px-3 py-1 rounded text-white ${status==='paid'?'bg-emerald-600':'bg-yellow-600'}`}>{status==='paid'?'Payment confirmed':'Awaiting MPesa confirmation...'}</div>
      </div>
    </div>
  )
}

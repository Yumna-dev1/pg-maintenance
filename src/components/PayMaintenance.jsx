import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function PayMaintenance() {
  const [amount, setAmount] = useState(500)
  const [payments, setPayments] = useState([])
  const [msg, setMsg] = useState('')

  const load = async () => {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
    setPayments(data || [])
  }

  useEffect(() => { load() }, [])

  const call = async (url, body) => {
    const { data: { session } } = await supabase.auth.getSession()
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    })
    return r.json()
  }

  const pay = async () => {
    setMsg('')
    const order = await call('/api/create-order', { amount: Number(amount) })
    if (order.error) return setMsg(order.error)

    const rzp = new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      order_id: order.id,
      amount: order.amount,
      currency: 'INR',
      name: 'PG Maintenance',
      description: 'Maintenance payment',
      handler: async (response) => {
        const result = await call('/api/verify-payment', response)
        setMsg(result.ok ? 'Payment successful!' : 'Payment could not be verified')
        load()
      },
    })
    rzp.open()
  }

  return (
    <div style={{ border: '1px solid #888', padding: 10, margin: '20px 0' }}>
      <h3>Pay maintenance</h3>
      <input
        type="number"
        min="1"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />{' '}
      <button onClick={pay}>Pay now</button>
      {msg && <p>{msg}</p>}

      <h4>Payment history</h4>
      {payments.length === 0 && <p>No payments yet.</p>}
      {payments.map((p) => (
        <p key={p.id}>
          ₹{p.amount} - {new Date(p.created_at).toLocaleString()}
        </p>
      ))}
    </div>
  )
}
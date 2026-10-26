import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const token = (req.headers.authorization || '').replace('Bearer ', '')
  const amount = Number(req.body?.amount)
  if (!token || !(amount >= 1 && amount <= 100000)) {
    return res.status(400).json({ error: 'Invalid request' })
  }

  const admin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  const { data: { user }, error: userErr } = await admin.auth.getUser(token)
  if (userErr || !user) return res.status(401).json({ error: 'Not logged in' })

  const auth = 'Basic ' + Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
  ).toString('base64')

  const r = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `pg_${Date.now()}`,
    }),
  })
  const order = await r.json()
  if (!order.id) {
    return res.status(500).json({ error: order.error?.description || 'Order failed' })
  }

  await admin.from('payments').insert({
    tenant_id: user.id,
    amount,
    razorpay_order_id: order.id,
  })

  res.status(200).json({ id: order.id, amount: order.amount })
}
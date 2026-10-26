import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const token = (req.headers.authorization || '').replace('Bearer ', '')
  const { complaintId } = req.body || {}
  if (!token || !complaintId) return res.status(400).json({ error: 'Missing data' })

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )

  const { data: c, error } = await supabase
    .from('complaints')
    .select('category, status, tenant:profiles!complaints_tenant_id_fkey(full_name, phone)')
    .eq('id', complaintId)
    .single()
  if (error || !c) return res.status(403).json({ error: 'Not allowed' })

  let phone = (c.tenant.phone || '').replace(/[\s-]/g, '')
  if (!phone.startsWith('+')) phone = '+91' + phone.replace(/^0/, '')

  const body = `Hi ${c.tenant.full_name}, your ${c.category} complaint is now: ${c.status}.`
  const auth = 'Basic ' + Buffer.from(`${process.env.TWILIO_SID}:${process.env.TWILIO_TOKEN}`).toString('base64')

  const send = (from, to) =>
    fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_SID}/Messages.json`, {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ From: from, To: to, Body: body }),
    }).then((r) => r.json())

    const sms = process.env.TWILIO_SMS_FROM
    ? await send(process.env.TWILIO_SMS_FROM, phone)
    : { message: 'SMS not set up yet' }
    const wa = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_SID}/Messages.json`, {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      From: 'whatsapp:' + process.env.TWILIO_WA_FROM,
      To: 'whatsapp:' + phone,
      ContentSid: 'HXb5b62575e6e4ff6129ad7c8efe1f983e',
      ContentVariables: JSON.stringify({ 1: `${c.category} complaint`, 2: c.status }),
    }),
  }).then((r) => r.json())
    res.status(200).json({ sms: sms.message || sms.status, whatsapp: wa.message || wa.status, code: wa.code })
}
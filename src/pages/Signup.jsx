import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Signup() {
  const [form, setForm] = useState({
    full_name: '', phone: '', room_no: '', email: '', password: ''
  })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin + '/login',
        data: {
          full_name: form.full_name,
          phone: form.phone,
          room_no: form.room_no,
        },
      },
    })
    setLoading(false)
    setMsg(error ? error.message : 'Check your email to verify your account.')
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 360, margin: '40px auto', display: 'grid', gap: 10 }}>
      <h2>Tenant Sign Up</h2>
      <input name="full_name" placeholder="Full name" onChange={handleChange} required />
      <input name="phone" placeholder="Phone" onChange={handleChange} required />
      <input name="room_no" placeholder="Room number" onChange={handleChange} required />
      <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password (min 6)" minLength={6} onChange={handleChange} required />
      <button disabled={loading}>{loading ? 'Please wait...' : 'Sign Up'}</button>
      {msg && <p>{msg}</p>}
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </form>
  )
}
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMsg('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return setMsg(error.message)

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    navigate('/' + (profile?.role || 'tenant'))
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 360, margin: '40px auto', display: 'grid', gap: 10 }}>
      <h2>Login</h2>
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
      <button>Login</button>
      {msg && <p>{msg}</p>}
      <p>New tenant? <Link to="/signup">Sign up</Link></p>
    </form>
  )
}
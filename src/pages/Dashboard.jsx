import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Dashboard({ title }) {
  const navigate = useNavigate()

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>{title}</h2>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
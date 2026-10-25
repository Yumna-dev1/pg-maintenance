import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function ProtectedRoute({ role, children }) {
  const [state, setState] = useState('loading')

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setState('denied')
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      setState(profile?.role === role ? 'ok' : 'denied')
    }
    check()
  }, [role])

  if (state === 'loading') return <p>Loading...</p>
  if (state === 'denied') return <Navigate to="/login" />
  return children
}
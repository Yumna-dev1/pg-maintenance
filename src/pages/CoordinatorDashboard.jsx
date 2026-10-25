import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function CoordinatorDashboard() {
  const [complaints, setComplaints] = useState([])
  const navigate = useNavigate()

  const load = async () => {
    const { data } = await supabase
      .from('complaints')
      .select('*, tenant:profiles!complaints_tenant_id_fkey(full_name, room_no, phone)')
      .order('created_at', { ascending: false })
    setComplaints(data || [])
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id, status) => {
    await supabase.from('complaints').update({ status }).eq('id', id)
    load()
  }

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div style={{ maxWidth: 700, margin: '30px auto', padding: 10 }}>
      <h2>Coordinator Dashboard</h2>
      <button onClick={logout}>Logout</button>

      <h3>My assigned complaints</h3>
      {complaints.length === 0 && <p>Nothing assigned to you yet.</p>}
      {complaints.map((c) => (
        <div key={c.id} style={{ border: '1px solid #888', padding: 10, marginBottom: 10 }}>
          <b>{c.category}</b> - <i>{c.status}</i>
          <p>
            {c.tenant?.full_name} (Room {c.tenant?.room_no}) - {c.tenant?.phone}
          </p>
          <p>{c.description}</p>
          {c.photo_url && <img src={c.photo_url} alt="complaint" width="150" />}
          <div style={{ display: 'flex', gap: 10 }}>
            {c.status === 'Assigned' && (
              <button onClick={() => updateStatus(c.id, 'In Progress')}>Start work</button>
            )}
            {c.status === 'In Progress' && (
              <button onClick={() => updateStatus(c.id, 'Resolved')}>Mark resolved</button>
            )}
            {c.status === 'Resolved' && <span>Done</span>}
          </div>
        </div>
      ))}
    </div>
  )
}
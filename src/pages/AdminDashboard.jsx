import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([])
  const [coordinators, setCoordinators] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const navigate = useNavigate()

  const load = async () => {
    const { data } = await supabase
      .from('complaints')
      .select('*, tenant:profiles!complaints_tenant_id_fkey(full_name, room_no)')
      .order('created_at', { ascending: false })
    setComplaints(data || [])

    const { data: coords } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'coordinator')
    setCoordinators(coords || [])
  }

  useEffect(() => { load() }, [])

  const assign = async (id, coordinatorId) => {
    if (!coordinatorId) return
    await supabase
      .from('complaints')
      .update({ assigned_to: coordinatorId, status: 'Assigned' })
      .eq('id', id)
    load()
  }

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const shown = complaints.filter((c) => {
    const text = `${c.category} ${c.description} ${c.tenant?.full_name} ${c.tenant?.room_no}`.toLowerCase()
    const matchSearch = text.includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div style={{ maxWidth: 700, margin: '30px auto', padding: 10 }}>
      <h2>Admin Dashboard</h2>
      <button onClick={logout}>Logout</button>

      <div style={{ display: 'flex', gap: 10, margin: '20px 0' }}>
        <input
          style={{ flex: 1 }}
          placeholder="Search by room, name, category..."
          onChange={(e) => setSearch(e.target.value)}
        />
        <select onChange={(e) => setStatusFilter(e.target.value)}>
          <option>All</option>
          <option>Open</option>
          <option>Assigned</option>
          <option>In Progress</option>
          <option>Resolved</option>
        </select>
      </div>

      {shown.length === 0 && <p>No complaints found.</p>}
      {shown.map((c) => (
        <div key={c.id} style={{ border: '1px solid #888', padding: 10, marginBottom: 10 }}>
          <b>{c.category}</b> - <i>{c.status}</i>
          <p>
            {c.tenant?.full_name} (Room {c.tenant?.room_no})
          </p>
          <p>{c.description}</p>
          {c.photo_url && <img src={c.photo_url} alt="complaint" width="150" />}
          <div>
            <select
              value={c.assigned_to || ''}
              onChange={(e) => assign(c.id, e.target.value)}
            >
              <option value="">Assign to...</option>
              {coordinators.map((co) => (
                <option key={co.id} value={co.id}>{co.full_name}</option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </div>
  )
}
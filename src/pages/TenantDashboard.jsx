import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import PayMaintenance from '../components/PayMaintenance'

export default function TenantDashboard() {
  const [complaints, setComplaints] = useState([])
  const [category, setCategory] = useState('Plumbing')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState(null)
  const [msg, setMsg] = useState('')
  const navigate = useNavigate()

  const load = async () => {
    const { data } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false })
    setComplaints(data || [])
  }

  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    const form = e.target
    setMsg('')
    const { data: { user } } = await supabase.auth.getUser()

    let photo_url = null
    if (photo) {
      const path = `${user.id}/${Date.now()}-${photo.name}`
      const { error: upErr } = await supabase.storage
        .from('complaint-photos')
        .upload(path, photo)
      if (upErr) return setMsg(upErr.message)
      photo_url = supabase.storage.from('complaint-photos').getPublicUrl(path).data.publicUrl
    }

    const { error } = await supabase
      .from('complaints')
      .insert({ tenant_id: user.id, category, description, photo_url })
    if (error) return setMsg(error.message)

    form.reset()
    setDescription('')
    setPhoto(null)
    setMsg('Complaint raised!')
    load()
  }

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div style={{ maxWidth: 600, margin: '30px auto', padding: 10 }}>
      <h2>Tenant Dashboard</h2>
      <button onClick={logout}>Logout</button>
            <PayMaintenance />

      <form onSubmit={submit} style={{ display: 'grid', gap: 10, margin: '20px 0' }}>
        <h3>Raise a complaint</h3>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>Plumbing</option>
          <option>Electrical</option>
          <option>WiFi</option>
          <option>Cleaning</option>
          <option>Other</option>
        </select>
        <textarea placeholder="Describe the problem" onChange={(e) => setDescription(e.target.value)} required />
        <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} />
        <button>Submit</button>
        {msg && <p>{msg}</p>}
      </form>

      <h3>My complaints</h3>
      {complaints.length === 0 && <p>No complaints yet.</p>}
      {complaints.map((c) => (
        <div key={c.id} style={{ border: '1px solid #888', padding: 10, marginBottom: 10 }}>
          <b>{c.category}</b> - <i>{c.status}</i>
          <p>{c.description}</p>
          {c.photo_url && <img src={c.photo_url} alt="complaint" width="150" />}
          <small>{new Date(c.created_at).toLocaleString()}</small>
        </div>
      ))}
    </div>
  )
}
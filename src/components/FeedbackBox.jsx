import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function FeedbackBox({ complaintId, existing, onDone }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [msg, setMsg] = useState('')

  if (existing) {
    return (
      <div>
        <p style={{ color: '#c9a24d', fontSize: '1.3rem', margin: 0 }}>
          {'★'.repeat(existing.rating)}{'☆'.repeat(5 - existing.rating)}
        </p>
        {existing.comment && <small>"{existing.comment}"</small>}
      </div>
    )
  }

  const submit = async () => {
    if (!rating) return setMsg('Please pick a star rating')
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('feedback').insert({
      complaint_id: complaintId,
      tenant_id: user.id,
      rating,
      comment,
    })
    if (error) return setMsg(error.message)
    onDone()
  }

  return (
    <div style={{ marginTop: 10 }}>
      <p style={{ margin: 0 }}>How was the service?</p>
      <div>
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            onClick={() => setRating(n)}
            style={{ cursor: 'pointer', fontSize: '1.8rem', color: '#c9a24d' }}
          >
            {n <= rating ? '★' : '☆'}
          </span>
        ))}
      </div>
      <textarea
        placeholder="Any comments? (optional)"
        onChange={(e) => setComment(e.target.value)}
        style={{ minHeight: 60, margin: '8px 0' }}
      />
      <button onClick={submit}>Submit feedback</button>
      {msg && <p>{msg}</p>}
    </div>
  )
}
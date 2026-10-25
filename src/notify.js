import { supabase } from './supabaseClient'

export async function notifyTenant(complaintId) {
  const { data: { session } } = await supabase.auth.getSession()
  fetch('/api/notify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ complaintId }),
  })
}
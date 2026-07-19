import { createClient } from '@supabase/supabase-js'

// Server-only: these env vars are never prefixed with NEXT_PUBLIC_,
// so Next.js never bundles them into client-side JS.
function isAuthorized(req) {
  const provided = req.headers['x-admin-password']
  return Boolean(provided) && Boolean(process.env.ADMIN_PASSWORD) && provided === process.env.ADMIN_PASSWORD
}

export default async function handler(req, res) {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('beta_applications')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'PATCH') {
    const { id, status } = req.body || {}
    if (!id || !status) return res.status(400).json({ error: 'id and status required' })
    const { data, error } = await supabase
      .from('beta_applications')
      .update({ status })
      .eq('id', id)
      .select()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  return res.status(405).end()
}

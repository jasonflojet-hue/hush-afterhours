import { createClient } from '@supabase/supabase-js'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

const SUPABASE_URL = 'https://xhwsegndtbsukkrejzkp.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhod3NlZ25kdGJzdWtrcmVqemtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNjA1MDksImV4cCI6MjA5MDgzNjUwOX0.7i6YGjkLSmBSFrNQcLmzED28amp-AZvE4705Sgu3bYA'

// avatar_url itself is harmless for a client to set directly, but the
// account_status transition (-> avatar_complete) is a protected column, so
// this goes through a server route like the rest of the pipeline. Avatar
// creation stays open to everyone during beta (per avatar.js's existing
// "optional beta feature" framing) -- we only flip status forward if the
// member had actually been approved first; otherwise we just save the URL.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const supabase = createPagesServerClient({ req, res, supabaseUrl: SUPABASE_URL, supabaseKey: SUPABASE_ANON_KEY })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return res.status(401).json({ error: 'Not authenticated' })

  const { avatar_url } = req.body || {}
  if (!avatar_url || typeof avatar_url !== 'string') {
    return res.status(400).json({ error: 'avatar_url required' })
  }

  const supabaseAdmin = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  const { data: profile, error: fetchError } = await supabaseAdmin
    .from('profiles')
    .select('account_status')
    .eq('id', session.user.id)
    .single()
  if (fetchError) return res.status(500).json({ error: fetchError.message })

  const update = { avatar_url }
  if (profile.account_status === 'approved') {
    update.account_status = 'avatar_complete'
  }

  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update(update)
    .eq('id', session.user.id)

  if (updateError) return res.status(500).json({ error: updateError.message })

  res.status(200).json({ ok: true, account_status: update.account_status || profile.account_status })
}

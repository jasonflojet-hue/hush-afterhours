import { createClient } from '@supabase/supabase-js'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

const SUPABASE_URL = 'https://xhwsegndtbsukkrejzkp.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhod3NlZ25kdGJzdWtrcmVqemtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNjA1MDksImV4cCI6MjA5MDgzNjUwOX0.7i6YGjkLSmBSFrNQcLmzED28amp-AZvE4705Sgu3bYA'

// The browser uploads the ID file directly to the private id-documents
// bucket (its own per-user RLS already restricts that to their own
// folder). This route just records the resulting path and advances
// account_status -- both protected columns the client can't write
// directly, so this server route is the only path from awaiting_id/
// needs_info into pending_review.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const supabase = createPagesServerClient({ req, res, supabaseUrl: SUPABASE_URL, supabaseKey: SUPABASE_ANON_KEY })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return res.status(401).json({ error: 'Not authenticated' })

  const { path } = req.body || {}
  if (!path || typeof path !== 'string') return res.status(400).json({ error: 'Missing document path' })

  // Make sure the path actually belongs to this user's own folder --
  // defense in depth even though storage RLS already enforces this on
  // upload.
  if (!path.startsWith(`${session.user.id}/`)) {
    return res.status(403).json({ error: 'Invalid document path' })
  }

  const supabaseAdmin = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('account_status')
    .eq('id', session.user.id)
    .single()

  if (profileError) return res.status(500).json({ error: profileError.message })

  if (!['awaiting_id', 'needs_info'].includes(profile.account_status)) {
    return res.status(400).json({ error: `Can't submit ID from status "${profile.account_status}".` })
  }

  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({
      id_document_path: path,
      id_submitted_at: new Date().toISOString(),
      account_status: 'pending_review',
      review_notes: null,
    })
    .eq('id', session.user.id)

  if (updateError) return res.status(500).json({ error: updateError.message })

  res.status(200).json({ ok: true, account_status: 'pending_review' })
}

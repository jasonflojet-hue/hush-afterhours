import { createClient } from '@supabase/supabase-js'

// Hardcoded to the correct project for the same reason as every other API
// route -- see lib/supabase.js.
const SUPABASE_URL = 'https://xhwsegndtbsukkrejzkp.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhod3NlZ25kdGJzdWtrcmVqemtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNjA1MDksImV4cCI6MjA5MDgzNjUwOX0.7i6YGjkLSmBSFrNQcLmzED28amp-AZvE4705Sgu3bYA'

// Lets a verified member browse other members. profiles has RLS locked to
// `auth.uid() = id` (own row only -- see users_select_own_profile policy),
// so there is no way for the client to query anyone else's row directly.
// This route is the only path: it verifies the requester's own token +
// their own account_status server-side (via the service-role key), then
// hands back a curated, safe subset of fields for everyone else who
// qualifies to be browsed. Never returns email, phone, id_document_path,
// review_notes, or raw birth_date (age is computed instead).
//
// Gating (per product decision 7/31/26): anyone with account_status
// 'approved' or 'avatar_complete' is browsable -- avatar is a nice-to-have,
// not required to appear. Viewing the directory requires that same bar:
// you have to be approved yourself before you can see other members.
const VISIBLE_STATUSES = ['approved', 'avatar_complete']

function calcAge(birthDateStr) {
  if (!birthDateStr) return null
  const bd = new Date(birthDateStr)
  if (Number.isNaN(bd.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - bd.getFullYear()
  const monthDiff = today.getMonth() - bd.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < bd.getDate())) age--
  return age
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ error: 'Not authenticated' })

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  const { data: { user }, error: userError } = await supabase.auth.getUser(token)
  if (userError || !user) return res.status(401).json({ error: 'Not authenticated' })

  const supabaseAdmin = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  const { data: me, error: meError } = await supabaseAdmin
    .from('profiles')
    .select('account_status')
    .eq('id', user.id)
    .single()

  if (meError) return res.status(500).json({ error: meError.message })

  if (!VISIBLE_STATUSES.includes(me.account_status)) {
    return res.status(403).json({ error: 'not_approved', account_status: me.account_status })
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, display_name, headline, about_me, pronouns, city, state, birth_date, photo_urls, avatar_url, orientation_tags, looking_for, interested_in, relationship_status')
    .in('account_status', VISIBLE_STATUSES)
    .neq('id', user.id)
    .order('display_name', { ascending: true })

  if (error) return res.status(500).json({ error: error.message })

  const members = (data || [])
    .filter((m) => m.display_name) // skip anyone who never finished a profile
    .map(({ birth_date, ...rest }) => ({ ...rest, age: calcAge(birth_date) }))

  res.status(200).json({ members })
}

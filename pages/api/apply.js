import { createClient } from '@supabase/supabase-js'

// Hardcoded to the correct project (xhwsegndtbsukkrejzkp) for the same
// reason as pages/api/waitlist.js — see that file for the full note.
const SUPABASE_URL = 'https://xhwsegndtbsukkrejzkp.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhod3NlZ25kdGJzdWtrcmVqemtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNjA1MDksImV4cCI6MjA5MDgzNjUwOX0.7i6YGjkLSmBSFrNQcLmzED28amp-AZvE4705Sgu3bYA'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, email, is_18 } = req.body || {}
  if (!email || !name) return res.status(400).json({ error: 'Name and email required' })
  if (!is_18) return res.status(400).json({ error: 'You must confirm you are 18 or older to apply.' })

  const nameParts = String(name).trim().split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const { error: dbError } = await supabase.from('beta_applications').insert({
      first_name: firstName,
      last_name: lastName,
      email: String(email).trim().toLowerCase(),
      is_18: true,
      status: 'pending',
    })

    if (dbError) {
      if (dbError.code === '23505') {
        return res.status(200).json({ success: true, alreadyApplied: true })
      }
      throw dbError
    }

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Apply error:', error)
    res.status(500).json({ error: 'Something went wrong' })
  }
}

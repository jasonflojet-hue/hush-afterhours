import { createClient } from '@supabase/supabase-js'

// Hardcoded to the correct project (xhwsegndtbsukkrejzkp) — same reason as
// pages/api/waitlist.js, apply.js, and stripe/webhook.js. Vercel's
// NEXT_PUBLIC_SUPABASE_URL/ANON_KEY are still pointed at a different,
// orphaned project (zwdixbqnrvjpirjeurdg), which is what every client-side
// auth/db call in the app goes through via this file — so this was the
// actual root cause of the earlier signup/login issues, not just the two
// routes patched individually before this. Safe to hardcode: this is the
// anon key, meant to be public.
const supabaseUrl = 'https://xhwsegndtbsukkrejzkp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhod3NlZ25kdGJzdWtrcmVqemtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNjA1MDksImV4cCI6MjA5MDgzNjUwOX0.7i6YGjkLSmBSFrNQcLmzED28amp-AZvE4705Sgu3bYA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

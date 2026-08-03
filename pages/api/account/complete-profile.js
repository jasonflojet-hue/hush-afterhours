import { createClient } from '@supabase/supabase-js'

// Hardcoded to the correct project for the same reason as every other API
// route tonight — see lib/supabase.js.
const SUPABASE_URL = 'https://xhwsegndtbsukkrejzkp.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhod3NlZ25kdGJzdWtrcmVqemtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNjA1MDksImV4cCI6MjA5MDgzNjUwOX0.7i6YGjkLSmBSFrNQcLmzED28amp-AZvE4705Sgu3bYA'

// Called by profile.js right after a profile completion save. Advances
// pending_verification -> awaiting_id and sends the welcome / "please
// upload ID" email -- but only once, and only once email is actually
// confirmed. account_status is a protected column (see migration
// protect_account_status_columns) so this can ONLY be written here, via
// the service-role key, never directly from the browser.
//
// NOTE: this app's client (lib/supabase.js) uses the plain supabase-js
// createClient(), which keeps the session in localStorage, not in cookies.
// createPagesServerClient() (auth-helpers) can only read a session from
// cookies, so it always came back null here -- every call silently 401'd
// and profile.js didn't check response.ok before redirecting on, which is
// exactly why this was never caught until a real live test. Fixed by
// passing the access token explicitly and verifying it server-side instead.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ error: 'Not authenticated' })

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  const { data: { user }, error: userError } = await supabase.auth.getUser(token)
  if (userError || !user) return res.status(401).json({ error: 'Not authenticated' })

  if (!user.email_confirmed_at) {
    return res.status(200).json({ ok: true, skipped: 'email_not_confirmed' })
  }

  const supabaseAdmin = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('account_status, display_name')
    .eq('id', user.id)
    .single()

  if (profileError) return res.status(500).json({ error: profileError.message })

  // Idempotent: only fires on the pending_verification -> awaiting_id edge.
  if (profile.account_status !== 'pending_verification') {
    return res.status(200).json({ ok: true, skipped: 'already_progressed', account_status: profile.account_status })
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hushafterhours.live'

  if (RESEND_API_KEY) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Hush After Hours <sales@hushafterhours.com>',
        to: user.email,
        subject: 'Welcome to Hush After Hours — one more step',
        html: `
          <div style="background:#05030a;color:#f8f4ff;font-family:Helvetica,sans-serif;padding:40px;max-width:520px;margin:0 auto">
            <img src="https://hushafterhours.live/hush-logo.png" alt="Hush" style="width:120px;margin-bottom:24px" />
            <h1 style="font-size:26px;font-weight:400;margin-bottom:16px;color:#f8f4ff">Welcome to Hush After Hours.</h1>
            <p style="color:#c9c2d6;line-height:1.8;margin-bottom:16px">
              Your application has been received.
            </p>
            <p style="color:#c9c2d6;line-height:1.8;margin-bottom:16px">
              Because Hush is a private members club, we verify every applicant. Please upload proof that you are 18+ (a government-issued ID). You may cover sensitive details like your ID number, as long as your name, photo, and date of birth remain visible.
            </p>
            <a href="${siteUrl}/profile" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#ff2d9b,#9b4dca);color:#fff;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;text-decoration:none;border-radius:4px;margin-top:8px">Upload ID →</a>
            <p style="color:#666680;font-size:12px;margin-top:24px">Your application is now Pending Review.</p>
            <p style="color:#333355;font-size:11px;margin-top:32px">© 2026 KontraBand Entertainment LLC · hushafterhours.live</p>
          </div>
        `,
      }),
    })
  }

  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({ account_status: 'awaiting_id', welcome_email_sent_at: new Date().toISOString() })
    .eq('id', user.id)

  if (updateError) return res.status(500).json({ error: updateError.message })

  res.status(200).json({ ok: true, account_status: 'awaiting_id' })
}

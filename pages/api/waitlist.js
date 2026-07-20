import { createClient } from '@supabase/supabase-js'

// Hardcoded to the correct project (xhwsegndtbsukkrejzkp). Vercel's
// NEXT_PUBLIC_SUPABASE_URL/ANON_KEY are currently pointed at a different,
// orphaned project, so this route doesn't depend on that dashboard value at
// all — it works regardless of what's set there. The anon key below is
// meant to be public (it's already inlined into every browser bundle site-
// wide); it's safe to keep in server code, unlike a service-role key.
const SUPABASE_URL = 'https://xhwsegndtbsukkrejzkp.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhod3NlZ25kdGJzdWtrcmVqemtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNjA1MDksImV4cCI6MjA5MDgzNjUwOX0.7i6YGjkLSmBSFrNQcLmzED28amp-AZvE4705Sgu3bYA'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, name } = req.body || {}
  if (!email) return res.status(400).json({ error: 'Email required' })

  const RESEND_API_KEY = process.env.RESEND_API_KEY

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const { error: dbError } = await supabase
      .from('waitlist')
      .insert({ email, name, created_at: new Date().toISOString() })

    if (dbError && dbError.code !== '23505') {
      // 23505 = unique violation (already on the waitlist) — treat as success,
      // not a hard failure, since the visitor's intent is already satisfied.
      throw dbError
    }

    if (RESEND_API_KEY) {
      // Confirmation to the visitor. No "VIP for life" / founding-member
      // framing here — that offer was explicitly removed, see Stripe brief.
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Hush After Hours <sales@hushafterhours.com>',
          to: email,
          subject: "You're on the Hush waitlist.",
          html: `
            <div style="background:#05030a;color:#f8f4ff;font-family:Helvetica,sans-serif;padding:40px;max-width:520px;margin:0 auto">
              <img src="https://hushafterhours.live/hush-logo.png" alt="Hush" style="width:120px;margin-bottom:24px" />
              <h1 style="font-size:28px;font-weight:400;margin-bottom:12px;color:#f8f4ff">You're on the list.</h1>
              <p style="color:#8888aa;line-height:1.8;margin-bottom:20px">
                ${name ? `Hey ${name}, w` : 'W'}e received your request for access to Hush After Hours.<br><br>
                Our team reviews every application personally. We'll be in touch within 24–48 hours with next steps.
              </p>
              <a href="https://hushafterhours.live/apply" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#ff2d9b,#9b4dca);color:#fff;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;text-decoration:none;border-radius:4px;margin-top:8px">Complete Your Application →</a>
              <p style="color:#333355;font-size:11px;margin-top:32px">© 2026 KontraBand Entertainment LLC · hushafterhours.live</p>
            </div>
          `,
        }),
      })

      // Internal alert to Jason
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Hush System <sales@hushafterhours.com>',
          to: 'jasonflojet@gmail.com',
          subject: `New waitlist signup: ${email}`,
          html: `
            <div style="font-family:Helvetica,sans-serif;padding:24px;max-width:480px">
              <h2 style="color:#ff2d9b">New Waitlist Signup</h2>
              <p><strong>Name:</strong> ${name || 'Not provided'}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
          `,
        }),
      })
    }

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Waitlist error:', error)
    res.status(500).json({ error: 'Something went wrong' })
  }
}

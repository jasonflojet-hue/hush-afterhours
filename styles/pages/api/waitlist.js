export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, name } = req.body
  if (!email) return res.status(400).json({ error: 'Email required' })

  const RESEND_API_KEY = process.env.RESEND_API_KEY

  try {
    // Save to Supabase
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    await supabase.from('waitlist').insert({ email, name, created_at: new Date().toISOString() })

    if (RESEND_API_KEY) {
      // Confirmation to user
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
              <div style="border-left:2px solid #ff2d9b;padding:12px 20px;margin:24px 0;background:rgba(255,45,155,0.06)">
                <p style="color:#ffc200;font-size:13px;margin:0;font-weight:600">FOUNDING MEMBER STATUS</p>
                <p style="color:#ccccdd;font-size:13px;margin:8px 0 0">As a beta member, you'll receive VIP status for life. First wave in gets the best access.</p>
              </div>
              <a href="https://hushafterhours.live/apply" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#ff2d9b,#9b4dca);color:#fff;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;text-decoration:none;border-radius:4px;margin-top:8px">Complete Your Application →</a>
              <p style="color:#333355;font-size:11px;margin-top:32px">© 2026 KontraBand Entertainment LLC · hushafterhours.live</p>
            </div>
          `
        })
      })

      // Alert to Jason
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Hush System <sales@hushafterhours.com>',
          to: 'jasonflojet@gmail.com',
          subject: `🔥 New waitlist signup: ${email}`,
          html: `
            <div style="font-family:Helvetica,sans-serif;padding:24px;max-width:480px">
              <h2 style="color:#ff2d9b">New Waitlist Signup</h2>
              <p><strong>Name:</strong> ${name || 'Not provided'}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <hr style="border-color:#eee;margin:16px 0"/>
              <a href="https://hushafterhours.live" style="color:#ff2d9b">View Dashboard →</a>
            </div>
          `
        })
      })
    }

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Waitlist error:', error)
    res.status(500).json({ error: 'Something went wrong' })
  }
}

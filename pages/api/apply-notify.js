export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { first_name, email } = req.body
  const RESEND_API_KEY = process.env.RESEND_API_KEY
  if (!RESEND_API_KEY) return res.status(200).json({ success: true })

  try {
    // Confirmation to applicant
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Hush After Hours <sales@hushafterhours.com>',
        to: email,
        subject: 'Application received — Hush After Hours',
        html: `
          <div style="background:#05030a;color:#f8f4ff;font-family:Helvetica,sans-serif;padding:40px;max-width:520px;margin:0 auto">
            <img src="https://hushafterhours.live/hush-logo.png" alt="Hush" style="width:120px;margin-bottom:24px" />
            <h1 style="font-size:26px;font-weight:400;margin-bottom:12px">Application received.</h1>
            <p style="color:#8888aa;line-height:1.8;margin-bottom:20px">
              Hey ${first_name},<br><br>
              Your application to Hush After Hours has been received. Our team reviews every application personally — you'll hear back from us within 24–48 hours.
            </p>
            <div style="border-left:2px solid #ffc200;padding:12px 20px;margin:24px 0;background:rgba(255,194,0,0.06)">
              <p style="color:#ffc200;font-size:13px;margin:0;font-weight:600">WHAT HAPPENS NEXT</p>
              <p style="color:#ccccdd;font-size:13px;margin:8px 0 0;line-height:1.6">We review your application. If approved, you'll receive an invitation to create your avatar and access the lounge. Founding members receive VIP status for life.</p>
            </div>
            <p style="color:#555577;font-size:12px;margin-top:32px">© 2026 KontraBand Entertainment LLC · hushafterhours.live</p>
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
        subject: `🎯 New application: ${first_name} (${email})`,
        html: `
          <div style="font-family:Helvetica,sans-serif;padding:24px;max-width:480px">
            <h2 style="color:#ff2d9b">New Beta Application</h2>
            <p><strong>Name:</strong> ${first_name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <hr style="border-color:#eee;margin:16px 0"/>
            <a href="https://supabase.com" style="color:#ff2d9b">View in Supabase →</a>
          </div>
        `
      })
    })

    res.status(200).json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Email failed' })
  }
}

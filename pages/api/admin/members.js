import { createClient } from '@supabase/supabase-js'

// Same server-only password pattern as pages/api/admin/signups.js.
function isAuthorized(req) {
  const provided = req.headers['x-admin-password']
  return Boolean(provided) && Boolean(process.env.ADMIN_PASSWORD) && provided === process.env.ADMIN_PASSWORD
}

const SUPABASE_URL = 'https://xhwsegndtbsukkrejzkp.supabase.co'

export default async function handler(req, res) {
  if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' })

  const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, birth_date, gender, city, state, photo_urls, id_document_path, account_status, id_submitted_at, review_notes, reviewed_at, created_at')
      .in('account_status', ['pending_review', 'needs_info', 'approved', 'declined'])
      .order('id_submitted_at', { ascending: true })

    if (error) return res.status(500).json({ error: error.message })

    // Signed URLs for the private ID documents -- 10 minute expiry, only
    // generated here via the service-role key, never exposed as a public URL.
    const withSignedUrls = await Promise.all(
      (data || []).map(async (row) => {
        if (!row.id_document_path) return { ...row, id_document_signed_url: null }
        const { data: signed } = await supabase.storage
          .from('id-documents')
          .createSignedUrl(row.id_document_path, 600)
        return { ...row, id_document_signed_url: signed?.signedUrl || null }
      })
    )

    return res.status(200).json(withSignedUrls)
  }

  if (req.method === 'PATCH') {
    const { id, decision, notes } = req.body || {}
    if (!id || !['approved', 'declined', 'needs_info'].includes(decision)) {
      return res.status(400).json({ error: 'id and a valid decision are required' })
    }

    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('id_document_path')
      .eq('id', id)
      .single()
    if (fetchError) return res.status(500).json({ error: fetchError.message })

    const { data: userRes, error: userError } = await supabase.auth.admin.getUserById(id)
    if (userError) return res.status(500).json({ error: userError.message })
    const email = userRes?.user?.email

    const nextStatus = decision // 'approved' | 'declined' | 'needs_info'

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        account_status: nextStatus,
        review_notes: notes || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) return res.status(500).json({ error: updateError.message })

    // Default: delete the ID image once a final decision (approved/declined)
    // is made -- minimizes how long sensitive ID images are retained.
    // Kept on needs_info since the applicant will be re-reviewed.
    if (['approved', 'declined'].includes(decision) && profile.id_document_path) {
      await supabase.storage.from('id-documents').remove([profile.id_document_path])
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hushafterhours.live'

    if (RESEND_API_KEY && email) {
      let subject, html
      if (decision === 'approved') {
        subject = "You've been selected — welcome to Hush After Hours"
        html = `
          <div style="background:#05030a;color:#f8f4ff;font-family:Helvetica,sans-serif;padding:40px;max-width:520px;margin:0 auto">
            <img src="https://hushafterhours.live/hush-logo.png" alt="Hush" style="width:120px;margin-bottom:24px" />
            <h1 style="font-size:26px;font-weight:400;margin-bottom:16px;color:#f8f4ff">Congratulations!</h1>
            <p style="color:#c9c2d6;line-height:1.8;margin-bottom:16px">
              You've been selected as a founding member of Hush After Hours. The club opens soon.
            </p>
            <p style="color:#c9c2d6;line-height:1.8;margin-bottom:16px">
              Your next step is to create your photorealistic avatar so you're ready to walk into the club on opening day.
            </p>
            <a href="${siteUrl}/avatar" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#ff2d9b,#9b4dca);color:#fff;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;text-decoration:none;border-radius:4px;margin-top:8px">Create My Avatar →</a>
            <p style="color:#333355;font-size:11px;margin-top:32px">© 2026 KontraBand Entertainment LLC · hushafterhours.live</p>
          </div>
        `
      } else if (decision === 'needs_info') {
        subject = 'A quick follow-up on your Hush application'
        html = `
          <div style="background:#05030a;color:#f8f4ff;font-family:Helvetica,sans-serif;padding:40px;max-width:520px;margin:0 auto">
            <img src="https://hushafterhours.live/hush-logo.png" alt="Hush" style="width:120px;margin-bottom:24px" />
            <h1 style="font-size:24px;font-weight:400;margin-bottom:16px;color:#f8f4ff">We need one more thing.</h1>
            <p style="color:#c9c2d6;line-height:1.8;margin-bottom:16px">${notes || 'Please re-submit a clearer photo of your ID.'}</p>
            <a href="${siteUrl}/profile" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#ff2d9b,#9b4dca);color:#fff;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;text-decoration:none;border-radius:4px;margin-top:8px">Resubmit →</a>
            <p style="color:#333355;font-size:11px;margin-top:32px">© 2026 KontraBand Entertainment LLC · hushafterhours.live</p>
          </div>
        `
      } else {
        subject = 'Your Hush After Hours application'
        html = `
          <div style="background:#05030a;color:#f8f4ff;font-family:Helvetica,sans-serif;padding:40px;max-width:520px;margin:0 auto">
            <img src="https://hushafterhours.live/hush-logo.png" alt="Hush" style="width:120px;margin-bottom:24px" />
            <h1 style="font-size:24px;font-weight:400;margin-bottom:16px;color:#f8f4ff">Thank you for applying.</h1>
            <p style="color:#c9c2d6;line-height:1.8;margin-bottom:16px">
              We weren't able to approve your application at this time.${notes ? ` ${notes}` : ''}
            </p>
            <p style="color:#333355;font-size:11px;margin-top:32px">© 2026 KontraBand Entertainment LLC · hushafterhours.live</p>
          </div>
        `
      }

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'Hush After Hours <sales@hushafterhours.com>', to: email, subject, html }),
      })
    }

    return res.status(200).json({ ok: true, account_status: nextStatus })
  }

  return res.status(405).end()
}

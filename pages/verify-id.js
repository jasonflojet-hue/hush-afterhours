import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Nav from '../components/Nav'
import { supabase } from '../lib/supabase'
import styles from '../styles/VerifyId.module.css'

const STATUS_CONFIG = {
  pending_verification: {
    badge: 'Confirm your email',
    color: '#e8a13f',
    message: 'Please confirm your email first — check your inbox for the link we sent when you signed up.',
  },
  awaiting_id: {
    badge: 'Action needed',
    color: '#e8a13f',
    message: "Hush is a private members club, so we verify every applicant. Upload a government-issued ID that shows your name, photo, and date of birth — you're welcome to cover your ID number.",
    showUpload: true,
  },
  pending_review: {
    badge: 'Pending review',
    color: '#c9a96e',
    message: "Your ID has been submitted. Our team reviews every applicant personally — we'll email you as soon as there's a decision.",
  },
  needs_info: {
    badge: 'More info needed',
    color: '#e8a13f',
    message: 'Our team needs a clearer or different ID photo before we can continue.',
    showUpload: true,
  },
  declined: {
    badge: 'Application declined',
    color: '#e24b4a',
    message: "We weren't able to approve your application at this time.",
  },
  approved: {
    badge: "You're in",
    color: '#7ed9a8',
    message: "Congratulations — you've been selected as a founding member of Hush After Hours. The club opens soon. Your next step is to create your photorealistic avatar so you're ready to walk in on opening day.",
    showAvatarCta: true,
  },
  avatar_complete: {
    badge: 'All set',
    color: '#7ed9a8',
    message: "You're fully set up. See you at Hush.",
    showLoungeCta: true,
  },
}

export default function VerifyId() {
  const router = useRouter()
  const fileInputRef = useRef(null)
  const [session, setSession] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [status, setStatus] = useState(null)
  const [reviewNotes, setReviewNotes] = useState(null)
  const [loading, setLoading] = useState(true)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthChecked(true)
      if (!session) router.push('/login?next=/verify-id')
    })
  }, [])

  useEffect(() => {
    if (!session) return
    loadStatus()
  }, [session])

  const loadStatus = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('account_status, review_notes')
      .eq('id', session.user.id)
      .single()
    if (data) {
      setStatus(data.account_status)
      setReviewNotes(data.review_notes)
    }
    setLoading(false)
  }

  const handleFilePick = (e) => {
    const f = e.target.files?.[0]
    setError('')
    if (!f) return
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowed.includes(f.type)) {
      setError('Please upload a JPG, PNG, WEBP, or PDF.')
      return
    }
    if (f.size > 8 * 1024 * 1024) {
      setError('File must be under 8MB.')
      return
    }
    setFile(f)
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError('')

    const ext = file.name.split('.').pop()
    const path = `${session.user.id}/id-${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('id-documents')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setUploading(false)
      setError('Something went wrong uploading that file. Please try again.')
      return
    }

    const res = await fetch('/api/account/submit-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    })

    setUploading(false)

    if (!res.ok) {
      setError('Your file uploaded, but we couldn\'t record it. Please try again.')
      return
    }

    setFile(null)
    setStatus('pending_review')
  }

  if (!authChecked || loading) {
    return (
      <>
        <Nav />
        <main className={styles.main}>
          <div className={styles.hero}><p className={styles.sub}>Loading…</p></div>
        </main>
      </>
    )
  }

  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending_verification

  return (
    <>
      <Head><title>Verify Your Application — Hush Afterhours</title></Head>
      <Nav />
      <main className={styles.main}>
        <div className={styles.hero}>
          <span className="badge">Membership application</span>
          <h1 className={styles.title}>Almost there.</h1>
          <p className={styles.sub}>Every applicant is reviewed personally — this is a private club, not a public app.</p>
        </div>

        <div className={styles.wrap}>
          <div className={styles.card}>
            <span className={styles.statusBadge} style={{ background: `${cfg.color}22`, color: cfg.color, border: `0.5px solid ${cfg.color}55` }}>
              {cfg.badge}
            </span>
            <p className={styles.statusMsg}>{cfg.message}</p>

            {status === 'needs_info' && reviewNotes && (
              <div className={styles.notesBox}>
                <strong>Note from our team:</strong> {reviewNotes}
              </div>
            )}

            {cfg.showUpload && (
              <>
                <label className={styles.dropZone}>
                  {file ? file.name : 'Click to choose a file (JPG, PNG, WEBP, or PDF)'}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    style={{ display: 'none' }}
                    onChange={handleFilePick}
                  />
                </label>
                <button className={styles.uploadBtn} onClick={handleUpload} disabled={!file || uploading}>
                  {uploading ? 'Uploading…' : 'Submit ID'}
                </button>
                {error && <p className={styles.errorMsg}>{error}</p>}
                <p className={styles.hint}>
                  Stored privately and only visible to our review team. Never shown on your public profile.
                </p>
              </>
            )}

            {cfg.showAvatarCta && (
              <a href="/avatar" className={styles.ctaBtn}>Create My Avatar →</a>
            )}

            {cfg.showLoungeCta && (
              <a href="/lounge" className={styles.ctaBtn}>Enter the Lounge →</a>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

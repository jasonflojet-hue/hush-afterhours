import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Nav from '../components/Nav'
import { supabase } from '../lib/supabase'
import styles from '../styles/Profile.module.css'

const GENDER_OPTIONS = ['Woman', 'Man', 'Non-binary', 'Trans woman', 'Trans man', 'Genderfluid', 'Other']
const LOOKING_FOR_OPTIONS = [
  'Friendship', 'Casual dating', 'Something fun', 'Long-term relationship', 'Marriage', 'Not sure yet',
  'Just here for the drinks and music', 'Something awesome happening', 'Karaoke, jokes & open mic', 'Shop till I drop',
]
// Repurposed from a gender-preference field to club-activity interests --
// gender/orientation preference now lives in the richer Orientation & Vibe
// section below, so this no longer needs to duplicate that.
const INTERESTED_IN_OPTIONS = [
  'Hanging out with friends', 'Playing pool, darts & poker', 'Live music', 'Dancing to groovy music', 'Having a great time doing it all',
]
const RELATIONSHIP_STATUS_OPTIONS = ['Single', 'Divorced', 'Separated', 'Widowed', 'Married', 'Open Relationship', 'Prefer Not To Say']
const DISTANCE_OPTIONS = ['10 miles', '25 miles', '50 miles', '100 miles', 'Anywhere']
const MAX_PHOTOS = 5

// Orientation & Vibe -- additive, standalone neon section (see Profile.module.css
// .neonSection). Each tag has its own accent color driven via the --neon-color/
// --neon-glow CSS custom properties set inline per card.
const ORIENTATION_TAGS = [
  { key: 'lgbtq', label: 'LGBTQ+ / Queer', sub: 'Open / all inclusive', color: '#ff2d95', glow: 'rgba(255,45,149,0.55)', icon: 'rainbow' },
  { key: 'pineapple', label: 'Pineapple', sub: 'Swinger / open to play', color: '#e8c34a', glow: 'rgba(232,195,74,0.55)', icon: 'pineapple' },
  { key: 'straight_man', label: 'Straight Man', sub: '', color: '#3aa0ff', glow: 'rgba(58,160,255,0.55)', icon: 'man' },
  { key: 'straight_woman', label: 'Straight Woman', sub: '', color: '#ff2d95', glow: 'rgba(255,45,149,0.55)', icon: 'woman' },
  { key: 'gay_man', label: 'Gay Man', sub: '', color: '#3aa0ff', glow: 'rgba(58,160,255,0.55)', icon: 'gay_man' },
  { key: 'gay_woman', label: 'Gay Woman', sub: '', color: '#ff2d95', glow: 'rgba(255,45,149,0.55)', icon: 'gay_woman' },
  { key: 'bi_male', label: 'Bi Male', sub: 'Two men + one woman', color: '#b45cff', glow: 'rgba(180,92,255,0.55)', icon: 'bi_male' },
  { key: 'bi_female', label: 'Bi Female', sub: 'Two women + one man', color: '#b45cff', glow: 'rgba(180,92,255,0.55)', icon: 'bi_female' },
  { key: 'polyamorous', label: 'Polyamorous', sub: 'Loving more than one', color: '#b45cff', glow: 'rgba(180,92,255,0.55)', icon: 'poly' },
  { key: 'pansexual', label: 'Pansexual', sub: 'Attracted to all genders', color: '#ff6bd6', glow: 'rgba(255,107,214,0.55)', icon: 'pan' },
  { key: 'transgender', label: 'Transgender', sub: 'Trans man / trans woman', color: '#7c6cff', glow: 'rgba(124,108,255,0.55)', icon: 'trans' },
  { key: 'ask_me', label: 'Buy me a drink and ask', sub: '', color: '#ff2d95', glow: 'rgba(255,45,149,0.55)', icon: 'drink' },
]

function OrientationIcon({ id }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (id) {
    case 'man':
      return <svg viewBox="0 0 40 40" style={{ height: '100%' }}><g {...p}><circle cx="16" cy="25" r="9" /><line x1="22.5" y1="18.5" x2="31" y2="10" /><polyline points="23,10 31,10 31,18" /></g></svg>
    case 'woman':
      return <svg viewBox="0 0 40 40" style={{ height: '100%' }}><g {...p}><circle cx="20" cy="14" r="9" /><line x1="20" y1="23" x2="20" y2="34" /><line x1="14" y1="28" x2="26" y2="28" /></g></svg>
    case 'gay_man':
      return <svg viewBox="0 0 40 40" style={{ height: '100%' }}><g {...p}><circle cx="14" cy="26" r="8" /><circle cx="26" cy="26" r="8" /><line x1="9.5" y1="20.5" x2="4" y2="15" /><polyline points="4,20 4,15 9,15" /><line x1="30.5" y1="20.5" x2="36" y2="15" /><polyline points="31,15 36,15 36,20" /></g></svg>
    case 'gay_woman':
      return <svg viewBox="0 0 40 40" style={{ height: '100%' }}><g {...p}><circle cx="14" cy="15" r="8" /><circle cx="26" cy="15" r="8" /><line x1="14" y1="23" x2="14" y2="33" /><line x1="9" y1="28" x2="19" y2="28" /><line x1="26" y1="23" x2="26" y2="33" /><line x1="21" y1="28" x2="31" y2="28" /></g></svg>
    case 'bi_male':
      return <svg viewBox="0 0 56 40" style={{ height: '100%' }}><g {...p}><circle cx="12" cy="24" r="7" /><circle cx="24" cy="24" r="7" /><circle cx="38" cy="15" r="7" stroke="#ff2d95" /><line x1="17" y1="19" x2="12" y2="14" /><polyline points="12,19 12,14 17,14" /><line x1="29" y1="19" x2="34" y2="14" /><polyline points="29,14 34,14 34,19" /><line x1="38" y1="22" x2="38" y2="31" stroke="#ff2d95" /><line x1="34" y1="26" x2="42" y2="26" stroke="#ff2d95" /></g></svg>
    case 'bi_female':
      return <svg viewBox="0 0 56 40" style={{ height: '100%' }}><g {...p}><circle cx="12" cy="15" r="7" /><circle cx="24" cy="15" r="7" /><circle cx="38" cy="24" r="7" stroke="#3aa0ff" /><line x1="12" y1="22" x2="12" y2="31" /><line x1="8" y1="26" x2="16" y2="26" /><line x1="24" y1="22" x2="24" y2="31" /><line x1="20" y1="26" x2="28" y2="26" /><line x1="43" y1="19" x2="48" y2="14" stroke="#3aa0ff" /><polyline points="43,14 48,14 48,19" stroke="#3aa0ff" /></g></svg>
    case 'poly':
      return <svg viewBox="0 0 40 40" style={{ height: '100%' }}><g {...p}><path d="M20 15 C17 10 9 11 9 17 C9 24 20 30 20 30 C20 30 31 24 31 17 C31 11 23 10 20 15 Z" /><circle cx="12" cy="33" r="2.4" fill="currentColor" /><circle cx="20" cy="35" r="2.4" fill="currentColor" /><circle cx="28" cy="33" r="2.4" fill="currentColor" /></g></svg>
    case 'pan':
      return (
        <svg viewBox="0 0 40 40" style={{ height: '100%' }}>
          <defs><linearGradient id="panGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#ff2d95" /><stop offset="100%" stopColor="#3aa0ff" /></linearGradient></defs>
          <path d="M11 20 C11 14 19 14 20 20 C21 26 29 26 29 20 C29 14 21 14 20 20 C19 26 11 26 11 20 Z" fill="none" stroke="url(#panGrad)" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      )
    case 'trans':
      return (
        <svg viewBox="0 0 40 40" style={{ height: '100%' }}>
          <defs><linearGradient id="transGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3aa0ff" /><stop offset="50%" stopColor="#ff6bd6" /><stop offset="100%" stopColor="#7c6cff" /></linearGradient></defs>
          <g fill="none" stroke="url(#transGrad)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="20" cy="22" r="8" />
            <line x1="25.5" y1="16.5" x2="31" y2="11" /><polyline points="24,11 31,11 31,18" />
            <line x1="20" y1="30" x2="20" y2="36" /><line x1="16" y1="33" x2="24" y2="33" />
            <line x1="12.5" y1="16.5" x2="7" y2="11" /><line x1="7" y1="15" x2="7" y2="11" /><line x1="7" y1="11" x2="11" y2="11" />
          </g>
        </svg>
      )
    case 'drink':
      return <svg viewBox="0 0 40 40" style={{ height: '100%' }}><g {...p}><path d="M9 9 L20 22 L31 9 Z" /><line x1="20" y1="22" x2="20" y2="33" /><line x1="13" y1="33" x2="27" y2="33" /><circle cx="16" cy="12" r="2" fill="currentColor" /></g></svg>
    case 'pineapple':
      return (
        <svg viewBox="0 0 40 40" style={{ height: '100%' }}>
          <g fill="none" stroke="#5fae5f" strokeWidth="2.2" strokeLinecap="round">
            <path d="M20 13 L20 3 M16 10 L14 3 M24 10 L26 3 M13 12 L7 7 M27 12 L33 7" />
          </g>
          <ellipse cx="20" cy="25" rx="11" ry="13" fill="none" stroke="#e8c34a" strokeWidth="2.2" />
          <g stroke="#e8c34a" strokeWidth="1.4" opacity="0.8">
            <path d="M11 18 L29 32 M11 32 L29 18 M11 25 L29 25 M20 13 L20 37" fill="none" />
          </g>
        </svg>
      )
    case 'rainbow':
      return (
        <svg viewBox="0 0 40 40" style={{ height: '100%' }}>
          <g fill="none" strokeLinecap="round">
            <path d="M6 30 A14 14 0 0 1 34 30" stroke="#ff3b3b" strokeWidth="2.6" />
            <path d="M9 30 A11 11 0 0 1 31 30" stroke="#ff9f2d" strokeWidth="2.6" />
            <path d="M12 30 A8 8 0 0 1 28 30" stroke="#ffe22d" strokeWidth="2.6" />
            <path d="M15 30 A5 5 0 0 1 25 30" stroke="#3ad65c" strokeWidth="2.6" />
            <path d="M17.5 30 A2.5 2.5 0 0 1 22.5 30" stroke="#3aa0ff" strokeWidth="2.6" />
          </g>
          <line x1="20" y1="30" x2="20" y2="36" stroke="#f5f0e8" strokeWidth="1.6" />
        </svg>
      )
    default:
      return null
  }
}

const emptyForm = {
  display_name: '',
  birth_date: '',
  gender: [],
  pronouns: '',
  headline: '',
  about_me: '',
  looking_for: [],
  interested_in: [],
  preferred_min_age: 18,
  preferred_max_age: 99,
  distance_preference: '',
  relationship_status: '',
  city: '',
  state: '',
  country: '',
  mobile_phone: '',
  photo_urls: [],
  orientation_tags: [],
}

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

export default function Profile() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [wasComplete, setWasComplete] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const [uploadingSlot, setUploadingSlot] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthChecked(true)
      if (!session) router.push('/login?next=/profile')
    })
  }, [])

  useEffect(() => {
    if (!session) return
    loadProfile()
  }, [session])

  const loadProfile = async () => {
    setLoading(true)
    const { data, error: loadError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (!loadError && data) {
      setForm({
        display_name: data.display_name || '',
        birth_date: data.birth_date || '',
        gender: data.gender || [],
        pronouns: data.pronouns || '',
        headline: data.headline || '',
        about_me: data.about_me || '',
        looking_for: data.looking_for || [],
        interested_in: data.interested_in || [],
        preferred_min_age: data.preferred_min_age ?? 18,
        preferred_max_age: data.preferred_max_age ?? 99,
        distance_preference: data.distance_preference || '',
        relationship_status: data.relationship_status || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || '',
        mobile_phone: data.mobile_phone || '',
        photo_urls: data.photo_urls || [],
        orientation_tags: data.orientation_tags || [],
      })
      setWasComplete(Boolean(data.profile_complete))
    }
    setLoading(false)
  }

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const toggleChip = (key, value) => {
    setForm((f) => {
      const current = f[key] || []
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      return { ...f, [key]: next }
    })
  }

  const handlePhotoPick = async (e, slotIndex) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setPhotoError('')

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setPhotoError('Photos must be JPG, PNG, or WEBP.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Each photo must be under 5MB.')
      return
    }

    setUploadingSlot(slotIndex)
    const ext = file.name.split('.').pop()
    const path = `${session.user.id}/${Date.now()}-${slotIndex}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setUploadingSlot(null)
      setPhotoError('Something went wrong uploading that photo. Please try again.')
      return
    }

    const { data: urlData } = supabase.storage.from('profile-photos').getPublicUrl(path)
    setForm((f) => {
      const next = [...f.photo_urls]
      next[slotIndex] = urlData.publicUrl
      return { ...f, photo_urls: next.filter(Boolean).slice(0, MAX_PHOTOS) }
    })
    setUploadingSlot(null)
  }

  const handlePhotoRemove = (slotIndex) => {
    setForm((f) => {
      const next = [...f.photo_urls]
      next.splice(slotIndex, 1)
      return { ...f, photo_urls: next }
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.display_name.trim()) {
      setError('Display name is required.')
      return
    }
    if (!form.birth_date) {
      setError('Date of birth is required.')
      return
    }
    const age = calcAge(form.birth_date)
    if (age === null || age < 18) {
      setError('You must be 18 or older.')
      return
    }

    const isComplete = Boolean(
      form.display_name.trim() &&
      form.birth_date &&
      form.gender.length > 0 &&
      form.looking_for.length > 0 &&
      form.interested_in.length > 0
    )

    setSaving(true)
    // upsert (not update): a fresh signup should always have a profiles row
    // via the on_auth_user_created trigger, but upsert makes this
    // self-healing if that trigger ever fails to fire (as it did earlier
    // tonight after a project pause/restore lost the trigger entirely --
    // update() against a missing row matches 0 rows and returns no error,
    // which silently showed "Profile saved." while writing nothing).
    const { error: saveError } = await supabase
      .from('profiles')
      .upsert({
        id: session.user.id,
        display_name: form.display_name.trim(),
        birth_date: form.birth_date,
        gender: form.gender,
        pronouns: form.pronouns.trim(),
        headline: form.headline.trim(),
        about_me: form.about_me.trim(),
        looking_for: form.looking_for,
        interested_in: form.interested_in,
        preferred_min_age: form.preferred_min_age,
        preferred_max_age: form.preferred_max_age,
        distance_preference: form.distance_preference,
        relationship_status: form.relationship_status,
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
        mobile_phone: form.mobile_phone.trim(),
        photo_urls: form.photo_urls,
        orientation_tags: form.orientation_tags,
        profile_complete: isComplete,
      })

    setSaving(false)

    if (saveError) {
      if (saveError.code === '23505') {
        setError('That display name is already taken — try another.')
      } else {
        setError('Something went wrong saving your profile. Please try again.')
      }
      return
    }

    setWasComplete(isComplete)
    setSuccess('Profile saved.')
  }

  if (!authChecked || loading) {
    return (
      <>
        <Nav />
        <main className={styles.main}>
          <div className={styles.hero}>
            <p className={styles.sub}>Loading your profile…</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Head><title>My Profile — Hush Afterhours</title></Head>
      <Nav />
      <main className={styles.main}>
        <div className={styles.hero}>
          <span className="badge">Your profile</span>
          <h1 className={styles.title}>Tell us who you are.</h1>
          <p className={styles.sub}>
            This is what other approved members see. The more complete it is, the better your matches.
          </p>
        </div>

        <form onSubmit={handleSave} className={styles.form}>
          {!wasComplete && (
            <p className={styles.incompleteBanner}>
              Your profile isn't complete yet — fill in your name, birthday, gender, and what you're looking for to finish.
            </p>
          )}

          <div className={styles.section}>
            <p className={styles.sectionLabel}>Photos</p>
            <div className={styles.photoGrid}>
              {Array.from({ length: MAX_PHOTOS }).map((_, i) => {
                const url = form.photo_urls[i]
                return (
                  <label
                    key={i}
                    className={`${styles.photoSlot} ${url ? styles.photoSlotFilled : ''}`}
                  >
                    {url ? (
                      <>
                        <img src={url} alt={`Photo ${i + 1}`} />
                        {i === 0 && <span className={styles.photoPrimaryBadge}>Main</span>}
                        <button
                          type="button"
                          className={styles.photoRemoveBtn}
                          onClick={(e) => { e.preventDefault(); handlePhotoRemove(i) }}
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <>
                        {uploadingSlot === i ? '…' : '+'}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          style={{ display: 'none' }}
                          onChange={(e) => handlePhotoPick(e, i)}
                          disabled={uploadingSlot !== null}
                        />
                      </>
                    )}
                  </label>
                )
              })}
            </div>
            {photoError && <p className={styles.errorMsg}>{photoError}</p>}
            <p className={styles.photoNote}>
              Up to 5 photos. <strong>Sexy is great — this is a classy joint, so no nudity in profile pics, please.</strong> Your first photo is what members see first.
            </p>
          </div>

          <div className={styles.section}>
            <p className={styles.sectionLabel}>Basics</p>
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="display_name">Display name</label>
                <input
                  id="display_name"
                  type="text"
                  maxLength={30}
                  value={form.display_name}
                  onChange={(e) => set('display_name', e.target.value)}
                  placeholder="What members will see"
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="birth_date">Date of birth</label>
                <input
                  id="birth_date"
                  type="date"
                  value={form.birth_date}
                  onChange={(e) => set('birth_date', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className={styles.field}>
              <label htmlFor="pronouns">Pronouns</label>
              <input
                id="pronouns"
                type="text"
                maxLength={50}
                value={form.pronouns}
                onChange={(e) => set('pronouns', e.target.value)}
                placeholder="she/her, he/him, they/them…"
              />
            </div>
            <div className={styles.field}>
              <label>Gender</label>
              <div className={styles.chipWrap}>
                {GENDER_OPTIONS.map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    className={`${styles.chip} ${form.gender.includes(opt) ? styles.chipActive : ''}`}
                    onClick={() => toggleChip('gender', opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <p className={styles.sectionLabel}>About you</p>
            <div className={styles.field}>
              <label htmlFor="headline">Headline</label>
              <input
                id="headline"
                type="text"
                maxLength={150}
                value={form.headline}
                onChange={(e) => set('headline', e.target.value)}
                placeholder="One line that sums you up"
              />
              <p className={styles.charCount}>{form.headline.length}/150</p>
            </div>
            <div className={styles.field}>
              <label htmlFor="about_me">About me</label>
              <textarea
                id="about_me"
                value={form.about_me}
                onChange={(e) => set('about_me', e.target.value)}
                placeholder="Tell members a bit about yourself…"
              />
            </div>
          </div>

          <div className={styles.neonSection}>
            <p className={styles.neonSectionLabel}>Orientation & vibe</p>
            <p className={styles.neonSectionSub}>Optional — select all that apply. Only you can change this later.</p>
            <div className={styles.neonGrid}>
              {ORIENTATION_TAGS.map((tag) => {
                const active = form.orientation_tags.includes(tag.key)
                return (
                  <button
                    type="button"
                    key={tag.key}
                    className={`${styles.neonCard} ${active ? styles.neonCardActive : ''}`}
                    style={{ '--neon-color': tag.color, '--neon-glow': tag.glow }}
                    onClick={() => toggleChip('orientation_tags', tag.key)}
                  >
                    <span className={styles.neonCheck} />
                    <span className={styles.neonIcon} style={{ color: tag.color }}>
                      <OrientationIcon id={tag.icon} />
                    </span>
                    <p className={styles.neonLabel}>{tag.label}</p>
                    {tag.sub && <p className={styles.neonSubLabel}>{tag.sub}</p>}
                  </button>
                )
              })}
            </div>
          </div>

          <div className={styles.section}>
            <p className={styles.sectionLabel}>What you're looking for</p>
            <div className={styles.field}>
              <label>Looking for</label>
              <div className={styles.chipWrap}>
                {LOOKING_FOR_OPTIONS.map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    className={`${styles.chip} ${form.looking_for.includes(opt) ? styles.chipActive : ''}`}
                    onClick={() => toggleChip('looking_for', opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label>What you're into at Hush</label>
              <div className={styles.chipWrap}>
                {INTERESTED_IN_OPTIONS.map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    className={`${styles.chip} ${form.interested_in.includes(opt) ? styles.chipActive : ''}`}
                    onClick={() => toggleChip('interested_in', opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="preferred_min_age">Match age — min</label>
                <input
                  id="preferred_min_age"
                  type="number"
                  min={18}
                  max={99}
                  value={form.preferred_min_age}
                  onChange={(e) => set('preferred_min_age', Number(e.target.value))}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="preferred_max_age">Match age — max</label>
                <input
                  id="preferred_max_age"
                  type="number"
                  min={18}
                  max={99}
                  value={form.preferred_max_age}
                  onChange={(e) => set('preferred_max_age', Number(e.target.value))}
                />
              </div>
            </div>
            <div className={styles.field}>
              <label htmlFor="distance_preference">Distance</label>
              <select
                id="distance_preference"
                value={form.distance_preference}
                onChange={(e) => set('distance_preference', e.target.value)}
              >
                <option value="">No preference</option>
                {DISTANCE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="relationship_status">Relationship status</label>
              <select
                id="relationship_status"
                value={form.relationship_status}
                onChange={(e) => set('relationship_status', e.target.value)}
              >
                <option value="">Prefer not to say</option>
                {RELATIONSHIP_STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.section}>
            <p className={styles.sectionLabel}>Location & contact</p>
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="city">City</label>
                <input id="city" type="text" value={form.city} onChange={(e) => set('city', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label htmlFor="state">State</label>
                <input id="state" type="text" value={form.state} onChange={(e) => set('state', e.target.value)} />
              </div>
            </div>
            <div className={styles.field}>
              <label htmlFor="country">Country</label>
              <input id="country" type="text" value={form.country} onChange={(e) => set('country', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label htmlFor="mobile_phone">Mobile phone</label>
              <input
                id="mobile_phone"
                type="tel"
                value={form.mobile_phone}
                onChange={(e) => set('mobile_phone', e.target.value)}
                placeholder="For account security — not shown to other members"
              />
              <p className={styles.hint}>Used for login verification. Not shown on your public profile.</p>
            </div>
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}
          {success && <p className={styles.successMsg}>{success}</p>}

          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </main>
    </>
  )
}

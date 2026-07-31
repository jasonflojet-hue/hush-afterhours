import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Nav from '../components/Nav'
import { supabase } from '../lib/supabase'
import { ORIENTATION_TAGS, OrientationIcon } from '../components/OrientationTags'
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

// Orientation & Vibe tag list + icon set now live in components/OrientationTags.js
// so members.js (browse view) can share the exact same set instead of drifting.

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

    // First time completing the profile: kick off the welcome/ID-request
    // email + account_status advance. Fire-and-forget -- account_status is
    // a protected column the client can't write directly (see
    // protect_account_status_columns migration), this server route is the
    // only path. Not blocking the save success message on it.
    if (!wasComplete && isComplete) {
      fetch('/api/account/complete-profile', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
        .then(() => {
          // Brief pause so "Profile saved." is actually visible before we
          // move them on to the verification step.
          setTimeout(() => router.push('/verify-id'), 900)
        })
        .catch(() => {})
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

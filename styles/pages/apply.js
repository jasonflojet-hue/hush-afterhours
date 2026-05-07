import { useState } from 'react'
import Head from 'next/head'
import Nav from '../components/Nav'
import { supabase } from '../lib/supabase'

const LOOKING_FOR = ['Straight','Bisexual','Swinging','Ethical non-monogamy','Not sure','Anything goes','Possible long term','Friends','Friends with benefits','LGBTQ','Multi-partner interaction','Voyeurism','Sub','Dom','Foot Fetish','Cosplay','Just like a good rave']
const ENERGY = ['Chill','Social','Flirty','Reserved','Wild','Curious']

const inputStyle = {
  width: '100%', padding: '16px 20px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '16px', color: '#fff',
  fontFamily: 'Inter, sans-serif', fontSize: '0.9rem',
  outline: 'none'
}

const chipStyle = (active) => ({
  display: 'flex', alignItems: 'center', gap: '10px',
  padding: '10px 14px',
  background: active ? 'rgba(217,70,239,0.15)' : 'rgba(255,255,255,0.04)',
  border: `1px solid ${active ? 'rgba(217,70,239,0.5)' : 'rgba(255,255,255,0.08)'}`,
  borderRadius: '12px', cursor: 'pointer',
  color: active ? '#d946ef' : 'rgba(255,255,255,0.7)',
  fontSize: '0.82rem', transition: 'all 0.2s'
})

export default function Apply() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    birthday_month: '', birthday_day: '', birthday_year: '',
    gender: '', looking_for: [], vibe_description: '',
    respect_answer: '', energy: [], zip_code: '',
    newsletter: false, donation_amount: 0, photo_url: ''
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggle = (k, v) => setForm(f => ({
    ...f, [k]: f[k].includes(v) ? f[k].filter(i => i !== v) : [...f[k], v]
  }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const birthday = new Date(`${form.birthday_year}-${form.birthday_month}-${form.birthday_day}`)
    const age = Math.floor((Date.now() - birthday) / (365.25 * 24 * 60 * 60 * 1000))
    if (age < 18) { setError('You must be 18 or older to apply.'); setLoading(false); return }

    const { error: dbError } = await supabase.from('beta_applications').insert({
      first_name: form.first_name, last_name: form.last_name,
      email: form.email, phone: form.phone,
      birthday: `${form.birthday_year}-${form.birthday_month.padStart(2,'0')}-${form.birthday_day.padStart(2,'0')}`,
      gender: form.gender,
      looking_for: form.looking_for.join(', '),
      vibe_description: form.vibe_description,
      respect_answer: form.respect_answer,
      energy: form.energy.join(', '),
      zip_code: form.zip_code,
      newsletter: form.newsletter,
      donation_amount: form.donation_amount,
      photo_url: form.photo_url,
      status: 'pending'
    })

    if (dbError) {
      if (dbError.code === '23505') setError('This email has already been submitted.')
      else setError('Something went wrong. Please try again.')
      setLoading(false); return
    }
    setSubmitted(true); setLoading(false)
  }

  if (submitted) return (
    <>
      <Head><title>Application Received — Hush</title></Head>
      <Nav />
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 60px' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '24px' }}>◈</div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 300, marginBottom: '16px' }}>Application received</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: '40px' }}>
            Thank you, {form.first_name}. Your application is being reviewed personally. We'll be in touch at {form.email}.
          </p>
          <a href="/" className="btn-outline">Back to home</a>
        </div>
      </main>
    </>
  )

  return (
    <>
      <Head><title>Apply for Membership — Hush</title></Head>
      <Nav />
      <main style={{ minHeight: '100vh', padding: '120px 24px 80px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span className="badge">Beta application</span>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 300, marginBottom: '16px' }}>
              Request an Invitation
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>Curated access. Not everyone gets in.</p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(217,70,239,0.08), rgba(124,58,237,0.08))',
            border: '1px solid rgba(217,70,239,0.15)',
            borderRadius: '32px', padding: '56px 48px'
          }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <input style={inputStyle} placeholder="Full legal name" value={form.first_name} onChange={e => set('first_name', e.target.value)} required />
                <input style={inputStyle} placeholder="Last name" value={form.last_name} onChange={e => set('last_name', e.target.value)} required />
                <input style={inputStyle} type="email" placeholder="Email" value={form.email} onChange={e => set('email', e.target.value)} required />
                <input style={inputStyle} placeholder="City / Zip code" value={form.zip_code} onChange={e => set('zip_code', e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <input style={inputStyle} placeholder="Birth Month" maxLength={2} value={form.birthday_month} onChange={e => set('birthday_month', e.target.value)} required />
                <input style={inputStyle} placeholder="Birth Day" maxLength={2} value={form.birthday_day} onChange={e => set('birthday_day', e.target.value)} required />
                <input style={inputStyle} placeholder="Birth Year" maxLength={4} value={form.birthday_year} onChange={e => set('birthday_year', e.target.value)} required />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '12px', letterSpacing: '0.1em' }}>Looking for (select all that apply)</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {LOOKING_FOR.map(item => (
                    <div key={item} style={chipStyle(form.looking_for.includes(item))} onClick={() => toggle('looking_for', item)}>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '12px', letterSpacing: '0.1em' }}>Energy</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {ENERGY.map(item => (
                    <div key={item} style={chipStyle(form.energy.includes(item))} onClick={() => toggle('energy', item)}>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical', marginBottom: '16px' }}
                placeholder="Describe your vibe..." value={form.vibe_description} onChange={e => set('vibe_description', e.target.value)} required />

              <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical', marginBottom: '16px' }}
                placeholder="What does respect mean to you?" value={form.respect_answer} onChange={e => set('respect_answer', e.target.value)} required />

              <input style={{ ...inputStyle, marginBottom: '32px' }} type="url"
                placeholder="Photo URL (fully clothed, face visible)" value={form.photo_url}
                onChange={e => set('photo_url', e.target.value)} required />

              {error && <p style={{ color: '#f87171', marginBottom: '16px', fontSize: '0.85rem' }}>{error}</p>}

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '16px',
                background: 'white', color: '#000',
                border: 'none', borderRadius: '999px',
                fontSize: '0.8rem', fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                fontFamily: 'Inter, sans-serif', transition: 'all 0.3s'
              }}>
                {loading ? 'Submitting...' : 'Request Invitation'}
              </button>
              <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                Applications reviewed within 24–48 hours
              </p>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}

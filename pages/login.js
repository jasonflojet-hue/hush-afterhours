import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Nav from '../components/Nav'
import { supabase } from '../lib/supabase'
import styles from '../styles/Auth.module.css'

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/

function passwordStrength(pw) {
  if (!pw) return { score: 0, label: '', color: 'rgba(255,255,255,0.15)' }
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^a-zA-Z0-9]/.test(pw)) score++
  score = Math.min(score, 4)
  const levels = [
    { label: 'Too weak', color: '#e24b4a' },
    { label: 'Weak', color: '#e24b4a' },
    { label: 'Fair', color: '#e8a13f' },
    { label: 'Good', color: '#c9a96e' },
    { label: 'Strong', color: '#7ed9a8' },
  ]
  return { score, ...levels[score] }
}

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('login')

  const strength = passwordStrength(password)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // First-time or incomplete profiles go to /profile instead of the
    // lounge — no point landing someone in the social feed before other
    // members can even tell who they are.
    const explicitNext = typeof router.query.next === 'string' ? router.query.next : null
    if (explicitNext) {
      router.push(explicitNext)
    } else {
      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_complete, account_status')
        .eq('id', data.user.id)
        .single()

      if (!profile?.profile_complete) {
        router.push('/profile')
      } else if (['approved', 'avatar_complete'].includes(profile.account_status)) {
        // Approval is the real gate -- we already have phone + confirmed
        // email on file by this point. Avatar creation is a nice-to-have
        // members can do anytime from the nav, not a hard requirement
        // blocking entry (see verify-id.js).
        router.push('/lounge')
      } else {
        // pending_verification, awaiting_id, pending_review, needs_info, declined --
        // the verification status card now lives at the bottom of /profile
        // instead of its own page.
        router.push('/profile')
      }
    }
    setLoading(false)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')

    const cleanUsername = username.trim()
    if (!USERNAME_RE.test(cleanUsername)) {
      setError('Username must be 3–20 characters: letters, numbers, and underscores only.')
      return
    }
    if (strength.score < 2) {
      setError('Please choose a stronger password (at least 8 characters, mixing letters, numbers, or symbols).')
      return
    }

    setLoading(true)

    const { data: available, error: checkError } = await supabase.rpc('is_username_available', { check_username: cleanUsername })
    if (checkError) {
      setError('Could not verify that username right now. Please try again.')
      setLoading(false)
      return
    }
    if (!available) {
      setError('That username is already taken — try another.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { username: cleanUsername },
        emailRedirectTo: `${window.location.origin}/profile`,
      }
    })
    if (error) setError(error.message)
    else setMode('check_email')
    setLoading(false)
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`
    })
    if (error) setError(error.message)
    else setMode('check_email')
    setLoading(false)
  }

  return (
    <>
      <Head><title>Sign In — Hush Afterhours</title></Head>
      <Nav />
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.logo}>Hush</p>
            {mode === 'check_email' ? (
              <p className={styles.sub}>Check your email — we sent you a link.</p>
            ) : (
              <p className={styles.sub}>
                {mode === 'login' ? 'Welcome back.' : mode === 'signup' ? 'Create your account.' : 'Reset your password.'}
              </p>
            )}
          </div>

          {mode !== 'check_email' && (
            <form onSubmit={mode === 'login' ? handleLogin : mode === 'signup' ? handleSignup : handleReset} className={styles.form}>
              {mode === 'signup' && (
                <div className={styles.field}>
                  <label>Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Your permanent username"
                    maxLength={20}
                    required
                  />
                  <p className={styles.hint}>3–20 characters, letters/numbers/underscores. This can't be changed later.</p>
                </div>
              )}
              <div className={styles.field}>
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
              </div>
              {mode !== 'reset' && (
                <div className={styles.field}>
                  <label>Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                  {mode === 'signup' && password && (
                    <>
                      <div className={styles.strengthTrack}>
                        <div
                          className={styles.strengthFill}
                          style={{ width: `${(strength.score / 4) * 100}%`, background: strength.color }}
                        />
                      </div>
                      <p className={styles.strengthLabel} style={{ color: strength.color }}>{strength.label}</p>
                    </>
                  )}
                </div>
              )}
              {error && <p className={styles.error}>{error}</p>}
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Loading...' : mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
              </button>
            </form>
          )}

          <div className={styles.switchLinks}>
            {mode === 'login' && (
              <>
                <button onClick={() => setMode('signup')} className={styles.switchBtn}>New member? Create account</button>
                <button onClick={() => setMode('reset')} className={styles.switchBtn}>Forgot password?</button>
              </>
            )}
            {mode !== 'login' && (
              <button onClick={() => setMode('login')} className={styles.switchBtn}>Back to sign in</button>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

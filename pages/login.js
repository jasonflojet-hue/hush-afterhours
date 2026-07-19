import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Nav from '../components/Nav'
import { supabase } from '../lib/supabase'
import styles from '../styles/Auth.module.css'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('login')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else router.push(typeof router.query.next === 'string' ? router.query.next : '/lounge')
    setLoading(false)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/lounge` }
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
              <div className={styles.field}>
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
              </div>
              {mode !== 'reset' && (
                <div className={styles.field}>
                  <label>Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
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

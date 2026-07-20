
import { useState } from 'react'
import Head from 'next/head'
import Nav from '../components/Nav'
import styles from '../styles/Apply.module.css'

export default function Apply() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    is_18: false,
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.is_18) {
      setError('You must confirm you are 18 or older to apply.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          is_18: form.is_18,
        }),
      })
      const data = await res.json()

      setLoading(false)

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }

      if (data.alreadyApplied) {
        setError('This email has already been submitted.')
        return
      }

      setSubmitted(true)
    } catch {
      setLoading(false)
      setError('Something went wrong. Please try again.')
    }
  }

  if (submitted) {
    return (
      <>
        <Head><title>You're on the list — Hush After Hours</title></Head>
        <Nav />
        <main className={styles.main}>
          <div className={styles.success}>
            <h2>You're on the list.</h2>
            <p>We'll be in touch at {form.email}.</p>
            <a href="/" className={styles.backLink}>Back to home</a>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Head><title>Apply for Membership — Hush After Hours</title></Head>
      <Nav />
      <main className={styles.main}>
        <div className={styles.header}>
          <span className={styles.badge}>Beta Access</span>
          <h1 className={styles.title}>Request an invitation.</h1>
          <p className={styles.sub}>Every application is reviewed personally.</p>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="name">Your name</label>
            <input
              id="name"
              type="text"
              placeholder="First and last name"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              required
              autoComplete="name"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={form.is_18}
              onChange={e => set('is_18', e.target.checked)}
            />
            <span>I confirm I am 18 years of age or older</span>
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading || !form.is_18}
          >
            {loading ? 'Submitting…' : 'Request Access'}
          </button>
        </form>
      </main>
    </>
  )
}

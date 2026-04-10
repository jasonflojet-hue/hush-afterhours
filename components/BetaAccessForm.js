// components/BetaAccessForm.js
// Drop this anywhere on your homepage. Saves to Supabase `beta_requests` table.
// Fields: name, email, age_confirmed. No photo, no vibe, no friction.

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const STATUS = { IDLE: 'idle', LOADING: 'loading', SUCCESS: 'success', ERROR: 'error' };

export default function BetaAccessForm() {
  const [form, setForm] = useState({ name: '', email: '', ageConfirmed: false });
  const [status, setStatus] = useState(STATUS.IDLE);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(STATUS.LOADING);
    setErrorMsg('');

    if (!form.ageConfirmed) {
      setErrorMsg('You must confirm you are 18 or older to enter.');
      setStatus(STATUS.ERROR);
      return;
    }

    try {
      const { error } = await supabase.from('beta_requests').insert([
        {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          age_confirmed: true,
          requested_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        // Handle duplicate email gracefully
        if (error.code === '23505') {
          setStatus(STATUS.SUCCESS); // Already on the list — still show success
        } else {
          throw error;
        }
      } else {
        setStatus(STATUS.SUCCESS);
      }
    } catch (err) {
      console.error('[beta-access]', err);
      setErrorMsg('Something went wrong. Please try again.');
      setStatus(STATUS.ERROR);
    }
  };

  if (status === STATUS.SUCCESS) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.successBox}>
          <p style={styles.successIcon}>✓</p>
          <h2 style={styles.successTitle}>You're on the list.</h2>
          <p style={styles.successSub}>
            We'll reach out when the doors open. Keep an eye on your inbox.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <p style={styles.eyebrow}>Beta Access</p>
        <h2 style={styles.title}>The doors open soon.</h2>
        <p style={styles.subtitle}>
          Request your spot inside Hush After Hours.
          <br />
          We'll reach out when it's your time.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.fieldGroup}>
          <label htmlFor="name" style={styles.label}>Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            style={styles.input}
            autoComplete="name"
          />
        </div>

        <div style={styles.fieldGroup}>
          <label htmlFor="email" style={styles.label}>Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            style={styles.input}
            autoComplete="email"
            inputMode="email"
          />
        </div>

        <label style={styles.checkboxRow}>
          <input
            type="checkbox"
            name="ageConfirmed"
            checked={form.ageConfirmed}
            onChange={handleChange}
            style={styles.checkbox}
            required
          />
          <span style={styles.checkboxText}>
            I confirm that I am{' '}
            <strong style={{ color: '#b48cff', fontWeight: 500 }}>
              18 years of age or older
            </strong>{' '}
            and agree to the Terms of Service.
          </span>
        </label>

        {status === STATUS.ERROR && (
          <p style={styles.errorMsg}>{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === STATUS.LOADING}
          style={{
            ...styles.submitBtn,
            opacity: status === STATUS.LOADING ? 0.7 : 1,
          }}
        >
          {status === STATUS.LOADING ? 'Requesting…' : 'Request Beta Access →'}
        </button>
      </form>

      <p style={styles.footnote}>
        Membership details collected after entry. No photo required.
      </p>
    </div>
  );
}

const styles = {
  wrapper: {
    width: '100%',
    maxWidth: 420,
    margin: '0 auto',
    padding: '0 1rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  eyebrow: {
    color: '#6b6b80',
    fontSize: 12,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    margin: '0 0 0.75rem',
    fontFamily: 'inherit',
  },
  title: {
    color: '#f0ebff',
    fontSize: '1.75rem',
    fontWeight: 600,
    margin: '0 0 0.5rem',
    letterSpacing: '-0.01em',
  },
  subtitle: {
    color: '#8b8ba0',
    fontSize: '0.9rem',
    margin: 0,
    lineHeight: 1.6,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    color: '#8b8ba0',
    fontSize: 12,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  input: {
    background: '#14141f',
    border: '1px solid #2a2a3d',
    borderRadius: 8,
    padding: '13px 16px',
    color: '#f0ebff',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    WebkitAppearance: 'none',
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    background: '#14141f',
    border: '1px solid #2a2a3d',
    borderRadius: 8,
    padding: '14px 16px',
    cursor: 'pointer',
  },
  checkbox: {
    marginTop: 2,
    accentColor: '#b48cff',
    width: 18,
    height: 18,
    minWidth: 18,
    cursor: 'pointer',
  },
  checkboxText: {
    color: '#8b8ba0',
    fontSize: '0.85rem',
    lineHeight: 1.5,
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #6040b0, #9060e0)',
    border: 'none',
    borderRadius: 8,
    padding: '15px',
    color: '#fff',
    fontSize: '0.95rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    cursor: 'pointer',
    width: '100%',
    marginTop: 4,
  },
  errorMsg: {
    color: '#ff6b8a',
    fontSize: '0.85rem',
    margin: 0,
    textAlign: 'center',
  },
  successBox: {
    textAlign: 'center',
    padding: '2rem 0',
  },
  successIcon: {
    color: '#b48cff',
    fontSize: '2.5rem',
    margin: '0 0 1rem',
  },
  successTitle: {
    color: '#f0ebff',
    fontSize: '1.5rem',
    fontWeight: 600,
    margin: '0 0 0.5rem',
  },
  successSub: {
    color: '#8b8ba0',
    fontSize: '0.9rem',
    lineHeight: 1.6,
    margin: 0,
  },
};

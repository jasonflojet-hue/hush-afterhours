import { useState } from 'react'
import styles from '../styles/Donation.module.css'

const PRESETS = [5, 10, 20]

// Generic donation widget — used both in the public homepage footer and on
// the post-membership confirmation page. `heading`/`subtext` let each
// placement (or a future giveaway promo) carry different copy without
// touching this component or the API route. `campaign` is passed through
// to Stripe metadata untouched.
export default function DonationWidget({
  heading = 'Support Hush After Hours',
  subtext = 'Every donation helps us keep the lounge running and the events coming.',
  campaign = 'general',
  returnPath,
}) {
  const [selected, setSelected] = useState(PRESETS[0])
  const [custom, setCustom] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const activeDollars = isCustom ? Number(custom) : selected

  const handlePreset = (amount) => {
    setIsCustom(false)
    setSelected(amount)
    setError('')
  }

  const handleCustomFocus = () => {
    setIsCustom(true)
    setError('')
  }

  const handleDonate = async () => {
    setError('')

    if (!activeDollars || activeDollars < 1) {
      setError('Enter an amount of at least $1.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/stripe/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(activeDollars * 100),
          campaign,
          returnPath: returnPath || (typeof window !== 'undefined' ? window.location.pathname : '/'),
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Something went wrong. Please try again.')
        setLoading(false)
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className={styles.widget}>
      <p className={styles.heading}>{heading}</p>
      {subtext && <p className={styles.subtext}>{subtext}</p>}

      <div className={styles.presets}>
        {PRESETS.map((amount) => (
          <button
            key={amount}
            type="button"
            className={`${styles.presetBtn} ${!isCustom && selected === amount ? styles.presetActive : ''}`}
            onClick={() => handlePreset(amount)}
          >
            ${amount}
          </button>
        ))}
        <div className={`${styles.customWrap} ${isCustom ? styles.presetActive : ''}`}>
          <span className={styles.dollarSign}>$</span>
          <input
            type="number"
            min="1"
            step="1"
            placeholder="Custom"
            value={custom}
            onFocus={handleCustomFocus}
            onChange={(e) => {
              setIsCustom(true)
              setCustom(e.target.value)
            }}
            className={styles.customInput}
          />
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button type="button" className={styles.donateBtn} onClick={handleDonate} disabled={loading}>
        {loading ? 'Redirecting…' : `Donate${activeDollars ? ` $${activeDollars}` : ''}`}
      </button>
    </div>
  )
}

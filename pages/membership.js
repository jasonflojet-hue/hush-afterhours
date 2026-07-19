import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import Nav from '../components/Nav'
import { supabase } from '../lib/supabase'
import styles from '../styles/Membership.module.css'

const ANNUAL_PRICE = 313.20
const MONTHLY_PRICE = 29
const ANNUAL_LIST_PRICE = MONTHLY_PRICE * 12 // $348
const ANNUAL_SAVINGS = ANNUAL_LIST_PRICE - ANNUAL_PRICE // $34.80

export default function Membership() {
  const router = useRouter()
  const [billingPeriod, setBillingPeriod] = useState('monthly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubscribe = async () => {
    setError('')
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login?next=/membership')
      return
    }

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingPeriod }),
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

  const displayPrice = billingPeriod === 'annual' ? ANNUAL_PRICE.toFixed(2) : MONTHLY_PRICE
  const displayPer = billingPeriod === 'annual' ? '/ year' : '/ month'

  return (
    <>
      <Head><title>Membership — Hush Afterhours</title></Head>
      <Nav />
      <main className={styles.main}>
        <div className={styles.hero}>
          <span className="badge">By invitation only</span>
          <h1 className={styles.title}>Join the inner circle</h1>
          <p className={styles.sub}>
            Every member is hand-selected. Legacy Membership is open now — Silver and Gold are coming soon.
          </p>
        </div>

        <div className={styles.toggleWrap}>
          <button
            type="button"
            className={`${styles.toggleBtn} ${billingPeriod === 'monthly' ? styles.toggleActive : ''}`}
            onClick={() => setBillingPeriod('monthly')}
          >
            Monthly
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${billingPeriod === 'annual' ? styles.toggleActive : ''}`}
            onClick={() => setBillingPeriod('annual')}
          >
            Annual <span className={styles.toggleSave}>Save 10%</span>
          </button>
        </div>

        <div className={styles.tiers}>
          {/* Legacy Membership — the only purchasable tier */}
          <div className={`${styles.tierCard} ${styles.featured}`}>
            <div className={styles.popularBadge}>Available now</div>
            <p className={styles.tierLabel} style={{ color: '#c9a96e' }}>Legacy</p>
            <p className={styles.tierName}>Legacy Membership</p>
            <div className={styles.tierPrice}>
              <span className={styles.priceNum} style={{ color: '#c9a96e' }}>${displayPrice}</span>
              <span className={styles.pricePer}> {displayPer}</span>
            </div>
            {billingPeriod === 'annual' && (
              <p className={styles.savingsNote}>
                Save ${ANNUAL_SAVINGS.toFixed(2)} — 10% off when you commit to a year
              </p>
            )}
            <div className={styles.divider} />
            <ul className={styles.perks}>
              {[
                'Access to the Lounge & member feed',
                'Live stream access',
                'Member-only shop pricing',
                'Community profile & matching',
              ].map((perk, i) => (
                <li key={i} className={styles.perk}>
                  <span className={styles.checkmark} style={{ borderColor: '#c9a96e' }}>
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1 4l2.5 2.5L7 1.5" stroke="#c9a96e" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
            {error && <p className={styles.errorMsg}>{error}</p>}
            <button className={styles.btnLocked} disabled>Coming Soon</button>
          </div>

          {/* Silver — coming soon, not purchasable */}
          <div className={`${styles.tierCard} ${styles.comingSoon}`}>
            <div className={styles.comingSoonBadge}>Coming Soon</div>
            <p className={styles.tierLabel} style={{ color: '#a8a8b3' }}>Silver</p>
            <p className={styles.tierName}>Silver Membership</p>
            <div className={styles.tierPrice}>
              <span className={styles.priceNum}>—</span>
            </div>
            <div className={styles.divider} />
            <ul className={styles.perks}>
              {[
                'Everything in Legacy',
                'Priority event access & early drops',
                'Silver badge in the Lounge',
              ].map((perk, i) => (
                <li key={i} className={styles.perk}>
                  <span className={styles.checkmark} style={{ borderColor: '#666' }}>
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1 4l2.5 2.5L7 1.5" stroke="#666" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
            <button className={styles.btnLocked} disabled>Coming Soon</button>
          </div>

          {/* Gold — coming soon, not purchasable */}
          <div className={`${styles.tierCard} ${styles.comingSoon}`}>
            <div className={styles.comingSoonBadge}>Coming Soon</div>
            <p className={styles.tierLabel} style={{ color: '#a8a8b3' }}>Gold</p>
            <p className={styles.tierName}>Gold Membership</p>
            <div className={styles.tierPrice}>
              <span className={styles.priceNum}>—</span>
            </div>
            <div className={styles.divider} />
            <ul className={styles.perks}>
              {[
                'Everything in Silver',
                'Private room access at events',
                'Direct line to host team',
                'Gold badge in the Lounge',
              ].map((perk, i) => (
                <li key={i} className={styles.perk}>
                  <span className={styles.checkmark} style={{ borderColor: '#666' }}>
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1 4l2.5 2.5L7 1.5" stroke="#666" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
            <button className={styles.btnLocked} disabled>Coming Soon</button>
          </div>
        </div>

        <div className={styles.faq}>
          <p className={`section-label ${styles.faqTitle}`}>Common questions</p>
          {[
            ['How does the application process work?', 'Complete the beta application on the welcome page. The Hush team reviews every application personally before granting access.'],
            ['Can I switch between monthly and annual?', 'Yes — reach out and we\'ll help you switch billing periods.'],
            ['Is this community discreet?', 'Absolutely. Member privacy is our top priority. Your profile is only visible to approved members.'],
            ['Can I cancel anytime?', 'Yes. You can cancel any time from your account — access continues through the end of your current billing period.'],
          ].map(([q, a], i) => (
            <div key={i} className={styles.faqItem}>
              <p className={styles.faqQ}>{q}</p>
              <p className={styles.faqA}>{a}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}

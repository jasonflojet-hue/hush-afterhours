import Head from 'next/head'
import Nav from '../components/Nav'
import styles from '../styles/Membership.module.css'

const tiers = [
  {
    id: 'afterhours',
    name: 'Afterhours',
    price: 15,
    tier: 'Entry',
    color: '#888',
    perks: [
      'Access to the Lounge & member feed',
      'Live stream access',
      'Member-only shop pricing',
      'Community profile & matching',
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_AFTERHOURS,
  },
  {
    id: 'hush_gold',
    name: 'Hush Gold',
    price: 35,
    tier: 'VIP',
    color: '#c9a96e',
    featured: true,
    perks: [
      'Everything in Afterhours',
      'Priority event access & early drops',
      'Gold badge on profile & in Lounge',
      'Exclusive Gold member events',
      '30% off all shop items',
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_HUSH_GOLD,
  },
  {
    id: 'black_card',
    name: 'Black Card',
    price: 75,
    tier: 'Elite',
    color: '#8040ff',
    perks: [
      'Everything in Hush Gold',
      'Private room access at events',
      'Direct line to host team',
      'Complimentary event tickets monthly',
      'All merch drops free',
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BLACK_CARD,
  },
]

export default function Membership() {
  const handleSubscribe = async (priceId) => {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  return (
    <>
      <Head><title>Membership — Hush Afterhours</title></Head>
      <Nav />
      <main className={styles.main}>
        <div className={styles.hero}>
          <span className="badge">By invitation only</span>
          <h1 className={styles.title}>Join the inner circle</h1>
          <p className={styles.sub}>
            Every member is hand-selected. Choose your tier and gain full access to the Hush experience.
          </p>
        </div>

        <div className={styles.tiers}>
          {tiers.map(tier => (
            <div key={tier.id} className={`${styles.tierCard} ${tier.featured ? styles.featured : ''}`}>
              {tier.featured && <div className={styles.popularBadge}>Most popular</div>}
              <p className={styles.tierLabel} style={{ color: tier.color }}>{tier.tier}</p>
              <p className={styles.tierName}>{tier.name}</p>
              <div className={styles.tierPrice}>
                <span className={styles.priceNum} style={{ color: tier.featured ? tier.color : '#fff' }}>
                  ${tier.price}
                </span>
                <span className={styles.pricePer}> / month</span>
              </div>
              <div className={styles.divider} />
              <ul className={styles.perks}>
                {tier.perks.map((perk, i) => (
                  <li key={i} className={styles.perk}>
                    <span className={styles.checkmark} style={{ borderColor: tier.color }}>
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1 4l2.5 2.5L7 1.5" stroke={tier.color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(tier.priceId)}
                className={tier.featured ? styles.btnFeatured : styles.btnDefault}
              >
                Join {tier.name}
              </button>
            </div>
          ))}
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}><p className={styles.statNum}>6</p><p className={styles.statLabel}>Beta members</p></div>
          <div className={styles.stat}><p className={styles.statNum}>3</p><p className={styles.statLabel}>Tiers available</p></div>
          <div className={styles.stat}><p className={styles.statNum}>18+</p><p className={styles.statLabel}>Age requirement</p></div>
        </div>

        <div className={styles.faq}>
          <p className={`section-label ${styles.faqTitle}`}>Common questions</p>
          {[
            ['How does the application process work?', 'Complete the beta application on the welcome page. The Hush team reviews every application personally before granting access.'],
            ['Can I upgrade my tier later?', 'Yes. You can upgrade at any time — we prorate the difference for the current billing period.'],
            ['Is this community discreet?', 'Absolutely. Member privacy is our top priority. Your profile is only visible to approved members.'],
            ['Can I cancel anytime?', 'Yes. All memberships are month-to-month with no long-term commitment.'],
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

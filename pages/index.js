import Head from 'next/head'
import { useState } from 'react'
import Nav from '../components/Nav'
import styles from '../styles/Home.module.css'

export default function Home() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [donationBannerVisible, setDonationBannerVisible] = useState(true)

  const handleWaitlist = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      })
      setSubmitted(true)
    } catch (err) {
      setSubmitted(true)
    }
    setLoading(false)
  }

  return (
    <>
      <Head>
        <title>Hush Afterhours — A Private Social Club</title>
        <meta name="description" content="A curated, members-only social club for open-minded adults. Apply for access." />
      </Head>

      <Nav />

      {donationBannerVisible && (
        <div className={styles.donationBanner}>
          <span className={styles.donationBannerIcon}>◈</span>
          <p className={styles.donationBannerText}>
            Help us build Hush — Support the founding member experience
          </p>
          <a
            href="https://venmo.com/u/hush2026"
            className={styles.donationBannerBtn}
            target="_blank"
            rel="noopener noreferrer"
          >
            Donate →
          </a>
          <button
            className={styles.donationBannerClose}
            onClick={() => setDonationBannerVisible(false)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      <main className={styles.main}>
        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.heroBg} />
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <img
              src="/neon-sign.png"
              alt="Hush Afterhours"
              className={styles.neonSign}
            />
            <p className={styles.eyebrow}>Members only · By invitation only · Beta now open</p>
            <p className={styles.heroSub}>
              A private social club for open-minded adults. Curated, intimate, and unlike anything else.
            </p>

            {!submitted ? (
              <form onSubmit={handleWaitlist} className={styles.captureForm}>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={styles.captureInput}
                />
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className={styles.captureInput}
                />
                <button type="submit" className={styles.captureBtn} disabled={loading}>
                  {loading ? 'Requesting...' : 'Request Access →'}
                </button>
                <p className={styles.captureNote}>Founding members get VIP status for life. Limited spots.</p>
              </form>
            ) : (
              <div className={styles.captureSuccess}>
                <p className={styles.successIcon}>◈</p>
                <p className={styles.successText}>You're on the list. We'll be in touch within 24–48 hours.</p>
                <a href="/apply" className="btn-gold" style={{marginTop:'1rem',display:'inline-block'}}>Complete your full application →</a>
              </div>
            )}

            <div className={styles.heroCtas}>
              <a href="/apply" className="btn-gold">Apply for membership</a>
              <a href="/why" className="btn-outline">Our story</a>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className={styles.stats}>
          <div className={styles.stat}>
            <p className={styles.statNum}>18+</p>
            <p className={styles.statLabel}>Age requirement</p>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <p className={styles.statNum}>100%</p>
            <p className={styles.statLabel}>Hand-selected members</p>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <p className={styles.statNum}>3</p>
            <p className={styles.statLabel}>Membership tiers</p>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <p className={styles.statNum}>FREE</p>
            <p className={styles.statLabel}>Beta access</p>
          </div>
        </section>

        {/* ABOUT */}
        <section className={styles.about}>
          <div className={styles.aboutGrid}>
            <div className={styles.aboutLeft}>
              <p className="section-label">What is Hush</p>
              <h2 className={styles.aboutTitle}>
                Not a dating app.<br />Not a nightclub.<br />Something <em>real.</em>
              </h2>
            </div>
            <div className={styles.aboutRight}>
              <p>Hush is where open-minded adults come together in curated, intimate settings — music, conversation, and the kind of connection you can't find on a screen.</p>
              <p>Every member is reviewed personally. Not everyone gets in. And that's exactly the point.</p>
              <a href="/why" className={styles.readMore}>Read our story →</a>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className={styles.features}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>◈</div>
            <h3>The Lounge</h3>
            <p>Your private members space. Live music, DJ sets, community feed, and connection — all in one immersive 3D space.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>◎</div>
            <h3>Member Profiles</h3>
            <p>Real people. Real vibes. Browse approved members, see what energy they bring, and connect directly.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>◇</div>
            <h3>Exclusive Events</h3>
            <p>Members-only gatherings, pop-ups, and experiences. The kind of nights you'll actually want to remember.</p>
          </div>
        </section>

        {/* CONCERT STRIP */}
        <section className={styles.concertStrip}>
          <img src="/hero-concert.jpg" alt="Live at Hush" className={styles.concertImg} />
          <div className={styles.concertOverlay}>
            <p className={styles.concertLabel}>Live · Members Only</p>
            <h2 className={styles.concertTitle}>Where the night<br /><em>begins</em></h2>
          </div>
        </section>

        {/* BETA CTA */}
        <section className={styles.betaSection}>
          <div className={styles.betaBox}>
            <img src="/hush-logo.png" alt="Hush" className={styles.betaLogo} />
            <p className={styles.betaBadge}>⚡ FOUNDING MEMBER BETA</p>
            <h2 className={styles.betaTitle}>First wave members get VIP for life.</h2>
            <p className={styles.betaSub}>Limited spots. Applications reviewed personally within 24–48 hours.</p>
            <a href="/apply" className="btn-gold">Apply now — it's free</a>
          </div>
        </section>

        {/* FOOTER */}
        <footer className={styles.footer}>
          <img src="/neon-sign.png" alt="Hush Afterhours" className={styles.footerNeon} />
          <img src="/kontraband-logo.png" alt="KontraBand Entertainment" className={styles.kbLogo} />
          <p className={styles.footerText}>© 2026 KontraBand Entertainment LLC · All rights reserved</p>
          <p className={styles.footerLinks}>
            <a href="/why">Our Story</a> · <a href="/membership">Membership</a> · <a href="/apply">Apply</a>
          </p>
        </footer>
      </main>
    </>
  )
}

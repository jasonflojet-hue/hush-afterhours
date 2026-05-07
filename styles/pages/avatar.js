import Head from 'next/head'
import Nav from '../components/Nav'
import styles from '../styles/Avatar.module.css'

export default function AvatarPage() {
  const SPATIAL_LINK =
    'https://www.spatial.io/s/HUSH-AFTER-HOURS-TEST-69be06ae77252f463df926d2?share=1370638781881802998'

  const AVATURN_LINK =
    'https://hushaftehourslive.avaturn.dev'

  return (
    <>
      <Head>
        <title>Avatar Lab — Hush Afterhours</title>
        <meta
          name="description"
          content="Optional avatar creation for Hush Afterhours beta."
        />
      </Head>

      <Nav />

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroBg} />
          <div className={styles.heroOverlay} />

          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>
              Avatar Lab · Optional Beta Feature
            </p>

            <h1 className={styles.title}>
              Step inside as
              <br />
              <em>yourself.</em>
            </h1>

            <p className={styles.sub}>
              Create a photorealistic version of yourself — or skip it for now and
              enter the experience.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginTop: '20px',
              }}
            >
              {/* ENTER LOUNGE */}
              <a
                href={SPATIAL_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.createBtn}
                style={{ textDecoration: 'none' }}
              >
                Enter Lounge →
              </a>

              {/* FIXED BUTTON */}
              <button
                className={styles.createBtn}
                onClick={() =>
                  window.open(AVATURN_LINK, '_blank')
                }
                style={{
                  background: 'transparent',
                  border: '1px solid #666',
                  color: '#ccc',
                }}
              >
                Test Avatar Creator
              </button>

              {/* BACK */}
              <a href="/" className={styles.backBtn}>
                Back to Home
              </a>
            </div>

            <p className={styles.createNote}>
              Avatar creation takes about 60 seconds and is optional during beta.
            </p>
          </div>
        </section>

        {/* FOOTER */}
        <footer className={styles.footer}>
          <img
            src="/kontraband-logo.png"
            alt="KontraBand Entertainment"
            className={styles.kbLogo}
          />
          <p className={styles.footerText}>
            © 2026 KontraBand Entertainment LLC
          </p>
        </footer>
      </main>
    </>
  )
}
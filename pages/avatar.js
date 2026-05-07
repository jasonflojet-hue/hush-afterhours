import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import Nav from '../components/Nav'
import styles from '../styles/Avatar.module.css'

export default function AvatarPage() {
  const [step, setStep] = useState('intro')
  const [avatarUrl, setAvatarUrl] = useState(null)
  const avaturnContainerRef = useRef(null)
  const sdkRef = useRef(null)

  const SPATIAL_LINK =
    'https://www.spatial.io/s/HUSH-AFTER-HOURS-TEST-69be06ae77252f463df926d2?share=1370638781881802998'

  useEffect(() => {
    let isMounted = true

    async function loadAvaturn() {
      if (step !== 'creator' || !avaturnContainerRef.current || sdkRef.current) return

      try {
        const { AvaturnSDK } = await import('@avaturn/sdk')

        const sdk = new AvaturnSDK()
        sdkRef.current = sdk

        // Replace with your actual Avaturn subdomain from developer.avaturn.me
        const subdomain = 'hushaftehourslive'
        const url = `https://${subdomain}.avaturn.dev`

        await sdk.init(avaturnContainerRef.current, {
          url,
        })

        sdk.on('export', async (data) => {
          console.log('AVATURN EXPORT:', data)

          if (!isMounted) return

          const urlFromExport =
            data?.url ||
            data?.avatarUrl ||
            data?.data?.url ||
            data?.data?.avatarUrl ||
            null

          setAvatarUrl(urlFromExport)
          setStep('done')

          // Optional: send avatar URL to your backend later
          // await fetch('/api/save-avatar', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({ avatarUrl: urlFromExport }),
          // })
        })
      } catch (error) {
        console.error('Failed to load Avaturn SDK:', error)
      }
    }

    loadAvaturn()

    return () => {
      isMounted = false
      sdkRef.current = null
    }
  }, [step])

  return (
    <>
      <Head>
        <title>Avatar Lab - Hush Afterhours</title>
        <meta
          name="description"
          content="Optional avatar creation for Hush Afterhours beta."
        />
      </Head>

      <Nav />

      <main className={styles.main}>
        {step === 'intro' && (
          <>
            <section className={styles.hero}>
              <div className={styles.heroBg} />
              <div className={styles.heroOverlay} />
              <div className={styles.heroContent}>
                <p className={styles.eyebrow}>Avatar Lab · Optional Beta Feature</p>
                <h1 className={styles.title}>
                  Walk in as
                  <br />
                  <em>yourself.</em>
                </h1>
                <p className={styles.sub}>
                  This is an early preview of Hush avatar technology. You can create a
                  photorealistic version of yourself — or skip it for now and enter the
                  experience.
                </p>
              </div>
            </section>

            <section className={styles.ctaSection}>
              <h2 className={styles.ctaTitle}>Step inside now.</h2>
              <p className={styles.ctaSub}>
                Avatar creation is optional during beta. You can always create or update
                yours later.
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <a
                  href={SPATIAL_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.createBtn}
                  style={{ textDecoration: 'none' }}
                >
                  Enter Lounge →
                </a>

                <button
                  className={styles.createBtn}
                  onClick={() => setStep('creator')}
                  style={{
                    background: 'transparent',
                    border: '1px solid #666',
                    color: '#ccc',
                  }}
                >
                  Test Avatar Creator
                </button>

                <a href="/" className={styles.backBtn}>
                  Back to Home
                </a>
              </div>
            </section>
          </>
        )}

        {step === 'creator' && (
          <section className={styles.creatorSection}>
            <div className={styles.creatorHeader}>
              <h2 className={styles.creatorTitle}>Avatar Lab</h2>
              <p className={styles.creatorSub}>
                Create your avatar here without leaving Hush. When you click Next in the
                Avaturn interface, we’ll catch the export and move you forward.
              </p>
            </div>

            <div
              style={{
                maxWidth: '1100px',
                margin: '0 auto',
                padding: '1rem 1rem 2rem',
              }}
            >
              <div
                ref={avaturnContainerRef}
                id="avaturn-sdk-container"
                style={{
                  width: '100%',
                  minHeight: '80vh',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  background: '#0a0711',
                }}
              />

              <div
                style={{
                  marginTop: '24px',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <a
                  href={SPATIAL_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.createBtn}
                  style={{ textDecoration: 'none' }}
                >
                  Skip for now — Enter Lounge →
                </a>

                <button className={styles.backBtn} onClick={() => setStep('intro')}>
                  Back
                </button>
              </div>
            </div>
          </section>
        )}

        {step === 'done' && (
          <section className={styles.doneSection}>
            <div className={styles.doneCard}>
              <div className={styles.doneIcon}>*</div>
              <h2 className={styles.doneTitle}>You’re ready.</h2>
              <p className={styles.doneSub}>
                {avatarUrl
                  ? 'Your avatar export was captured. Step inside and experience Hush.'
                  : 'Your avatar is ready. Step inside and experience Hush.'}
              </p>

              <a
                href={SPATIAL_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.createBtn}
                style={{
                  display: 'inline-block',
                  textDecoration: 'none',
                  marginTop: '1.5rem',
                }}
              >
                Enter the Lounge
              </a>

              <button
                className={styles.backBtn}
                onClick={() => setStep('creator')}
                style={{ marginTop: '1rem' }}
              >
                Edit avatar
              </button>
            </div>
          </section>
        )}

        <footer className={styles.footer}>
          <img
            src="/kontraband-logo.png"
            alt="KontraBand Entertainment"
            className={styles.kbLogo}
          />
          <p className={styles.footerText}>
            2026 KontraBand Entertainment LLC - All rights reserved
          </p>
        </footer>
      </main>
    </>
  )
}

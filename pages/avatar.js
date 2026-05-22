import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import Nav from '../components/Nav'
import styles from '../styles/Avatar.module.css'

export default function AvatarPage() {
  const [step, setStep] = useState('intro')
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const avaturnContainerRef = useRef(null)
  const sdkRef = useRef(null)

  const SPATIAL_LINK =
    'https://www.spatial.io/s/HUSH-AFTER-HOURS-TEST-69be06ae77252f463df926d2?share=1370638781881802998'

  useEffect(() => {
    let isMounted = true

    async function loadAvaturn() {
      if (step !== 'creator' || !avaturnContainerRef.current || sdkRef.current) return

      setIsLoading(true)

      try {
        const { AvaturnSDK } = await import('@avaturn/sdk')

        const sdk = new AvaturnSDK()
        sdkRef.current = sdk

        const subdomain = 'hushaftehourslive'
        const url = `https://${subdomain}.avaturn.dev`

        await sdk.init(avaturnContainerRef.current, {
          url,
          iframeClassName: 'avaturn-iframe',
        })

        // Hide spinner once SDK is ready
        if (isMounted) setIsLoading(false)

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
        })
      } catch (error) {
        console.error('Failed to load Avaturn SDK:', error)
        if (isMounted) setIsLoading(false)
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
        <meta name="description" content="Create your avatar for Hush Afterhours." />
        <style>{`
          .avaturn-iframe {
            width: 100% !important;
            height: 100% !important;
            border: none !important;
            display: block !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
          }
          #avaturn-sdk-container iframe {
            width: 100% !important;
            height: 100% !important;
            border: none !important;
            display: block !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
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
                  Create a photorealistic version of yourself — or skip it and enter now.
                </p>
              </div>
            </section>

            <section className={styles.ctaSection}>
              <h2 className={styles.ctaTitle}>Step inside now.</h2>
              <p className={styles.ctaSub}>
                Avatar creation is optional during beta. You can always create or update yours later.
              </p>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
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
                  style={{ background: 'transparent', border: '1px solid #666', color: '#ccc' }}
                >
                  Create My Avatar
                </button>

                <a href="/" className={styles.backBtn}>Back to Home</a>
              </div>
            </section>
          </>
        )}

        {step === 'creator' && (
          <section className={styles.creatorSection}>
            {/* Loading Spinner */}
            {isLoading && (
              <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(5,3,10,0.95)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
              }}>
                {/* Spinning ring */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  border: '3px solid rgba(255,45,155,0.2)',
                  borderTop: '3px solid #ff2d9b',
                  animation: 'spin 1s linear infinite',
                  marginBottom: '2rem',
                }} />

                {/* Hush logo text */}
                <p style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '0.7rem',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.4)',
                  animation: 'pulse 2s ease-in-out infinite',
                }}>
                  Building your avatar lab...
                </p>
              </div>
            )}

            {/* Avatar Creator */}
            <div style={{
              maxWidth: '1100px',
              margin: '0 auto',
              padding: '1rem 1rem 2rem',
              height: 'calc(100vh - 100px)',
              minHeight: '600px',
              display: 'flex',
              flexDirection: 'column',
              opacity: isLoading ? 0 : 1,
              transition: 'opacity 0.5s ease',
            }}>
              <div
                ref={avaturnContainerRef}
                id="avaturn-sdk-container"
                style={{
                  flex: 1,
                  width: '100%',
                  position: 'relative',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  background: '#0a0711',
                }}
              />

              <div style={{
                marginTop: '16px',
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
                flexShrink: 0,
              }}>
                <a
                  href={SPATIAL_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.createBtn}
                  style={{ textDecoration: 'none' }}
                >
                  Skip — Enter Lounge →
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
              <div className={styles.doneIcon}>✦</div>
              <h2 className={styles.doneTitle}>You're ready.</h2>
              <p className={styles.doneSub}>
                {avatarUrl
                  ? 'Your avatar was captured. Step inside and experience Hush.'
                  : 'Your avatar is ready. Step inside and experience Hush.'}
              </p>

              <a
                href={SPATIAL_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.createBtn}
                style={{ display: 'inline-block', textDecoration: 'none', marginTop: '1.5rem' }}
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
          <img src="/kontraband-logo.png" alt="KontraBand Entertainment" className={styles.kbLogo} />
          <p className={styles.footerText}>
            2026 KontraBand Entertainment LLC - All rights reserved
          </p>
        </footer>
      </main>
    </>
  )
}

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Nav from '../components/Nav'
import { supabase } from '../lib/supabase'
import styles from '../styles/Lounge.module.css'

// The real Lounge (3D club, live DJ sets, member feed) is being built
// separately in Unity and isn't wired up to this site yet. This page is a
// holding stop so approved members land somewhere intentional instead of
// an unfinished 3D scene or a dead end. Swap this back out for the real
// experience once the Unity build is ready to embed/link.
export default function Lounge() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthChecked(true)
      if (!session) router.push('/login')
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
      if (!session) router.push('/login')
    })
    return () => subscription.unsubscribe()
  }, [])

  if (!authChecked) return null

  return (
    <>
      <Head><title>The Lounge — Hush Afterhours</title></Head>
      <Nav />
      <main className={styles.constructionMain}>
        <div className={styles.constructionCard}>
          <span className={styles.constructionBadge}>Under Construction</span>
          <h1 className={styles.constructionTitle}>The Lounge is being built.</h1>
          <p className={styles.constructionSub}>
            You're in — that's the hard part done. We're putting the finishing touches
            on the live room itself: DJ sets, the dance floor, the member feed. Check
            back soon.
          </p>
          <div className={styles.constructionLinks}>
            <a href="/members" className={styles.constructionBtn}>Browse members →</a>
            <a href="/profile" className={styles.constructionBtnGhost}>Edit your profile</a>
          </div>
        </div>
      </main>
    </>
  )
}

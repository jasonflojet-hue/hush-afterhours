import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import styles from './Nav.module.css'

export default function Nav() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    import('../lib/supabase').then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session))
      return () => subscription.unsubscribe()
    })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    const { supabase } = await import('../lib/supabase')
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <a href="/" className={styles.logo}>
        <img src="/hush-logo.png" alt="Hush" className={styles.logoImg} />
      </a>
      <div className={styles.links}>
        {mounted && session ? (
          <>
            <a href="/lounge" className={router.pathname === '/lounge' ? styles.active : ''}>Lounge</a>
            <a href="/avatar" className={router.pathname === '/avatar' ? styles.active : ''}>My Avatar</a>
            <a href="/membership" className={router.pathname === '/membership' ? styles.active : ''}>Membership</a>
            <button onClick={handleSignOut} className={styles.signout}>Sign out</button>
          </>
        ) : (
          <>
            <a href="/why">Our Story</a>
            <a href="/avatar" className={router.pathname === '/avatar' ? styles.active : ''}>Avatars</a>
            <a href="/membership">Membership</a>
            <a href="/apply">Apply</a>
            <a href="/login" className={styles.loginBtn}>Sign in</a>
          </>
        )}
      </div>
    </nav>
  )
}

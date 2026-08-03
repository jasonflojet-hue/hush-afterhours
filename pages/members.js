import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Nav from '../components/Nav'
import { supabase } from '../lib/supabase'
import { ORIENTATION_TAGS, OrientationIcon } from '../components/OrientationTags'
import styles from '../styles/Members.module.css'

const TAG_LOOKUP = ORIENTATION_TAGS.reduce((acc, t) => { acc[t.key] = t; return acc }, {})

export default function Members() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null) // 'not_approved' | 'other' | null
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthChecked(true)
      if (!session) router.push('/login?next=/members')
    })
  }, [])

  useEffect(() => {
    if (!session) return
    loadMembers()
  }, [session])

  const loadMembers = async () => {
    setLoading(true)
    setError(null)
    const res = await fetch('/api/members', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(body.error === 'not_approved' ? 'not_approved' : 'other')
      setMembers([])
    } else {
      setMembers(body.members || [])
    }
    setLoading(false)
  }

  if (!authChecked || loading) {
    return (
      <>
        <Nav />
        <main className={styles.main}>
          <p className={styles.loadingText}>Loading members…</p>
        </main>
      </>
    )
  }

  return (
    <>
      <Head><title>Members — Hush Afterhours</title></Head>
      <Nav />
      <main className={styles.main}>
        <div className={styles.hero}>
          <span className={styles.eyebrow}>Members</span>
          <h1 className={styles.title}>Who's here.</h1>
          <p className={styles.sub}>Browse other approved members of Hush After Hours.</p>
        </div>

        {error === 'not_approved' && (
          <div className={styles.gateCard}>
            <p>You'll be able to browse other members once your application is approved.</p>
            <a href="/profile" className={styles.gateBtn}>Check your status →</a>
          </div>
        )}

        {error === 'other' && (
          <div className={styles.gateCard}>
            <p>Something went wrong loading members. Please try again in a moment.</p>
          </div>
        )}

        {!error && members.length === 0 && (
          <div className={styles.gateCard}>
            <p>No other members yet — check back soon.</p>
          </div>
        )}

        {!error && members.length > 0 && (
          <div className={styles.grid}>
            {members.map((m) => (
              <button key={m.id} className={styles.card} onClick={() => setSelected(m)}>
                <div className={styles.cardPhoto}>
                  {m.photo_urls?.[0] ? (
                    <img src={m.photo_urls[0]} alt={m.display_name} />
                  ) : m.avatar_url ? (
                    <img src={m.avatar_url} alt={m.display_name} />
                  ) : (
                    <span className={styles.cardInitial}>{m.display_name?.[0]?.toUpperCase() || '?'}</span>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.cardName}>
                    {m.display_name}{m.age ? <span className={styles.cardAge}> · {m.age}</span> : null}
                  </p>
                  {(m.city || m.state) && (
                    <p className={styles.cardLocation}>{[m.city, m.state].filter(Boolean).join(', ')}</p>
                  )}
                  {m.headline && <p className={styles.cardHeadline}>{m.headline}</p>}
                  {m.orientation_tags?.length > 0 && (
                    <div className={styles.cardTags}>
                      {m.orientation_tags.slice(0, 3).map((key) => {
                        const tag = TAG_LOOKUP[key]
                        if (!tag) return null
                        return (
                          <span
                            key={key}
                            className={styles.miniTag}
                            style={{ '--neon-color': tag.color, '--neon-glow': tag.glow }}
                            title={tag.label}
                          >
                            <span className={styles.miniTagIcon}><OrientationIcon id={tag.icon} /></span>
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {selected && (
        <div className={styles.modalOverlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setSelected(null)}>×</button>

            <div className={styles.modalPhotos}>
              {selected.photo_urls?.length > 0 ? (
                selected.photo_urls.map((url, i) => (
                  <img key={i} src={url} alt="" className={styles.modalPhoto} />
                ))
              ) : selected.avatar_url ? (
                <img src={selected.avatar_url} alt="" className={styles.modalPhoto} />
              ) : (
                <div className={styles.modalPhotoPlaceholder}>{selected.display_name?.[0]?.toUpperCase() || '?'}</div>
              )}
            </div>

            <h2 className={styles.modalName}>
              {selected.display_name}{selected.age ? <span className={styles.cardAge}> · {selected.age}</span> : null}
            </h2>
            {(selected.city || selected.state) && (
              <p className={styles.cardLocation}>{[selected.city, selected.state].filter(Boolean).join(', ')}</p>
            )}
            {selected.pronouns && <p className={styles.modalPronouns}>{selected.pronouns}</p>}
            {selected.headline && <p className={styles.modalHeadline}>"{selected.headline}"</p>}
            {selected.about_me && <p className={styles.modalAbout}>{selected.about_me}</p>}

            {selected.orientation_tags?.length > 0 && (
              <div className={styles.modalSection}>
                <p className={styles.modalLabel}>Orientation & vibe</p>
                <div className={styles.modalTagRow}>
                  {selected.orientation_tags.map((key) => {
                    const tag = TAG_LOOKUP[key]
                    if (!tag) return null
                    return (
                      <span
                        key={key}
                        className={styles.modalTag}
                        style={{ '--neon-color': tag.color, '--neon-glow': tag.glow }}
                      >
                        <span className={styles.miniTagIcon}><OrientationIcon id={tag.icon} /></span>
                        {tag.label}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {selected.looking_for?.length > 0 && (
              <div className={styles.modalSection}>
                <p className={styles.modalLabel}>Looking for</p>
                <div className={styles.pillRow}>
                  {selected.looking_for.map((v) => <span key={v} className={styles.pill}>{v}</span>)}
                </div>
              </div>
            )}

            {selected.interested_in?.length > 0 && (
              <div className={styles.modalSection}>
                <p className={styles.modalLabel}>Into at Hush</p>
                <div className={styles.pillRow}>
                  {selected.interested_in.map((v) => <span key={v} className={styles.pill}>{v}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

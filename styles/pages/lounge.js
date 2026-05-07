import { useEffect, useRef, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Nav from '../components/Nav'
import styles from '../styles/Lounge.module.css'

export default function Lounge() {
  const supabase = useSupabaseClient()
  const router = useRouter()
  const canvasRef = useRef(null)
  const [session, setSession] = useState(null)
  const [posts, setPosts] = useState([])
  const [newPost, setNewPost] = useState('')
  const [djLineup, setDjLineup] = useState([])
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    if (!session) return
    loadPosts()
    loadDJLineup()

    const channel = supabase
      .channel('lounge-posts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'lounge_posts'
      }, payload => {
        setPosts(prev => [payload.new, ...prev])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [session])

  useEffect(() => {
    if (!canvasRef.current || !session) return
    let animId
    import('three').then(THREE => {
      const canvas = canvasRef.current
      if (!canvas) return
      const W = () => canvas.parentElement?.clientWidth || window.innerWidth * 0.65
      const H = () => canvas.parentElement?.clientHeight || 500

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.shadowMap.enabled = true
      renderer.setSize(W(), H())

      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0x050308)
      scene.fog = new THREE.FogExp2(0x050308, 0.038)

      const camera = new THREE.PerspectiveCamera(60, W() / H(), 0.1, 100)
      camera.position.set(0, 4, 10)
      camera.lookAt(0, 1.5, -2)

      const resize = () => {
        renderer.setSize(W(), H())
        camera.aspect = W() / H()
        camera.updateProjectionMatrix()
      }
      window.addEventListener('resize', resize)

      const trimMat = new THREE.MeshStandardMaterial({ color: 0xc9a96e, roughness: 0.2, metalness: 0.9, emissive: 0xc9a96e, emissiveIntensity: 0.4 })

      const floor = new THREE.Mesh(new THREE.PlaneGeometry(28, 28, 28, 28), new THREE.MeshStandardMaterial({ color: 0x0a0810, roughness: 0.2, metalness: 0.8 }))
      floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor)
      const grid = new THREE.GridHelper(28, 28, 0x1a1020, 0x110d18); grid.position.y = 0.01; scene.add(grid)

      ;[[0, 4, -14, 0], [0, 4, 14, Math.PI], [-14, 4, 0, Math.PI / 2], [14, 4, 0, -Math.PI / 2]].forEach(([x, y, z, ry]) => {
        const w = new THREE.Mesh(new THREE.PlaneGeometry(28, 8), new THREE.MeshStandardMaterial({ color: 0x080610, roughness: 0.9 }))
        w.position.set(x, y, z); w.rotation.y = ry; scene.add(w)
      })

      const stage = new THREE.Mesh(new THREE.BoxGeometry(10, 0.4, 3.5), new THREE.MeshStandardMaterial({ color: 0x120e1a, roughness: 0.3, metalness: 0.7 }))
      stage.position.set(0, 0.2, -10.5); scene.add(stage)
      const booth = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 1), new THREE.MeshStandardMaterial({ color: 0x1a1020, roughness: 0.4, metalness: 0.6 }))
      booth.position.set(0, 1, -11); scene.add(booth)
      const boothTrim = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.05, 1.05), trimMat)
      boothTrim.position.set(0, 1.63, -11); scene.add(boothTrim)

      const screenRim = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 4.2), trimMat)
      screenRim.position.set(0, 4.5, -13.85); scene.add(screenRim)
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(7, 4), new THREE.MeshStandardMaterial({ color: 0x0a0510, emissive: 0x300a20, emissiveIntensity: 0.8 }))
      screen.position.set(0, 4.5, -13.8); scene.add(screen)

      const bar = new THREE.Mesh(new THREE.BoxGeometry(1, 1.1, 8), new THREE.MeshStandardMaterial({ color: 0x1a1020, roughness: 0.3, metalness: 0.7 }))
      bar.position.set(-10, 0.55, -2); scene.add(bar)
      const barTop = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 8.2), trimMat)
      barTop.position.set(-10, 1.14, -2); scene.add(barTop)

      ;[[4, 0, 2], [-4, 0, 2], [7, 0, -1], [-7, 0, -1], [4, 0, 5.5], [-4, 0, 5.5]].forEach(([x, y, z]) => {
        const t = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.07, 16), new THREE.MeshStandardMaterial({ color: 0x0e0b14, roughness: 0.4, metalness: 0.6 }))
        t.position.set(x, 0.66, z); scene.add(t)
        const r = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.03, 8, 32), trimMat)
        r.position.set(x, 0.7, z); r.rotation.x = Math.PI / 2; scene.add(r)
        const pl = new THREE.PointLight(0xc9a96e, 0.35, 3); pl.position.set(x, 0.9, z); scene.add(pl)
      })

      for (let i = -3; i <= 3; i++) {
        const s = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 12), new THREE.MeshStandardMaterial({ color: 0xc9a96e, emissive: 0xc9a96e, emissiveIntensity: 0.7 }))
        s.position.set(i * 2, 7.4, -2); scene.add(s)
      }

      scene.add(new THREE.AmbientLight(0x180d28, 1.2))
      const spotDJ = new THREE.SpotLight(0xfff0cc, 4, 22, Math.PI / 5, 0.5, 1.5)
      spotDJ.position.set(0, 8, -6); spotDJ.target.position.set(0, 1, -10); spotDJ.castShadow = true
      scene.add(spotDJ); scene.add(spotDJ.target)

      const movSpots = []
      ;[[0xff2060], [0x6020ff], [0x20a0ff], [0xc9a96e]].forEach(([col], i) => {
        const s = new THREE.SpotLight(col, 2.2, 18, Math.PI / 8, 0.7, 1.5)
        s.position.set(-6 + i * 3, 7, -1); s.target.position.set(0, 0, -6)
        scene.add(s); scene.add(s.target); movSpots.push(s)
      })
      const barLight = new THREE.PointLight(0x8040ff, 1.5, 7); barLight.position.set(-10, 2, -2); scene.add(barLight)

      let drag = false, prev = { x: 0, y: 0 }, sph = { theta: 0.1, phi: 1.05, r: 10 }
      const updateCam = () => {
        camera.position.x = sph.r * Math.sin(sph.phi) * Math.sin(sph.theta)
        camera.position.y = sph.r * Math.cos(sph.phi) + 2
        camera.position.z = sph.r * Math.sin(sph.phi) * Math.cos(sph.theta)
        camera.lookAt(0, 1.5, -2)
      }
      canvas.addEventListener('mousedown', e => { drag = true; prev = { x: e.clientX, y: e.clientY } })
      window.addEventListener('mouseup', () => drag = false)
      window.addEventListener('mousemove', e => {
        if (!drag) return
        sph.theta -= (e.clientX - prev.x) * 0.008
        sph.phi = Math.max(0.35, Math.min(1.5, sph.phi + (e.clientY - prev.y) * 0.006))
        prev = { x: e.clientX, y: e.clientY }; updateCam()
      })
      canvas.addEventListener('wheel', e => { sph.r = Math.max(4, Math.min(18, sph.r + e.deltaY * 0.01)); updateCam(); e.preventDefault() }, { passive: false })
      updateCam()

      let t = 0
      const animate = () => {
        animId = requestAnimationFrame(animate); t += 0.01
        movSpots.forEach((s, i) => { const a = t * 0.5 + i * Math.PI / 2; s.target.position.x = Math.sin(a) * 6; s.target.position.z = -5 + Math.cos(a) * 2; s.target.updateMatrixWorld() })
        barLight.intensity = 1.2 + Math.sin(t * 2) * 0.4
        screen.material.emissiveIntensity = 0.6 + Math.sin(t * 3) * 0.25
        renderer.render(scene, camera)
      }
      animate()
      setLoading(false)

      return () => {
        window.removeEventListener('resize', resize)
        cancelAnimationFrame(animId)
        renderer.dispose()
      }
    })
  }, [session])

  const loadPosts = async () => {
    const { data } = await supabase.from('lounge_posts').select('*').order('created_at', { ascending: false }).limit(30)
    if (data) setPosts(data)
  }

  const loadDJLineup = async () => {
    const { data } = await supabase.from('dj_lineup').select('*').order('set_time')
    if (data) setDjLineup(data)
  }

  const handlePost = async (e) => {
    e.preventDefault()
    if (!newPost.trim()) return
    const { data: profile } = await supabase.from('profiles').select('first_name, last_name, nickname, avatar_url').eq('id', session.user.id).single()
    await supabase.from('lounge_posts').insert({
      author_id: session.user.id,
      author_name: profile?.nickname || profile?.first_name || 'Member',
      author_avatar: profile?.avatar_url || null,
      content: newPost.trim(),
      post_type: 'text'
    })
    setNewPost('')
  }

  if (!authChecked) return null

  const currentDJ = djLineup.find(d => d.is_live) || djLineup[0]

  return (
    <>
      <Head><title>The Lounge — Hush Afterhours</title></Head>
      <Nav />
      <div className={styles.loungeWrap}>
        <div className={styles.canvasWrap}>
          {loading && <div className={styles.loading}>Entering the lounge...</div>}
          <canvas ref={canvasRef} className={styles.canvas} />
          <div className={styles.canvasHint}>Drag to explore · Scroll to zoom</div>
        </div>
        <div className={styles.panel}>
          <div className={styles.nowPlaying}>
            <p className={styles.panelLabel}>Now playing</p>
            <div className={styles.liveRow}>
              <span className={styles.liveDot} />
              <span className={styles.liveText}>Live</span>
            </div>
            <p className={styles.djName}>{currentDJ?.dj_name || 'DJ Phantom'}</p>
            <p className={styles.djGenre}>{currentDJ?.genre || 'Deep House · Afrobeats'}</p>
            <div className={styles.progressBar}><div className={styles.progressFill} /></div>
          </div>
          {djLineup.length > 0 && (
            <div className={styles.lineup}>
              <p className={styles.panelLabel}>Tonight's lineup</p>
              {djLineup.map((dj) => (
                <div key={dj.id} className={styles.lineupItem}>
                  <div className={styles.lineupAv}>{dj.dj_name.slice(0, 2).toUpperCase()}</div>
                  <div className={styles.lineupInfo}>
                    <p className={styles.lineupName}>{dj.dj_name}</p>
                    <p className={styles.lineupGenre}>{dj.genre}</p>
                  </div>
                  <span className={styles.lineupTime}>{dj.is_live ? 'Now' : dj.set_time}</span>
                </div>
              ))}
            </div>
          )}
          <div className={styles.feed}>
            <p className={styles.panelLabel}>Member feed</p>
            <div className={styles.posts}>
              {posts.length === 0 && <p className={styles.emptyFeed}>Be the first to post something.</p>}
              {posts.map(post => (
                <div key={post.id} className={styles.post}>
                  <div className={styles.postAv}>{post.author_name?.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <p className={styles.postAuthor}>{post.author_name}</p>
                    <p className={styles.postContent}>{post.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handlePost} className={styles.postForm}>
              <input value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="Share your vibe with the room..." className={styles.postInput} />
              <button type="submit" className={styles.postBtn}>Post</button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

import Head from 'next/head'
import Nav from '../components/Nav'
import styles from '../styles/Why.module.css'

export default function Why() {
  return (
    <>
      <Head><title>Why I Built Hush — Jason Ward</title></Head>
      <Nav />
      <main className={styles.main}>

        {/* HERO */}
        <div className={styles.hero}>
          <p className={styles.eyebrow}>A letter from the founder</p>
          <h1 className={styles.title}>Why I built<br /><em>Hush</em></h1>
          <p className={styles.sub}>This isn't a dating app. It isn't a nightclub. It's something we used to have — and somehow lost.</p>
          <div className={styles.scrollLine} />
        </div>

        {/* FOUNDER */}
        <div className={styles.founderSection}>
          <div className={styles.founderImg}>
            <img src="/founder.jpg" alt="Jason Ward, Founder" />
          </div>
          <div className={styles.founderBio}>
            <p className={styles.sectionLabel}>The founder</p>
            <h2 className={styles.founderName}>Jason Ward</h2>
            <p className={styles.founderTitle}>Founder & CEO, KontraBand Entertainment LLC</p>
            <p>An entrepreneur, connector, and someone who got tired of watching real human connection get replaced by algorithms and subscription fees. Jason built Hush to bring back the one thing no app has ever been able to replicate — the electricity of meeting someone in real life.</p>
          </div>
        </div>

        <div className={styles.content}>

          {/* THE PROBLEM */}
          <div className={styles.section}>
            <p className={styles.sectionLabel}>The problem</p>
            <p>Loneliness is becoming an epidemic. Not because people don't want connection — but because the conditions for real connection are disappearing.</p>
            <p>Think about what's happened over the last decade. Technology has quietly pulled us indoors. Dating apps became the default way to find a partner. And somewhere in that shift, we lost something essential — the spontaneous, unscripted moment of meeting someone in real life.</p>
          </div>

          {/* DISCONNECT IMAGE */}
          <div className={styles.disconnectSection}>
            <div className={styles.disconnectVisual}>
              <svg viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg" className={styles.disconnectSvg}>
                {/* Left figure - woman */}
                <ellipse cx="180" cy="80" rx="35" ry="35" fill="rgba(255,45,155,0.15)" stroke="rgba(255,45,155,0.4)" strokeWidth="1"/>
                <line x1="180" y1="115" x2="180" y2="210" stroke="rgba(255,45,155,0.4)" strokeWidth="2"/>
                <line x1="180" y1="145" x2="145" y2="175" stroke="rgba(255,45,155,0.4)" strokeWidth="2"/>
                <line x1="180" y1="145" x2="215" y2="175" stroke="rgba(255,45,155,0.4)" strokeWidth="2"/>
                <line x1="180" y1="210" x2="155" y2="255" stroke="rgba(255,45,155,0.4)" strokeWidth="2"/>
                <line x1="180" y1="210" x2="205" y2="255" stroke="rgba(255,45,155,0.4)" strokeWidth="2"/>
                {/* Right figure - man */}
                <ellipse cx="420" cy="80" rx="35" ry="35" fill="rgba(0,200,255,0.1)" stroke="rgba(0,200,255,0.4)" strokeWidth="1"/>
                <line x1="420" y1="115" x2="420" y2="210" stroke="rgba(0,200,255,0.4)" strokeWidth="2"/>
                <line x1="420" y1="145" x2="385" y2="175" stroke="rgba(0,200,255,0.4)" strokeWidth="2"/>
                <line x1="420" y1="145" x2="455" y2="175" stroke="rgba(0,200,255,0.4)" strokeWidth="2"/>
                <line x1="420" y1="210" x2="395" y2="255" stroke="rgba(0,200,255,0.4)" strokeWidth="2"/>
                <line x1="420" y1="210" x2="445" y2="255" stroke="rgba(0,200,255,0.4)" strokeWidth="2"/>
                {/* Crack/divide in middle */}
                <line x1="300" y1="20" x2="300" y2="280" stroke="rgba(255,194,0,0.3)" strokeWidth="1" strokeDasharray="8,6"/>
                <text x="300" y="295" textAnchor="middle" fill="rgba(255,194,0,0.5)" fontSize="11" fontFamily="Montserrat" letterSpacing="3">DISCONNECTED</text>
                {/* Phone icons */}
                <rect x="155" y="160" width="18" height="28" rx="3" fill="none" stroke="rgba(255,45,155,0.5)" strokeWidth="1.5"/>
                <rect x="427" y="160" width="18" height="28" rx="3" fill="none" stroke="rgba(0,200,255,0.5)" strokeWidth="1.5"/>
              </svg>
            </div>
            <p className={styles.disconnectCaption}>Two people. Two phones. Zero connection.</p>
          </div>

          <div className={styles.pullQuote}>
            <p>"Somewhere in that shift, we lost the one wild card that every algorithm is missing — human interaction, unfiltered, in the moment."</p>
          </div>

          <div className={styles.section}>
            <p className={styles.sectionLabel}>The disconnect</p>
            <p>Here's what I kept coming back to: the way men and women come to attraction is fundamentally different. Women are moved emotionally first. Men often need physical connection before emotional intimacy develops. These two wiring patterns are not wrong. They're just human. But put them on a profile-matching app and they become a collision course.</p>
            <p>Women narrow the field. Men misread the signals. And somewhere in the middle, two people who might have been genuinely right for each other never get the chance to find out.</p>
          </div>

          <div className={styles.section}>
            <p className={styles.sectionLabel}>The answer</p>
            <p>I didn't build Hush to fight technology. I built it to put technology in its proper place — as a door, not a destination. What happens at Hush isn't a profile swap or a swipe. It's a room full of open-minded adults, music that sets a mood, and the one thing no algorithm can replicate.</p>
            <p>A real moment. In real time. With a real person standing in front of you. No resume. No highlight reel. Just you, showing up.</p>
          </div>

          <div className={styles.pullQuote}>
            <p>"Not by expecting an entire generation to give up their tech — but by bringing the spin of random, face-to-face meetings back into their lives."</p>
          </div>

          <div className={styles.section}>
            <p className={styles.sectionLabel}>What this is</p>
            <p>Hush is a private social club for open-minded adults who believe that real connection still matters. Every member is hand-selected. Every experience is curated. And every interaction happens with one rule above all others — respect.</p>
            <p>If you're reading this, it's probably because some part of you already knows exactly what I mean.</p>
          </div>

          <div className={styles.signature}>
            <img src="/founder.jpg" alt="Jason Ward" className={styles.sigPhoto} />
            <div>
              <p className={styles.sigName}>Jason Ward</p>
              <p className={styles.sigTitle}>Founder, Hush Afterhours · KontraBand Entertainment LLC</p>
            </div>
          </div>

          {/* LOGOS */}
          <div className={styles.brandBar}>
            <img src="/hush-logo.png" alt="Hush" className={styles.brandLogo} />
            <img src="/kontraband-logo.png" alt="KontraBand Entertainment" className={styles.brandLogoLarge} />
          </div>
        </div>

        <div className={styles.cta}>
          <h2 className={styles.ctaTitle}>Ready to be part of it?</h2>
          <p className={styles.ctaSub}>Applications are reviewed personally. Not everyone gets in — and that's the point.</p>
          <a href="/apply" className="btn-gold">Apply for membership</a>
        </div>
      </main>
    </>
  )
}

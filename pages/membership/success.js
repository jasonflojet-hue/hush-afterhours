import Head from 'next/head'
import Nav from '../../components/Nav'
import DonationWidget from '../../components/DonationWidget'
import styles from '../../styles/MembershipSuccess.module.css'

// Note: this page trusts Stripe's redirect for the confirmation UI, but the
// actual membership status change (profiles.membership_status = 'active')
// is written by the webhook (checkout.session.completed), not by this page.
// Stripe fires the webhook independently of the browser redirect, so even
// if someone closes the tab before landing here, their membership still
// activates correctly.
export default function MembershipSuccess() {
  return (
    <>
      <Head><title>Welcome — Hush Afterhours</title></Head>
      <Nav />
      <main className={styles.main}>
        <div className={styles.confirmation}>
          <p className={styles.icon}>◈</p>
          <h1 className={styles.title}>You're in.</h1>
          <p className={styles.sub}>
            Welcome to Legacy Membership. Your access is being activated now — head to the Lounge to get started.
          </p>
          <a href="/lounge" className="btn-gold">Enter the Lounge →</a>
        </div>

        <div className={styles.donationSection}>
          <DonationWidget
            heading="Feeling generous?"
            subtext="Since you're already here — a donation goes straight toward keeping the lounge running and the events coming."
            campaign="post_signup"
          />
        </div>
      </main>
    </>
  )
}

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

// Verification now lives at the bottom of /profile instead of its own page
// (product call 8/1/26 -- one place to look, not a redirect chain). This
// page stays alive as a redirect only so already-sent emails and any
// bookmarks pointing at /verify-id still land somewhere useful instead of
// a 404.
export default function VerifyIdRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/profile')
  }, [])

  return (
    <>
      <Head><title>Redirecting… — Hush Afterhours</title></Head>
    </>
  )
}

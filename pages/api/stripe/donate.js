import Stripe from 'stripe'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Donations are one-off Checkout sessions (mode: 'payment'), never
// subscriptions, and never require an account — this route works for both
// anonymous visitors (footer of the public page) and logged-in members
// (post-signup confirmation page).
//
// Kept generic on purpose: `campaign` is a free-text label passed straight
// through to Stripe metadata. A future giveaway ("donate for a chance to
// win") can be wired up by changing copy/labels on the frontend and reading
// this same metadata field later — no changes needed here.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { amount, campaign, returnPath } = req.body || {}

  const amountInCents = Number(amount)
  if (!Number.isInteger(amountInCents) || amountInCents < 100) {
    return res.status(400).json({ error: 'Donation amount must be at least $1.' })
  }
  // Sanity ceiling to guard against typos/abuse (e.g. someone fat-fingering
  // an extra zero into the custom amount field). Raise if a legit large
  // donation ever needs it.
  if (amountInCents > 500000) {
    return res.status(400).json({ error: 'Amount too large — contact us directly for donations over $5,000.' })
  }

  // Optional: if the visitor happens to be logged in, attach their Supabase
  // user id for record-keeping. Not required.
  let supabaseUserId = null
  try {
    const supabase = createPagesServerClient({ req, res })
    const { data: { session } } = await supabase.auth.getSession()
    supabaseUserId = session?.user?.id || null
  } catch {
    // Not logged in / no session — fine, donations don't require auth.
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || ''
  const safeReturnPath = typeof returnPath === 'string' && returnPath.startsWith('/') ? returnPath : '/'

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amountInCents,
            product_data: {
              name: 'Donation to Hush After Hours',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${site}${safeReturnPath}${safeReturnPath.includes('?') ? '&' : '?'}donation=success`,
      cancel_url: `${site}${safeReturnPath}${safeReturnPath.includes('?') ? '&' : '?'}donation=cancelled`,
      metadata: {
        type: 'donation',
        campaign: campaign || 'general',
        supabase_user_id: supabaseUserId || '',
      },
    })

    res.json({ url: checkoutSession.url })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}

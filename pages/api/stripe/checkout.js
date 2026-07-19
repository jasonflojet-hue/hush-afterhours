import Stripe from 'stripe'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Server-side map of the only two purchasable options right now.
// Client sends 'monthly' | 'annual' — never a raw Stripe price ID —
// so there's no way to inject an arbitrary/unapproved price from the browser.
const PRICE_MAP = {
  monthly: process.env.STRIPE_PRICE_LEGACY_MONTHLY,
  annual: process.env.STRIPE_PRICE_LEGACY_ANNUAL,
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const supabase = createPagesServerClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return res.status(401).json({ error: 'Not authenticated' })

  const { billingPeriod } = req.body || {}
  const priceId = PRICE_MAP[billingPeriod]

  if (!priceId) {
    return res.status(400).json({ error: 'Invalid billing period. Must be "monthly" or "annual".' })
  }

  try {
    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email, first_name, last_name')
      .eq('id', session.user.id)
      .single()

    let customerId = profile?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email || session.user.email,
        name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
        metadata: { supabase_user_id: session.user.id },
      })
      customerId = customer.id
      await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', session.user.id)
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/membership/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/membership`,
      metadata: {
        supabase_user_id: session.user.id,
        tier: 'legacy',
        billing_period: billingPeriod,
      },
      // Metadata on the session isn't automatically copied onto the subscription
      // object that later webhook events (customer.subscription.*) receive, so
      // duplicate it here too — the webhook needs it there for those events.
      subscription_data: {
        metadata: {
          supabase_user_id: session.user.id,
          tier: 'legacy',
          billing_period: billingPeriod,
        },
      },
    })

    res.json({ url: checkoutSession.url })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Service-role client: webhooks have no logged-in user/session, so we need
// a client that bypasses RLS to write membership status onto profiles.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Stripe requires the raw, unparsed request body to verify the signature.
export const config = {
  api: { bodyParser: false },
}

async function buffer(readable) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

function expiresAtFromSubscription(subscription) {
  return subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null
}

// Maps Stripe's subscription statuses onto our three-value membership_status.
function mapStatus(stripeStatus) {
  if (stripeStatus === 'active' || stripeStatus === 'trialing') return 'active'
  if (stripeStatus === 'past_due' || stripeStatus === 'unpaid' || stripeStatus === 'incomplete') return 'past_due'
  return 'canceled' // canceled, incomplete_expired
}

async function updateProfileByCustomerId(customerId, fields) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update(fields)
    .eq('stripe_customer_id', customerId)

  if (error) console.error('Supabase update failed for customer', customerId, error)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const sig = req.headers['stripe-signature']
  const buf = await buffer(req)

  let event
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object

        // Only membership checkouts reach here — donation checkout sessions
        // (one-off, mode: 'payment') don't carry a supabase_user_id and are
        // ignored by this handler.
        if (session.mode !== 'subscription' || !session.metadata?.supabase_user_id) break

        const subscription = await stripe.subscriptions.retrieve(session.subscription)

        await supabaseAdmin
          .from('profiles')
          .update({
            membership_tier: 'legacy',
            membership_status: 'active',
            billing_period: session.metadata.billing_period || null,
            stripe_customer_id: session.customer,
            membership_started_at: new Date().toISOString(),
            membership_expires_at: expiresAtFromSubscription(subscription),
          })
          .eq('id', session.metadata.supabase_user_id)

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        await updateProfileByCustomerId(subscription.customer, {
          membership_status: mapStatus(subscription.status),
          membership_expires_at: expiresAtFromSubscription(subscription),
          billing_period: subscription.metadata?.billing_period || undefined,
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        await updateProfileByCustomerId(subscription.customer, {
          membership_status: 'canceled',
          membership_expires_at: new Date().toISOString(),
        })
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        // Grace period: 3 days, confirmed by Jas. We don't revoke access
        // here: we just flag past_due. membership_expires_at is left as-is,
        // so the member keeps access until it naturally expires or Stripe's
        // retry cycle resolves the invoice (paid -> active) or exhausts
        // retries (subscription.updated fires with status unpaid/canceled,
        // which the handlers above will then act on).
        //
        // Note: this relies on Stripe's own retry schedule roughly lining
        // up with 3 days. If you want a hard 3-day cutoff regardless of
        // Stripe's retry timing, that needs an explicit scheduled check
        // (e.g. a cron job comparing now() to the invoice's failure date) —
        // not built here since it's out of scope for this pass. Flagging in
        // case the difference matters to you.
        await updateProfileByCustomerId(invoice.customer, {
          membership_status: 'past_due',
        })
        break
      }

      default:
        // Unhandled event type — no-op.
        break
    }

    res.json({ received: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    // Return 500 so Stripe retries the event.
    res.status(500).json({ error: 'Webhook handler failed' })
  }
}

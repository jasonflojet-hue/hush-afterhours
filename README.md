# Hush Afterhours — Custom Platform

Built with Next.js + Supabase + Stripe, deployed on Vercel.

---

## Stack
- **Frontend**: Next.js 14
- **Database + Auth**: Supabase
- **Payments**: Stripe
- **3D Lounge**: Three.js
- **Hosting**: Vercel
- **Domain**: hushafterhours.live

---

## Setup — Do These In Order

### 1. Supabase
1. Go to https://supabase.com and create a new project
2. Name it `hush-afterhours`
3. Go to **SQL Editor** and paste the entire contents of `supabase/schema.sql`
4. Run it — this creates all your tables, RLS policies, and triggers
5. Go to **Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Service role key → `SUPABASE_SERVICE_ROLE_KEY`
6. Go to **Authentication → Settings** and set:
   - Site URL: `https://hushafterhours.live`
   - Redirect URLs: add `https://hushafterhours.live/**`

### 2. Stripe
1. Go to https://stripe.com and create an account
2. Create 3 recurring monthly products in the Stripe dashboard:
   - **Afterhours** — $15/month
   - **Hush Gold** — $35/month
   - **Black Card** — $75/month
3. Copy the Price IDs (start with `price_`) for each
4. Copy your API keys from Developers → API Keys

### 3. Environment Variables
Copy `.env.local.example` to `.env.local` and fill in all values:
```
cp .env.local.example .env.local
```

### 4. Install & Run Locally
```bash
npm install
npm run dev
```
Open http://localhost:3000

### 5. Deploy to Vercel
1. Push this folder to GitHub:
```bash
git init
git add .
git commit -m "Initial Hush Afterhours build"
git remote add origin https://github.com/YOUR_USERNAME/hush-afterhours.git
git push -u origin main
```
2. Go to https://vercel.com → New Project → Import from GitHub
3. Select `hush-afterhours`
4. Add all environment variables from `.env.local`
5. Click Deploy

### 6. Connect Your Domain
1. In Vercel → your project → Settings → Domains
2. Add `hushafterhours.live`
3. Vercel will give you DNS records
4. In Wix (or wherever domain is managed) → DNS Settings
5. Update the nameservers or A/CNAME records to point to Vercel
6. Wait up to 24 hours for propagation (usually 15 minutes)

---

## Pages
| Route | Description |
|---|---|
| `/` | Home / welcome page |
| `/apply` | Beta application form |
| `/login` | Member sign in |
| `/lounge` | 3D immersive lounge + chat (members only) |
| `/membership` | Pricing tiers + Stripe checkout |
| `/why` | Jason's story |
| `/profile` | Member profile (coming next) |
| `/shop` | Merch shop (coming next) |
| `/admin` | Admin dashboard (coming next) |

---

## What's Built
- ✅ Home page
- ✅ Beta application form (saves to Supabase)
- ✅ Member auth (sign up, login, password reset)
- ✅ 3D Lounge with Three.js + member feed
- ✅ Membership page with 3 tiers
- ✅ Stripe checkout for subscriptions
- ✅ Why I Built This page
- ✅ Full database schema with RLS

## Coming Next (tell Claude to build these)
- Member profiles page
- Member-to-member messaging
- Shop page with Stripe products
- Admin dashboard for reviewing applications
- Email notifications when applications are submitted

---

## Domain Transfer From Wix
When you cancel Wix:
1. **Before cancelling**: Make sure you have your domain's auth/transfer code from Wix Settings → Domains
2. Transfer the domain to Namecheap or Google Domains (~$12/year)
3. Or just update the DNS records to point to Vercel (faster, no transfer needed)
force rebuild

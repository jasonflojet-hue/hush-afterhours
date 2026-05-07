-- ============================================
-- HUSH AFTERHOURS — SUPABASE SCHEMA
-- Run this in your Supabase SQL editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- Extends Supabase auth.users
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  first_name text,
  last_name text,
  nickname text,
  avatar_url text,
  birthday date,
  gender text,
  looking_for text,
  my_vibe text,
  about_me text,
  zip_code text,
  energy text,
  newsletter boolean default false,
  membership_tier text default 'none', -- none, afterhours, hush_gold, black_card
  membership_status text default 'pending', -- pending, active, cancelled
  stripe_customer_id text,
  is_approved boolean default false,
  is_beta_member boolean default false,
  photo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS: users can read public profiles, only edit their own
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by members" on public.profiles
  for select using (auth.role() = 'authenticated');
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- ============================================
-- MESSAGES TABLE
-- Member to member direct messages
-- ============================================
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles(id) on delete cascade,
  recipient_id uuid references public.profiles(id) on delete cascade,
  sender_name text,
  content text not null,
  conversation_id text not null, -- sorted concat of both user ids
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.messages enable row level security;
create policy "Members can send messages" on public.messages
  for insert with check (auth.uid() = sender_id);
create policy "Members can read their own messages" on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = recipient_id);
create policy "Recipients can mark messages read" on public.messages
  for update using (auth.uid() = recipient_id);

-- ============================================
-- LOUNGE POSTS TABLE
-- Member social feed
-- ============================================
create table public.lounge_posts (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.profiles(id) on delete cascade,
  author_name text,
  author_avatar text,
  content text not null,
  likes_count integer default 0,
  post_type text default 'text', -- text, vibe, event
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.lounge_posts enable row level security;
create policy "Members can view lounge posts" on public.lounge_posts
  for select using (auth.role() = 'authenticated');
create policy "Members can create posts" on public.lounge_posts
  for insert with check (auth.uid() = author_id);
create policy "Authors can delete own posts" on public.lounge_posts
  for delete using (auth.uid() = author_id);

-- ============================================
-- POST LIKES TABLE
-- ============================================
create table public.post_likes (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.lounge_posts(id) on delete cascade,
  member_id uuid references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(post_id, member_id)
);

alter table public.post_likes enable row level security;
create policy "Members can like posts" on public.post_likes
  for all using (auth.role() = 'authenticated');

-- ============================================
-- DJ LINEUP TABLE
-- ============================================
create table public.dj_lineup (
  id uuid default uuid_generate_v4() primary key,
  dj_name text not null,
  genre text,
  set_time text,
  stream_url text,
  is_live boolean default false,
  event_date date,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.dj_lineup enable row level security;
create policy "Members can view DJ lineup" on public.dj_lineup
  for select using (auth.role() = 'authenticated');
create policy "Admins can manage DJ lineup" on public.dj_lineup
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and membership_tier = 'admin'
    )
  );

-- ============================================
-- BETA APPLICATIONS TABLE
-- ============================================
create table public.beta_applications (
  id uuid default uuid_generate_v4() primary key,
  first_name text,
  last_name text,
  email text unique not null,
  phone text,
  birthday date,
  gender text,
  looking_for text,
  vibe_description text,
  respect_answer text,
  energy text,
  zip_code text,
  photo_url text,
  newsletter boolean default false,
  donation_amount integer default 0,
  status text default 'pending', -- pending, approved, rejected
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.beta_applications enable row level security;
create policy "Anyone can submit an application" on public.beta_applications
  for insert with check (true);
create policy "Admins can view applications" on public.beta_applications
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and membership_tier = 'admin'
    )
  );

-- ============================================
-- MEMBERSHIPS TABLE
-- Tracks Stripe subscriptions
-- ============================================
create table public.memberships (
  id uuid default uuid_generate_v4() primary key,
  member_id uuid references public.profiles(id) on delete cascade,
  stripe_subscription_id text unique,
  stripe_customer_id text,
  tier text not null, -- afterhours, hush_gold, black_card
  status text not null, -- active, cancelled, past_due
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.memberships enable row level security;
create policy "Members can view own membership" on public.memberships
  for select using (auth.uid() = member_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profile_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ============================================
-- SEED: Insert the 6 beta members
-- Run after setting up auth users
-- ============================================
-- Note: Run this after your beta members sign up via the app
-- Their profiles will be auto-created, then update like this:

-- update public.profiles set
--   first_name = 'Chris', last_name = 'Wood',
--   birthday = '1978-07-12', zip_code = '32792',
--   is_approved = true, is_beta_member = true,
--   membership_tier = 'afterhours'
-- where email = 'chrisw.ccdish@gmail.com';

-- Waitlist table
create table if not exists waitlist (
  id uuid default gen_random_uuid() primary key,
  name text,
  email text unique not null,
  created_at timestamp with time zone default now()
);

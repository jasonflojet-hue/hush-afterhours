-- ============================================
-- Adds Legacy Membership billing columns to profiles
-- Run this in Supabase SQL editor against the LIVE project
-- (schema.sql is the from-scratch script and won't touch
-- the existing profiles table since it already exists)
-- ============================================

alter table public.profiles
  add column if not exists billing_period text, -- monthly, annual
  add column if not exists membership_started_at timestamp with time zone,
  add column if not exists membership_expires_at timestamp with time zone;

-- membership_status previously allowed: pending, active, cancelled
-- webhook.js now also writes 'past_due' and 'canceled' (not 'cancelled') —
-- this is a free-text column so no constraint needs updating, but flagging
-- the spelling difference ('cancelled' vs 'canceled') in case any existing
-- UI code filters/matches on the old spelling.

-- ============================================================
--  The Legacy Circle · Supabase setup
--  Run this once: Supabase Dashboard → SQL Editor → New query
--  → paste everything → Run.
--  Creates two tables with insert-only public access:
--  visitors can write, only you (dashboard) can read.
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- Invitation requests (the pipeline) ----------
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  role text not null,
  city text not null,
  investable_range text not null,
  money_should_buy text not null,
  nominated_by text,
  contact text not null,
  source text not null default 'website'
);

alter table public.invitations enable row level security;

drop policy if exists "anon can request an invitation" on public.invitations;
create policy "anon can request an invitation"
  on public.invitations
  for insert
  to anon
  with check (true);

-- ---------- Legacy Letters subscribers ----------
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique,
  source text not null default 'website'
);

alter table public.subscribers enable row level security;

drop policy if exists "anon can subscribe" on public.subscribers;
create policy "anon can subscribe"
  on public.subscribers
  for insert
  to anon
  with check (true);

-- Note: no select / update / delete policies are granted to anon.
-- The public can only add rows. Reading happens in your dashboard
-- (Table Editor) or with the service key on a backend.

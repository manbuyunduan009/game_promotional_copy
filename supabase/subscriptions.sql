do $$
begin
  create type public.payment_status as enum ('free', 'active', 'past_due', 'canceled');
exception
  when duplicate_object then null;
end $$;

alter table public.profiles
add column if not exists payment_status public.payment_status not null default 'free';

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  stripe_checkout_session_id text unique,
  stripe_price_id text,
  plan public.subscription_plan not null default 'pro',
  status text not null default 'incomplete',
  current_period_start timestamptz,
  current_period_end timestamptz,
  raw_event jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create index if not exists subscriptions_user_created_at_idx
on public.subscriptions (user_id, created_at desc);

create index if not exists subscriptions_stripe_customer_idx
on public.subscriptions (stripe_customer_id);

do $$
begin
  create policy "Users can read their own subscriptions"
  on public.subscriptions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);
exception
  when duplicate_object then null;
end $$;

create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_name text not null,
  description text not null,
  target_audience text not null,
  selling_points text not null,
  publishing_channel text not null,
  game_type text,
  genre text,
  style text,
  purpose text,
  campaign_info text,
  prompt jsonb not null,
  output text not null,
  model text not null,
  status text not null default 'success',
  error_message text,
  latency_ms integer,
  input_tokens integer,
  output_tokens integer,
  total_tokens integer,
  created_at timestamptz not null default now()
);

alter table public.generations
add column if not exists status text not null default 'success';

alter table public.generations
add column if not exists error_message text;

alter table public.generations
add column if not exists latency_ms integer;

alter table public.generations
add column if not exists input_tokens integer;

alter table public.generations
add column if not exists output_tokens integer;

alter table public.generations
add column if not exists total_tokens integer;

alter table public.generations enable row level security;

create index if not exists generations_user_created_at_idx
on public.generations (user_id, created_at desc);

do $$
begin
  create policy "Users can read their own generations"
  on public.generations
  for select
  to authenticated
  using ((select auth.uid()) = user_id);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create policy "Users can insert their own generations"
  on public.generations
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);
exception
  when duplicate_object then null;
end $$;

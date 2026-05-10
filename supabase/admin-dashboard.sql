do $$
begin
  create type public.payment_status as enum ('free', 'active', 'past_due', 'canceled');
exception
  when duplicate_object then null;
end $$;

alter table public.profiles
add column if not exists payment_status public.payment_status not null default 'free';

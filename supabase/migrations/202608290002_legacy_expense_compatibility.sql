-- Upgrade projects that already had the original expenses table.
-- CREATE TABLE IF NOT EXISTS does not add newly introduced columns, so keep
-- this migration idempotent and safe for both legacy and fresh installations.

alter table public.expenses add column if not exists currency text not null default 'INR';
alter table public.expenses add column if not exists category_id text default 'General';
alter table public.expenses add column if not exists category_ref uuid references public.categories(id) on delete set null;
alter table public.expenses add column if not exists receipt_url text;
alter table public.expenses add column if not exists is_recurring boolean not null default false;
alter table public.expenses add column if not exists recurring_interval text;
alter table public.expenses add column if not exists tags text[] not null default '{}';
alter table public.expenses add column if not exists mood text;
alter table public.expenses add column if not exists notes text;
alter table public.expenses add column if not exists created_at timestamptz not null default now();
alter table public.expenses add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.expenses'::regclass
      and conname = 'expenses_recurring_interval_check'
  ) then
    alter table public.expenses
      add constraint expenses_recurring_interval_check
      check (recurring_interval is null or recurring_interval in ('daily', 'weekly', 'monthly', 'yearly'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.expenses'::regclass
      and conname = 'expenses_mood_check'
  ) then
    alter table public.expenses
      add constraint expenses_mood_check
      check (mood is null or mood in ('happy', 'neutral', 'guilty', 'excited', 'stressed'));
  end if;
end;
$$;

notify pgrst, 'reload schema';

-- FinFlow end-to-end schema foundation.
-- Safe to apply to an existing project: it creates missing objects and preserves rows.

create extension if not exists "uuid-ossp";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  monthly_salary numeric(14,2) not null default 0 check (monthly_salary >= 0),
  pay_date integer not null default 1 check (pay_date between 1 and 31),
  savings_goal_percent numeric(5,2) not null default 20 check (savings_goal_percent between 0 and 100),
  onboarding_complete boolean not null default false,
  default_currency text not null default 'INR',
  budget_alerts_enabled boolean not null default true,
  reminder_notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists default_currency text not null default 'INR';
alter table public.profiles add column if not exists budget_alerts_enabled boolean not null default true;
alter table public.profiles add column if not exists reminder_notifications_enabled boolean not null default true;

create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#00a86b',
  icon text not null default 'wallet',
  kind text not null default 'expense' check (kind in ('expense', 'income', 'both')),
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name, kind)
);

create table if not exists public.expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  currency text not null default 'INR',
  description text not null,
  category_id text default 'General',
  category_ref uuid references public.categories(id) on delete set null,
  date date not null default current_date,
  receipt_url text,
  is_recurring boolean not null default false,
  recurring_interval text check (recurring_interval is null or recurring_interval in ('daily', 'weekly', 'monthly', 'yearly')),
  tags text[] not null default '{}',
  mood text check (mood is null or mood in ('happy', 'neutral', 'guilty', 'excited', 'stressed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.expenses add column if not exists category_ref uuid references public.categories(id) on delete set null;
alter table public.expenses add column if not exists updated_at timestamptz not null default now();

create table if not exists public.incomes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  currency text not null default 'INR',
  source text not null,
  category_id text default 'Income',
  date date not null default current_date,
  is_recurring boolean not null default false,
  recurring_interval text check (recurring_interval is null or recurring_interval in ('daily', 'weekly', 'monthly', 'yearly')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.category_budgets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_name text not null,
  monthly_limit numeric(14,2) not null check (monthly_limit >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, category_name)
);

create table if not exists public.savings_goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(14,2) not null check (target_amount > 0),
  current_amount numeric(14,2) not null default 0 check (current_amount >= 0),
  target_date date,
  status text not null default 'active' check (status in ('active', 'completed', 'paused')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.goal_contributions (
  id uuid primary key default uuid_generate_v4(),
  goal_id uuid not null references public.savings_goals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  contribution_date date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.debts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  person_name text not null,
  contact text,
  amount numeric(14,2) not null check (amount > 0),
  paid_amount numeric(14,2) not null default 0 check (paid_amount >= 0),
  type text not null check (type in ('i_owe', 'owed_to_me')),
  borrowed_date date not null default current_date,
  due_date date,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'partial', 'settled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.debts add column if not exists updated_at timestamptz not null default now();

create table if not exists public.debt_payments (
  id uuid primary key default uuid_generate_v4(),
  debt_id uuid not null references public.debts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  payment_date date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.investments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  amount_invested numeric(14,2) not null check (amount_invested >= 0),
  current_value numeric(14,2) not null check (current_value >= 0),
  start_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.investments add column if not exists updated_at timestamptz not null default now();

create table if not exists public.wishlist (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_name text not null,
  estimated_price numeric(14,2) not null check (estimated_price > 0),
  priority text not null default 'Medium' check (priority in ('High', 'Medium', 'Low')),
  link text,
  target_date date,
  is_purchased boolean not null default false,
  purchased_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.wishlist add column if not exists purchased_at timestamptz;
alter table public.wishlist add column if not exists updated_at timestamptz not null default now();

create table if not exists public.reminders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  amount numeric(14,2) check (amount is null or amount >= 0),
  due_date date not null,
  recurrence text not null default 'none' check (recurrence in ('none', 'weekly', 'monthly', 'yearly')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'dismissed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.split_expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  total_amount numeric(14,2) not null check (total_amount > 0),
  paid_by text not null,
  expense_date date not null default current_date,
  notes text,
  status text not null default 'open' check (status in ('open', 'settled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.split_participants (
  id uuid primary key default uuid_generate_v4(),
  split_expense_id uuid not null references public.split_expenses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  participant_name text not null,
  amount_owed numeric(14,2) not null check (amount_owed >= 0),
  amount_paid numeric(14,2) not null default 0 check (amount_paid >= 0),
  is_settled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.monthly_reports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month integer not null check (month between 1 and 12),
  year integer not null check (year >= 2000),
  total_spent numeric(14,2) not null default 0,
  total_earned numeric(14,2) not null default 0,
  total_saved numeric(14,2) not null default 0,
  budget_score numeric(5,2) not null default 0,
  top_category text,
  generated_at timestamptz not null default now(),
  unique (user_id, month, year)
);

create index if not exists expenses_user_date_idx on public.expenses(user_id, date desc);
create index if not exists incomes_user_date_idx on public.incomes(user_id, date desc);
create index if not exists reminders_user_due_idx on public.reminders(user_id, due_date);
create index if not exists debts_user_status_idx on public.debts(user_id, status);
create index if not exists goals_user_status_idx on public.savings_goals(user_id, status);
create index if not exists split_participants_split_idx on public.split_participants(split_expense_id);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'categories', 'expenses', 'incomes', 'category_budgets',
    'savings_goals', 'goal_contributions', 'debts', 'debt_payments',
    'investments', 'wishlist', 'reminders', 'split_expenses',
    'split_participants', 'monthly_reports'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists "Users manage own rows" on public.%I', table_name);
    execute format(
      'create policy "Users manage own rows" on public.%I for all to authenticated using (auth.uid() = %I) with check (auth.uid() = %I)',
      table_name,
      case when table_name = 'profiles' then 'id' else 'user_id' end,
      case when table_name = 'profiles' then 'id' else 'user_id' end
    );
  end loop;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'categories', 'expenses', 'incomes', 'category_budgets',
    'savings_goals', 'debts', 'investments', 'wishlist', 'reminders',
    'split_expenses', 'split_participants'
  ]
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name,
      table_name
    );
  end loop;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of raw_user_meta_data on auth.users
  for each row execute function public.handle_new_user();

insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do update set public = false;

drop policy if exists "Users manage own receipts" on storage.objects;
create policy "Users manage own receipts"
on storage.objects for all to authenticated
using (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);

create or replace function public.add_goal_contribution(p_goal_id uuid, p_amount numeric, p_note text default null)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if p_amount <= 0 then raise exception 'Contribution must be greater than zero'; end if;

  insert into public.goal_contributions (goal_id, user_id, amount, note)
  select id, user_id, p_amount, p_note
  from public.savings_goals
  where id = p_goal_id and user_id = auth.uid();

  if not found then raise exception 'Goal not found'; end if;

  update public.savings_goals
  set current_amount = current_amount + p_amount,
      status = case when current_amount + p_amount >= target_amount then 'completed' else status end
  where id = p_goal_id and user_id = auth.uid();
end;
$$;

create or replace function public.create_split_expense(
  p_title text,
  p_total_amount numeric,
  p_paid_by text,
  p_expense_date date,
  p_notes text,
  p_participants jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  split_id uuid;
  participant_count integer;
begin
  participant_count := jsonb_array_length(p_participants);
  if p_total_amount <= 0 then raise exception 'Total amount must be greater than zero'; end if;
  if participant_count = 0 then raise exception 'Add at least one participant'; end if;

  insert into public.split_expenses (user_id, title, total_amount, paid_by, expense_date, notes)
  values (auth.uid(), p_title, p_total_amount, p_paid_by, p_expense_date, p_notes)
  returning id into split_id;

  insert into public.split_participants (split_expense_id, user_id, participant_name, amount_owed)
  select split_id, auth.uid(), value #>> '{}', round(p_total_amount / participant_count, 2)
  from jsonb_array_elements(p_participants);

  return split_id;
end;
$$;

create or replace function public.record_debt_payment(p_debt_id uuid, p_amount numeric, p_note text default null)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  new_paid numeric;
  debt_total numeric;
begin
  if p_amount <= 0 then raise exception 'Payment must be greater than zero'; end if;
  select paid_amount + p_amount, amount into new_paid, debt_total
  from public.debts where id = p_debt_id and user_id = auth.uid();
  if not found then raise exception 'Debt not found'; end if;
  if new_paid > debt_total then raise exception 'Payment exceeds the remaining balance'; end if;

  insert into public.debt_payments (debt_id, user_id, amount, note)
  values (p_debt_id, auth.uid(), p_amount, p_note);
  update public.debts set paid_amount = new_paid,
    status = case when new_paid >= amount then 'settled' else 'partial' end
  where id = p_debt_id and user_id = auth.uid();
end;
$$;

create or replace function public.purchase_wishlist_item(p_item_id uuid, p_currency text default 'INR')
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  item public.wishlist%rowtype;
  expense_id uuid;
begin
  select * into item from public.wishlist where id = p_item_id and user_id = auth.uid() and is_purchased = false;
  if not found then raise exception 'Wishlist item not found or already purchased'; end if;
  insert into public.expenses (user_id, amount, currency, description, category_id, date)
  values (auth.uid(), item.estimated_price, p_currency, item.item_name, 'Shopping', current_date)
  returning id into expense_id;
  update public.wishlist set is_purchased = true, purchased_at = now() where id = p_item_id and user_id = auth.uid();
  return expense_id;
end;
$$;

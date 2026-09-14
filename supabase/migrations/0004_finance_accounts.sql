-- Manual "accounts" concept (Checking, Savings, Roth IRA, credit cards, etc.) so balances can
-- be broken out per account instead of one undifferentiated transaction pool. No bank-linking
-- or aggregation — accounts and their balances are entirely user-maintained.

create table finance_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  name text not null,
  account_type text not null default 'checking'
    check (account_type in ('checking', 'savings', 'credit_card', 'investment', 'other')),
  starting_balance numeric not null default 0,
  is_archived boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

alter table transactions add column account_id uuid references finance_accounts(id);

create index transactions_account_idx on transactions (user_id, account_id);

alter table finance_accounts enable row level security;

create policy "owner access" on finance_accounts for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

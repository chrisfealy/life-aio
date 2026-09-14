-- life-aio initial schema
-- Single-user personal tracker: journal, habits, workouts (RepCount-style), finance.
-- Every user-owned table carries user_id and is protected by an identical
-- "owner access" RLS policy scoped to auth.uid().

create extension if not exists "pgcrypto";

-- =========================================================================
-- Journal
-- =========================================================================

create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  entry_date date not null,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

create index journal_entries_user_date_idx on journal_entries (user_id, entry_date);

-- =========================================================================
-- Habits
-- =========================================================================

create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  name text not null,
  description text,
  habit_type text not null default 'boolean' check (habit_type in ('boolean', 'numeric')),
  target_value numeric,
  unit text,
  is_archived boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  habit_id uuid not null references habits(id) on delete cascade,
  log_date date not null,
  completed boolean,
  value numeric,
  created_at timestamptz not null default now(),
  unique (habit_id, log_date)
);

create index habit_logs_user_date_idx on habit_logs (user_id, log_date);

-- =========================================================================
-- Workouts (RepCount-style)
-- =========================================================================

create table exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id), -- null = shared seeded library
  name text not null,
  category text not null,
  exercise_type text not null default 'strength' check (exercise_type in ('strength', 'cardio')),
  is_custom boolean not null default false,
  created_at timestamptz not null default now()
);

create table workout_programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table workout_program_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  program_id uuid not null references workout_programs(id) on delete cascade,
  exercise_id uuid not null references exercises(id),
  sort_order int not null default 0,
  target_sets int,
  target_reps int,
  target_weight numeric,
  notes text
);

create table workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  workout_date date not null,
  workout_type text not null check (workout_type in ('strength', 'cardio')),
  program_id uuid references workout_programs(id),
  notes text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index workouts_user_date_idx on workouts (user_id, workout_date);

create table workout_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  workout_id uuid not null references workouts(id) on delete cascade,
  exercise_id uuid not null references exercises(id),
  set_number int not null,
  weight numeric,
  reps int,
  is_warmup boolean not null default false,
  rpe numeric,
  created_at timestamptz not null default now()
);

create index workout_sets_workout_idx on workout_sets (workout_id);
create index workout_sets_exercise_idx on workout_sets (user_id, exercise_id, created_at);

create table cardio_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  workout_id uuid not null references workouts(id) on delete cascade,
  exercise_id uuid references exercises(id),
  duration_seconds int,
  distance numeric,
  distance_unit text default 'mi',
  calories numeric,
  avg_heart_rate int,
  created_at timestamptz not null default now()
);

create index cardio_logs_workout_idx on cardio_logs (workout_id);

-- =========================================================================
-- Finance
-- =========================================================================

create table finance_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  name text not null,
  direction text not null default 'expense' check (direction in ('income', 'expense', 'both')),
  color text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table csv_import_batches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  filename text,
  imported_at timestamptz not null default now(),
  row_count int
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  txn_date date not null,
  amount numeric not null,
  direction text not null check (direction in ('in', 'out')),
  category_id uuid references finance_categories(id),
  note text,
  raw_description text,
  source text not null default 'manual' check (source in ('manual', 'csv_import')),
  import_batch_id uuid references csv_import_batches(id),
  created_at timestamptz not null default now()
);

create index transactions_user_date_idx on transactions (user_id, txn_date);
create index transactions_import_batch_idx on transactions (import_batch_id);

create table category_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  category_id uuid not null references finance_categories(id),
  keyword text not null,
  created_at timestamptz not null default now()
);

-- =========================================================================
-- Row Level Security
-- =========================================================================

alter table journal_entries enable row level security;
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table exercises enable row level security;
alter table workout_programs enable row level security;
alter table workout_program_exercises enable row level security;
alter table workouts enable row level security;
alter table workout_sets enable row level security;
alter table cardio_logs enable row level security;
alter table finance_categories enable row level security;
alter table csv_import_batches enable row level security;
alter table transactions enable row level security;
alter table category_rules enable row level security;

create policy "owner access" on journal_entries for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "owner access" on habits for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "owner access" on habit_logs for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- exercises: everyone (signed in) can read the shared seeded library
-- (user_id is null) or their own custom exercises; writes only to their own rows.
create policy "read shared or own exercises" on exercises for select
  using (user_id is null or user_id = auth.uid());
create policy "insert own exercises" on exercises for insert
  with check (user_id = auth.uid());
create policy "update own exercises" on exercises for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own exercises" on exercises for delete
  using (user_id = auth.uid());

create policy "owner access" on workout_programs for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "owner access" on workout_program_exercises for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "owner access" on workouts for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "owner access" on workout_sets for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "owner access" on cardio_logs for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "owner access" on finance_categories for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "owner access" on csv_import_batches for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "owner access" on transactions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "owner access" on category_rules for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

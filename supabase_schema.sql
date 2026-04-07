-- ============================================================
-- ON-ARCH Panel Dofinansowań – Supabase schema
-- Wklej całość w SQL Editor w Supabase i kliknij RUN
-- ============================================================

create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  contract_number text,
  participant_name text not null,
  course_name text not null,
  start_date date,
  end_date date,
  value numeric,
  status text default 'active',
  notes text,
  created_at timestamptz default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid references contracts(id) on delete cascade,
  name text not null,
  period text default 'once',
  due_date date,
  status text default 'pending',
  note text,
  created_at timestamptz default now()
);

-- Wyłącz RLS (apka bez logowania, dostęp przez anon key)
alter table contracts disable row level security;
alter table documents disable row level security;

-- Indeksy dla szybszych zapytań
create index if not exists idx_documents_contract_id on documents(contract_id);
create index if not exists idx_documents_due_date on documents(due_date);
create index if not exists idx_contracts_status on contracts(status);

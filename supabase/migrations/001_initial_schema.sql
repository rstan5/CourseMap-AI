-- CourseMap AI — run once in Supabase SQL Editor (Dashboard → SQL → New query)

create table if not exists public.users (
  id text primary key,
  email text not null,
  name text not null default '',
  password_hash text not null,
  created_at bigint not null
);

create unique index if not exists users_email_lower_idx on public.users (lower(email));

create table if not exists public.user_access (
  user_id text primary key,
  free_map_used boolean not null default false,
  subscription_active boolean not null default false,
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end bigint
);

create unique index if not exists user_access_stripe_sub_idx
  on public.user_access (stripe_subscription_id)
  where stripe_subscription_id is not null;

create table if not exists public.course_maps (
  id text primary key,
  user_id text not null,
  course_map_overview jsonb not null,
  concept_map jsonb not null,
  learning_graph_edges jsonb not null default '[]'::jsonb,
  learning_sequence jsonb not null default '[]'::jsonb,
  high_yield_map jsonb not null,
  knowledge_gaps jsonb not null default '[]'::jsonb,
  source_text text not null default '',
  created_at bigint not null,
  updated_at bigint not null
);

create index if not exists course_maps_user_id_idx on public.course_maps (user_id);
create index if not exists course_maps_user_updated_idx
  on public.course_maps (user_id, updated_at desc);

-- Service role (server) bypasses RLS; block public/anon access if keys leak.
alter table public.users enable row level security;
alter table public.user_access enable row level security;
alter table public.course_maps enable row level security;

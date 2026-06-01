create extension if not exists pgcrypto;

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_id text not null unique,
  event_name text not null,
  visitor_id text,
  session_id text,
  page_path text,
  page_title text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  viewport_width integer,
  viewport_height integer,
  scroll_depth integer,
  payload jsonb not null default '{}'::jsonb
);

create index if not exists analytics_events_created_at_idx on public.analytics_events (created_at desc);
create index if not exists analytics_events_event_name_idx on public.analytics_events (event_name);
create index if not exists analytics_events_session_id_idx on public.analytics_events (session_id);
create index if not exists analytics_events_visitor_id_idx on public.analytics_events (visitor_id);
create index if not exists analytics_events_utm_campaign_idx on public.analytics_events (utm_campaign);
create index if not exists analytics_events_payload_gin_idx on public.analytics_events using gin (payload);

alter table public.analytics_events enable row level security;

drop policy if exists "Allow public analytics inserts" on public.analytics_events;
create policy "Allow public analytics inserts"
on public.analytics_events
for insert
to anon
with check (true);

-- Intentionally no public SELECT policy.
-- Read reports with SUPABASE_SERVICE_ROLE_KEY or another private key.

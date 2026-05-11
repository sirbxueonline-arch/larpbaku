-- Run this in the Supabase SQL editor (one-time setup).
-- Re-running is safe (all statements are idempotent).

create table if not exists larps (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 50),
  claim text not null check (char_length(claim) between 1 and 200),
  upvotes integer not null default 0,
  downvotes integer not null default 0,
  score integer generated always as (upvotes - downvotes) stored,
  created_at timestamptz not null default now()
);

create index if not exists larps_score_idx on larps (score desc, created_at asc);

alter table larps enable row level security;

drop policy if exists "Public read" on larps;
create policy "Public read" on larps for select using (true);

-- Anyone can insert, but only with zero votes (votes go through the API route).
drop policy if exists "Public insert" on larps;
create policy "Public insert" on larps for insert
  with check (upvotes = 0 and downvotes = 0);

-- Vote-tracking table. One row per voter (keyed by hashed IP).
-- Inserts come from the server-side API route using the service role key,
-- so no public RLS policies are needed.
create table if not exists votes (
  ip_hash text primary key,
  larp_id uuid not null references larps(id) on delete cascade,
  vote_type text not null check (vote_type in ('up', 'down')),
  voted_at timestamptz not null default now()
);

alter table votes enable row level security;

-- Atomic vote: insert the dedup row first; if the IP already voted, the
-- ON CONFLICT skips the insert and we return false without bumping the
-- counter. Otherwise we increment the corresponding column on `larps`.
-- Called only from the server (service role) — see app/api/vote/route.ts.
create or replace function increment_vote_by_ip(
  p_larp_id uuid,
  p_vote_type text,
  p_ip_hash text
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted integer;
begin
  insert into votes (ip_hash, larp_id, vote_type)
  values (p_ip_hash, p_larp_id, p_vote_type)
  on conflict (ip_hash) do nothing;

  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return false;
  end if;

  if p_vote_type = 'up' then
    update larps set upvotes = upvotes + 1 where id = p_larp_id;
  elsif p_vote_type = 'down' then
    update larps set downvotes = downvotes + 1 where id = p_larp_id;
  else
    raise exception 'invalid vote_type: %', p_vote_type;
  end if;

  return true;
end;
$$;

-- Drop the old client-callable RPC; voting now goes through /api/vote.
drop function if exists increment_vote(uuid, text);

-- Submission rate-limit table. One row per IP-hash tracking the most
-- recent submission time. Server-side check via add_larp_with_rate_limit.
create table if not exists larp_submissions (
  ip_hash text primary key,
  last_submitted_at timestamptz not null default now()
);

alter table larp_submissions enable row level security;

-- Atomic submit: rejects if the same IP submitted within the cooldown
-- window (default 10 minutes), otherwise inserts the larp and bumps the
-- IP-hash's last_submitted_at. Called from /api/larps.
create or replace function add_larp_with_rate_limit(
  p_name text,
  p_claim text,
  p_ip_hash text,
  p_cooldown_seconds int default 600
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_last timestamptz;
  v_new_id uuid;
begin
  select last_submitted_at into v_last
  from larp_submissions
  where ip_hash = p_ip_hash;

  if v_last is not null and v_last > now() - make_interval(secs => p_cooldown_seconds) then
    raise exception 'rate_limited';
  end if;

  insert into larps (name, claim) values (p_name, p_claim)
  returning id into v_new_id;

  insert into larp_submissions (ip_hash, last_submitted_at)
  values (p_ip_hash, now())
  on conflict (ip_hash) do update set last_submitted_at = now();

  return v_new_id;
end;
$$;

-- Profiles table: one row per registered user, mapping auth.users.id to a
-- public username, avatar URL, and bio. Inserted by the client after
-- successful signup; updated through the ProfileEditor modal.
create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-zA-Z0-9_]{3,20}$'),
  avatar_url text,
  bio text check (bio is null or char_length(bio) <= 200),
  created_at timestamptz not null default now()
);

-- Backfill columns when re-running on an older schema
alter table profiles add column if not exists avatar_url text;
alter table profiles add column if not exists bio text;
alter table profiles add column if not exists tiktok text;
alter table profiles add column if not exists instagram text;
do $$ begin
  begin
    alter table profiles add constraint profiles_bio_len check (bio is null or char_length(bio) <= 200);
  exception when duplicate_object then null;
  end;
  begin
    alter table profiles add constraint profiles_tiktok_fmt
      check (tiktok is null or tiktok ~ '^[a-zA-Z0-9._]{1,24}$');
  exception when duplicate_object then null;
  end;
  begin
    alter table profiles add constraint profiles_instagram_fmt
      check (instagram is null or instagram ~ '^[a-zA-Z0-9._]{1,30}$');
  exception when duplicate_object then null;
  end;
end $$;

alter table profiles enable row level security;

drop policy if exists "Profiles public read" on profiles;
create policy "Profiles public read" on profiles for select using (true);

drop policy if exists "Profiles self insert" on profiles;
create policy "Profiles self insert" on profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "Profiles self update" on profiles;
create policy "Profiles self update" on profiles for update
  using (auth.uid() = user_id);

-- Larps: nullable user_id so anonymous entries still work alongside owned
-- entries. Reference profiles directly so PostgREST can do the embed
-- (Supabase JS .select('*, profiles(...)') needs an FK to the table).
alter table larps
  add column if not exists user_id uuid;

-- If an old FK to auth.users exists, drop it before adding the new one.
do $$ begin
  if exists (
    select 1 from information_schema.referential_constraints
    where constraint_name = 'larps_user_id_fkey' and constraint_schema = 'public'
  ) then
    alter table larps drop constraint larps_user_id_fkey;
  end if;
end $$;

do $$ begin
  begin
    alter table larps add constraint larps_user_id_fkey
      foreign key (user_id) references profiles(user_id) on delete set null;
  exception when duplicate_object then null;
  end;
end $$;

create index if not exists larps_user_id_idx on larps (user_id);

-- Avatars storage bucket. Public so <img> tags work without signed URLs.
-- 2 MB cap, image types only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars', 'avatars', true,
  2097152,
  array['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage policies: public read, authenticated user can write/replace
-- files only under a folder matching their own user_id.
drop policy if exists "Avatar public read" on storage.objects;
create policy "Avatar public read" on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Avatar self insert" on storage.objects;
create policy "Avatar self insert" on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Avatar self update" on storage.objects;
create policy "Avatar self update" on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Avatar self delete" on storage.objects;
create policy "Avatar self delete" on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Enable realtime for the leaderboard (idempotent — skips if already added).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'larps'
  ) then
    alter publication supabase_realtime add table larps;
  end if;
end $$;

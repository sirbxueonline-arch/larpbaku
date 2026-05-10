-- Run this in the Supabase SQL editor (one-time setup).

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

-- Anyone can insert, but only with zero votes (votes go through the RPC).
drop policy if exists "Public insert" on larps;
create policy "Public insert" on larps for insert
  with check (upvotes = 0 and downvotes = 0);

-- Atomic vote increment. SECURITY DEFINER bypasses RLS so anon clients
-- can bump vote counts without a wide-open UPDATE policy.
create or replace function increment_vote(larp_id uuid, vote_type text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if vote_type = 'up' then
    update larps set upvotes = upvotes + 1 where id = larp_id;
  elsif vote_type = 'down' then
    update larps set downvotes = downvotes + 1 where id = larp_id;
  else
    raise exception 'invalid vote_type: %', vote_type;
  end if;
end;
$$;

grant execute on function increment_vote(uuid, text) to anon, authenticated;

-- Enable realtime for the table.
alter publication supabase_realtime add table larps;

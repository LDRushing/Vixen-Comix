-- Vixen Comix: saved spots and reading history.
-- Paste this whole file into the Supabase SQL editor and run it once.
-- It is safe to run again: every statement checks for existing objects first.
--
-- Privacy: row level security is switched on for both tables, and every policy
-- only lets a signed-in reader touch rows where user_id is their own id.
-- Signed-out visitors (the "anon" role) get no access at all.

-- ---------------------------------------------------------------------------
-- One saved spot per comic
-- ---------------------------------------------------------------------------
create table if not exists public.bookmarks (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  comic_slug text not null check (char_length(comic_slug) between 1 and 100),
  chapter_slug text not null check (char_length(chapter_slug) between 1 and 100),
  page integer not null check (page >= 1),
  updated_at timestamptz not null default now(),
  primary key (user_id, comic_slug)
);

-- ---------------------------------------------------------------------------
-- Reading history: the latest page read in each chapter
-- ---------------------------------------------------------------------------
create table if not exists public.reading_history (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  comic_slug text not null check (char_length(comic_slug) between 1 and 100),
  chapter_slug text not null check (char_length(chapter_slug) between 1 and 100),
  page integer not null check (page >= 1),
  last_read_at timestamptz not null default now(),
  primary key (user_id, comic_slug, chapter_slug)
);

create index if not exists reading_history_user_last_read_idx
  on public.reading_history (user_id, last_read_at desc);

-- ---------------------------------------------------------------------------
-- Keep the timestamps honest: set them on the server whenever a row is updated
-- ---------------------------------------------------------------------------
create or replace function public.bookmarks_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists bookmarks_set_updated_at on public.bookmarks;
create trigger bookmarks_set_updated_at
  before update on public.bookmarks
  for each row execute function public.bookmarks_set_updated_at();

create or replace function public.reading_history_set_last_read_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.last_read_at := now();
  return new;
end;
$$;

drop trigger if exists reading_history_set_last_read_at on public.reading_history;
create trigger reading_history_set_last_read_at
  before update on public.reading_history
  for each row execute function public.reading_history_set_last_read_at();

-- ---------------------------------------------------------------------------
-- Access: row level security on, no access for signed-out visitors
-- ---------------------------------------------------------------------------
alter table public.bookmarks enable row level security;
alter table public.reading_history enable row level security;

revoke all on public.bookmarks from anon;
revoke all on public.reading_history from anon;

grant select, insert, update, delete on public.bookmarks to authenticated;
grant select, insert, update, delete on public.reading_history to authenticated;

-- bookmarks: four own-row policies
drop policy if exists "bookmarks_select_own" on public.bookmarks;
create policy "bookmarks_select_own" on public.bookmarks
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "bookmarks_insert_own" on public.bookmarks;
create policy "bookmarks_insert_own" on public.bookmarks
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "bookmarks_update_own" on public.bookmarks;
create policy "bookmarks_update_own" on public.bookmarks
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "bookmarks_delete_own" on public.bookmarks;
create policy "bookmarks_delete_own" on public.bookmarks
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- reading_history: four own-row policies
drop policy if exists "reading_history_select_own" on public.reading_history;
create policy "reading_history_select_own" on public.reading_history
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "reading_history_insert_own" on public.reading_history;
create policy "reading_history_insert_own" on public.reading_history
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "reading_history_update_own" on public.reading_history;
create policy "reading_history_update_own" on public.reading_history
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "reading_history_delete_own" on public.reading_history;
create policy "reading_history_delete_own" on public.reading_history
  for delete to authenticated
  using ((select auth.uid()) = user_id);

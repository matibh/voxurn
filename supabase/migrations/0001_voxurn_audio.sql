-- Voxurn MVP: anonymous audio posts and audio replies.
-- Run this file in the Supabase SQL Editor for project qkxuasszurxilglgrawv.

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  text text not null default '' check (char_length(text) <= 1000),
  audio_path text not null,
  duration_seconds integer not null check (duration_seconds > 0),
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  audio_path text not null,
  duration_seconds integer not null check (duration_seconds > 0),
  created_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists replies_post_id_created_at_idx on public.replies (post_id, created_at asc);

alter table public.posts enable row level security;
alter table public.replies enable row level security;

-- Table privileges are required in addition to the RLS policies below.
grant usage on schema public to anon, authenticated;
grant select, insert on table public.posts, public.replies to anon, authenticated;

drop policy if exists "Anyone can read posts" on public.posts;
create policy "Anyone can read posts"
  on public.posts for select to anon, authenticated using (true);

drop policy if exists "Anyone can publish posts" on public.posts;
create policy "Anyone can publish posts"
  on public.posts for insert to anon, authenticated with check (
    char_length(text) <= 1000 and duration_seconds > 0 and audio_path <> ''
  );

drop policy if exists "Anyone can read replies" on public.replies;
create policy "Anyone can read replies"
  on public.replies for select to anon, authenticated using (true);

drop policy if exists "Anyone can publish replies" on public.replies;
create policy "Anyone can publish replies"
  on public.replies for insert to anon, authenticated with check (
    duration_seconds > 0 and audio_path <> ''
    and exists (select 1 from public.posts where posts.id = post_id)
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'voxurn-audio', 'voxurn-audio', true, 20971520,
  array['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/x-wav', 'audio/webm;codecs=opus']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can listen to Voxurn audio" on storage.objects;
create policy "Public can listen to Voxurn audio"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'voxurn-audio');

drop policy if exists "Anyone can upload Voxurn audio" on storage.objects;
create policy "Anyone can upload Voxurn audio"
  on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'voxurn-audio');

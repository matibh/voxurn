-- Voxurn: required topic/category for every anonymous audio post.
-- Existing posts are assigned to the general Joker's Club section.

alter table public.posts
  add column if not exists topic text not null default 'Joker''s Club';

update public.posts
set topic = 'Joker''s Club'
where topic is null or btrim(topic) = '';

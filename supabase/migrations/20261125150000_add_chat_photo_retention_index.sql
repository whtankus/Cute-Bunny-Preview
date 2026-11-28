-- Speeds up the scheduled 14-day cleanup without affecting songs.
-- The cleanup job only targets chat notes and photos.
create index if not exists memories_chat_photo_retention_idx
  on public.memories (created_at, id)
  where kind in ('note', 'photo');

-- Do not add a trigger that decrements profile_heart_totals on memory deletion.
-- Lifetime heart totals are intentionally independent of memories and likes.

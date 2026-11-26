-- Replace the earlier note-only update policy to avoid duplicate permissive UPDATE checks.
drop policy if exists "Update own notes" on public.memories;
-- Permit idempotent upserts for Notes parents and their linked Photos Garden records.
drop policy if exists "Update own note messages and linked photos" on public.memories;
create policy "Update own note messages and linked photos"
on public.memories for update to authenticated
using (owner_id = (select auth.uid()) and kind in ('note','photo'))
with check (owner_id = (select auth.uid()) and kind in ('note','photo'));

grant update (
  owner_id, kind, text, reply_to_id, photo_group_id, client_message_id,
  file_name, content_type, storage_path, chat_message_id, client_photo_id
) on public.memories to authenticated;

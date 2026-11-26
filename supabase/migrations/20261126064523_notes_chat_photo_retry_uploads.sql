-- Storage upsert requires UPDATE permission for a user's own stable retry path.
drop policy if exists "Retry own Notes photo uploads" on storage.objects;
create policy "Retry own Notes photo uploads"
on storage.objects for update to authenticated
using (bucket_id = 'memories' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'memories' and (storage.foldername(name))[1] = (select auth.uid())::text);

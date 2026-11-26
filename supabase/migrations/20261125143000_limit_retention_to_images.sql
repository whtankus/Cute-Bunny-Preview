-- Restrict the scheduled 21-day expiry to images; audio stays untouched.
create or replace function public.cleanup_expired_memory_media()
returns integer language plpgsql security definer set search_path = ''
as $$
declare removed_count integer := 0;
begin
  with expired as (
    select id, storage_path from public.memories
    where storage_path <> '' and content_type like 'image/%'
      and created_at < now() - interval '21 days'
  ), deleted_objects as (
    delete from storage.objects o using expired e
    where o.bucket_id = 'memories' and o.name = e.storage_path
    returning o.name
  )
  delete from public.memories m using expired e where m.id = e.id;
  get diagnostics removed_count = row_count;
  return removed_count;
end;
$$;
revoke all on function public.cleanup_expired_memory_media() from public, anon, authenticated;

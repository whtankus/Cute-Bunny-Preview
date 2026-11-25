-- Grouped Notes photo messages and automatic 21-day media retention.
alter table public.memories add column if not exists photo_group_id uuid;
create index if not exists memories_photo_group_id_idx on public.memories(photo_group_id) where photo_group_id is not null;
create index if not exists memories_expired_media_idx on public.memories(created_at) where storage_path <> '';

create or replace function public.cleanup_expired_memory_media()
returns integer language plpgsql security definer set search_path = ''
as $$
declare removed_count integer := 0;
begin
  with expired as (
    select id, storage_path from public.memories
    where storage_path <> '' and created_at < now() - interval '21 days'
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

create extension if not exists pg_cron with schema extensions;
do $$
begin
  if exists (select 1 from cron.job where jobname = 'cute-bunny-expire-photos-21-days') then
    perform cron.unschedule('cute-bunny-expire-photos-21-days');
  end if;
  perform cron.schedule('cute-bunny-expire-photos-21-days', '17 2 * * *', 'select public.cleanup_expired_memory_media();');
end $$;

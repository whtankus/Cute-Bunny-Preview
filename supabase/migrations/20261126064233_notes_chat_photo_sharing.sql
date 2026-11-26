-- Link each Notes chat message to its Photos Garden entries and make client retries idempotent.
alter table public.memories
  add column if not exists photo_group_id uuid,
  add column if not exists client_message_id uuid,
  add column if not exists client_photo_id uuid,
  add column if not exists chat_message_id bigint references public.memories(id) on delete cascade;

create unique index if not exists memories_client_message_id_uidx
  on public.memories(client_message_id);
create unique index if not exists memories_client_photo_id_uidx
  on public.memories(client_photo_id);
create index if not exists memories_chat_message_id_idx
  on public.memories(chat_message_id) where chat_message_id is not null;
create index if not exists memories_photo_group_id_idx
  on public.memories(photo_group_id) where photo_group_id is not null;

-- Keep legacy Notes photo objects visible in Photos Garden without copying their bytes.
update public.memories
set photo_group_id = md5('legacy-note-photo:' || id::text)::uuid
where kind = 'note' and storage_path <> '' and photo_group_id is null;

insert into public.memories (
  owner_id, kind, text, file_name, content_type, storage_path,
  created_at, photo_group_id, chat_message_id, client_photo_id
)
select n.owner_id, 'photo', coalesce(nullif(n.text, ''), nullif(n.file_name, ''), 'Shared photo'),
       n.file_name, n.content_type, n.storage_path, n.created_at, n.photo_group_id,
       n.id, md5('legacy-note-photo:' || n.id::text)::uuid
from public.memories n
where n.kind = 'note' and n.storage_path <> ''
  and not exists (select 1 from public.memories p where p.kind = 'photo' and p.chat_message_id = n.id);

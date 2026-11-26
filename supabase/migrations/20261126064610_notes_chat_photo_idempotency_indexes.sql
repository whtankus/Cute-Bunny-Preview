-- Full unique indexes allow PostgREST ON CONFLICT inference; NULL values remain distinct.
drop index if exists public.memories_client_message_id_uidx;
create unique index memories_client_message_id_uidx on public.memories(client_message_id);
drop index if exists public.memories_client_photo_id_uidx;
create unique index memories_client_photo_id_uidx on public.memories(client_photo_id);

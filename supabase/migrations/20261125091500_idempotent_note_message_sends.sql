-- Make Notes sends safe to retry after duplicate taps or lost HTTP responses.
-- Existing clients can continue inserting memories without a client_message_id.
alter table public.memories
  add column if not exists client_message_id uuid;

create unique index if not exists memories_owner_client_message_id_uidx
  on public.memories (owner_id, client_message_id)
  where client_message_id is not null;

create or replace function public.send_note_message(
  p_client_message_id uuid,
  p_text text,
  p_reply_to_id bigint default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_text text := btrim(coalesce(p_text, ''));
  v_message public.memories%rowtype;
begin
  if v_user_id is null then
    raise exception 'Sign in to send a message.';
  end if;
  if p_client_message_id is null then
    raise exception 'A message request ID is required.';
  end if;
  if v_text = '' or char_length(v_text) > 1000 then
    raise exception 'Messages must contain between 1 and 1000 characters.';
  end if;

  insert into public.memories (
    owner_id, kind, text, reply_to_id, client_message_id
  )
  values (
    v_user_id, 'note', v_text, p_reply_to_id, p_client_message_id
  )
  on conflict (owner_id, client_message_id)
    where client_message_id is not null
    do nothing;

  select *
    into v_message
  from public.memories
  where owner_id = v_user_id
    and client_message_id = p_client_message_id
    and kind = 'note';

  if not found then
    raise exception 'The message could not be confirmed. Please retry.';
  end if;

  if v_message.text is distinct from v_text
     or v_message.reply_to_id is distinct from p_reply_to_id then
    raise exception 'This message request ID was already used for different content.';
  end if;

  return to_jsonb(v_message);
end;
$$;

revoke all on function public.send_note_message(uuid, text, bigint) from public, anon;
grant execute on function public.send_note_message(uuid, text, bigint) to authenticated;

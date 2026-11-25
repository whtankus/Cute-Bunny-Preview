-- Validate Petal Points against persisted activity, not browser-local quest state.
-- The app may queue claims offline; this function verifies each claim when it syncs.

create schema if not exists private;

create or replace function private.daily_quest_slot_complete(
  p_user_id uuid,
  p_day date,
  p_slot integer
) returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_timezone text;
  v_local_today date;
  v_day_index integer;
  v_target integer := 1;
  v_pattern text;
  v_count bigint := 0;
  v_action text;
begin
  if p_user_id is null or p_day is null or p_slot not between 1 and 3 then
    return false;
  end if;

  select coalesce(nullif(p.streak_timezone, ''), 'UTC')
    into v_timezone
  from public.profiles p
  where p.id = p_user_id;

  if not found then
    return false;
  end if;

  v_local_today := (pg_catalog.now() at time zone v_timezone)::date;
  if p_day < date '2026-11-21' or p_day > v_local_today then
    return false;
  end if;

  v_day_index := mod(p_day - date '2026-11-21', 20);

  if p_slot = 1 then
    -- The first daily quest is a text-based Notes quest.
    v_pattern := case v_day_index
      when 0 then '(^|[^[:alnum:]])(hello|hi|hey)([^[:alnum:]]|$)'
      when 1 then '(^|[^[:alnum:]])(happy|happiness|glad|joy|cheerful)([^[:alnum:]]|$)'
      when 2 then '(^|[^[:alnum:]])(thank|thanks|thankful|thank you|appreciate|appreciation)([^[:alnum:]]|$)'
      when 3 then '(^|[^[:alnum:]])(dream|dreams|wish|wishes)([^[:alnum:]]|$)'
      when 4 then '(^|[^[:alnum:]])(red|blue|green|yellow|pink|purple|orange|black|white|brown|grey|gray)([^[:alnum:]]|$)'
      when 5 then '(^|[^[:alnum:]])(morning|good morning)([^[:alnum:]]|$)'
      when 6 then '(^|[^[:alnum:]])(night|good night|tonight)([^[:alnum:]]|$)'
      when 7 then '(^|[^[:alnum:]])(kind|kindness|caring|thoughtful)([^[:alnum:]]|$)'
      when 8 then '(^|[^[:alnum:]])(win|wins|won|victory|achievement)([^[:alnum:]]|$)'
      when 9 then '(^|[^[:alnum:]])(appreciate|appreciation|grateful|thankful)([^[:alnum:]]|$)'
      when 10 then '(^|[^[:alnum:]])(song|songs|music|melody)([^[:alnum:]]|$)'
      when 11 then '(^|[^[:alnum:]])(remember|memory|memories)([^[:alnum:]]|$)'
      when 12 then '(^|[^[:alnum:]])(proud|believe|encourage|you can do it)([^[:alnum:]]|$)'
      when 13 then '(^|[^[:alnum:]])(love)([^[:alnum:]]|$)'
      when 14 then '(^|[^[:alnum:]])(hope|hopeful|wish|wishes)([^[:alnum:]]|$)'
      when 15 then '(^|[^[:alnum:]])(day|today)([^[:alnum:]]|$)'
      when 16 then '(^|[^[:alnum:]])(smile|smiling|smiled|happy)([^[:alnum:]]|$)'
      when 17 then '(^|[^[:alnum:]])(love|lovely|adore|caring)([^[:alnum:]]|$)'
      else null
    end;

    if v_day_index = 18 then v_target := 3; end if;
    if v_day_index = 19 then v_target := 5; end if;

    select count(*) into v_count
    from public.memories m
    where m.owner_id = p_user_id
      and m.kind = 'note'
      and (m.created_at at time zone v_timezone)::date = p_day
      and (
        (v_pattern is not null and coalesce(m.text, '') ~* v_pattern)
        or (v_day_index = 13 and (
          pg_catalog.strpos(coalesce(m.text, ''), '♡') > 0
          or pg_catalog.strpos(coalesce(m.text, ''), '❤') > 0
        ))
        or (v_day_index in (18, 19))
      );

    return v_count >= v_target;
  end if;

  if p_slot = 2 then
    -- Photo quest; multi-photo days require the same number of persisted uploads.
    v_target := case when v_day_index in (17, 18) then 2 when v_day_index = 19 then 3 else 1 end;
    select count(*) into v_count
    from public.memories m
    where m.owner_id = p_user_id
      and m.kind = 'photo'
      and m.storage_path is not null
      and coalesce(m.content_type, '') like 'image/%'
      and (m.created_at at time zone v_timezone)::date = p_day;
    return v_count >= v_target;
  end if;

  -- Slot three alternates community quests and persisted Bearfriend actions.
  if v_day_index in (3, 7, 11, 15, 19) then
    v_action := case v_day_index
      when 3 then 'hug'
      when 7 then 'kiss'
      when 11 then 'pet'
      when 15 then 'dance'
      else null
    end;
    v_target := case v_day_index
      when 3 then 2
      when 7 then 2
      when 11 then 3
      when 15 then 2
      else 3
    end;

    select count(*) into v_count
    from public.bear_hug_action_receipts r
    where r.sender_id = p_user_id
      and (r.created_at at time zone v_timezone)::date = p_day
      and (
        (v_day_index = 19 and r.action in ('hug','kiss','flykiss','slap','hands','dance','pet','feed','sleep','tummy','idle'))
        or (v_action is not null and r.action = v_action)
      );
    return v_count >= v_target;
  end if;

  if v_day_index in (0, 3, 5, 7, 10, 12, 15, 18) then
    v_target := case when v_day_index in (3, 7, 12, 18) then 5 else 3 end;
    select count(distinct l.memory_id) into v_count
    from public.memory_likes l
    where l.user_id = p_user_id
      and (l.created_at at time zone v_timezone)::date = p_day;
    return v_count >= v_target;
  end if;

  if v_day_index in (1, 4, 8, 13, 16, 19) then
    select count(*) into v_count
    from public.memories m
    where m.owner_id = p_user_id
      and m.kind = 'song'
      and m.storage_path is not null
      and coalesce(m.content_type, '') like 'audio/%'
      and (m.created_at at time zone v_timezone)::date = p_day;
    return v_count >= 1;
  end if;

  if v_day_index in (2, 6, 9, 11, 14, 17) then
    return exists (
      select 1 from public.profiles p
      where p.id = p_user_id and p.last_login_date = p_day
    );
  end if;

  return false;
end;
$function$;

revoke all on function private.daily_quest_slot_complete(uuid, date, integer) from public, anon, authenticated;

create or replace function public.grant_petal_points(
  p_grant_key text,
  p_amount bigint
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  uid uuid := auth.uid();
  inserted_key text;
  balance bigint;
  tz text;
  local_day date;
  reward_day date;
  expected_amount bigint;
  reward_slot integer;
  reward_day_number integer;
  weekly_tier integer;
  completed_days integer := 0;
  check_day date;
  key_parts text[];
begin
  if uid is null then raise exception 'Authentication required'; end if;
  if p_grant_key is null or length(trim(p_grant_key)) = 0 or length(p_grant_key) > 200 then
    raise exception 'Invalid reward key';
  end if;

  select coalesce(nullif(streak_timezone, ''), 'UTC')
    into tz
  from public.profiles
  where id = uid;

  tz := coalesce(tz, 'UTC');
  local_day := (now() at time zone tz)::date;

  if p_grant_key ~ '^chest:[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
    reward_day := substring(p_grant_key from '^chest:([0-9]{4}-[0-9]{2}-[0-9]{2})$')::date;
    expected_amount := 25;
    if reward_day <> local_day then
      raise exception 'The daily chest can only be claimed for today';
    end if;
    if not (
      private.daily_quest_slot_complete(uid, reward_day, 1)
      and private.daily_quest_slot_complete(uid, reward_day, 2)
      and private.daily_quest_slot_complete(uid, reward_day, 3)
    ) then
      raise exception 'Complete all three verified daily quests before claiming the chest';
    end if;

  elsif p_grant_key ~ '^quest:[0-9]{4}-[0-9]{2}-[0-9]{2}:day-[0-9]{1,2}-quest-[1-3]$' then
    key_parts := regexp_match(p_grant_key, '^quest:([0-9]{4}-[0-9]{2}-[0-9]{2}):day-([0-9]{1,2})-quest-([1-3])$');
    reward_day := key_parts[1]::date;
    reward_day_number := key_parts[2]::integer;
    reward_slot := key_parts[3]::integer;
    expected_amount := 10;

    if reward_day < date '2026-11-21' or reward_day > local_day then
      raise exception 'Quest reward date is outside the campaign';
    end if;
    if reward_day_number <> mod(reward_day - date '2026-11-21', 20) + 1 then
      raise exception 'Quest reward key does not match the campaign day';
    end if;
    if not private.daily_quest_slot_complete(uid, reward_day, reward_slot) then
      raise exception 'This daily quest has not been completed in saved activity';
    end if;

  elsif p_grant_key ~ '^weekly:[0-9]{4}-[0-9]{2}-[0-9]{2}:(3|5|7)$' then
    key_parts := regexp_match(p_grant_key, '^weekly:([0-9]{4}-[0-9]{2}-[0-9]{2}):(3|5|7)$');
    reward_day := key_parts[1]::date;
    weekly_tier := key_parts[2]::integer;
    expected_amount := case weekly_tier when 3 then 30 when 5 then 50 else 100 end;

    if reward_day <> date_trunc('week', local_day)::date then
      raise exception 'Weekly reward must belong to the current week';
    end if;

    for check_day in
      select generated_day::date
      from generate_series(
        reward_day::timestamp,
        least(reward_day + 6, local_day)::timestamp,
        interval '1 day'
      ) as generated_day
    loop
      if private.daily_quest_slot_complete(uid, check_day, 1)
        and private.daily_quest_slot_complete(uid, check_day, 2)
        and private.daily_quest_slot_complete(uid, check_day, 3) then
        completed_days := completed_days + 1;
      end if;
    end loop;

    if completed_days < weekly_tier then
      raise exception 'Not enough verified daily quest sets for this weekly reward';
    end if;
  else
    raise exception 'Unsupported Petal Points reward type';
  end if;

  if p_amount is distinct from expected_amount then
    raise exception 'Invalid Petal Points reward amount';
  end if;

  insert into private.petal_point_transactions(user_id, grant_key, amount)
  values (uid, p_grant_key, p_amount)
  on conflict (user_id, grant_key) do nothing
  returning grant_key into inserted_key;

  insert into public.profile_garden_collections(user_id, petal_points, updated_at)
  values (uid, case when inserted_key is null then 0 else p_amount end, now())
  on conflict (user_id) do update
  set petal_points = public.profile_garden_collections.petal_points
      + case when inserted_key is null then 0 else p_amount end,
      updated_at = now();

  select petal_points into balance
  from public.profile_garden_collections
  where user_id = uid;

  return jsonb_build_object(
    'granted', inserted_key is not null,
    'petal_points', coalesce(balance, 0)
  );
end;
$function$;

revoke all on function public.grant_petal_points(text, bigint) from public, anon;
grant execute on function public.grant_petal_points(text, bigint) to authenticated;

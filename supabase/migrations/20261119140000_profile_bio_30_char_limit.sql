-- Cute Bunny: enforce the 30-character profile bio limit.
-- Trim existing values first so this migration is safe for current accounts.
update public.profiles
set bio = left(coalesce(bio, ''), 30)
where char_length(coalesce(bio, '')) > 30;

alter table public.profiles
  drop constraint if exists profiles_bio_char_limit;

alter table public.profiles
  add constraint profiles_bio_char_limit
  check (char_length(bio) <= 30);

-- Run the storage-API cleanup worker daily at 02:17 UTC.
create extension if not exists pg_net with schema extensions;
do $$
begin
  if exists (select 1 from cron.job where jobname = 'cute-bunny-expire-photos-21-days') then
    perform cron.unschedule('cute-bunny-expire-photos-21-days');
  end if;
  perform cron.schedule(
    'cute-bunny-expire-photos-21-days',
    '17 2 * * *',
    $job$select net.http_post(
      url := 'https://mlwaawclbciagypwggxx.supabase.co/functions/v1/expire-memory-media',
      headers := '{"Content-Type":"application/json"}'::jsonb,
      body := '{}'::jsonb
    );$job$
  );
end $$;

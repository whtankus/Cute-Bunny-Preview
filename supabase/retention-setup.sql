-- Run once in the Supabase SQL Editor AFTER deploying
-- supabase/functions/cleanup-expired-memories.
--
-- Before running this file, add these two secrets in Supabase Vault:
--   cleanup_project_url       = https://YOUR_PROJECT_REF.supabase.co
--   cleanup_service_role_key  = your project's service_role key
--
-- Never commit either secret to GitHub or put it in frontend configuration.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Remove an older copy of this schedule before creating the current one.
select cron.unschedule(jobid)
from cron.job
where jobname = 'cleanup-expired-chat-photo-memories';

select cron.schedule(
  'cleanup-expired-chat-photo-memories',
  '15 2 * * *',
  $job$
  select net.http_post(
    url := (
      select decrypted_secret
      from vault.decrypted_secrets
      where name = 'cleanup_project_url'
    ) || '/functions/v1/cleanup-expired-memories',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'cleanup_service_role_key'
      )
    ),
    body := '{}'::jsonb
  );
  $job$
);

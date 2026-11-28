# Chat and photo memory retention

Cute Bunny Preview uses a **14-day rolling retention period** for chat messages
(`memories.kind = 'note'`) and photos (`memories.kind = 'photo'`).

- Records older than 14 days are permanently deleted by a daily scheduled job.
- Photo objects are removed from the private `memories` Storage bucket before
  their database rows are deleted. If Storage removal fails, the rows remain so
  the next run can retry.
- Songs (`memories.kind = 'song'') are never selected or deleted by this job.
- Lifetime profile heart totals are stored separately in
  `public.profile_heart_totals`. The cleanup never updates or decrements them.
  Per-memory likes/reactions and notifications linked to expired records are
  removed through their existing foreign-key cascades.
- The job processes at most 2,000 records per run and continues on the next
  daily run if a backlog remains.

## Enable the scheduled cleanup

1. Deploy the Edge Function:
   `supabase functions deploy cleanup-expired-memories`
2. In Supabase Vault, create secrets named `cleanup_project_url` and
   `cleanup_service_role_key`. Store the project URL and service-role key
   there; never add them to this repository or frontend config.
3. Apply `supabase/migrations/20261125150000_add_chat_photo_retention_index.sql`.
4. Run `supabase/retention-setup.sql` once in the Supabase SQL Editor.
5. Verify the job exists in `cron.job` and inspect the Edge Function logs after
   its first scheduled run.

The schedule runs daily at 02:15 UTC. The function uses its own fixed 14-day
cutoff; request payloads cannot change the retention period.

**Important:** Adding these files to GitHub does not delete live user data.
The migration, Edge Function deployment, Vault secrets, and cron schedule must
all be configured in the Supabase project before automatic deletion begins.

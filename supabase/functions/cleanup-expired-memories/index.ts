// Permanently removes chat notes and photos after 14 days.
// Songs are deliberately excluded. Lifetime profile heart totals live in
// profile_heart_totals and are never modified by this cleanup.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const RETENTION_DAYS = 14;
const BATCH_SIZE = 200;
const MAX_BATCHES_PER_RUN = 10;
const STORAGE_DELETE_BATCH_SIZE = 100;

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json({ error: "Cleanup service is not configured." }, { status: 500 });
  }

  // The scheduled caller must use the service-role JWT. Never accept a
  // publishable/anon key for a destructive maintenance operation.
  if (req.headers.get("Authorization") !== `Bearer ${serviceRoleKey}`) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  let deletedNotes = 0;
  let deletedPhotos = 0;
  let batches = 0;

  try {
    while (batches < MAX_BATCHES_PER_RUN) {
      const { data: expired, error: selectError } = await admin
        .from("memories")
        .select("id,kind,storage_path")
        .in("kind", ["note", "photo"])
        .lt("created_at", cutoff)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true })
        .limit(BATCH_SIZE);

      if (selectError) throw selectError;
      if (!expired?.length) break;

      const photos = expired.filter((row) => row.kind === "photo" && row.storage_path);
      const paths = photos.map((row) => row.storage_path as string);

      // Remove stored photo bytes first. If Storage fails, keep the database
      // rows so the next scheduled run can retry without losing the file path.
      for (let i = 0; i < paths.length; i += STORAGE_DELETE_BATCH_SIZE) {
        const { error: storageError } = await admin.storage
          .from("memories")
          .remove(paths.slice(i, i + STORAGE_DELETE_BATCH_SIZE));
        if (storageError) throw storageError;
      }

      const ids = expired.map((row) => row.id);
      const { error: deleteError } = await admin.from("memories").delete().in("id", ids);
      if (deleteError) throw deleteError;

      deletedNotes += expired.filter((row) => row.kind === "note").length;
      deletedPhotos += expired.filter((row) => row.kind === "photo").length;
      batches += 1;
      if (expired.length < BATCH_SIZE) break;
    }

    return Response.json({
      ok: true,
      retentionDays: RETENTION_DAYS,
      cutoff,
      deletedNotes,
      deletedPhotos,
      songsDeleted: 0,
      batches,
      moreMayRemain: batches === MAX_BATCHES_PER_RUN,
      heartTotalsChanged: false,
    });
  } catch (error) {
    console.error("Expired chat/photo cleanup failed:", error);
    return Response.json({ error: "Cleanup failed; remaining records will be retried." }, { status: 500 });
  }
});

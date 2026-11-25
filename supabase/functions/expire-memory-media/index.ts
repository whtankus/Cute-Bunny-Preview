import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (_req: Request) => {
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceKey) throw new Error("Storage cleanup service is not configured.");
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
    const cutoff = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString();
    let removed = 0;
    while (true) {
      const { data: rows, error } = await supabase.from("memories")
        .select("id,storage_path").neq("storage_path", "")
        .like("content_type", "image/%").lt("created_at", cutoff)
        .order("created_at", { ascending: true }).limit(100);
      if (error) throw error;
      if (!rows?.length) break;
      const paths = rows.map(row => row.storage_path).filter(Boolean);
      if (paths.length) {
        const { error: storageError } = await supabase.storage.from("memories").remove(paths);
        if (storageError) throw storageError;
      }
      const { error: deleteError } = await supabase.from("memories").delete().in("id", rows.map(row => row.id));
      if (deleteError) throw deleteError;
      removed += rows.length;
    }
    return Response.json({ success: true, removed });
  } catch (error) {
    console.error("Photo retention cleanup failed:", error);
    return Response.json({ error: error instanceof Error ? error.message : "Cleanup failed." }, { status: 500 });
  }
});

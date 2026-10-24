import { ADMIN_CONFIG } from "@/features/admin/config";
import { isAdmin } from "@/features/admin/lib/session";
import { listSubmissions } from "@/features/admin/lib/submissionStore";
import { toCsv } from "@/features/admin/lib/toCsv";

export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const name = `${ADMIN_CONFIG.exportFilePrefix}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(toCsv(await listSubmissions()), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}

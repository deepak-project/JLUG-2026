import { isAdmin } from "@/features/admin/lib/session";
import { deleteSubmission } from "@/features/admin/lib/submissionStore";

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id || !(await deleteSubmission(id))) return Response.json({ error: "Not found." }, { status: 404 });
  return Response.json({ ok: true });
}

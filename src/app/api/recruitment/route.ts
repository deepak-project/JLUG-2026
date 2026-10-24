import { addSubmission } from "@/features/admin/lib/submissionStore";
import { INITIAL_FORM_DATA } from "@/features/recruitment/data/recruitmentOptions";
import { RecruitmentFormData } from "@/features/recruitment/types";
import { validateForm } from "@/features/recruitment/validation";

const MAX_LEN = 2000;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return Response.json({ error: "Invalid request." }, { status: 400 });

  // Whitelist fields and coerce types so nothing else gets persisted.
  const data = {} as RecruitmentFormData;
  for (const key of Object.keys(INITIAL_FORM_DATA) as (keyof RecruitmentFormData)[]) {
    const v = body[key];
    if (key === "domains") {
      data.domains = Array.isArray(v) ? v.filter((d) => typeof d === "string").slice(0, 10) : [];
    } else {
      data[key] = typeof v === "string" ? v.trim().slice(0, MAX_LEN) : "";
    }
  }

  if (Object.keys(validateForm(data)).length) {
    return Response.json({ error: "Please check your details and try again." }, { status: 422 });
  }
  await addSubmission(data);
  return Response.json({ ok: true }, { status: 201 });
}

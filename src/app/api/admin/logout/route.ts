import { ADMIN_CONFIG } from "@/features/admin/config";

export async function POST() {
  const res = Response.json({ ok: true });
  res.headers.append("Set-Cookie", `${ADMIN_CONFIG.cookieName}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`);
  return res;
}

import { ADMIN_CONFIG } from "@/features/admin/config";
import {
  checkSecretKey,
  clearLoginFailures,
  createSessionToken,
  isAdminConfigured,
  loginAllowed,
  recordLoginFailure,
} from "@/features/admin/lib/session";

export async function POST(req: Request) {
  if (!isAdminConfigured()) {
    return Response.json({ error: `${ADMIN_CONFIG.secretEnvVar} is not set on the server.` }, { status: 503 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (!loginAllowed(ip)) return Response.json({ error: "Too many attempts. Try again later." }, { status: 429 });

  const { key } = (await req.json().catch(() => ({}))) as { key?: unknown };
  if (typeof key !== "string" || !checkSecretKey(key)) {
    recordLoginFailure(ip);
    return Response.json({ error: "Invalid secret key." }, { status: 401 });
  }
  clearLoginFailures(ip);

  const res = Response.json({ ok: true });
  res.headers.append(
    "Set-Cookie",
    `${ADMIN_CONFIG.cookieName}=${createSessionToken()}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${ADMIN_CONFIG.sessionTtlSeconds}${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`
  );
  return res;
}

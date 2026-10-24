import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { ADMIN_CONFIG } from "../config";

const secret = () => process.env[ADMIN_CONFIG.secretEnvVar] ?? "";

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("hex");

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function isAdminConfigured() {
  return secret().length > 0;
}

export function checkSecretKey(input: string) {
  // Hash both sides so lengths match and the comparison is constant-time.
  const h = (v: string) => createHmac("sha256", "jlug-admin-cmp").update(v).digest("hex");
  return isAdminConfigured() && safeEqual(h(input), h(secret()));
}

/** Cookie value: `<expiryMs>.<hmac>`; stateless, and invalidated by rotating the env key. */
export function createSessionToken() {
  const exp = String(Date.now() + ADMIN_CONFIG.sessionTtlSeconds * 1000);
  return `${exp}.${sign(exp)}`;
}

export async function isAdmin() {
  if (!isAdminConfigured()) return false;
  const token = (await cookies()).get(ADMIN_CONFIG.cookieName)?.value;
  if (!token) return false;
  const [exp, sig] = token.split(".");
  return !!exp && !!sig && Number(exp) > Date.now() && safeEqual(sig, sign(exp));
}

// shortcut: in-memory limiter resets on restart and isn't shared across instances; use a shared store if scaled out.
const attempts = new Map<string, { count: number; resetAt: number }>();

/** Returns false when this IP has exhausted its failed-login budget. */
export function loginAllowed(ip: string) {
  const a = attempts.get(ip);
  return !a || a.resetAt < Date.now() || a.count < ADMIN_CONFIG.maxLoginAttempts;
}

export function recordLoginFailure(ip: string) {
  const a = attempts.get(ip);
  if (!a || a.resetAt < Date.now()) {
    attempts.set(ip, { count: 1, resetAt: Date.now() + ADMIN_CONFIG.loginWindowMs });
  } else a.count++;
}

export function clearLoginFailures(ip: string) {
  attempts.delete(ip);
}

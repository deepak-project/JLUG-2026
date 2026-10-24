"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    if (res.ok) return router.refresh();
    setError((await res.json().catch(() => ({}))).error ?? "Login failed.");
    setBusy(false);
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto mt-16 flex max-w-md flex-col gap-5 border border-jlug-line bg-jlug-ink/60 p-8"
    >
      <div className="font-mono text-xs uppercase tracking-widest text-jlug-gray-2">/ADMIN // ACCESS_CONTROL</div>
      {!configured && (
        <p className="font-mono text-xs text-red-400">ADMIN_SECRET_KEY is not set. Add it to .env.local and restart.</p>
      )}
      <label htmlFor="admin-key" className="font-mono text-xs uppercase tracking-widest text-jlug-white">
        SECRET KEY
      </label>
      <input
        id="admin-key"
        type="password"
        autoComplete="current-password"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        className="border border-jlug-line bg-jlug-black px-4 py-3 font-mono text-sm text-jlug-white outline-none focus:border-jlug-accent"
      />
      {error && <p className="font-mono text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={busy || !key}
        className="cursor-pointer border border-jlug-accent bg-jlug-accent px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-jlug-black hover:bg-jlug-white disabled:opacity-50"
      >
        {busy ? "CHECKING..." : "UNLOCK"}
      </button>
    </form>
  );
}

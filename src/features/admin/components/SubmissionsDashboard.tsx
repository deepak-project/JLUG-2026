"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BRANCH_OPTIONS, DOMAIN_OPTIONS, YEAR_OPTIONS } from "@/features/recruitment/data/recruitmentOptions";
import { Submission } from "../types";

const selectCls =
  "border border-jlug-line bg-jlug-black px-3 py-2 font-mono text-xs text-jlug-white outline-none focus:border-jlug-accent";
const btnCls =
  "cursor-pointer border border-jlug-line bg-jlug-surface px-4 py-2 font-mono text-xs uppercase tracking-widest text-jlug-gray-1 hover:border-jlug-white hover:text-jlug-white";

export default function SubmissionsDashboard({ initial }: { initial: Submission[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [query, setQuery] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [domain, setDomain] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (!branch || r.branch === branch) &&
        (!year || r.year === year) &&
        (!domain || r.domains.includes(domain)) &&
        (!q || [r.fullName, r.email, r.phone].some((v) => v.toLowerCase().includes(q)))
    );
  }, [rows, query, branch, year, domain]);

  async function remove(r: Submission) {
    if (!confirm(`Delete the application from ${r.fullName}? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/submissions?id=${encodeURIComponent(r.id)}`, { method: "DELETE" });
    if (res.ok) setRows((prev) => prev.filter((x) => x.id !== r.id));
    else alert("Delete failed.");
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-jlug-gray-2">/ADMIN // SUBMISSIONS</div>
          <div className="mt-1 font-mono text-sm text-jlug-white">
            {visible.length} of {rows.length} applications
          </div>
        </div>
        <div className="flex gap-3">
          <a href="/api/admin/export" className={`${btnCls} border-jlug-accent text-jlug-accent`}>
            EXPORT EXCEL (CSV)
          </a>
          <button type="button" onClick={() => router.refresh()} className={btnCls}>
            REFRESH
          </button>
          <button type="button" onClick={logout} className={btnCls}>
            LOGOUT
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          aria-label="Search name, email or phone"
          placeholder="Search name / email / phone"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`${selectCls} min-w-64`}
        />
        <select aria-label="Branch" value={branch} onChange={(e) => setBranch(e.target.value)} className={selectCls}>
          <option value="">All branches</option>
          {BRANCH_OPTIONS.map((b) => (
            <option key={b.code} value={b.code}>
              {b.code}
            </option>
          ))}
        </select>
        <select aria-label="Year" value={year} onChange={(e) => setYear(e.target.value)} className={selectCls}>
          <option value="">All years</option>
          {YEAR_OPTIONS.map((y) => (
            <option key={y.value} value={y.value}>
              {y.label}
            </option>
          ))}
        </select>
        <select aria-label="Domain" value={domain} onChange={(e) => setDomain(e.target.value)} className={selectCls}>
          <option value="">All domains</option>
          {DOMAIN_OPTIONS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto border border-jlug-line">
        <table className="w-full text-left font-mono text-xs text-jlug-white-soft">
          <thead className="bg-jlug-surface uppercase tracking-widest text-jlug-gray-2">
            <tr>
              {["Submitted", "Name", "Branch", "Year", "Phone", "Email", "Domains", ""].map((h) => (
                <th key={h} className="px-4 py-3 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-jlug-gray-2">
                  No applications match.
                </td>
              </tr>
            )}
            {visible.map((r) => (
              <FragmentRow key={r.id} r={r} expanded={open === r.id} onToggle={() => setOpen(open === r.id ? null : r.id)} onDelete={() => remove(r)} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FragmentRow({
  r,
  expanded,
  onToggle,
  onDelete,
}: {
  r: Submission;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <>
      <tr className="border-t border-jlug-line align-top hover:bg-jlug-surface/60">
        <td className="whitespace-nowrap px-4 py-3">{new Date(r.submittedAt).toLocaleString()}</td>
        <td className="px-4 py-3 text-jlug-white">{r.fullName}</td>
        <td className="px-4 py-3">{r.branch}</td>
        <td className="whitespace-nowrap px-4 py-3">{r.year}</td>
        <td className="px-4 py-3">{r.phone}</td>
        <td className="px-4 py-3">{r.email}</td>
        <td className="px-4 py-3">{r.domains.join(", ")}</td>
        <td className="whitespace-nowrap px-4 py-3">
          <button type="button" onClick={onToggle} className="mr-3 cursor-pointer text-jlug-accent hover:underline">
            {expanded ? "HIDE" : "VIEW"}
          </button>
          <button type="button" onClick={onDelete} className="cursor-pointer text-red-400 hover:underline">
            DELETE
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-jlug-ink">
          <td colSpan={8} className="whitespace-pre-wrap px-4 py-4 text-jlug-white-soft">
            <span className="text-jlug-gray-2">WHY JOIN: </span>
            {r.whyJoin}
          </td>
        </tr>
      )}
    </>
  );
}

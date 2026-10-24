import { Submission } from "../types";

const COLUMNS: [string, (s: Submission) => string][] = [
  ["Submitted At", (s) => s.submittedAt],
  ["Full Name", (s) => s.fullName],
  ["Branch", (s) => s.branch],
  ["Year", (s) => s.year],
  ["Phone", (s) => s.phone],
  ["Email", (s) => s.email],
  ["Domains", (s) => s.domains.join(", ")],
  ["Why Join", (s) => s.whyJoin],
];

// A leading = + - @ would run as a formula in Excel, so prefix those with a quote.
const cell = (v: string) => {
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
};

/** CSV with a UTF-8 BOM so Excel opens it with the right encoding. */
export function toCsv(rows: Submission[]) {
  const lines = [COLUMNS.map(([h]) => cell(h)), ...rows.map((r) => COLUMNS.map(([, f]) => cell(f(r))))];
  return "﻿" + lines.map((l) => l.join(",")).join("\r\n");
}

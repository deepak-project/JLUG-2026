import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { RecruitmentFormData } from "@/features/recruitment/types";
import { ADMIN_CONFIG } from "../config";
import { Submission } from "../types";

const file = () =>
  path.resolve(process.env[ADMIN_CONFIG.dataDirEnvVar] || ADMIN_CONFIG.defaultDataDir, ADMIN_CONFIG.dataFileName);

// shortcut: JSON file on one disk, so run a single instance with a persistent disk; swap for a DB to scale out.
let queue: Promise<unknown> = Promise.resolve();
const serialize = <T>(fn: () => Promise<T>): Promise<T> => {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
};

async function read(): Promise<Submission[]> {
  try {
    return JSON.parse(await readFile(file(), "utf8"));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
}

async function write(all: Submission[]) {
  await mkdir(path.dirname(file()), { recursive: true });
  const tmp = `${file()}.tmp`;
  await writeFile(tmp, JSON.stringify(all, null, 2));
  await rename(tmp, file());
}

/** Newest first. */
export const listSubmissions = async () => (await read()).reverse();

export const addSubmission = (data: RecruitmentFormData) =>
  serialize(async () => {
    const all = await read();
    all.push({ ...data, id: randomUUID(), submittedAt: new Date().toISOString() });
    await write(all);
  });

export const deleteSubmission = (id: string) =>
  serialize(async () => {
    const all = await read();
    const next = all.filter((s) => s.id !== id);
    await write(next);
    return next.length !== all.length;
  });

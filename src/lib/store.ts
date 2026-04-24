import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { randomBytes } from "crypto";
import type { Question } from "./questions";

const DATA_DIR     = join(process.cwd(), "data");
const SESSIONS_DIR = join(DATA_DIR, "sessions");
const RESULTS_DIR  = join(DATA_DIR, "results");

function ensureDirs() {
  [DATA_DIR, SESSIONS_DIR, RESULTS_DIR].forEach(d => {
    if (!existsSync(d)) mkdirSync(d, { recursive: true });
  });
}

export function generateId(): string {
  return randomBytes(4).toString("hex"); // 8-char hex, e.g. "a3b2c1d4"
}

export interface Session {
  id: string;
  topic: string;
  format: string;
  count: number;
  difficulty: string;
  questions: Question[];
  teacherName: string;
  createdAt: number;
}

export interface StudentResult {
  id: string;
  sessionId: string;
  studentName: string;
  score: number;
  total: number;
  answers: (number | boolean)[];
  completedAt: number;
}

export function saveSession(session: Session): void {
  ensureDirs();
  writeFileSync(join(SESSIONS_DIR, `${session.id}.json`), JSON.stringify(session));
}

export function getSession(id: string): Session | null {
  ensureDirs();
  const path = join(SESSIONS_DIR, `${id}.json`);
  if (!existsSync(path)) return null;
  try { return JSON.parse(readFileSync(path, "utf-8")); }
  catch { return null; }
}

export function saveResult(result: StudentResult): void {
  ensureDirs();
  const dir = join(RESULTS_DIR, result.sessionId);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${result.completedAt}-${result.id}.json`), JSON.stringify(result));
}

export function getResults(sessionId: string): StudentResult[] {
  ensureDirs();
  const dir = join(RESULTS_DIR, sessionId);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith(".json"))
    .map(f => { try { return JSON.parse(readFileSync(join(dir, f), "utf-8")); } catch { return null; } })
    .filter(Boolean)
    .sort((a, b) => a.completedAt - b.completedAt);
}

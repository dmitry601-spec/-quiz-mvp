import { NextRequest, NextResponse } from "next/server";
import { getSession, saveResult, generateId } from "@/lib/store";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession(params.id);
  if (!session) return NextResponse.json({ error: "Сессия не найдена" }, { status: 404 });

  const { studentName, score, answers, total: bodyTotal } = await req.json();
  if (!studentName?.trim()) return NextResponse.json({ error: "Укажите имя" }, { status: 400 });

  const mq = session.format === "matching" ? (session.questions[0] as { pairs?: unknown[] }) : null;
  const total = bodyTotal ?? (mq?.pairs?.length ?? session.questions.length);

  saveResult({
    id: generateId(),
    sessionId: params.id,
    studentName: studentName.trim(),
    score: Number(score) || 0,
    total,
    answers: answers ?? [],
    completedAt: Date.now(),
  });

  return NextResponse.json({ ok: true });
}

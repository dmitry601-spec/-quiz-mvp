import { NextRequest, NextResponse } from "next/server";
import { getSession, saveResult, generateId } from "@/lib/store";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession(params.id);
  if (!session) return NextResponse.json({ error: "Сессия не найдена" }, { status: 404 });

  const { studentName, score, answers } = await req.json();
  if (!studentName?.trim()) return NextResponse.json({ error: "Укажите имя" }, { status: 400 });

  saveResult({
    id: generateId(),
    sessionId: params.id,
    studentName: studentName.trim(),
    score: Number(score) || 0,
    total: session.questions.length,
    answers: answers ?? [],
    completedAt: Date.now(),
  });

  return NextResponse.json({ ok: true });
}

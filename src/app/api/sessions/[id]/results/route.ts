import { NextRequest, NextResponse } from "next/server";
import { getSession, getResults } from "@/lib/store";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession(params.id);
  if (!session) return NextResponse.json({ error: "Сессия не найдена" }, { status: 404 });
  const results = getResults(params.id);
  return NextResponse.json({ session, results });
}

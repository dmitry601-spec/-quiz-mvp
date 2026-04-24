import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { GameFormat } from "@/lib/questions";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `Ты генератор учебных игр. Возвращай ТОЛЬКО валидный JSON-массив без пояснений, markdown или тегов.`;

function buildPrompt(topic: string, format: GameFormat, count: number): string {
  if (format === "quiz") {
    return `Создай ${count} вопросов квиза на тему "${topic}" для учеников. Ответь ТОЛЬКО JSON-массивом:
[{"format":"quiz","question":"Вопрос?","options":["А","Б","В","Г"],"correct":0}]
Правила: correct — индекс правильного ответа (0-3), все варианты правдоподобны, язык — русский.`;
  }
  if (format === "truefalse") {
    return `Создай ${count} утверждений "Правда или ложь" на тему "${topic}" для учеников. Ответь ТОЛЬКО JSON-массивом:
[{"format":"truefalse","question":"Утверждение.","correct":true}]
Правила: примерно половина true, половина false, язык — русский.`;
  }
  return `Создай ${count} флеш-карточек на тему "${topic}" для учеников. Ответь ТОЛЬКО JSON-массивом:
[{"format":"flashcard","front":"Термин","back":"Чёткое определение"}]
Правила: front — термин/понятие, back — ясное определение, язык — русский.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, format, count = 5 } = body as { topic: string; format: GameFormat; count?: number };

    if (!topic?.trim()) return NextResponse.json({ error: "Укажите тему" }, { status: 400 });
    if (!["quiz", "truefalse", "flashcard"].includes(format)) {
      return NextResponse.json({ error: "Неверный формат" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1200,
      system: SYSTEM,
      messages: [{ role: "user", content: buildPrompt(topic.trim(), format, count) }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return NextResponse.json({ error: "AI вернул неверный формат" }, { status: 502 });

    const questions = JSON.parse(match[0]);
    return NextResponse.json({ questions });
  } catch (err) {
    console.error("generate error:", err);
    return NextResponse.json({ error: "Ошибка генерации" }, { status: 500 });
  }
}

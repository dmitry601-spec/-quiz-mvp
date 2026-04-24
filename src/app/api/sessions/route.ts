import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { GameFormat } from "@/lib/questions";
import { generateId, saveSession } from "@/lib/store";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const DIFFICULTY_RU: Record<string, string> = {
  easy:   "Вопросы простые, охватывают базовые факты, подходят для начинающих.",
  medium: "Вопросы среднего уровня — требуют понимания темы, а не только знания фактов.",
  hard:   "Вопросы сложные — затрагивают нюансы, требуют глубокого знания темы.",
};

function shuffleQuizOptions(questions: unknown[]): unknown[] {
  return questions.map(q => {
    const item = q as Record<string, unknown>;
    if (item.format !== "quiz" || !Array.isArray(item.options)) return q;
    const options = [...item.options];
    const correctOption = options[item.correct as number];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return { ...item, options, correct: options.indexOf(correctOption) };
  });
}

function buildPrompt(topic: string, format: GameFormat, count: number, difficulty: string): string {
  const d = DIFFICULTY_RU[difficulty] ?? DIFFICULTY_RU.medium;
  if (format === "quiz") return `Создай ${count} вопросов квиза на тему "${topic}". ${d}
Ответь ТОЛЬКО JSON-массивом:
[{"format":"quiz","question":"Вопрос?","options":["А","Б","В","Г"],"correct":0,"explanation":"Объяснение (1-2 предложения)."}]
Правила: correct — индекс правильного ответа (0-3), все варианты правдоподобны.`;
  if (format === "truefalse") return `Создай ${count} утверждений "Правда или ложь" на тему "${topic}". ${d}
Ответь ТОЛЬКО JSON-массивом:
[{"format":"truefalse","question":"Утверждение.","correct":true,"explanation":"Объяснение (1-2 предложения)."}]
Правила: примерно половина true, половина false.`;
  if (format === "fillblank") return `Создай ${count} предложений с одним пропуском на тему "${topic}". ${d}
Ответь ТОЛЬКО JSON-массивом:
[{"format":"fillblank","sentence":"Слово ___ использовано в контексте","answer":"слово","hint":"подсказка без ответа","explanation":"Объяснение (1-2 предложения)."}]
Правила: пропуск обозначь символом ___, ответ — одно-два слова, подсказка не должна содержать ответ.`;
  if (format === "matching") return `Создай ${count} пар "термин — краткое определение" на тему "${topic}". ${d}
Ответь ТОЛЬКО JSON-массивом с ОДНИМ объектом:
[{"format":"matching","pairs":[{"left":"Термин (1-3 слова)","right":"Краткое определение (до 8 слов)"}]}]
Правила: термины короткие, определения чёткие и краткие, ровно ${count} пар.`;
  return `Создай ${count} флеш-карточек на тему "${topic}". ${d}
Ответь ТОЛЬКО JSON-массивом:
[{"format":"flashcard","front":"Термин","back":"Чёткое определение"}]`;
}

export async function POST(req: NextRequest) {
  try {
    const { topic, format, count = 5, difficulty = "medium", teacherName = "" } = await req.json();
    if (!topic?.trim()) return NextResponse.json({ error: "Укажите тему" }, { status: 400 });

    const safeCount = Math.min(Math.max(Number(count) || 5, 3), 20);
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: "Ты генератор учебных игр. Возвращай ТОЛЬКО валидный JSON-массив без пояснений и markdown.",
      messages: [{ role: "user", content: buildPrompt(topic.trim(), format, safeCount, difficulty) }],
    });

    const raw = msg.content[0].type === "text" ? msg.content[0].text : "";
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return NextResponse.json({ error: "AI вернул неверный формат" }, { status: 502 });

    const questions = shuffleQuizOptions(JSON.parse(match[0])) as import("@/lib/questions").Question[];
    const session = {
      id: generateId(),
      topic: topic.trim(),
      format,
      count: safeCount,
      difficulty,
      questions,
      teacherName: teacherName.trim() || "Учитель",
      createdAt: Date.now(),
    };
    saveSession(session);
    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

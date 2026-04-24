"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useMemo, useState, useEffect } from "react";
import { FORMAT_LABELS, GameFormat, Question, QuizQuestion, TrueFalseQuestion, FlashcardQuestion } from "@/lib/questions";

const BLUE      = "#6C8CFC";
const BLUE_SOFT = "#EFF6FF";
const BLUE_MID  = "#D3DDFE";
const INK       = "#010B13";
const BORDER    = "#E1E1E1";
const SURFACE   = "#F5F5F7";
const OK_BG     = "#F0FDF4";
const OK_BORDER = "#86EFAC";
const OK_TEXT   = "#15803D";
const ERR_BG    = "#FFF0F0";
const ERR_BDR   = "#FCA5A5";
const ERR_TEXT  = "#DC2626";

function Confetti() {
  const particles = useMemo(() =>
    Array.from({ length: 32 }, (_, i) => ({
      id: i,
      x: `${4 + (i * 2.9) % 92}%`,
      delay: `${(i * 0.06) % 1.4}s`,
      dur: `${2.4 + (i * 0.11) % 1.6}s`,
      color: ["#6C8CFC", "#F59E0B", "#19AA0F", "#FB2C36", "#A78BFA", "#34D399", "#FCD34D"][(i * 3) % 7],
      w: `${5 + (i * 1.9) % 9}px`,
      h: `${4 + (i * 2.1) % 6}px`,
      radius: i % 3 === 0 ? "50%" : i % 3 === 1 ? "2px" : "1px",
    })), []
  );
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 999 }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: "absolute", top: "-16px", left: p.x,
          width: p.w, height: p.h, background: p.color,
          borderRadius: p.radius,
          animation: `confetti-fall ${p.dur} ${p.delay} ease-in forwards`,
        }} />
      ))}
    </div>
  );
}

function ResultsContent() {
  const params = useSearchParams();
  const score  = Number(params.get("score") ?? 0);
  const total  = Number(params.get("total") ?? 5);
  const format = (params.get("format") ?? "quiz") as GameFormat;
  const pct    = Math.round((score / total) * 100);

  const [animPct, setAnimPct] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<(number | boolean)[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setAnimPct(pct), 120);
    return () => clearTimeout(t);
  }, [pct]);

  useEffect(() => {
    try {
      const q = sessionStorage.getItem("playclass_questions");
      const a = sessionStorage.getItem("playclass_answers");
      if (q) setQuestions(JSON.parse(q));
      if (a) setAnswers(JSON.parse(a));
    } catch { /* ignore */ }
  }, []);

  const grade =
    pct === 100 ? { label: "Идеально!",  sub: "Все ответы правильные — вы в теме!", ring: BLUE }
  : pct >= 80   ? { label: "Отлично!",   sub: "Почти идеально — так держать!",      ring: BLUE }
  : pct >= 50   ? { label: "Неплохо",    sub: "Хороший результат, есть куда расти", ring: "#F59E0B" }
  :               { label: "Ещё раз?",   sub: "Попробуйте снова — у вас получится!", ring: "#FB2C36" };

  const circumference = 2 * Math.PI * 44;
  const dash = circumference * (animPct / 100);

  const hasBreakdown = questions.length > 0 && answers.length > 0;
  const wrongCount = format !== "flashcard"
    ? questions.filter((q, i) => {
        if (q.format === "quiz")      return answers[i] !== (q as QuizQuestion).correct;
        if (q.format === "truefalse") return answers[i] !== (q as TrueFalseQuestion).correct;
        return false;
      }).length
    : 0;

  return (
    <>
      {pct >= 80 && <Confetti />}
      <main style={{
        minHeight: "100vh", background: SURFACE,
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "48px 24px 80px",
        fontFamily: "'Golos Text', system-ui, sans-serif",
      }}>
        <div style={{ width: "100%", maxWidth: "560px", display: "flex", flexDirection: "column", gap: "28px" }}>

          {/* Score ring */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", animation: "pop-in 0.55s ease both" }}>
            <div style={{ position: "relative", width: "136px", height: "136px" }}>
              <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke={BORDER} strokeWidth="7" />
                <circle cx="50" cy="50" r="44" fill="none" stroke={grade.ring} strokeWidth="7"
                  strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
                  style={{ transition: "stroke-dasharray 1.1s cubic-bezier(.4,0,.2,1)" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "-1.5px", color: grade.ring, lineHeight: 1 }}>{pct}%</span>
              </div>
            </div>
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "clamp(26px, 5vw, 34px)", fontWeight: 900, color: INK, letterSpacing: "-0.5px" }}>{grade.label}</span>
              <p style={{ fontSize: "14px", color: "#666666", fontWeight: 500 }}>{grade.sub}</p>
              <p style={{ fontSize: "13px", color: "#ACACAD", fontWeight: 500, marginTop: "2px" }}>
                {score} из {total} · {FORMAT_LABELS[format]}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
            background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: "20px",
            overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,.04)",
            animation: "fade-up 0.5s ease 180ms both",
          }}>
            {[
              { label: "Правильно", value: score,         color: "#19AA0F" },
              { label: "Неверно",   value: total - score, color: "#FB2C36" },
              { label: "Результат", value: `${pct}%`,      color: grade.ring },
            ].map(({ label, value, color }, i) => (
              <div key={label} style={{ padding: "20px 12px", textAlign: "center", borderRight: i < 2 ? `1px solid ${BORDER}` : "none" }}>
                <span style={{ fontSize: "26px", fontWeight: 900, color, display: "block", lineHeight: 1 }}>{value}</span>
                <span style={{ fontSize: "11px", color: "#ACACAD", fontWeight: 600, display: "block", marginTop: "5px" }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", animation: "fade-up 0.5s ease 280ms both" }}>
            <Link href={`/play/${format}`} style={{
              display: "block", width: "100%", textAlign: "center",
              borderRadius: "100px", padding: "17px",
              background: BLUE, color: "#FFFFFF",
              fontFamily: "'Golos Text', system-ui, sans-serif",
              fontSize: "16px", fontWeight: 700, textDecoration: "none",
              boxShadow: "0 4px 16px rgba(108,140,252,.30)",
              transition: "opacity .18s, transform .18s, box-shadow .18s",
            }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.opacity = "0.88"; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 8px 24px rgba(108,140,252,.40)"; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.opacity = "1"; el.style.transform = "none"; el.style.boxShadow = "0 4px 16px rgba(108,140,252,.30)"; }}
            >Пройти ещё раз →</Link>
            <Link href="/start" style={{
              display: "block", width: "100%", textAlign: "center",
              borderRadius: "100px", padding: "17px",
              background: SURFACE, color: "#666666", border: `1.5px solid ${BORDER}`,
              fontFamily: "'Golos Text', system-ui, sans-serif",
              fontSize: "16px", fontWeight: 600, textDecoration: "none",
              transition: "border-color .18s, color .18s",
            }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = BLUE; el.style.color = INK; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = BORDER; el.style.color = "#666666"; }}
            >Выбрать другой формат</Link>
          </div>

          {/* Breakdown */}
          {hasBreakdown && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "fade-up 0.5s ease 400ms both" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ flex: 1, height: "1px", background: BORDER }} />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#ACACAD", letterSpacing: "1.5px", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                  Разбор игры
                  {format !== "flashcard" && wrongCount > 0 && (
                    <span style={{ marginLeft: "8px", background: ERR_BG, color: ERR_TEXT, border: `1px solid ${ERR_BDR}`, borderRadius: "100px", padding: "2px 8px", fontSize: "11px" }}>
                      {wrongCount} ошибк{wrongCount === 1 ? "а" : wrongCount < 5 ? "и" : ""}
                    </span>
                  )}
                </span>
                <div style={{ flex: 1, height: "1px", background: BORDER }} />
              </div>

              {questions.map((q, i) => {
                const userAnswer = answers[i];
                if (q.format === "quiz") return (
                  <QuizBreakdown key={i} idx={i} q={q} userAnswer={userAnswer as number} />
                );
                if (q.format === "truefalse") return (
                  <TrueFalseBreakdown key={i} idx={i} q={q} userAnswer={userAnswer as boolean} />
                );
                if (q.format === "flashcard") return (
                  <FlashcardBreakdown key={i} idx={i} q={q} knew={userAnswer as boolean} />
                );
                return null;
              })}
            </div>
          )}

          <p style={{ fontSize: "14px", color: "#ACACAD", fontWeight: 700, textAlign: "center" }}>
            Play<span style={{ color: BLUE }}>Class</span>
          </p>
        </div>
      </main>
    </>
  );
}

function StatusDot({ ok, neutral }: { ok: boolean; neutral?: boolean }) {
  return (
    <div style={{
      flexShrink: 0, width: "26px", height: "26px", borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: ok ? OK_BG : neutral ? "#F5F5F7" : ERR_BG,
      border: `1.5px solid ${ok ? OK_BORDER : neutral ? "#E1E1E1" : ERR_BDR}`,
    }}>
      {ok ? (
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke={OK_TEXT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1.5 5.5l2.5 2.5 5.5-5.5" />
        </svg>
      ) : neutral ? (
        <svg width="9" height="2" viewBox="0 0 9 2" fill="none" stroke="#ACACAD" strokeWidth="2" strokeLinecap="round">
          <line x1="0" y1="1" x2="9" y2="1" />
        </svg>
      ) : (
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke={ERR_TEXT} strokeWidth="2" strokeLinecap="round">
          <path d="M1 1l7 7M8 1L1 8" />
        </svg>
      )}
    </div>
  );
}

function QuizBreakdown({ idx, q, userAnswer }: { idx: number; q: QuizQuestion; userAnswer: number }) {
  const isCorrect = userAnswer === q.correct;
  return (
    <div style={{
      background: "#FFFFFF", border: `1px solid ${isCorrect ? OK_BORDER : ERR_BDR}`,
      borderRadius: "18px", overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: "12px", borderBottom: `1px solid ${BORDER}` }}>
        <StatusDot ok={isCorrect} />
        <p style={{ fontSize: "15px", fontWeight: 600, color: INK, lineHeight: 1.45, flex: 1 }}>
          <span style={{ fontSize: "12px", color: "#ACACAD", fontWeight: 500, display: "block", marginBottom: "3px" }}>Вопрос {idx + 1}</span>
          {q.question}
        </p>
      </div>

      {/* Answers */}
      <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {!isCorrect && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: ERR_BG, border: `1px solid ${ERR_BDR}`, borderRadius: "10px" }}>
            <span style={{ fontSize: "13px", color: ERR_TEXT, fontWeight: 700, flexShrink: 0 }}>Ваш ответ:</span>
            <span style={{ fontSize: "14px", color: ERR_TEXT }}>{q.options[userAnswer] ?? "—"}</span>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: OK_BG, border: `1px solid ${OK_BORDER}`, borderRadius: "10px" }}>
          <span style={{ fontSize: "13px", color: OK_TEXT, fontWeight: 700, flexShrink: 0 }}>Правильно:</span>
          <span style={{ fontSize: "14px", color: OK_TEXT, fontWeight: 600 }}>{q.options[q.correct]}</span>
        </div>
        {q.explanation && (
          <div style={{ padding: "12px 14px", background: BLUE_SOFT, border: `1px solid ${BLUE_MID}`, borderRadius: "10px", marginTop: "2px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: BLUE, letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Объяснение</span>
            <p style={{ fontSize: "14px", color: "#3344AA", lineHeight: 1.6 }}>{q.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TrueFalseBreakdown({ idx, q, userAnswer }: { idx: number; q: TrueFalseQuestion; userAnswer: boolean }) {
  const isCorrect = userAnswer === q.correct;
  const label = (v: boolean) => v ? "Правда" : "Ложь";
  return (
    <div style={{
      background: "#FFFFFF", border: `1px solid ${isCorrect ? OK_BORDER : ERR_BDR}`,
      borderRadius: "18px", overflow: "hidden",
    }}>
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: "12px", borderBottom: `1px solid ${BORDER}` }}>
        <StatusDot ok={isCorrect} />
        <p style={{ fontSize: "15px", fontWeight: 600, color: INK, lineHeight: 1.45, flex: 1 }}>
          <span style={{ fontSize: "12px", color: "#ACACAD", fontWeight: 500, display: "block", marginBottom: "3px" }}>Вопрос {idx + 1}</span>
          {q.question}
        </p>
      </div>
      <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {!isCorrect && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: ERR_BG, border: `1px solid ${ERR_BDR}`, borderRadius: "10px" }}>
            <span style={{ fontSize: "13px", color: ERR_TEXT, fontWeight: 700 }}>Ваш ответ:</span>
            <span style={{ fontSize: "14px", color: ERR_TEXT }}>{label(userAnswer)}</span>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: OK_BG, border: `1px solid ${OK_BORDER}`, borderRadius: "10px" }}>
          <span style={{ fontSize: "13px", color: OK_TEXT, fontWeight: 700 }}>Правильно:</span>
          <span style={{ fontSize: "14px", color: OK_TEXT, fontWeight: 600 }}>{label(q.correct)}</span>
        </div>
        {q.explanation && (
          <div style={{ padding: "12px 14px", background: BLUE_SOFT, border: `1px solid ${BLUE_MID}`, borderRadius: "10px", marginTop: "2px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: BLUE, letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Объяснение</span>
            <p style={{ fontSize: "14px", color: "#3344AA", lineHeight: 1.6 }}>{q.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FlashcardBreakdown({ idx, q, knew }: { idx: number; q: FlashcardQuestion; knew: boolean }) {
  return (
    <div style={{
      background: "#FFFFFF", border: `1px solid ${knew ? OK_BORDER : BORDER}`,
      borderRadius: "18px", overflow: "hidden",
    }}>
      <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: "12px" }}>
        <StatusDot ok={knew} neutral={!knew} />
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: "12px", color: "#ACACAD", fontWeight: 500, display: "block", marginBottom: "2px" }}>Карточка {idx + 1} · {knew ? "Знал" : "Не знал"}</span>
          <p style={{ fontSize: "15px", fontWeight: 700, color: INK }}>{q.front}</p>
        </div>
      </div>
      <div style={{ padding: "0 20px 14px 20px" }}>
        <div style={{ padding: "10px 14px", background: BLUE_SOFT, border: `1px solid ${BLUE_MID}`, borderRadius: "10px" }}>
          <p style={{ fontSize: "14px", color: "#3344AA", lineHeight: 1.6 }}>{q.back}</p>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense>
      <ResultsContent />
    </Suspense>
  );
}

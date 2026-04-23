"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  GameFormat, Question, QuizQuestion, TrueFalseQuestion, FlashcardQuestion,
  getQuestion, getTotal, FORMAT_LABELS,
} from "@/lib/questions";

const BLUE       = "#6C8CFC";
const BLUE_SOFT  = "#EFF6FF";
const BLUE_MID   = "#D3DDFE";
const INK        = "#010B13";
const MID        = "#666666";
const BORDER     = "#E1E1E1";
const SURFACE    = "#F5F5F7";
const WHITE      = "#FFFFFF";
const OK_BG      = "#F0FDF4";
const OK_BORDER  = "#86EFAC";
const OK_TEXT    = "#15803D";
const ERR_BG     = "#FFF0F0";
const ERR_BORDER = "#FCA5A5";
const ERR_TEXT   = "#DC2626";

export default function PlayPage() {
  const params = useParams();
  const router = useRouter();
  const format = params.format as GameFormat;
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | boolean | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const total = getTotal(format);
  const question = getQuestion(format, index);

  useEffect(() => {
    setSelected(null);
    setRevealed(false);
    setAnimKey((k) => k + 1);
  }, [index]);

  if (!question) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: SURFACE }}>
        <p style={{ color: INK, fontFamily: "'Golos Text', system-ui, sans-serif" }}>Неизвестный формат</p>
      </main>
    );
  }

  function advance(correct: boolean) {
    const newScore = correct ? score + 1 : score;
    if (index + 1 >= total) {
      router.push(`/results?score=${newScore}&total=${total}&format=${format}`);
    } else {
      setScore(newScore);
      setIndex((i) => i + 1);
    }
  }

  function handleQuizAnswer(i: number, q: QuizQuestion) {
    if (selected !== null) return;
    setSelected(i);
    setTimeout(() => advance(i === q.correct), 750);
  }

  function handleTrueFalse(answer: boolean, q: TrueFalseQuestion) {
    if (selected !== null) return;
    setSelected(answer);
    setTimeout(() => advance(answer === q.correct), 750);
  }

  const progress = (index / total) * 100;

  return (
    <main style={{
      minHeight: "100vh", background: SURFACE,
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "40px 24px 64px",
      fontFamily: "'Golos Text', system-ui, sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: "560px", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{
            fontSize: "11px", fontWeight: 700, letterSpacing: "2px",
            textTransform: "uppercase", color: BLUE,
            background: BLUE_SOFT, border: `1px solid ${BLUE_MID}`,
            borderRadius: "100px", padding: "4px 12px",
          }}>
            {FORMAT_LABELS[format]}
          </span>
          <span style={{ fontSize: "14px", fontWeight: 600, color: MID }}>
            {index + 1} <span style={{ color: BORDER }}>/ {total}</span>
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: "6px", background: BORDER, borderRadius: "100px", overflow: "hidden" }}>
          <div style={{
            height: "100%", background: BLUE, borderRadius: "100px",
            width: `${progress}%`, transition: "width 0.5s ease",
          }} />
        </div>

        {/* Question card */}
        <div
          key={animKey}
          style={{
            background: WHITE, border: `1px solid ${BORDER}`,
            borderRadius: "24px", padding: "32px",
            boxShadow: "0 4px 20px rgba(0,0,0,.05)",
            display: "flex", flexDirection: "column", gap: "24px",
            animation: "fade-up 0.35s ease both",
          }}
        >
          {question.format === "quiz" && (
            <QuizCard question={question} selected={selected as number | null} onAnswer={(i) => handleQuizAnswer(i, question)} />
          )}
          {question.format === "truefalse" && (
            <TrueFalseCard question={question} selected={selected as boolean | null} onAnswer={(v) => handleTrueFalse(v, question)} />
          )}
          {question.format === "flashcard" && (
            <FlashcardCard question={question} revealed={revealed} onReveal={() => setRevealed(true)} onNext={(c) => advance(c)} />
          )}
        </div>

        {/* Score */}
        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: "13px", color: "#ACACAD", fontWeight: 500 }}>
            Правильных ответов: <strong style={{ color: BLUE }}>{score}</strong>
          </span>
        </div>
      </div>
    </main>
  );
}

function QuizCard({ question, selected, onAnswer }: {
  question: QuizQuestion; selected: number | null; onAnswer: (i: number) => void;
}) {
  return (
    <>
      <p style={{ fontSize: "clamp(17px, 2.5vw, 20px)", fontWeight: 700, lineHeight: 1.4, color: INK }}>
        {question.question}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {question.options.map((opt, i) => {
          const revealed = selected !== null;
          const isCorrect = i === question.correct;
          const isSelected = selected === i;
          let borderColor = BORDER, bg = WHITE, textColor = INK;
          if (revealed) {
            if (isCorrect)      { borderColor = OK_BORDER;  bg = OK_BG;  textColor = OK_TEXT;  }
            else if (isSelected){ borderColor = ERR_BORDER; bg = ERR_BG; textColor = ERR_TEXT; }
            else { textColor = "#ACACAD"; }
          }
          return (
            <button
              key={i} onClick={() => onAnswer(i)} disabled={revealed}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                borderRadius: "14px", border: `1.5px solid ${borderColor}`,
                padding: "13px 16px", textAlign: "left", fontSize: "15px",
                fontFamily: "'Golos Text', system-ui, sans-serif",
                background: bg, color: textColor,
                cursor: revealed ? "default" : "pointer",
                transition: "border-color .15s, background .15s",
                width: "100%", fontWeight: isCorrect && revealed ? 600 : 400,
              }}
              onMouseEnter={(e) => { if (!revealed)(e.currentTarget as HTMLElement).style.borderColor = BLUE; }}
              onMouseLeave={(e) => { if (!revealed)(e.currentTarget as HTMLElement).style.borderColor = BORDER; }}
            >
              <span style={{
                fontSize: "12px", fontWeight: 700,
                width: "28px", height: "28px",
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: "8px", flexShrink: 0,
                background: isCorrect && revealed ? OK_BORDER : isSelected && revealed ? ERR_BORDER : SURFACE,
                color: isCorrect && revealed ? OK_TEXT : isSelected && revealed ? ERR_TEXT : MID,
                transition: "background .15s",
              }}>
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
    </>
  );
}

function TrueFalseCard({ question, selected, onAnswer }: {
  question: TrueFalseQuestion; selected: boolean | null; onAnswer: (v: boolean) => void;
}) {
  function getStyle(value: boolean): React.CSSProperties {
    if (selected === null) return { borderColor: BORDER, background: WHITE, color: INK };
    if (value === question.correct) return { borderColor: OK_BORDER, background: OK_BG, color: OK_TEXT };
    if (selected === value)         return { borderColor: ERR_BORDER, background: ERR_BG, color: ERR_TEXT };
    return { borderColor: BORDER, background: WHITE, color: "#ACACAD" };
  }
  return (
    <>
      <p style={{ fontSize: "clamp(17px, 2.5vw, 22px)", fontWeight: 700, lineHeight: 1.4, color: INK }}>
        {question.question}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {([true, false] as const).map((v) => {
          const st = getStyle(v);
          return (
            <button
              key={String(v)} onClick={() => onAnswer(v)} disabled={selected !== null}
              style={{
                borderRadius: "16px", border: `1.5px solid ${st.borderColor}`,
                padding: "24px 12px", fontFamily: "'Golos Text', system-ui, sans-serif",
                fontSize: "16px", fontWeight: 700,
                background: st.background, color: st.color,
                cursor: selected !== null ? "default" : "pointer",
                transition: "border-color .15s, background .15s",
              }}
              onMouseEnter={(e) => { if (selected === null)(e.currentTarget as HTMLElement).style.borderColor = BLUE; }}
              onMouseLeave={(e) => { if (selected === null)(e.currentTarget as HTMLElement).style.borderColor = BORDER; }}
            >
              {v ? "✓ Правда" : "✗ Ложь"}
            </button>
          );
        })}
      </div>
    </>
  );
}

function FlashcardCard({ question, revealed, onReveal, onNext }: {
  question: FlashcardQuestion; revealed: boolean; onReveal: () => void; onNext: (c: boolean) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" as const, color: "#ACACAD" }}>
          Термин
        </span>
        <p style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 900, letterSpacing: "-0.5px", lineHeight: 1.15, color: INK, marginTop: "8px" }}>
          {question.front}
        </p>
      </div>

      {!revealed ? (
        <button
          onClick={onReveal}
          style={{
            borderRadius: "14px", border: `1.5px solid ${BORDER}`,
            padding: "16px", fontFamily: "'Golos Text', system-ui, sans-serif",
            fontSize: "15px", fontWeight: 600, color: MID,
            background: SURFACE, cursor: "pointer",
            transition: "border-color .15s, color .15s",
          }}
          onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = BLUE; el.style.color = INK; }}
          onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = BORDER; el.style.color = MID; }}
        >
          Показать определение →
        </button>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", animation: "fade-up 0.3s ease both" }}>
          <div style={{ borderRadius: "14px", padding: "18px", background: BLUE_SOFT, border: `1px solid ${BLUE_MID}` }}>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" as const, color: BLUE }}>
              Определение
            </span>
            <p style={{ marginTop: "8px", fontSize: "15px", lineHeight: 1.7, color: INK }}>
              {question.back}
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <button
              onClick={() => onNext(false)}
              style={{
                borderRadius: "14px", border: `1.5px solid ${ERR_BORDER}`, padding: "14px",
                fontFamily: "'Golos Text', system-ui, sans-serif", fontSize: "15px", fontWeight: 700,
                color: ERR_TEXT, background: ERR_BG, cursor: "pointer", transition: "opacity .15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.8"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
            >✗ Не знал</button>
            <button
              onClick={() => onNext(true)}
              style={{
                borderRadius: "14px", border: `1.5px solid ${OK_BORDER}`, padding: "14px",
                fontFamily: "'Golos Text', system-ui, sans-serif", fontSize: "15px", fontWeight: 700,
                color: OK_TEXT, background: OK_BG, cursor: "pointer", transition: "opacity .15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.8"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
            >✓ Знал</button>
          </div>
        </div>
      )}
    </div>
  );
}

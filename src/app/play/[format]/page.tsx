"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  GameFormat, QuizQuestion, TrueFalseQuestion, FlashcardQuestion,
  getQuestion, getTotal, FORMAT_LABELS,
} from "@/lib/questions";

const BLUE       = "#6C8CFC";
const BLUE_SOFT  = "#EFF6FF";
const BLUE_MID   = "#D3DDFE";
const INK        = "#010B13";
const MID        = "#555566"; /* §13: чуть темнее для контраста */
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
  /* §15: принцип прогрессии — показываем сколько осталось */
  const remaining = total - index - 1;

  useEffect(() => {
    setSelected(null);
    setRevealed(false);
    setAnimKey((k) => k + 1);
  }, [index]);

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
    setTimeout(() => advance(i === q.correct), 800);
  }

  function handleTrueFalse(answer: boolean, q: TrueFalseQuestion) {
    if (selected !== null) return;
    setSelected(answer);
    setTimeout(() => advance(answer === q.correct), 800);
  }

  /* §13: keyboard shortcuts */
  useEffect(() => {
    if (!question) return;
    function onKey(e: KeyboardEvent) {
      if (question!.format === "quiz") {
        if (selected !== null) return;
        const optIdx = parseInt(e.key) - 1;
        const q = question as QuizQuestion;
        if (optIdx >= 0 && optIdx < q.options.length) {
          setSelected(optIdx);
          const correct = optIdx === q.correct;
          setTimeout(() => {
            const ns = correct ? score + 1 : score;
            if (index + 1 >= total) router.push(`/results?score=${ns}&total=${total}&format=${format}`);
            else { setScore(ns); setIndex((i) => i + 1); }
          }, 800);
        }
      } else if (question!.format === "truefalse") {
        if (selected !== null) return;
        const q = question as TrueFalseQuestion;
        let answer: boolean | null = null;
        if (e.key === "ArrowLeft"  || e.key.toLowerCase() === "t") answer = true;
        if (e.key === "ArrowRight" || e.key.toLowerCase() === "f") answer = false;
        if (answer !== null) {
          setSelected(answer);
          const correct = answer === q.correct;
          setTimeout(() => {
            const ns = correct ? score + 1 : score;
            if (index + 1 >= total) router.push(`/results?score=${ns}&total=${total}&format=${format}`);
            else { setScore(ns); setIndex((i) => i + 1); }
          }, 800);
        }
      } else if (question!.format === "flashcard") {
        if (!revealed && (e.key === " " || e.key === "Enter")) {
          e.preventDefault();
          setRevealed(true);
        } else if (revealed) {
          if (e.key === "ArrowLeft") {
            if (index + 1 >= total) router.push(`/results?score=${score}&total=${total}&format=${format}`);
            else setIndex((i) => i + 1);
          }
          if (e.key === "ArrowRight" || e.key === "Enter") {
            const ns = score + 1;
            if (index + 1 >= total) router.push(`/results?score=${ns}&total=${total}&format=${format}`);
            else { setScore(ns); setIndex((i) => i + 1); }
          }
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [question, selected, revealed, score, index, total, format, router]);

  if (!question) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: SURFACE }}>
        <p style={{ color: INK, fontFamily: "'Golos Text', system-ui, sans-serif" }}>Неизвестный формат</p>
      </main>
    );
  }

  return (
    <main style={{
      minHeight: "100vh", background: SURFACE,
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "40px 24px 64px",
      fontFamily: "'Golos Text', system-ui, sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: "560px", display: "flex", flexDirection: "column", gap: "20px" }}>

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

        {/* §15: прогресс-точки — принцип прогрессии */}
        <div style={{ display: "flex", gap: "6px", justifyContent: "center", alignItems: "center" }} role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={total}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{
              height: "6px",
              width: i === index ? "22px" : "6px",
              borderRadius: "100px",
              background: i < index ? BLUE : i === index ? BLUE : BORDER,
              opacity: i > index ? 0.4 : 1,
              transition: "width 0.4s cubic-bezier(.4,0,.2,1), background 0.3s ease",
              flexShrink: 0,
            }} />
          ))}
        </div>

        {/* Question card */}
        <div
          key={animKey}
          style={{
            background: WHITE, border: `1px solid ${BORDER}`,
            borderRadius: "24px", padding: "32px",
            /* §6: тень + border */
            boxShadow: "0 4px 20px rgba(0,0,0,.05)",
            display: "flex", flexDirection: "column", gap: "24px",
            animation: "fade-up 0.35s ease both",
            minHeight: "280px",
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

        {/* §15: принцип прогрессии — показываем сколько осталось */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "#BBBBCC", fontWeight: 500, letterSpacing: "0.2px" }}>
            {question.format === "quiz" && "Клавиши 1–4 для ответа"}
            {question.format === "truefalse" && "← Правда · Ложь →"}
            {question.format === "flashcard" && (!revealed ? "Пробел — показать" : "← Не знал · Знал →")}
          </span>
          <span style={{ fontSize: "12px", color: "#BBBBCC", fontWeight: 500 }}>
            {remaining > 0 ? `Осталось ${remaining}` : "Последний вопрос"}
          </span>
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
      <p style={{ fontSize: "clamp(17px, 2.5vw, 20px)", fontWeight: 700, lineHeight: 1.45, color: INK }}>
        {question.question}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }} role="group" aria-label="Варианты ответа">
        {question.options.map((opt, i) => {
          const revealed = selected !== null;
          const isCorrect = i === question.correct;
          const isSelected = selected === i;
          let borderColor = BORDER, bg = WHITE, textColor = INK;
          if (revealed) {
            if (isCorrect)       { borderColor = OK_BORDER;  bg = OK_BG;  textColor = OK_TEXT;  }
            else if (isSelected) { borderColor = ERR_BORDER; bg = ERR_BG; textColor = ERR_TEXT; }
            else { textColor = "#ACACAD"; }
          }
          return (
            <button
              key={i} onClick={() => onAnswer(i)} disabled={revealed}
              aria-label={`Вариант ${i + 1}: ${opt}${isCorrect && revealed ? " — правильный ответ" : ""}`}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                borderRadius: "14px", border: `1.5px solid ${borderColor}`,
                /* §12: min 48px высота для мобильных тап-зон */
                padding: "14px 16px", minHeight: "48px",
                textAlign: "left", fontSize: "15px",
                fontFamily: "'Golos Text', system-ui, sans-serif",
                background: bg, color: textColor,
                cursor: revealed ? "default" : "pointer",
                transition: "border-color .15s, background .15s, transform .1s",
                width: "100%", fontWeight: isCorrect && revealed ? 600 : 400,
                transform: (isSelected || isCorrect) && revealed ? "scale(1.01)" : "none",
              }}
              onMouseEnter={(e) => { if (!revealed)(e.currentTarget as HTMLElement).style.borderColor = BLUE; }}
              onMouseLeave={(e) => { if (!revealed)(e.currentTarget as HTMLElement).style.borderColor = BORDER; }}
            >
              <span style={{
                fontSize: "11px", fontWeight: 700,
                minWidth: "28px", height: "28px",
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: "8px", flexShrink: 0,
                background: isCorrect && revealed ? OK_BORDER : isSelected && revealed ? ERR_BORDER : SURFACE,
                color: isCorrect && revealed ? OK_TEXT : isSelected && revealed ? ERR_TEXT : MID,
                transition: "background .15s",
              }} aria-hidden="true">
                {i + 1}
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
      <p style={{ fontSize: "clamp(17px, 2.5vw, 22px)", fontWeight: 700, lineHeight: 1.45, color: INK }}>
        {question.question}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }} role="group" aria-label="Выберите: правда или ложь">
        {([true, false] as const).map((v) => {
          const st = getStyle(v);
          return (
            <button
              key={String(v)} onClick={() => onAnswer(v)} disabled={selected !== null}
              aria-pressed={selected === v}
              style={{
                borderRadius: "16px", border: `1.5px solid ${st.borderColor}`,
                /* §12: 48px минимум для мобильных тап-зон */
                padding: "28px 12px", minHeight: "80px",
                fontFamily: "'Golos Text', system-ui, sans-serif",
                fontSize: "16px", fontWeight: 700,
                background: st.background, color: st.color,
                cursor: selected !== null ? "default" : "pointer",
                transition: "border-color .15s, background .15s, transform .12s",
                transform: selected !== null && (v === question.correct || selected === v) ? "scale(1.02)" : "none",
              }}
              onMouseEnter={(e) => { if (selected === null)(e.currentTarget as HTMLElement).style.borderColor = BLUE; }}
              onMouseLeave={(e) => { if (selected === null)(e.currentTarget as HTMLElement).style.borderColor = BORDER; }}
            >
              {v ? "✓  Правда" : "✗  Ложь"}
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
            /* §12: 48px минимум */
            padding: "16px", minHeight: "52px",
            fontFamily: "'Golos Text', system-ui, sans-serif",
            fontSize: "15px", fontWeight: 600, color: MID,
            background: SURFACE, cursor: "pointer",
            transition: "border-color .15s, color .15s, background .15s",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = BLUE; el.style.color = INK; el.style.background = BLUE_SOFT;
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = BORDER; el.style.color = MID; el.style.background = SURFACE;
          }}
        >
          Показать определение →
        </button>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", animation: "fade-up 0.3s ease both" }}>
          <div style={{ borderRadius: "14px", padding: "18px", background: BLUE_SOFT, border: `1px solid ${BLUE_MID}` }}>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" as const, color: BLUE }}>
              Определение
            </span>
            <p style={{ marginTop: "8px", fontSize: "15px", lineHeight: 1.72, color: INK }}>
              {question.back}
            </p>
          </div>
          {/* §12: тап-зоны 48px, §5: large buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }} role="group" aria-label="Вы знали ответ?">
            <button
              onClick={() => onNext(false)}
              style={{
                borderRadius: "14px", border: `1.5px solid ${ERR_BORDER}`,
                padding: "16px", minHeight: "56px",
                fontFamily: "'Golos Text', system-ui, sans-serif", fontSize: "15px", fontWeight: 700,
                color: ERR_TEXT, background: ERR_BG, cursor: "pointer", transition: "opacity .15s, transform .1s",
              }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.opacity = "0.82"; el.style.transform = "scale(0.98)"; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.opacity = "1"; el.style.transform = "none"; }}
            >✗  Не знал</button>
            <button
              onClick={() => onNext(true)}
              style={{
                borderRadius: "14px", border: `1.5px solid ${OK_BORDER}`,
                padding: "16px", minHeight: "56px",
                fontFamily: "'Golos Text', system-ui, sans-serif", fontSize: "15px", fontWeight: 700,
                color: OK_TEXT, background: OK_BG, cursor: "pointer", transition: "opacity .15s, transform .1s",
              }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.opacity = "0.82"; el.style.transform = "scale(0.98)"; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.opacity = "1"; el.style.transform = "none"; }}
            >✓  Знал</button>
          </div>
        </div>
      )}
    </div>
  );
}

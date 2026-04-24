"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import type { Session } from "@/lib/store";
import type { Question, QuizQuestion, TrueFalseQuestion, FlashcardQuestion } from "@/lib/questions";

/* ── colors ── */
const BLUE      = "#6C8CFC";
const BLUE_SOFT = "#EFF6FF";
const BLUE_MID  = "#D3DDFE";
const INK       = "#010B13";
const MID       = "#555566";
const BORDER    = "#E1E1E1";
const SURFACE   = "#F5F5F7";
const WHITE     = "#FFFFFF";
const OK_BG     = "#F0FDF4";
const OK_BDR    = "#86EFAC";
const OK_TEXT   = "#15803D";
const ERR_BG    = "#FFF0F0";
const ERR_BDR   = "#FCA5A5";
const ERR_TEXT  = "#DC2626";

const FORMAT_LABELS: Record<string, string> = {
  quiz: "Квиз", truefalse: "Правда или ложь", flashcard: "Флеш-карточки",
};
const DIFF_LABELS: Record<string, string> = { easy: "Лёгкий", medium: "Средний", hard: "Сложный" };

type Phase = "loading" | "error" | "intro" | "playing" | "submitting" | "done";

export default function GamePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [phase, setPhase] = useState<Phase>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [studentName, setStudentName] = useState("");
  const [nameError, setNameError] = useState("");

  /* game state */
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | boolean | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const answersRef = useRef<(number | boolean)[]>([]);

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setSession(data); setPhase("intro"); })
      .catch(() => setPhase("error"));
  }, [sessionId]);

  useEffect(() => {
    setSelected(null);
    setRevealed(false);
    setAnimKey(k => k + 1);
  }, [index]);

  /* derived — safe before session loads */
  const questions = ((session?.questions ?? []) as Question[]);
  const total = questions.length;
  const question = questions[index] ?? null;
  const remaining = total - index - 1;

  /* ── keyboard — must be before any conditional return ── */
  useEffect(() => {
    if (phase !== "playing" || !question) return;
    function onKey(e: KeyboardEvent) {
      if (question!.format === "quiz") {
        if (selected !== null) return;
        const i = parseInt(e.key) - 1;
        const q = question as QuizQuestion;
        if (i >= 0 && i < q.options.length) handleQuizAnswer(i, q);
      } else if (question!.format === "truefalse") {
        if (selected !== null) return;
        const q = question as TrueFalseQuestion;
        if (e.key === "ArrowLeft"  || e.key.toLowerCase() === "t") handleTrueFalse(true, q);
        if (e.key === "ArrowRight" || e.key.toLowerCase() === "f") handleTrueFalse(false, q);
      } else if (question!.format === "flashcard") {
        if (!revealed && (e.key === " " || e.key === "Enter")) { e.preventDefault(); setRevealed(true); }
        else if (revealed) {
          if (e.key === "ArrowLeft")                               handleFlashcard(false);
          if (e.key === "ArrowRight" || e.key === "Enter")        handleFlashcard(true);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, question, selected, revealed, score, index]); // eslint-disable-line

  if (!session) {
    return (
      <Center>
        {phase === "error" ? (
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
            <div style={{ fontSize: "40px" }}>🔍</div>
            <p style={{ fontSize: "17px", fontWeight: 700, color: INK }}>Игра не найдена</p>
            <p style={{ fontSize: "14px", color: MID }}>Попросите учителя прислать правильную ссылку</p>
          </div>
        ) : (
          <Spinner large />
        )}
      </Center>
    );
  }

  /* ── submit ── */
  async function submitResults(finalScore: number) {
    setPhase("submitting");
    try {
      await fetch(`/api/sessions/${sessionId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName, score: finalScore, answers: answersRef.current }),
      });
    } catch { /* ignore submit error, still show done */ }
    setPhase("done");
  }

  function finishOrAdvance(isCorrect: boolean) {
    const newScore = isCorrect ? score + 1 : score;
    setScore(newScore);
    if (index + 1 >= total) {
      submitResults(newScore);
    } else {
      setIndex(i => i + 1);
    }
  }

  function handleQuizAnswer(i: number, q: QuizQuestion) {
    if (selected !== null) return;
    setSelected(i);
    answersRef.current = [...answersRef.current, i];
    setTimeout(() => finishOrAdvance(i === q.correct), 800);
  }

  function handleTrueFalse(answer: boolean, q: TrueFalseQuestion) {
    if (selected !== null) return;
    setSelected(answer);
    answersRef.current = [...answersRef.current, answer];
    setTimeout(() => finishOrAdvance(answer === q.correct), 800);
  }

  function handleFlashcard(knew: boolean) {
    answersRef.current = [...answersRef.current, knew];
    finishOrAdvance(knew);
  }

  /* ══════════════════════ PHASES ══════════════════════ */

  /* INTRO */
  function startGame() {
    if (studentName.trim().length < 2) { setNameError("Введите имя (минимум 2 символа)"); return; }
    setPhase("playing");
  }

  if (phase === "intro") {
    return (
      <main style={{ minHeight: "100vh", background: SURFACE, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", fontFamily: "'Golos Text', system-ui, sans-serif" }}>
        <div style={{ width: "100%", maxWidth: "440px", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ animation: "fade-up 0.4s ease both" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#EFF6FF", border: "1px solid #D3DDFE", borderRadius: "100px", padding: "4px 12px", fontSize: "12px", fontWeight: 700, color: BLUE, marginBottom: "16px" }}>
              👩‍🏫 {session.teacherName}
            </div>
            <h1 style={{ fontSize: "clamp(22px, 5vw, 30px)", fontWeight: 900, color: INK, letterSpacing: "-0.5px", lineHeight: 1.2 }}>{session.topic}</h1>
            <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
              {[FORMAT_LABELS[session.format], DIFF_LABELS[session.difficulty], `${session.count} вопросов`].map(tag => (
                <span key={tag} style={{ fontSize: "12px", fontWeight: 600, color: MID, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: "100px", padding: "3px 10px" }}>{tag}</span>
              ))}
            </div>
          </div>

          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", animation: "fade-up 0.4s ease 80ms both" }}>
            <label style={{ fontSize: "12px", fontWeight: 700, color: MID, letterSpacing: "1.5px", textTransform: "uppercase" }}>
              Ваше имя
            </label>
            <input
              autoFocus
              value={studentName}
              onChange={e => { setStudentName(e.target.value); setNameError(""); }}
              onKeyDown={e => { if (e.key === "Enter") startGame(); }}
              placeholder="Введите имя или фамилию…"
              style={{ padding: "13px 16px", fontSize: "15px", fontFamily: "inherit", border: `1.5px solid ${nameError ? "#FB2C36" : BORDER}`, borderRadius: "14px", color: INK, outline: "none", transition: "border-color .15s, box-shadow .15s" }}
              onFocus={e => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(108,140,252,.15)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = nameError ? "#FB2C36" : BORDER; e.currentTarget.style.boxShadow = "none"; }}
            />
            {nameError && <p style={{ fontSize: "13px", color: "#FB2C36", fontWeight: 500, marginTop: "-8px" }}>{nameError}</p>}
            <button onClick={startGame} style={{ padding: "16px", borderRadius: "100px", background: BLUE, color: WHITE, border: "none", fontSize: "16px", fontWeight: 700, fontFamily: "inherit", cursor: "pointer", boxShadow: "0 4px 16px rgba(108,140,252,.35)", transition: "opacity .15s, transform .15s" }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.opacity = "0.88"; el.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.opacity = "1"; el.style.transform = "none"; }}
            >
              Начать игру →
            </button>
          </div>

          <p style={{ textAlign: "center", fontSize: "13px", color: "#ACACAD", animation: "fade-up 0.4s ease 140ms both" }}>
            Play<span style={{ color: BLUE }}>Class</span> · результаты получит {session.teacherName}
          </p>
        </div>
      </main>
    );
  }

  /* SUBMITTING / DONE */
  if (phase === "submitting" || phase === "done") {
    const pct = Math.round((score / total) * 100);
    const grade = pct === 100 ? "Идеально! 🎉" : pct >= 80 ? "Отлично! 👏" : pct >= 50 ? "Неплохо 👍" : "Попробуй ещё раз";
    const ringColor = pct >= 80 ? BLUE : pct >= 50 ? "#F59E0B" : "#FB2C36";

    return (
      <main style={{ minHeight: "100vh", background: SURFACE, padding: "48px 24px 80px", fontFamily: "'Golos Text', system-ui, sans-serif" }}>
        <div style={{ width: "100%", maxWidth: "560px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Score card */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", animation: "pop-in 0.5s ease both" }}>
            <div style={{ position: "relative", width: "110px", height: "110px" }}>
              <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                <circle cx="50" cy="50" r="44" fill="none" stroke={BORDER} strokeWidth="7" />
                <circle cx="50" cy="50" r="44" fill="none" stroke={ringColor} strokeWidth="7"
                  strokeDasharray={`${2 * Math.PI * 44 * (pct / 100)} ${2 * Math.PI * 44}`}
                  strokeLinecap="round" style={{ transition: "stroke-dasharray 1s ease" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "24px", fontWeight: 900, color: ringColor }}>{pct}%</span>
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "22px", fontWeight: 900, color: INK }}>{grade}</p>
              <p style={{ fontSize: "14px", color: MID, marginTop: "4px" }}>{score} из {total} · {studentName}</p>
            </div>
            <div style={{ background: phase === "done" ? OK_BG : SURFACE, border: `1px solid ${phase === "done" ? OK_BDR : BORDER}`, borderRadius: "14px", padding: "14px 20px", display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
              {phase === "submitting" ? (
                <><Spinner /><span style={{ fontSize: "14px", color: MID }}>Отправляем результат учителю…</span></>
              ) : (
                <><span style={{ fontSize: "16px" }}>✅</span><span style={{ fontSize: "14px", color: OK_TEXT, fontWeight: 600 }}>Результат отправлен {session.teacherName}!</span></>
              )}
            </div>
          </div>

          {/* Breakdown */}
          {phase === "done" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", animation: "fade-up 0.4s ease 200ms both" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: MID, letterSpacing: "1.5px", textTransform: "uppercase", marginTop: "8px" }}>
                Разбор игры
              </div>
              {questions.map((q, i) => {
                const userAnswer = answersRef.current[i];
                const isCorrect =
                  q.format === "quiz" ? userAnswer === (q as QuizQuestion).correct :
                  q.format === "truefalse" ? userAnswer === (q as TrueFalseQuestion).correct :
                  userAnswer === true;

                return (
                  <div key={i} style={{ background: WHITE, border: `1px solid ${isCorrect ? OK_BDR : ERR_BDR}`, borderRadius: "16px", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ flexShrink: 0, width: "22px", height: "22px", borderRadius: "50%", background: isCorrect ? OK_BG : ERR_BG, border: `1.5px solid ${isCorrect ? OK_BDR : ERR_BDR}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: isCorrect ? OK_TEXT : ERR_TEXT, marginTop: "1px" }}>
                        {isCorrect ? "✓" : "✗"}
                      </span>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: INK, lineHeight: 1.5 }}>
                        {q.format === "flashcard" ? (q as FlashcardQuestion).front : (q as QuizQuestion | TrueFalseQuestion).question}
                      </p>
                    </div>

                    {/* Quiz answers */}
                    {q.format === "quiz" && (() => {
                      const qq = q as QuizQuestion;
                      return (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingLeft: "32px" }}>
                          {qq.options.map((opt, oi) => {
                            const isOpt = oi === qq.correct;
                            const isUser = oi === userAnswer;
                            if (!isOpt && !isUser) return null;
                            return (
                              <div key={oi} style={{ fontSize: "13px", padding: "8px 12px", borderRadius: "8px", background: isOpt ? OK_BG : ERR_BG, border: `1px solid ${isOpt ? OK_BDR : ERR_BDR}`, color: isOpt ? OK_TEXT : ERR_TEXT, fontWeight: 600 }}>
                                {isOpt && !isUser ? "✓ " : isUser && !isOpt ? "✗ Вы ответили: " : "✓ "}{opt}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* True/False answers */}
                    {q.format === "truefalse" && (() => {
                      const tq = q as TrueFalseQuestion;
                      return (
                        <div style={{ paddingLeft: "32px", display: "flex", flexDirection: "column", gap: "6px" }}>
                          {!isCorrect && (
                            <div style={{ fontSize: "13px", padding: "8px 12px", borderRadius: "8px", background: ERR_BG, border: `1px solid ${ERR_BDR}`, color: ERR_TEXT, fontWeight: 600 }}>
                              ✗ Вы ответили: {userAnswer ? "Правда" : "Ложь"}
                            </div>
                          )}
                          <div style={{ fontSize: "13px", padding: "8px 12px", borderRadius: "8px", background: OK_BG, border: `1px solid ${OK_BDR}`, color: OK_TEXT, fontWeight: 600 }}>
                            ✓ Правильно: {tq.correct ? "Правда" : "Ложь"}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Flashcard */}
                    {q.format === "flashcard" && (
                      <div style={{ paddingLeft: "32px", fontSize: "13px", color: MID, lineHeight: 1.6, background: SURFACE, borderRadius: "8px", padding: "10px 12px 10px 12px" }}>
                        {(q as FlashcardQuestion).back}
                      </div>
                    )}

                    {/* Explanation */}
                    {(q as QuizQuestion).explanation && (
                      <div style={{ paddingLeft: "32px", fontSize: "13px", color: "#3B5FC0", lineHeight: 1.6, background: "#EFF6FF", border: "1px solid #D3DDFE", borderRadius: "8px", padding: "10px 12px" }}>
                        💡 {(q as QuizQuestion).explanation}
                      </div>
                    )}
                  </div>
                );
              })}

              <a href={`/game/${sessionId}`} style={{ display: "block", textAlign: "center", fontSize: "14px", color: BLUE, fontWeight: 600, textDecoration: "none", padding: "12px" }}>
                Пройти ещё раз
              </a>
            </div>
          )}
        </div>
      </main>
    );
  }

  /* PLAYING */
  if (phase !== "playing" || !question) return <Center><Spinner large /></Center>;

  return (
    <main style={{ minHeight: "100vh", background: SURFACE, display: "flex", flexDirection: "column", alignItems: "center", padding: "36px 24px 64px", fontFamily: "'Golos Text', system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "560px", display: "flex", flexDirection: "column", gap: "18px" }}>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: BLUE, background: BLUE_SOFT, border: `1px solid ${BLUE_MID}`, borderRadius: "100px", padding: "4px 12px" }}>
              {FORMAT_LABELS[session.format]}
            </span>
            <span style={{ fontSize: "12px", color: "#ACACAD", fontWeight: 500 }}>{studentName}</span>
          </div>
          <span style={{ fontSize: "14px", fontWeight: 600, color: MID }}>
            {index + 1} <span style={{ color: BORDER }}>/ {total}</span>
          </span>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{ height: "5px", flex: i === index ? 3 : 1, borderRadius: "100px", background: i <= index ? BLUE : BORDER, opacity: i > index ? 0.35 : 1, transition: "flex 0.4s ease, background 0.3s ease" }} />
          ))}
        </div>

        {/* Card */}
        <div key={animKey} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: "24px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,.05)", display: "flex", flexDirection: "column", gap: "22px", animation: "fade-up 0.3s ease both", minHeight: "260px" }}>
          {question.format === "quiz" && (
            <QuizCard question={question} selected={selected as number | null} onAnswer={i => handleQuizAnswer(i, question)} />
          )}
          {question.format === "truefalse" && (
            <TrueFalseCard question={question} selected={selected as boolean | null} onAnswer={v => handleTrueFalse(v, question)} />
          )}
          {question.format === "flashcard" && (
            <FlashcardCard question={question} revealed={revealed} onReveal={() => setRevealed(true)} onNext={handleFlashcard} />
          )}
        </div>

        {/* Hint + remaining */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "12px", color: "#BBBBCC", fontWeight: 500 }}>
            {question.format === "quiz" && "Клавиши 1–4"}
            {question.format === "truefalse" && "← Правда · Ложь →"}
            {question.format === "flashcard" && (!revealed ? "Пробел — показать" : "← Не знал · Знал →")}
          </span>
          <span style={{ fontSize: "12px", color: "#BBBBCC", fontWeight: 500 }}>
            {remaining > 0 ? `Осталось ${remaining}` : "Последний вопрос"}
          </span>
        </div>

        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: "13px", color: "#ACACAD", fontWeight: 500 }}>Счёт: <strong style={{ color: BLUE }}>{score}</strong></span>
        </div>
      </div>
    </main>
  );
}

/* ── Shared quiz components ── */

function QuizCard({ question, selected, onAnswer }: { question: QuizQuestion; selected: number | null; onAnswer: (i: number) => void }) {
  const revealed = selected !== null;
  return (
    <>
      <p style={{ fontSize: "clamp(16px, 2.5vw, 19px)", fontWeight: 700, lineHeight: 1.45, color: INK }}>{question.question}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
        {question.options.map((opt, i) => {
          const isCorrect = i === question.correct, isSelected = selected === i;
          let borderColor = BORDER, bg = WHITE, color = INK;
          if (revealed) {
            if (isCorrect)       { borderColor = OK_BDR;  bg = OK_BG;  color = OK_TEXT; }
            else if (isSelected) { borderColor = ERR_BDR; bg = ERR_BG; color = ERR_TEXT; }
            else { color = "#ACACAD"; }
          }
          return (
            <button key={i} onClick={() => onAnswer(i)} disabled={revealed}
              style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "12px", border: `1.5px solid ${borderColor}`, padding: "12px 14px", minHeight: "46px", textAlign: "left", fontSize: "14px", fontFamily: "inherit", background: bg, color, cursor: revealed ? "default" : "pointer", transition: "all .15s", width: "100%", fontWeight: isCorrect && revealed ? 600 : 400 }}
              onMouseEnter={e => { if (!revealed)(e.currentTarget as HTMLElement).style.borderColor = BLUE; }}
              onMouseLeave={e => { if (!revealed)(e.currentTarget as HTMLElement).style.borderColor = BORDER; }}
            >
              <span style={{ fontSize: "11px", fontWeight: 700, minWidth: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "7px", flexShrink: 0, background: isCorrect && revealed ? OK_BDR : isSelected && revealed ? ERR_BDR : SURFACE, color: isCorrect && revealed ? OK_TEXT : isSelected && revealed ? ERR_TEXT : MID }}>{i + 1}</span>
              {opt}
            </button>
          );
        })}
      </div>
    </>
  );
}

function TrueFalseCard({ question, selected, onAnswer }: { question: TrueFalseQuestion; selected: boolean | null; onAnswer: (v: boolean) => void }) {
  const sty = (v: boolean): React.CSSProperties => {
    if (selected === null) return { borderColor: BORDER, background: WHITE, color: INK };
    if (v === question.correct) return { borderColor: OK_BDR, background: OK_BG, color: OK_TEXT };
    if (selected === v) return { borderColor: ERR_BDR, background: ERR_BG, color: ERR_TEXT };
    return { borderColor: BORDER, background: WHITE, color: "#ACACAD" };
  };
  return (
    <>
      <p style={{ fontSize: "clamp(16px, 2.5vw, 20px)", fontWeight: 700, lineHeight: 1.45, color: INK }}>{question.question}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        {([true, false] as const).map(v => {
          const s = sty(v);
          return (
            <button key={String(v)} onClick={() => onAnswer(v)} disabled={selected !== null}
              style={{ borderRadius: "14px", border: `1.5px solid ${s.borderColor}`, padding: "24px 12px", minHeight: "74px", fontFamily: "inherit", fontSize: "15px", fontWeight: 700, background: s.background, color: s.color, cursor: selected !== null ? "default" : "pointer", transition: "all .15s" }}
              onMouseEnter={e => { if (selected === null)(e.currentTarget as HTMLElement).style.borderColor = BLUE; }}
              onMouseLeave={e => { if (selected === null)(e.currentTarget as HTMLElement).style.borderColor = BORDER; }}
            >{v ? "✓  Правда" : "✗  Ложь"}</button>
          );
        })}
      </div>
    </>
  );
}

function FlashcardCard({ question, revealed, onReveal, onNext }: { question: FlashcardQuestion; revealed: boolean; onReveal: () => void; onNext: (c: boolean) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <div>
        <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" as const, color: "#ACACAD" }}>Термин</span>
        <p style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 900, letterSpacing: "-0.5px", lineHeight: 1.2, color: INK, marginTop: "6px" }}>{question.front}</p>
      </div>
      {!revealed ? (
        <button onClick={onReveal} style={{ borderRadius: "12px", border: `1.5px solid ${BORDER}`, padding: "14px", minHeight: "48px", fontFamily: "inherit", fontSize: "14px", fontWeight: 600, color: MID, background: SURFACE, cursor: "pointer", transition: "all .15s" }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = BLUE; el.style.background = BLUE_SOFT; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = BORDER; el.style.background = SURFACE; }}
        >Показать определение →</button>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", animation: "fade-up 0.3s ease both" }}>
          <div style={{ borderRadius: "12px", padding: "16px", background: BLUE_SOFT, border: `1px solid ${BLUE_MID}` }}>
            <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" as const, color: BLUE }}>Определение</span>
            <p style={{ marginTop: "6px", fontSize: "14px", lineHeight: 1.7, color: INK }}>{question.back}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <button onClick={() => onNext(false)} style={{ borderRadius: "12px", border: `1.5px solid ${ERR_BDR}`, padding: "14px", minHeight: "52px", fontFamily: "inherit", fontSize: "14px", fontWeight: 700, color: ERR_TEXT, background: ERR_BG, cursor: "pointer", transition: "opacity .15s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.8"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
            >✗  Не знал</button>
            <button onClick={() => onNext(true)} style={{ borderRadius: "12px", border: `1.5px solid ${OK_BDR}`, padding: "14px", minHeight: "52px", fontFamily: "inherit", fontSize: "14px", fontWeight: 700, color: OK_TEXT, background: OK_BG, cursor: "pointer", transition: "opacity .15s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.8"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
            >✓  Знал</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Helpers ── */
function Center({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: SURFACE, fontFamily: "'Golos Text', system-ui, sans-serif" }}>
      {children}
    </main>
  );
}
function Spinner({ large }: { large?: boolean }) {
  const s = large ? 36 : 18;
  return <span style={{ display: "inline-block", width: s, height: s, border: `${large ? 3 : 2.5}px solid #D3DDFE`, borderTopColor: BLUE, borderRadius: "50%", animation: "spin-anim 0.7s linear infinite" }} />;
}

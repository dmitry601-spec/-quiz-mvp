"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import type { Session } from "@/lib/store";
import { IconSearch } from "@/app/icons";
import type {
  Question, QuizQuestion, TrueFalseQuestion, FlashcardQuestion,
  FillBlankQuestion, MatchingQuestion,
} from "@/lib/questions";

/* ── palette ── */
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
const AMBER     = "#F59E0B";

const FORMAT_LABELS: Record<string, string> = {
  quiz: "Квиз", truefalse: "Правда/Ложь", flashcard: "Флеш-карточки",
  fillblank: "Заполни пропуск", matching: "Сопоставление",
};
const DIFF_LABELS: Record<string, string> = {
  easy: "Лёгкий", medium: "Средний", hard: "Сложный",
};

const QUIZ_TIME = 15;

type Phase = "loading" | "error" | "intro" | "playing" | "submitting" | "done";

export default function GamePage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  /* ── shared state ── */
  const [phase, setPhase]           = useState<Phase>("loading");
  const [session, setSession]       = useState<Session | null>(null);
  const [studentName, setStudentName] = useState("");
  const [nameError, setNameError]   = useState("");
  const [score, setScore]           = useState(0);
  const answersRef                  = useRef<(number | boolean)[]>([]);

  /* ── sequential format state ── */
  const [index, setIndex]       = useState(0);
  const [selected, setSelected] = useState<number | boolean | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [animKey, setAnimKey]   = useState(0);

  /* ── quiz timer ── */
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);

  /* ── fill blank ── */
  const [fillInput, setFillInput]       = useState("");
  const [fillSubmitted, setFillSubmitted] = useState(false);

  /* ── matching ── */
  const [rightOrder, setRightOrder]         = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs]     = useState<Set<number>>(new Set());
  const [correctFirst, setCorrectFirst]     = useState<Set<number>>(new Set());
  const [wrongAttempted, setWrongAttempted] = useState<Set<number>>(new Set());
  const [selectedLeft, setSelectedLeft]     = useState<number | null>(null);
  const [wrongFlash, setWrongFlash]         = useState<number | null>(null);

  /* ── load session ── */
  useEffect(() => {
    fetch(`/api/sessions/${sessionId}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setSession(data); setPhase("intro"); })
      .catch(() => setPhase("error"));
  }, [sessionId]);

  /* ── reset on question change ── */
  useEffect(() => {
    setSelected(null);
    setRevealed(false);
    setFillInput("");
    setFillSubmitted(false);
    setAnimKey(k => k + 1);
    setTimeLeft(QUIZ_TIME);
  }, [index]);

  /* ── derived (safe before session loads) ── */
  const questions  = (session?.questions ?? []) as Question[];
  const matchingQ  = session?.format === "matching" ? (questions[0] as MatchingQuestion) : null;
  const total      = matchingQ ? (matchingQ.pairs?.length ?? 0) : questions.length;
  const question   = questions[index] ?? null;
  const remaining  = questions.length - index - 1;

  /* ── helpers used by effects ── */
  const submitRef = useRef<(s: number, t?: number) => void>(() => {});
  const advanceRef = useRef<(correct: boolean) => void>(() => {});

  /* ── keyboard ── */
  useEffect(() => {
    if (phase !== "playing" || !question) return;
    function onKey(e: KeyboardEvent) {
      if (question!.format === "quiz") {
        if (selected !== null) return;
        const q = question as QuizQuestion;
        const i = parseInt(e.key) - 1;
        if (i >= 0 && i < q.options.length) advanceRef.current(i === q.correct);
      } else if (question!.format === "truefalse") {
        if (selected !== null) return;
        const q = question as TrueFalseQuestion;
        if (e.key === "ArrowLeft"  || e.key.toLowerCase() === "t") advanceRef.current(true === q.correct);
        if (e.key === "ArrowRight" || e.key.toLowerCase() === "f") advanceRef.current(false === q.correct);
      } else if (question!.format === "flashcard") {
        if (!revealed && (e.key === " " || e.key === "Enter")) { e.preventDefault(); setRevealed(true); }
        else if (revealed) {
          if (e.key === "ArrowLeft")  advanceRef.current(false);
          if (e.key === "ArrowRight" || e.key === "Enter") advanceRef.current(true);
        }
      } else if (question!.format === "fillblank") {
        if (e.key === "Enter" && !fillSubmitted) setFillSubmitted(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, question, selected, revealed, fillSubmitted]); // eslint-disable-line

  /* ── quiz timer ── */
  useEffect(() => {
    if (phase !== "playing" || session?.format !== "quiz" || selected !== null) return;
    if (timeLeft <= 0) {
      answersRef.current = [...answersRef.current, -1];
      setSelected(-1 as unknown as number);
      const t = setTimeout(() => advanceRef.current(false), 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setTimeLeft(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft, selected, session?.format]); // eslint-disable-line

  /* ── matching initialization ── */
  useEffect(() => {
    if (!session || session.format !== "matching") return;
    const mq = (session.questions?.[0] ?? null) as MatchingQuestion | null;
    if (!mq?.pairs) return;
    const order = mq.pairs.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    setRightOrder(order);
  }, [session]); // eslint-disable-line

  /* ── guard ── */
  if (!session) {
    return (
      <Center>
        {phase === "error" ? (
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: SURFACE, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: "#ACACAD" }}>
              <IconSearch size={26} />
            </div>
            <p style={{ fontSize: "17px", fontWeight: 700, color: INK }}>Игра не найдена</p>
            <p style={{ fontSize: "14px", color: MID }}>Попросите учителя прислать правильную ссылку</p>
          </div>
        ) : (
          <Spinner large />
        )}
      </Center>
    );
  }

  /* ══ game functions ══ */

  async function submitResults(finalScore: number, finalTotal?: number) {
    setPhase("submitting");
    try {
      await fetch(`/api/sessions/${sessionId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          score: finalScore,
          total: finalTotal ?? questions.length,
          answers: answersRef.current,
        }),
      });
    } catch { /* ignore */ }
    setPhase("done");
  }
  submitRef.current = submitResults;

  function finishOrAdvance(isCorrect: boolean) {
    const newScore = isCorrect ? score + 1 : score;
    setScore(newScore);
    if (index + 1 >= total) {
      submitResults(newScore);
    } else {
      setIndex(i => i + 1);
    }
  }
  advanceRef.current = finishOrAdvance;

  /* quiz */
  function handleQuizAnswer(i: number, q: QuizQuestion) {
    if (selected !== null) return;
    setSelected(i);
    answersRef.current = [...answersRef.current, i];
    setTimeout(() => finishOrAdvance(i === q.correct), 800);
  }

  /* truefalse */
  function handleTrueFalse(answer: boolean, q: TrueFalseQuestion) {
    if (selected !== null) return;
    setSelected(answer);
    answersRef.current = [...answersRef.current, answer];
    setTimeout(() => finishOrAdvance(answer === q.correct), 800);
  }

  /* flashcard */
  function handleFlashcard(knew: boolean) {
    answersRef.current = [...answersRef.current, knew];
    finishOrAdvance(knew);
  }

  /* fill blank */
  function handleFillSubmit() {
    if (fillSubmitted) return;
    setFillSubmitted(true);
    const q = question as FillBlankQuestion;
    const correct = fillInput.trim().toLowerCase() === q.answer.trim().toLowerCase();
    answersRef.current = [...answersRef.current, correct];
  }

  function handleFillNext() {
    const q = question as FillBlankQuestion;
    const correct = fillInput.trim().toLowerCase() === q.answer.trim().toLowerCase();
    finishOrAdvance(correct);
  }

  /* matching */
  function handleMatchingLeft(leftOrigIdx: number) {
    if (matchedPairs.has(leftOrigIdx)) return;
    setSelectedLeft(prev => prev === leftOrigIdx ? null : leftOrigIdx);
  }

  function handleMatchingRight(displayIdx: number) {
    if (selectedLeft === null) return;
    const origRight = rightOrder[displayIdx];
    if (selectedLeft === origRight) {
      // correct match
      const newMatched = new Set(matchedPairs);
      newMatched.add(selectedLeft);
      setMatchedPairs(newMatched);
      const isFirstTry = !wrongAttempted.has(selectedLeft);
      if (isFirstTry) {
        setCorrectFirst(prev => { const s = new Set(prev); s.add(selectedLeft!); return s; });
      }
      setSelectedLeft(null);
      if (newMatched.size === total) {
        const finalScore = correctFirst.size + (isFirstTry ? 1 : 0);
        setScore(finalScore);
        submitRef.current(finalScore, total);
      }
    } else {
      // wrong
      setWrongAttempted(prev => { const s = new Set(prev); s.add(selectedLeft!); return s; });
      setWrongFlash(displayIdx);
      setSelectedLeft(null);
      setTimeout(() => setWrongFlash(null), 600);
    }
  }

  function startGame() {
    if (studentName.trim().length < 2) { setNameError("Введите имя (минимум 2 символа)"); return; }
    setPhase("playing");
  }

  /* ══════════════════════ INTRO ══════════════════════ */
  if (phase === "intro") {
    return (
      <main style={{ minHeight: "100vh", background: SURFACE, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", fontFamily: "'Golos Text', system-ui, sans-serif" }}>
        <div style={{ width: "100%", maxWidth: "440px", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ animation: "fade-up 0.4s ease both" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: BLUE_SOFT, border: `1px solid ${BLUE_MID}`, borderRadius: "100px", padding: "4px 12px 4px 4px", fontSize: "12px", fontWeight: 700, color: BLUE, marginBottom: "16px" }}>
              <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: BLUE, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 800, flexShrink: 0 }}>
                {session.teacherName?.[0]?.toUpperCase() ?? "T"}
              </div>
              {session.teacherName}
            </div>
            <h1 style={{ fontSize: "clamp(22px, 5vw, 30px)", fontWeight: 900, color: INK, letterSpacing: "-0.5px", lineHeight: 1.2 }}>{session.topic}</h1>
            <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
              {[FORMAT_LABELS[session.format], DIFF_LABELS[session.difficulty], `${session.count} ${session.format === "matching" ? "пар" : "вопросов"}`].map(tag => (
                <span key={tag} style={{ fontSize: "12px", fontWeight: 600, color: MID, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: "100px", padding: "3px 10px" }}>{tag}</span>
              ))}
            </div>
          </div>

          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", animation: "fade-up 0.4s ease 80ms both" }}>
            <label style={{ fontSize: "12px", fontWeight: 700, color: MID, letterSpacing: "1.5px", textTransform: "uppercase" }}>Ваше имя</label>
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
            >Начать игру →</button>
          </div>

          <p style={{ textAlign: "center", fontSize: "13px", color: "#ACACAD", animation: "fade-up 0.4s ease 140ms both" }}>
            Play<span style={{ color: BLUE }}>Class</span> · результаты получит {session.teacherName}
          </p>
        </div>
      </main>
    );
  }

  /* ══════════════════════ DONE ══════════════════════ */
  if (phase === "submitting" || phase === "done") {
    const pct      = total > 0 ? Math.round((score / total) * 100) : 0;
    const grade    = pct === 100 ? "Идеально! 🎉" : pct >= 80 ? "Отлично! 👏" : pct >= 50 ? "Неплохо 👍" : "Попробуй ещё раз";
    const ringColor = pct >= 80 ? BLUE : pct >= 50 ? AMBER : "#FB2C36";

    return (
      <main style={{ minHeight: "100vh", background: SURFACE, padding: "48px 24px 80px", fontFamily: "'Golos Text', system-ui, sans-serif" }}>
        <div style={{ width: "100%", maxWidth: "560px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Score card */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "18px", animation: "pop-in 0.5s ease both" }}>
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
                <><Spinner /><span style={{ fontSize: "14px", color: MID }}>Отправляем результат…</span></>
              ) : (
                <><span style={{ fontSize: "16px" }}>✅</span><span style={{ fontSize: "14px", color: OK_TEXT, fontWeight: 600 }}>Результат отправлен {session.teacherName}!</span></>
              )}
            </div>
          </div>

          {/* Breakdown */}
          {phase === "done" && session.format !== "matching" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", animation: "fade-up 0.4s ease 200ms both" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: MID, letterSpacing: "1.5px", textTransform: "uppercase", marginTop: "8px", paddingLeft: "4px" }}>Разбор игры</div>
              {questions.map((q, i) => {
                const ua = answersRef.current[i];
                const isCorrect =
                  q.format === "quiz"      ? ua === (q as QuizQuestion).correct :
                  q.format === "truefalse" ? ua === (q as TrueFalseQuestion).correct :
                  q.format === "fillblank" ? ua === true :
                  ua === true;

                return (
                  <div key={i} style={{ background: WHITE, border: `1px solid ${isCorrect ? OK_BDR : ERR_BDR}`, borderRadius: "16px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ flexShrink: 0, width: "22px", height: "22px", borderRadius: "50%", background: isCorrect ? OK_BG : ERR_BG, border: `1.5px solid ${isCorrect ? OK_BDR : ERR_BDR}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: isCorrect ? OK_TEXT : ERR_TEXT, marginTop: "1px" }}>
                        {isCorrect ? "✓" : "✗"}
                      </span>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: INK, lineHeight: 1.5 }}>
                        {q.format === "flashcard" ? (q as FlashcardQuestion).front
                          : q.format === "fillblank" ? (q as FillBlankQuestion).sentence.replace("___", `[${(q as FillBlankQuestion).answer}]`)
                          : (q as QuizQuestion | TrueFalseQuestion).question}
                      </p>
                    </div>

                    {q.format === "quiz" && (() => {
                      const qq = q as QuizQuestion;
                      return (
                        <div style={{ paddingLeft: "32px", display: "flex", flexDirection: "column", gap: "5px" }}>
                          {!isCorrect && ua !== -1 && (
                            <div style={{ fontSize: "13px", padding: "7px 11px", borderRadius: "8px", background: ERR_BG, border: `1px solid ${ERR_BDR}`, color: ERR_TEXT, fontWeight: 600 }}>
                              ✗ Вы: {qq.options[ua as number]}
                            </div>
                          )}
                          {ua === -1 && <div style={{ fontSize: "13px", padding: "7px 11px", borderRadius: "8px", background: "#FFF7ED", border: "1px solid #FCD34D", color: "#92400E", fontWeight: 600 }}>⏰ Время вышло</div>}
                          <div style={{ fontSize: "13px", padding: "7px 11px", borderRadius: "8px", background: OK_BG, border: `1px solid ${OK_BDR}`, color: OK_TEXT, fontWeight: 600 }}>
                            ✓ {qq.options[qq.correct]}
                          </div>
                        </div>
                      );
                    })()}

                    {q.format === "truefalse" && !isCorrect && (
                      <div style={{ paddingLeft: "32px", display: "flex", flexDirection: "column", gap: "5px" }}>
                        <div style={{ fontSize: "13px", padding: "7px 11px", borderRadius: "8px", background: ERR_BG, border: `1px solid ${ERR_BDR}`, color: ERR_TEXT, fontWeight: 600 }}>
                          ✗ Вы: {ua ? "Правда" : "Ложь"} · Верно: {(q as TrueFalseQuestion).correct ? "Правда" : "Ложь"}
                        </div>
                      </div>
                    )}

                    {q.format === "fillblank" && !isCorrect && (
                      <div style={{ paddingLeft: "32px", display: "flex", flexDirection: "column", gap: "5px" }}>
                        <div style={{ fontSize: "13px", padding: "7px 11px", borderRadius: "8px", background: OK_BG, border: `1px solid ${OK_BDR}`, color: OK_TEXT, fontWeight: 600 }}>
                          ✓ Правильный ответ: {(q as FillBlankQuestion).answer}
                        </div>
                      </div>
                    )}

                    {q.format === "flashcard" && (
                      <div style={{ paddingLeft: "32px", fontSize: "13px", color: MID, lineHeight: 1.6, background: SURFACE, borderRadius: "8px", padding: "9px 12px" }}>
                        {(q as FlashcardQuestion).back}
                      </div>
                    )}

                    {(q as QuizQuestion).explanation && (
                      <div style={{ paddingLeft: "32px", fontSize: "13px", color: "#3B5FC0", lineHeight: 1.6, background: BLUE_SOFT, border: `1px solid ${BLUE_MID}`, borderRadius: "8px", padding: "9px 12px" }}>
                        💡 {(q as QuizQuestion).explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {phase === "done" && (
            <a href={`/game/${sessionId}`} style={{ display: "block", textAlign: "center", fontSize: "14px", color: BLUE, fontWeight: 600, textDecoration: "none", padding: "12px" }}>
              Пройти ещё раз
            </a>
          )}
        </div>
      </main>
    );
  }

  /* ══════════════════════ PLAYING ══════════════════════ */

  /* matching is a separate full-screen experience */
  if (phase === "playing" && session.format === "matching") {
    if (!matchingQ || rightOrder.length === 0) return <Center><Spinner large /></Center>;
    const pairs = matchingQ.pairs;

    return (
      <main style={{ minHeight: "100vh", background: SURFACE, display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 20px 64px", fontFamily: "'Golos Text', system-ui, sans-serif" }}>
        <div style={{ width: "100%", maxWidth: "640px", display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: BLUE, background: BLUE_SOFT, border: `1px solid ${BLUE_MID}`, borderRadius: "100px", padding: "4px 12px" }}>Сопоставление</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: MID }}>
              {matchedPairs.size} <span style={{ color: BORDER }}>/</span> {total}
            </span>
          </div>

          {/* Progress */}
          <div style={{ height: "5px", background: BORDER, borderRadius: "100px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(matchedPairs.size / total) * 100}%`, background: BLUE, borderRadius: "100px", transition: "width 0.4s ease" }} />
          </div>

          <p style={{ fontSize: "13px", color: MID, textAlign: "center" }}>
            {selectedLeft !== null ? "Теперь выберите определение справа →" : "Выберите термин слева"}
          </p>

          {/* Two columns */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {/* Left: terms */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {pairs.map((pair, origIdx) => {
                const isMatched  = matchedPairs.has(origIdx);
                const isSelected = selectedLeft === origIdx;
                return (
                  <button key={origIdx} onClick={() => handleMatchingLeft(origIdx)} disabled={isMatched}
                    style={{
                      padding: "14px 16px", borderRadius: "14px", textAlign: "left",
                      fontFamily: "inherit", fontSize: "14px", fontWeight: 600,
                      border: `2px solid ${isMatched ? OK_BDR : isSelected ? BLUE : BORDER}`,
                      background: isMatched ? OK_BG : isSelected ? BLUE_SOFT : WHITE,
                      color: isMatched ? OK_TEXT : isSelected ? BLUE : INK,
                      cursor: isMatched ? "default" : "pointer",
                      transition: "all .15s",
                      opacity: isMatched ? 0.7 : 1,
                    }}
                    onMouseEnter={e => { if (!isMatched && !isSelected) (e.currentTarget as HTMLElement).style.borderColor = BLUE; }}
                    onMouseLeave={e => { if (!isMatched && !isSelected) (e.currentTarget as HTMLElement).style.borderColor = BORDER; }}
                  >
                    {isMatched ? "✓ " : ""}{pair.left}
                  </button>
                );
              })}
            </div>

            {/* Right: shuffled definitions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {rightOrder.map((origIdx, displayIdx) => {
                const isMatched  = matchedPairs.has(origIdx);
                const isWrong    = wrongFlash === displayIdx;
                return (
                  <button key={displayIdx} onClick={() => handleMatchingRight(displayIdx)} disabled={isMatched}
                    style={{
                      padding: "14px 16px", borderRadius: "14px", textAlign: "left",
                      fontFamily: "inherit", fontSize: "13px", fontWeight: 500,
                      border: `2px solid ${isMatched ? OK_BDR : isWrong ? ERR_BDR : selectedLeft !== null ? BLUE_MID : BORDER}`,
                      background: isMatched ? OK_BG : isWrong ? ERR_BG : selectedLeft !== null ? "#F8F9FF" : WHITE,
                      color: isMatched ? OK_TEXT : isWrong ? ERR_TEXT : INK,
                      cursor: isMatched ? "default" : selectedLeft !== null ? "pointer" : "default",
                      transition: "all .15s",
                      opacity: isMatched ? 0.7 : 1,
                      animation: isWrong ? "shake 0.4s ease" : "none",
                    }}
                    onMouseEnter={e => { if (!isMatched && selectedLeft !== null) (e.currentTarget as HTMLElement).style.borderColor = BLUE; }}
                    onMouseLeave={e => { if (!isMatched && !isWrong) (e.currentTarget as HTMLElement).style.borderColor = selectedLeft !== null ? BLUE_MID : BORDER; }}
                  >
                    {isMatched ? "✓ " : ""}{pairs[origIdx].right}
                  </button>
                );
              })}
            </div>
          </div>

          <p style={{ textAlign: "center", fontSize: "12px", color: "#BBBBCC", marginTop: "4px" }}>
            Сначала термин слева, затем его определение справа
          </p>
        </div>
      </main>
    );
  }

  if (phase !== "playing" || !question) return <Center><Spinner large /></Center>;

  /* ── sequential game UI ── */
  const isQuiz      = question.format === "quiz";
  const isFillblank = question.format === "fillblank";
  const timedOut    = isQuiz && selected === (-1 as unknown as number | boolean | null);

  return (
    <main style={{ minHeight: "100vh", background: SURFACE, display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 20px 64px", fontFamily: "'Golos Text', system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "560px", display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: BLUE, background: BLUE_SOFT, border: `1px solid ${BLUE_MID}`, borderRadius: "100px", padding: "4px 12px" }}>
            {FORMAT_LABELS[session.format]}
          </span>
          <span style={{ fontSize: "14px", fontWeight: 600, color: MID }}>
            {index + 1} <span style={{ color: BORDER }}>/ {total}</span>
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ display: "flex", gap: "4px" }}>
          {Array.from({ length: questions.length }).map((_, i) => (
            <div key={i} style={{ height: "5px", flex: i === index ? 3 : 1, borderRadius: "100px", background: i < index ? OK_BDR : i === index ? BLUE : BORDER, transition: "flex 0.4s ease" }} />
          ))}
        </div>

        {/* Quiz timer bar */}
        {isQuiz && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ flex: 1, height: "6px", background: BORDER, borderRadius: "100px", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${(timeLeft / QUIZ_TIME) * 100}%`,
                background: timeLeft <= 5 ? "#FB2C36" : timeLeft <= 10 ? AMBER : BLUE,
                borderRadius: "100px",
                transition: "width 1s linear, background 0.3s ease",
              }} />
            </div>
            <span style={{ fontSize: "13px", fontWeight: 700, color: timeLeft <= 5 ? "#FB2C36" : MID, minWidth: "22px", textAlign: "right" }}>
              {timedOut ? "0" : timeLeft}
            </span>
          </div>
        )}

        {/* Question card */}
        <div key={animKey} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: "24px", padding: "26px", boxShadow: "0 4px 20px rgba(0,0,0,.05)", display: "flex", flexDirection: "column", gap: "20px", animation: "fade-up 0.3s ease both", minHeight: "200px" }}>
          {timedOut && (
            <div style={{ background: "#FFF7ED", border: "1px solid #FCD34D", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", fontWeight: 700, color: "#92400E", textAlign: "center" }}>
              ⏰ Время вышло!
            </div>
          )}

          {question.format === "quiz" && (
            <QuizCard question={question} selected={selected as number | null} onAnswer={i => handleQuizAnswer(i, question)} />
          )}
          {question.format === "truefalse" && (
            <TrueFalseCard question={question} selected={selected as boolean | null} onAnswer={v => handleTrueFalse(v, question)} />
          )}
          {question.format === "flashcard" && (
            <FlashcardCard question={question} revealed={revealed} onReveal={() => setRevealed(true)} onNext={handleFlashcard} />
          )}
          {isFillblank && (
            <FillBlankCard
              question={question}
              input={fillInput}
              submitted={fillSubmitted}
              onChange={setFillInput}
              onSubmit={handleFillSubmit}
              onNext={handleFillNext}
            />
          )}
        </div>

        {/* Footer hint */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "12px", color: "#BBBBCC", fontWeight: 500 }}>
            {question.format === "quiz"      && !timedOut && "Клавиши 1–4"}
            {question.format === "truefalse" && "← Правда · Ложь →"}
            {question.format === "flashcard" && (!revealed ? "Пробел — показать" : "← Не знал · Знал →")}
            {isFillblank                     && (!fillSubmitted ? "Enter — ответить" : "")}
          </span>
          <span style={{ fontSize: "12px", color: "#BBBBCC", fontWeight: 500 }}>
            {remaining > 0 ? `Осталось ${remaining}` : "Последний"}
          </span>
        </div>
      </div>
    </main>
  );
}

/* ═══════════════════ CARD COMPONENTS ═══════════════════ */

function QuizCard({ question, selected, onAnswer }: { question: QuizQuestion; selected: number | null; onAnswer: (i: number) => void }) {
  const revealed = selected !== null;
  return (
    <>
      <p style={{ fontSize: "clamp(16px, 2.5vw, 19px)", fontWeight: 700, lineHeight: 1.5, color: INK }}>{question.question}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
        {question.options.map((opt, i) => {
          const isCorrect = i === question.correct;
          const isSelected = selected === i;
          let borderColor = BORDER, bg = WHITE, color = INK;
          if (revealed) {
            if (isCorrect)       { borderColor = OK_BDR;  bg = OK_BG;  color = OK_TEXT; }
            else if (isSelected) { borderColor = ERR_BDR; bg = ERR_BG; color = ERR_TEXT; }
            else                 { color = "#ACACAD"; }
          }
          return (
            <button key={i} onClick={() => onAnswer(i)} disabled={revealed}
              style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "12px", border: `1.5px solid ${borderColor}`, padding: "12px 14px", textAlign: "left", fontSize: "14px", fontFamily: "inherit", background: bg, color, cursor: revealed ? "default" : "pointer", transition: "all .15s", width: "100%", fontWeight: isCorrect && revealed ? 600 : 400 }}
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
    if (selected === v)         return { borderColor: ERR_BDR, background: ERR_BG, color: ERR_TEXT };
    return { borderColor: BORDER, background: WHITE, color: "#ACACAD" };
  };
  return (
    <>
      <p style={{ fontSize: "clamp(16px, 2.5vw, 20px)", fontWeight: 700, lineHeight: 1.5, color: INK }}>{question.question}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        {([true, false] as const).map(v => {
          const s = sty(v);
          return (
            <button key={String(v)} onClick={() => onAnswer(v)} disabled={selected !== null}
              style={{ borderRadius: "14px", border: `1.5px solid ${s.borderColor}`, padding: "24px 12px", fontFamily: "inherit", fontSize: "15px", fontWeight: 700, background: s.background, color: s.color, cursor: selected !== null ? "default" : "pointer", transition: "all .15s" }}
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
        <p style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 900, letterSpacing: "-0.5px", lineHeight: 1.2, color: INK, marginTop: "6px" }}>{question.front}</p>
      </div>
      {!revealed ? (
        <button onClick={onReveal} style={{ borderRadius: "12px", border: `1.5px solid ${BORDER}`, padding: "14px", fontFamily: "inherit", fontSize: "14px", fontWeight: 600, color: MID, background: SURFACE, cursor: "pointer", transition: "all .15s" }}
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
            <button onClick={() => onNext(false)} style={{ borderRadius: "12px", border: `1.5px solid ${ERR_BDR}`, padding: "14px", fontFamily: "inherit", fontSize: "14px", fontWeight: 700, color: ERR_TEXT, background: ERR_BG, cursor: "pointer", transition: "opacity .15s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.8"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
            >✗  Не знал</button>
            <button onClick={() => onNext(true)} style={{ borderRadius: "12px", border: `1.5px solid ${OK_BDR}`, padding: "14px", fontFamily: "inherit", fontSize: "14px", fontWeight: 700, color: OK_TEXT, background: OK_BG, cursor: "pointer", transition: "opacity .15s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.8"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
            >✓  Знал</button>
          </div>
        </div>
      )}
    </div>
  );
}

function FillBlankCard({ question, input, submitted, onChange, onSubmit, onNext }: {
  question: FillBlankQuestion;
  input: string;
  submitted: boolean;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onNext: () => void;
}) {
  const isCorrect = submitted && input.trim().toLowerCase() === question.answer.trim().toLowerCase();
  const isWrong   = submitted && !isCorrect;

  const parts = question.sentence.split("___");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* Sentence with blank highlighted */}
      <p style={{ fontSize: "clamp(16px, 2.5vw, 19px)", fontWeight: 700, lineHeight: 1.6, color: INK }}>
        {parts[0]}
        <span style={{
          display: "inline-block", minWidth: "80px", padding: "2px 10px",
          borderBottom: `2.5px solid ${submitted ? (isCorrect ? OK_TEXT : ERR_TEXT) : BLUE}`,
          color: submitted ? (isCorrect ? OK_TEXT : ERR_TEXT) : BLUE,
          fontWeight: 800, margin: "0 4px",
        }}>
          {submitted ? (isCorrect ? input : input || "—") : (input || "…")}
        </span>
        {parts[1]}
      </p>

      {/* Hint */}
      {!submitted && question.hint && (
        <div style={{ fontSize: "13px", color: MID, background: SURFACE, borderRadius: "8px", padding: "8px 12px" }}>
          💡 Подсказка: {question.hint}
        </div>
      )}

      {/* Result */}
      {submitted && isWrong && (
        <div style={{ fontSize: "14px", padding: "10px 14px", borderRadius: "10px", background: OK_BG, border: `1px solid ${OK_BDR}`, color: OK_TEXT, fontWeight: 600 }}>
          ✓ Правильный ответ: <strong>{question.answer}</strong>
        </div>
      )}
      {submitted && isCorrect && (
        <div style={{ fontSize: "14px", padding: "10px 14px", borderRadius: "10px", background: OK_BG, border: `1px solid ${OK_BDR}`, color: OK_TEXT, fontWeight: 700 }}>
          ✓ Правильно!
        </div>
      )}
      {submitted && question.explanation && (
        <div style={{ fontSize: "13px", color: "#3B5FC0", lineHeight: 1.6, background: BLUE_SOFT, border: `1px solid ${BLUE_MID}`, borderRadius: "8px", padding: "10px 12px" }}>
          💡 {question.explanation}
        </div>
      )}

      {/* Input or Next button */}
      {!submitted ? (
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            autoFocus
            value={input}
            onChange={e => onChange(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && input.trim()) onSubmit(); }}
            placeholder="Введите ответ…"
            style={{ flex: 1, padding: "13px 16px", fontSize: "15px", fontFamily: "inherit", border: `1.5px solid ${BORDER}`, borderRadius: "14px", color: INK, outline: "none", transition: "border-color .15s, box-shadow .15s" }}
            onFocus={e => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(108,140,252,.15)"; }}
            onBlur={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; }}
          />
          <button onClick={onSubmit} disabled={!input.trim()} style={{ padding: "13px 20px", borderRadius: "14px", background: input.trim() ? BLUE : BORDER, color: WHITE, border: "none", fontSize: "14px", fontWeight: 700, fontFamily: "inherit", cursor: input.trim() ? "pointer" : "not-allowed", transition: "background .15s", flexShrink: 0 }}>
            Ответить
          </button>
        </div>
      ) : (
        <button onClick={onNext} style={{ padding: "14px", borderRadius: "14px", background: BLUE, color: WHITE, border: "none", fontSize: "15px", fontWeight: 700, fontFamily: "inherit", cursor: "pointer", boxShadow: "0 4px 16px rgba(108,140,252,.25)", transition: "opacity .15s" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.88"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
        >
          Следующий →
        </button>
      )}
    </div>
  );
}

/* ── helpers ── */
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

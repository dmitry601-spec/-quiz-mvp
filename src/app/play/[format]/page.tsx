"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  GameFormat,
  Question,
  QuizQuestion,
  TrueFalseQuestion,
  FlashcardQuestion,
  getQuestion,
  getTotal,
  FORMAT_LABELS,
} from "@/lib/questions";

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
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "'Playfair Display', serif", color: "var(--white)" }}>Неизвестный формат</p>
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
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 24px 64px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          pointerEvents: "none",
          position: "fixed",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "260px",
          borderRadius: "50%",
          opacity: 0.06,
          filter: "blur(90px)",
          background: "var(--amber)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "560px",
          display: "flex",
          flexDirection: "column",
          gap: "32px",
        }}
      >
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "var(--amber)",
            }}
          >
            {FORMAT_LABELS[format]}
          </span>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "14px",
              fontWeight: 700,
              color: "rgba(255,255,255,.35)",
              letterSpacing: "-0.3px",
            }}
          >
            {index + 1} <span style={{ color: "rgba(255,255,255,.18)" }}>/</span> {total}
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: "3px",
            width: "100%",
            borderRadius: "2px",
            background: "rgba(255,255,255,.07)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: "2px",
              background: "var(--amber)",
              width: `${progress}%`,
              transition: "width 0.5s ease",
            }}
          />
        </div>

        {/* Question card */}
        <div
          key={animKey}
          style={{
            background: "var(--surface)",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: "16px",
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "28px",
            animation: "fade-up 0.4s ease both",
          }}
        >
          {question.format === "quiz" && (
            <QuizCard
              question={question}
              selected={selected as number | null}
              onAnswer={(i) => handleQuizAnswer(i, question)}
            />
          )}
          {question.format === "truefalse" && (
            <TrueFalseCard
              question={question}
              selected={selected as boolean | null}
              onAnswer={(v) => handleTrueFalse(v, question)}
            />
          )}
          {question.format === "flashcard" && (
            <FlashcardCard
              question={question}
              revealed={revealed}
              onReveal={() => setRevealed(true)}
              onNext={(correct) => advance(correct)}
            />
          )}
        </div>

        {/* Score hint */}
        <div style={{ textAlign: "center" }}>
          <span
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,.22)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Правильных ответов: {score}
          </span>
        </div>
      </div>
    </main>
  );
}

function QuizCard({
  question,
  selected,
  onAnswer,
}: {
  question: QuizQuestion;
  selected: number | null;
  onAnswer: (i: number) => void;
}) {
  return (
    <>
      <p
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(18px, 3vw, 22px)",
          fontWeight: 700,
          lineHeight: 1.35,
          letterSpacing: "-0.4px",
          color: "var(--white)",
        }}
      >
        {question.question}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {question.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = i === question.correct;
          const revealed = selected !== null;

          let borderColor = "rgba(255,255,255,.08)";
          let bg = "transparent";
          let textColor = "rgba(255,255,255,.8)";
          let badgeBg = "rgba(255,255,255,.06)";
          let badgeColor = "rgba(255,255,255,.35)";

          if (revealed) {
            if (isCorrect) {
              borderColor = "var(--amber-border)";
              bg = "var(--amber-glow)";
              textColor = "#E8A84A";
              badgeBg = "var(--amber-border)";
              badgeColor = "var(--amber)";
            } else if (isSelected) {
              borderColor = "rgba(224,82,82,.35)";
              bg = "var(--red-glow)";
              textColor = "#E07070";
              badgeBg = "rgba(224,82,82,.2)";
              badgeColor = "var(--red)";
            } else {
              textColor = "rgba(255,255,255,.28)";
              badgeColor = "rgba(255,255,255,.18)";
            }
          }

          return (
            <button
              key={i}
              onClick={() => onAnswer(i)}
              disabled={selected !== null}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                borderRadius: "10px",
                border: `1px solid ${borderColor}`,
                padding: "13px 16px",
                textAlign: "left",
                fontSize: "14px",
                fontFamily: "'DM Sans', sans-serif",
                background: bg,
                color: textColor,
                cursor: selected !== null ? "default" : "pointer",
                transition: "border-color .18s, background .18s, color .18s",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                if (selected !== null) return;
                (e.currentTarget as HTMLElement).style.borderColor = "var(--amber-border)";
              }}
              onMouseLeave={(e) => {
                if (selected !== null) return;
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.08)";
              }}
            >
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "12px",
                  fontWeight: 700,
                  width: "26px",
                  height: "26px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "6px",
                  background: badgeBg,
                  color: badgeColor,
                  flexShrink: 0,
                  transition: "background .18s, color .18s",
                }}
              >
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

function TrueFalseCard({
  question,
  selected,
  onAnswer,
}: {
  question: TrueFalseQuestion;
  selected: boolean | null;
  onAnswer: (v: boolean) => void;
}) {
  function getStyle(value: boolean): React.CSSProperties {
    if (selected === null) {
      return {
        borderColor: "rgba(255,255,255,.08)",
        background: "transparent",
        color: "rgba(255,255,255,.75)",
      };
    }
    if (value === question.correct) {
      return {
        borderColor: "var(--amber-border)",
        background: "var(--amber-glow)",
        color: "#E8A84A",
      };
    }
    if (selected === value) {
      return {
        borderColor: "rgba(224,82,82,.35)",
        background: "var(--red-glow)",
        color: "#E07070",
      };
    }
    return {
      borderColor: "rgba(255,255,255,.04)",
      background: "transparent",
      color: "rgba(255,255,255,.25)",
    };
  }

  return (
    <>
      <p
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(18px, 3vw, 24px)",
          fontWeight: 700,
          lineHeight: 1.35,
          letterSpacing: "-0.5px",
          color: "var(--white)",
        }}
      >
        {question.question}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {([true, false] as const).map((v) => {
          const s = getStyle(v);
          return (
            <button
              key={String(v)}
              onClick={() => onAnswer(v)}
              disabled={selected !== null}
              style={{
                borderRadius: "12px",
                border: `1px solid ${s.borderColor}`,
                padding: "24px 12px",
                fontFamily: "'Playfair Display', serif",
                fontSize: "17px",
                fontWeight: 700,
                letterSpacing: "-0.3px",
                background: s.background,
                color: s.color,
                cursor: selected !== null ? "default" : "pointer",
                transition: "border-color .18s, background .18s, color .18s",
              }}
              onMouseEnter={(e) => {
                if (selected !== null) return;
                (e.currentTarget as HTMLElement).style.borderColor = "var(--amber-border)";
              }}
              onMouseLeave={(e) => {
                if (selected !== null) return;
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.08)";
              }}
            >
              {v ? "✓ Правда" : "✗ Ложь"}
            </button>
          );
        })}
      </div>
    </>
  );
}

function FlashcardCard({
  question,
  revealed,
  onReveal,
  onNext,
}: {
  question: FlashcardQuestion;
  revealed: boolean;
  onReveal: () => void;
  onNext: (correct: boolean) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Term */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,.3)",
          }}
        >
          Термин
        </span>
        <p
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(24px, 4vw, 32px)",
            fontWeight: 900,
            letterSpacing: "-1px",
            lineHeight: 1.15,
            color: "var(--white)",
          }}
        >
          {question.front}
        </p>
      </div>

      {!revealed ? (
        <button
          onClick={onReveal}
          style={{
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,.08)",
            padding: "18px",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
            fontWeight: 500,
            color: "rgba(255,255,255,.45)",
            background: "transparent",
            cursor: "pointer",
            transition: "border-color .18s, color .18s",
            textAlign: "center",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = "var(--amber-border)";
            el.style.color = "rgba(255,255,255,.8)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = "rgba(255,255,255,.08)";
            el.style.color = "rgba(255,255,255,.45)";
          }}
        >
          Показать определение →
        </button>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "fade-up 0.35s ease both" }}>
          {/* Definition */}
          <div
            style={{
              borderRadius: "10px",
              padding: "20px",
              background: "var(--amber-glow)",
              border: "1px solid var(--amber-border)",
            }}
          >
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "var(--amber)",
              }}
            >
              Определение
            </span>
            <p
              style={{
                marginTop: "10px",
                fontSize: "14px",
                lineHeight: 1.75,
                color: "rgba(255,255,255,.82)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {question.back}
            </p>
          </div>

          {/* Know / Don't know */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <button
              onClick={() => onNext(false)}
              style={{
                borderRadius: "10px",
                border: "1px solid rgba(224,82,82,.3)",
                padding: "14px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                color: "#E07070",
                background: "transparent",
                cursor: "pointer",
                transition: "background .18s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--red-glow)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              ✗ Не знал
            </button>
            <button
              onClick={() => onNext(true)}
              style={{
                borderRadius: "10px",
                border: "1px solid var(--amber-border)",
                padding: "14px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--amber)",
                background: "transparent",
                cursor: "pointer",
                transition: "background .18s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--amber-glow)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              ✓ Знал
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useMemo, useState, useEffect } from "react";
import { FORMAT_LABELS, GameFormat } from "@/lib/questions";

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
  useEffect(() => {
    const t = setTimeout(() => setAnimPct(pct), 120);
    return () => clearTimeout(t);
  }, [pct]);

  const grade =
    pct === 100 ? { label: "Идеально!",  sub: "Все ответы правильные — вы в теме!", ring: "#6C8CFC", ringBg: "#EFF6FF" }
  : pct >= 80   ? { label: "Отлично!",   sub: "Почти идеально — так держать!",      ring: "#6C8CFC", ringBg: "#EFF6FF" }
  : pct >= 50   ? { label: "Неплохо",    sub: "Хороший результат, есть куда расти", ring: "#F59E0B", ringBg: "#FFFBEB" }
  :               { label: "Ещё раз?",   sub: "Попробуйте снова — у вас получится!", ring: "#FB2C36", ringBg: "#FFF0F0" };

  const circumference = 2 * Math.PI * 44;
  const dash = circumference * (animPct / 100);

  return (
    <>
      {pct >= 80 && <Confetti />}
      <main style={{
        minHeight: "100vh", background: "#F5F5F7",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "64px 24px",
        fontFamily: "'Golos Text', system-ui, sans-serif",
      }}>
        <div style={{ width: "100%", maxWidth: "420px", display: "flex", flexDirection: "column", alignItems: "center", gap: "28px" }}>

          {/* Score ring */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", animation: "pop-in 0.55s ease both" }}>
            <div style={{ position: "relative", width: "136px", height: "136px" }}>
              <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="#E1E1E1" strokeWidth="7" />
                <circle cx="50" cy="50" r="44" fill="none" stroke={grade.ring} strokeWidth="7"
                  strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
                  style={{ transition: "stroke-dasharray 1.1s cubic-bezier(.4,0,.2,1)" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "-1.5px", color: grade.ring, lineHeight: 1 }}>{pct}%</span>
              </div>
            </div>

            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "clamp(28px, 5vw, 36px)", fontWeight: 900, color: "#010B13", letterSpacing: "-0.5px" }}>
                {grade.label}
              </span>
              <p style={{ fontSize: "14px", color: "#666666", fontWeight: 500 }}>{grade.sub}</p>
              <p style={{ fontSize: "13px", color: "#ACACAD", fontWeight: 500, marginTop: "2px" }}>
                {score} из {total} · {FORMAT_LABELS[format]}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            width: "100%",
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
            background: "#FFFFFF", border: "1px solid #E1E1E1", borderRadius: "20px",
            overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,.04)",
            animation: "fade-up 0.5s ease 180ms both",
          }}>
            {[
              { label: "Правильно", value: score,        color: "#19AA0F" },
              { label: "Неверно",   value: total - score, color: "#FB2C36" },
              { label: "Результат", value: `${pct}%`,     color: grade.ring },
            ].map(({ label, value, color }, i) => (
              <div key={label} style={{
                padding: "20px 12px", textAlign: "center",
                borderRight: i < 2 ? "1px solid #E1E1E1" : "none",
              }}>
                <span style={{ fontSize: "26px", fontWeight: 900, color, display: "block", lineHeight: 1 }}>{value}</span>
                <span style={{ fontSize: "11px", color: "#ACACAD", fontWeight: 600, display: "block", marginTop: "5px" }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px", animation: "fade-up 0.5s ease 300ms both" }}>
            <Link
              href={`/play/${format}`}
              style={{
                display: "block", width: "100%", textAlign: "center",
                borderRadius: "100px", padding: "17px",
                background: "#6C8CFC", color: "#FFFFFF",
                fontFamily: "'Golos Text', system-ui, sans-serif",
                fontSize: "16px", fontWeight: 700, textDecoration: "none",
                boxShadow: "0 4px 16px rgba(108,140,252,.30)",
                transition: "opacity .18s, transform .18s, box-shadow .18s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.opacity = "0.88"; el.style.transform = "translateY(-2px)";
                el.style.boxShadow = "0 8px 24px rgba(108,140,252,.40)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.opacity = "1"; el.style.transform = "none";
                el.style.boxShadow = "0 4px 16px rgba(108,140,252,.30)";
              }}
            >
              Пройти ещё раз →
            </Link>
            <Link
              href="/start"
              style={{
                display: "block", width: "100%", textAlign: "center",
                borderRadius: "100px", padding: "17px",
                background: "#F5F5F7", color: "#666666", border: "1.5px solid #E1E1E1",
                fontFamily: "'Golos Text', system-ui, sans-serif",
                fontSize: "16px", fontWeight: 600, textDecoration: "none",
                transition: "border-color .18s, color .18s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "#6C8CFC"; el.style.color = "#010B13";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "#E1E1E1"; el.style.color = "#666666";
              }}
            >
              Выбрать другой формат
            </Link>
          </div>

          <p style={{ fontSize: "14px", color: "#ACACAD", fontWeight: 700 }}>
            Play<span style={{ color: "#6C8CFC" }}>Class</span>
          </p>
        </div>
      </main>
    </>
  );
}

export default function ResultsPage() {
  return (
    <Suspense>
      <ResultsContent />
    </Suspense>
  );
}

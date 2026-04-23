"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { FORMAT_LABELS, GameFormat } from "@/lib/questions";

function ResultsContent() {
  const params = useSearchParams();
  const score  = Number(params.get("score") ?? 0);
  const total  = Number(params.get("total") ?? 5);
  const format = (params.get("format") ?? "quiz") as GameFormat;
  const pct    = Math.round((score / total) * 100);

  const grade =
    pct >= 80 ? { label: "Отлично!",  ring: "#6C8CFC", ringBg: "#EFF6FF" }
  : pct >= 50 ? { label: "Неплохо",   ring: "#F59E0B", ringBg: "#FFFBEB" }
  :             { label: "Ещё раз?",  ring: "#FB2C36", ringBg: "#FFF0F0" };

  const circumference = 2 * Math.PI * 44;
  const dash = circumference * (pct / 100);

  return (
    <main style={{
      minHeight: "100vh", background: "#F5F5F7",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "64px 24px",
      fontFamily: "'Golos Text', system-ui, sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: "420px", display: "flex", flexDirection: "column", alignItems: "center", gap: "32px" }}>

        {/* Score ring */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", animation: "fade-up 0.5s ease both" }}>
          <div style={{ position: "relative", width: "128px", height: "128px" }}>
            <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="#E1E1E1" strokeWidth="6" />
              <circle cx="50" cy="50" r="44" fill="none" stroke={grade.ring} strokeWidth="6"
                strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
                style={{ transition: "stroke-dasharray 1s ease" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "26px", fontWeight: 900, letterSpacing: "-1px", color: grade.ring, lineHeight: 1 }}>{pct}%</span>
            </div>
          </div>

          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "clamp(28px, 5vw, 36px)", fontWeight: 900, color: "#010B13", letterSpacing: "-0.5px" }}>
              {grade.label}
            </span>
            <p style={{ fontSize: "14px", color: "#666666", fontWeight: 500 }}>
              {score} из {total} правильных · {FORMAT_LABELS[format]}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          width: "100%",
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          background: "#FFFFFF", border: "1px solid #E1E1E1", borderRadius: "20px",
          overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,.04)",
          animation: "fade-up 0.5s ease 120ms both",
        }}>
          {[
            { label: "Правильно", value: score,         color: "#19AA0F" },
            { label: "Неверно",   value: total - score,  color: "#FB2C36" },
            { label: "Результат", value: `${pct}%`,      color: grade.ring },
          ].map(({ label, value, color }, i) => (
            <div key={label} style={{
              padding: "20px 12px", textAlign: "center",
              borderRight: i < 2 ? "1px solid #E1E1E1" : "none",
            }}>
              <span style={{ fontSize: "26px", fontWeight: 900, color, display: "block", lineHeight: 1 }}>{value}</span>
              <span style={{ fontSize: "11px", color: "#ACACAD", fontWeight: 600, display: "block", marginTop: "4px" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px", animation: "fade-up 0.5s ease 230ms both" }}>
          <Link
            href={`/play/${format}`}
            style={{
              display: "block", width: "100%", textAlign: "center",
              borderRadius: "100px", padding: "16px",
              background: "#6C8CFC", color: "#FFFFFF",
              fontFamily: "'Golos Text', system-ui, sans-serif",
              fontSize: "16px", fontWeight: 700, textDecoration: "none",
              transition: "opacity .18s, transform .18s, box-shadow .18s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.opacity = "0.85"; el.style.transform = "translateY(-1px)";
              el.style.boxShadow = "0 6px 20px rgba(108,140,252,.35)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.opacity = "1"; el.style.transform = "none"; el.style.boxShadow = "none";
            }}
          >
            Пройти ещё раз →
          </Link>
          <Link
            href="/start"
            style={{
              display: "block", width: "100%", textAlign: "center",
              borderRadius: "100px", padding: "16px",
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
  );
}

export default function ResultsPage() {
  return (
    <Suspense>
      <ResultsContent />
    </Suspense>
  );
}

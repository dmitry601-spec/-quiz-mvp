"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { FORMAT_LABELS, GameFormat } from "@/lib/questions";

function ResultsContent() {
  const params = useSearchParams();
  const score = Number(params.get("score") ?? 0);
  const total = Number(params.get("total") ?? 5);
  const format = (params.get("format") ?? "quiz") as GameFormat;
  const pct = Math.round((score / total) * 100);

  const grade =
    pct >= 80
      ? { label: "Отлично!", note: "Блестящий результат", glowColor: "rgba(196,123,42,.12)" }
      : pct >= 50
      ? { label: "Неплохо", note: "Есть куда расти", glowColor: "rgba(196,123,42,.08)" }
      : { label: "Ещё раз?", note: "Попробуйте снова", glowColor: "rgba(224,82,82,.1)" };

  const circumference = 2 * Math.PI * 44;
  const dash = circumference * (pct / 100);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 24px",
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
          height: "300px",
          borderRadius: "50%",
          opacity: 0.08,
          filter: "blur(100px)",
          background: "var(--amber)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "420px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "40px",
        }}
      >
        {/* Score display */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            animation: "fade-up 0.55s ease both",
          }}
        >
          {/* Ring */}
          <div style={{ position: "relative", width: "120px", height: "120px" }}>
            <svg className="w-full h-full" style={{ transform: "rotate(-90deg)" }} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="5" />
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="var(--amber)"
                strokeWidth="5"
                strokeDasharray={`${dash} ${circumference}`}
                strokeLinecap="round"
                style={{ transition: "stroke-dasharray 1s ease" }}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "26px",
                  fontWeight: 900,
                  letterSpacing: "-1px",
                  color: "var(--amber)",
                  lineHeight: 1,
                }}
              >
                {pct}%
              </span>
            </div>
          </div>

          {/* Grade */}
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "6px" }}>
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(28px, 5vw, 36px)",
                fontWeight: 900,
                letterSpacing: "-1px",
                color: "var(--white)",
              }}
            >
              <em style={{ fontStyle: "italic", color: "var(--amber)" }}>{grade.label}</em>
            </span>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,.38)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {score} из {total} правильных · {FORMAT_LABELS[format]}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            background: "rgba(255,255,255,.05)",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: "14px",
            overflow: "hidden",
            animation: "fade-up 0.55s ease 120ms both",
          }}
        >
          {[
            { label: "Правильно", value: score, color: "var(--amber)" },
            { label: "Неверно", value: total - score, color: "#E07070" },
            { label: "Результат", value: `${pct}%`, color: "rgba(255,255,255,.6)" },
          ].map(({ label, value, color }, i) => (
            <div
              key={label}
              style={{
                padding: "20px 12px",
                textAlign: "center",
                background: "var(--surface)",
                borderRight: i < 2 ? "1px solid rgba(255,255,255,.06)" : "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "24px",
                  fontWeight: 900,
                  letterSpacing: "-0.5px",
                  color,
                  lineHeight: 1,
                }}
              >
                {value}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,.3)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            animation: "fade-up 0.55s ease 230ms both",
          }}
        >
          {/* Primary CTA */}
          <Link
            href={`/play/${format}`}
            style={{
              display: "block",
              width: "100%",
              textAlign: "center",
              borderRadius: "10px",
              padding: "16px",
              background: "var(--amber)",
              color: "var(--white)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "15px",
              fontWeight: 500,
              textDecoration: "none",
              transition: "background .18s, transform .18s, box-shadow .18s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "var(--amber-dim)";
              el.style.transform = "translateY(-1px)";
              el.style.boxShadow = "0 6px 20px rgba(196,123,42,.28)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "var(--amber)";
              el.style.transform = "none";
              el.style.boxShadow = "none";
            }}
          >
            Пройти ещё раз →
          </Link>

          {/* Secondary CTA */}
          <Link
            href="/start"
            style={{
              display: "block",
              width: "100%",
              textAlign: "center",
              borderRadius: "10px",
              padding: "16px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,.1)",
              color: "rgba(255,255,255,.55)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "15px",
              fontWeight: 500,
              textDecoration: "none",
              transition: "border-color .18s, color .18s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "rgba(255,255,255,.25)";
              el.style.color = "rgba(255,255,255,.85)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "rgba(255,255,255,.1)";
              el.style.color = "rgba(255,255,255,.55)";
            }}
          >
            Выбрать другой формат
          </Link>
        </div>

        {/* Brand footer */}
        <p
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "14px",
            color: "rgba(255,255,255,.18)",
            letterSpacing: "-0.2px",
          }}
        >
          Play<em style={{ fontStyle: "italic", color: "rgba(196,123,42,.5)" }}>Class</em>
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

"use client";

import Link from "next/link";
import { GameFormat, FORMAT_LABELS, FORMAT_DESCRIPTIONS } from "@/lib/questions";

const formats: GameFormat[] = ["quiz", "truefalse", "flashcard"];
const FORMAT_NUMS = ["01", "02", "03"];
const FORMAT_ICONS: Record<GameFormat, string> = {
  quiz: "🧠",
  truefalse: "⚡",
  flashcard: "📖",
};

export default function StartPage() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "#F5F5F7",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "64px 24px",
      fontFamily: "'Golos Text', system-ui, sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column", gap: "40px" }}>

        {/* Brand */}
        <div style={{ animation: "fade-up 0.5s ease both", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "#EFF6FF", border: "1px solid #D3DDFE",
            borderRadius: "100px", padding: "6px 16px", width: "fit-content",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6C8CFC", display: "inline-block", flexShrink: 0 }} />
            <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: ".3px", color: "#2B7FFF" }}>
              AI-конструктор игр для репетиторов
            </span>
          </div>

          <div style={{ fontSize: "clamp(36px, 7vw, 52px)", fontWeight: 900, letterSpacing: "-1.5px", lineHeight: 1.08, color: "#010B13" }}>
            Play<span style={{ color: "#6C8CFC" }}>Class</span>
          </div>

          <p style={{ fontSize: "clamp(16px, 2.5vw, 19px)", fontWeight: 700, lineHeight: 1.3, color: "#010B13" }}>
            Ученики не скучают.<br />
            <span style={{ color: "#666666", fontWeight: 500 }}>Вы не готовитесь часами.</span>
          </p>

          <p style={{ fontSize: "15px", color: "#666666", lineHeight: 1.65 }}>
            Выберите формат — AI сгенерирует игру по вашей теме. Ученик откроет по ссылке, без регистрации.
          </p>
        </div>

        {/* Format cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" as const, color: "#6C8CFC", marginBottom: "6px" }}>
            Выберите формат игры
          </div>
          {formats.map((format, i) => (
            <FormatCard key={format} format={format} icon={FORMAT_ICONS[format]} delay={i * 90 + 150} />
          ))}
        </div>

        {/* Stats */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          background: "#FFFFFF", border: "1px solid #E1E1E1",
          borderRadius: "20px", overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,.04)",
          animation: "fade-up 0.5s ease 480ms both",
        }}>
          {[
            { n: "5", l: "минут от темы до игры" },
            { n: "0", l: "регистраций ученику" },
            { n: "∞", l: "тем — AI справится" },
          ].map(({ n, l }, i) => (
            <div key={l} style={{
              padding: "20px 12px", textAlign: "center",
              borderRight: i < 2 ? "1px solid #E1E1E1" : "none",
            }}>
              <div style={{ fontSize: "32px", fontWeight: 900, letterSpacing: "-1px", lineHeight: 1, color: "#6C8CFC" }}>{n}</div>
              <div style={{ fontSize: "11px", color: "#ACACAD", marginTop: "5px", lineHeight: 1.4, fontWeight: 500 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function FormatCard({ format, icon, delay }: {
  format: GameFormat; icon: string; delay: number;
}) {
  return (
    <Link
      href={`/play/${format}`}
      style={{
        display: "flex", alignItems: "center", gap: "16px",
        background: "#FFFFFF", border: "1.5px solid #E1E1E1",
        borderRadius: "20px", padding: "20px 22px",
        textDecoration: "none",
        transition: "border-color .18s, box-shadow .18s, transform .18s",
        animation: `fade-up 0.5s ease ${delay}ms both`,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "#6C8CFC";
        el.style.boxShadow = "0 4px 20px rgba(108,140,252,.15)";
        el.style.transform = "translateY(-1px)";
        const arr = el.querySelector(".arr") as HTMLElement | null;
        if (arr) arr.style.transform = "translateX(4px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "#E1E1E1";
        el.style.boxShadow = "none";
        el.style.transform = "none";
        const arr = el.querySelector(".arr") as HTMLElement | null;
        if (arr) arr.style.transform = "translateX(0)";
      }}
    >
      <div style={{
        fontSize: "22px", width: "48px", height: "48px",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "#EFF6FF", border: "1px solid #D3DDFE",
        borderRadius: "14px", flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "3px", flex: 1 }}>
        <span style={{ fontSize: "16px", fontWeight: 700, color: "#010B13" }}>
          {FORMAT_LABELS[format]}
        </span>
        <span style={{ fontSize: "13px", color: "#666666", lineHeight: 1.5 }}>
          {FORMAT_DESCRIPTIONS[format]}
        </span>
      </div>
      <span className="arr" style={{ color: "#6C8CFC", fontSize: "18px", fontWeight: 700, transition: "transform .18s", flexShrink: 0 }}>
        →
      </span>
    </Link>
  );
}

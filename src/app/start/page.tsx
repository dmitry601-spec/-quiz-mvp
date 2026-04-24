"use client";

import Link from "next/link";
import { GameFormat, FORMAT_LABELS, FORMAT_DESCRIPTIONS } from "@/lib/questions";

const formats: GameFormat[] = ["quiz", "truefalse", "flashcard"];

const FORMAT_ICONS: Record<GameFormat, string> = {
  quiz: "🧠",
  truefalse: "⚡",
  flashcard: "📖",
};

const FORMAT_TIME: Record<GameFormat, string> = {
  quiz: "~2 мин",
  truefalse: "~1 мин",
  flashcard: "~3 мин",
};

const FORMAT_BADGE: Record<GameFormat, string | null> = {
  quiz: "Популярное",
  truefalse: null,
  flashcard: null,
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
      <div style={{ width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column", gap: "32px" }}>

        {/* Back + Brand */}
        <div style={{ animation: "fade-up 0.5s ease both", display: "flex", flexDirection: "column", gap: "20px" }}>
          <a href="/" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            fontSize: "13px", fontWeight: 600, color: "#ACACAD",
            textDecoration: "none", transition: "color .15s",
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#010B13"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#ACACAD"}
          >
            ← На главную
          </a>

          <div>
            <div style={{ fontSize: "clamp(28px, 6vw, 40px)", fontWeight: 900, letterSpacing: "-1.2px", lineHeight: 1.1, color: "#010B13" }}>
              Play<span style={{ color: "#6C8CFC" }}>Class</span>
            </div>
            <p style={{ fontSize: "17px", fontWeight: 700, color: "#010B13", marginTop: "10px", lineHeight: 1.35 }}>
              Выберите формат игры
            </p>
            <p style={{ fontSize: "14px", color: "#666666", marginTop: "6px", lineHeight: 1.6 }}>
              AI сгенерирует игру по вашей теме. Ученик откроет по ссылке, без регистрации.
            </p>
          </div>
        </div>

        {/* Format cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" as const, color: "#6C8CFC", marginBottom: "4px" }}>
            Доступные форматы
          </div>
          {formats.map((format, i) => (
            <FormatCard
              key={format}
              format={format}
              icon={FORMAT_ICONS[format]}
              time={FORMAT_TIME[format]}
              badge={FORMAT_BADGE[format]}
              delay={i * 90 + 150}
            />
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

function FormatCard({ format, icon, time, badge, delay }: {
  format: GameFormat; icon: string; time: string; badge: string | null; delay: number;
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

      <div style={{ display: "flex", flexDirection: "column", gap: "3px", flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#010B13" }}>
            {FORMAT_LABELS[format]}
          </span>
          {badge && (
            <span style={{
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px",
              background: "#EFF6FF", color: "#6C8CFC",
              border: "1px solid #D3DDFE",
              borderRadius: "100px", padding: "2px 8px",
              textTransform: "uppercase" as const, flexShrink: 0,
            }}>
              {badge}
            </span>
          )}
        </div>
        <span style={{ fontSize: "13px", color: "#666666", lineHeight: 1.5 }}>
          {FORMAT_DESCRIPTIONS[format]}
        </span>
        <span style={{ fontSize: "12px", color: "#ACACAD", fontWeight: 500, marginTop: "2px" }}>
          {time} · 5 вопросов
        </span>
      </div>

      <span className="arr" style={{ color: "#6C8CFC", fontSize: "18px", fontWeight: 700, transition: "transform .18s", flexShrink: 0 }}>
        →
      </span>
    </Link>
  );
}

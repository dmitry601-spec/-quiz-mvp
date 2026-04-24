"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GameFormat, FORMAT_LABELS, FORMAT_DESCRIPTIONS } from "@/lib/questions";

const FORMAT_ICONS: Record<GameFormat, string> = { quiz: "🧠", truefalse: "⚡", flashcard: "📖" };
const FORMAT_TIME: Record<GameFormat, string>  = { quiz: "~2 мин", truefalse: "~1 мин", flashcard: "~3 мин" };
const FORMAT_BADGE: Record<GameFormat, string | null> = { quiz: "Популярное", truefalse: null, flashcard: null };

const formats: GameFormat[] = ["quiz", "truefalse", "flashcard"];
const COUNTS = [5, 10, 15] as const;
const DIFFICULTIES = [
  { key: "easy",   label: "Лёгкий",  color: "#19AA0F", bg: "#F0FDF4", border: "#86EFAC" },
  { key: "medium", label: "Средний", color: "#F59E0B", bg: "#FFFBEB", border: "#FCD34D" },
  { key: "hard",   label: "Сложный", color: "#FB2C36", bg: "#FFF0F0", border: "#FCA5A5" },
] as const;

export default function StartPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [loading, setLoading] = useState<GameFormat | null>(null);
  const [error, setError] = useState("");

  async function generate(format: GameFormat) {
    const t = topic.trim();
    if (!t) { setError("Введите тему, чтобы продолжить"); return; }
    setError("");
    setLoading(format);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t, format, count, difficulty }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Ошибка генерации");
      }
      const { questions } = await res.json();
      sessionStorage.setItem("playclass_questions", JSON.stringify(questions));
      sessionStorage.setItem("playclass_topic", t);
      sessionStorage.setItem("playclass_difficulty", difficulty);
      router.push(`/play/${format}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Что-то пошло не так");
      setLoading(null);
    }
  }

  return (
    <main style={{
      minHeight: "100vh", background: "#F5F5F7",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "64px 24px",
      fontFamily: "'Golos Text', system-ui, sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Back + Brand */}
        <div style={{ animation: "fade-up 0.5s ease both", display: "flex", flexDirection: "column", gap: "16px" }}>
          <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "#ACACAD", textDecoration: "none", transition: "color .15s" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#010B13"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#ACACAD"}
          >← На главную</a>
          <div>
            <div style={{ fontSize: "clamp(26px, 6vw, 38px)", fontWeight: 900, letterSpacing: "-1.2px", lineHeight: 1.1, color: "#010B13" }}>
              Play<span style={{ color: "#6C8CFC" }}>Class</span>
            </div>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#010B13", marginTop: "8px" }}>
              Введите тему — AI сгенерирует игру
            </p>
          </div>
        </div>

        {/* Topic input */}
        <div style={{ animation: "fade-up 0.5s ease 80ms both", display: "flex", flexDirection: "column", gap: "8px" }}>
          <label htmlFor="topic-input" style={{ fontSize: "12px", fontWeight: 700, color: "#555566", letterSpacing: "1.5px", textTransform: "uppercase" }}>
            Тема урока
          </label>
          <input
            id="topic-input" type="text" value={topic}
            onChange={e => { setTopic(e.target.value); if (error) setError(""); }}
            onKeyDown={e => { if (e.key === "Enter" && !loading) generate("quiz"); }}
            placeholder="Например: Фотосинтез, Теорема Пифагора, ВОВ…"
            disabled={!!loading}
            style={{
              width: "100%", padding: "14px 16px", fontSize: "15px", fontFamily: "inherit",
              border: error ? "1.5px solid #FB2C36" : "1.5px solid #E1E1E1",
              borderRadius: "14px", background: "#FFFFFF", color: "#010B13", outline: "none",
              transition: "border-color .15s, box-shadow .15s", boxSizing: "border-box",
            }}
            onFocus={e => { e.currentTarget.style.borderColor = "#6C8CFC"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(108,140,252,.15)"; }}
            onBlur={e => { e.currentTarget.style.borderColor = error ? "#FB2C36" : "#E1E1E1"; e.currentTarget.style.boxShadow = "none"; }}
          />
          {error && <p style={{ fontSize: "13px", color: "#FB2C36", fontWeight: 500 }}>{error}</p>}
        </div>

        {/* Count + Difficulty row */}
        <div style={{ animation: "fade-up 0.5s ease 140ms both", display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {/* Count */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#555566", letterSpacing: "1.5px", textTransform: "uppercase" }}>
              Вопросов
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              {COUNTS.map(n => (
                <button key={n} onClick={() => setCount(n)} disabled={!!loading}
                  style={{
                    flex: 1, padding: "9px 0", borderRadius: "10px", border: "1.5px solid",
                    borderColor: count === n ? "#6C8CFC" : "#E1E1E1",
                    background: count === n ? "#EFF6FF" : "#FFFFFF",
                    color: count === n ? "#6C8CFC" : "#555566",
                    fontSize: "14px", fontWeight: 700, fontFamily: "inherit",
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "all .15s",
                  }}
                >{n}</button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 2 }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#555566", letterSpacing: "1.5px", textTransform: "uppercase" }}>
              Сложность
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              {DIFFICULTIES.map(d => (
                <button key={d.key} onClick={() => setDifficulty(d.key)} disabled={!!loading}
                  style={{
                    flex: 1, padding: "9px 4px", borderRadius: "10px", border: "1.5px solid",
                    borderColor: difficulty === d.key ? d.border : "#E1E1E1",
                    background: difficulty === d.key ? d.bg : "#FFFFFF",
                    color: difficulty === d.key ? d.color : "#555566",
                    fontSize: "13px", fontWeight: 700, fontFamily: "inherit",
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "all .15s",
                  }}
                >{d.label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Format cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", animation: "fade-up 0.5s ease 200ms both" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#6C8CFC", marginBottom: "2px" }}>
            Выберите формат
          </div>
          {formats.map((format, i) => (
            <FormatCard
              key={format} format={format} icon={FORMAT_ICONS[format]}
              time={FORMAT_TIME[format]} badge={FORMAT_BADGE[format]}
              delay={i * 80 + 240} loading={loading === format}
              disabled={!!loading} count={count}
              onClick={() => generate(format)}
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
            { n: "60с", l: "от темы до игры" },
            { n: "0", l: "регистраций ученику" },
            { n: "∞", l: "тем — AI справится" },
          ].map(({ n, l }, i) => (
            <div key={l} style={{ padding: "18px 12px", textAlign: "center", borderRight: i < 2 ? "1px solid #E1E1E1" : "none" }}>
              <div style={{ fontSize: "26px", fontWeight: 900, letterSpacing: "-1px", lineHeight: 1, color: "#6C8CFC" }}>{n}</div>
              <div style={{ fontSize: "11px", color: "#ACACAD", marginTop: "5px", lineHeight: 1.4, fontWeight: 500 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function FormatCard({ format, icon, time, badge, delay, loading, disabled, count, onClick }: {
  format: GameFormat; icon: string; time: string; badge: string | null;
  delay: number; loading: boolean; disabled: boolean; count: number; onClick: () => void;
}) {
  const mins = format === "quiz" ? Math.round(count * 0.4) : format === "truefalse" ? Math.round(count * 0.2) : Math.round(count * 0.6);
  const timeLabel = `~${Math.max(1, mins)} мин · ${count} вопросов`;

  return (
    <button onClick={onClick} disabled={disabled} aria-busy={loading}
      style={{
        display: "flex", alignItems: "center", gap: "16px",
        background: "#FFFFFF", border: loading ? "1.5px solid #6C8CFC" : "1.5px solid #E1E1E1",
        borderRadius: "20px", padding: "18px 20px", textAlign: "left",
        cursor: disabled ? (loading ? "wait" : "not-allowed") : "pointer",
        transition: "border-color .18s, box-shadow .18s, transform .18s",
        animation: `fade-up 0.5s ease ${delay}ms both`,
        opacity: disabled && !loading ? 0.5 : 1,
        width: "100%", fontFamily: "inherit",
      }}
      onMouseEnter={e => {
        if (disabled) return;
        const el = e.currentTarget;
        el.style.borderColor = "#6C8CFC";
        el.style.boxShadow = "0 4px 20px rgba(108,140,252,.15)";
        el.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        if (disabled) return;
        const el = e.currentTarget;
        el.style.borderColor = "#E1E1E1";
        el.style.boxShadow = "none";
        el.style.transform = "none";
      }}
    >
      <div style={{
        fontSize: "22px", width: "46px", height: "46px",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: loading ? "#EFF6FF" : "#F5F5F7",
        border: `1px solid ${loading ? "#D3DDFE" : "#E1E1E1"}`,
        borderRadius: "12px", flexShrink: 0,
      }}>
        {loading ? <Spinner /> : icon}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "3px", flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "15px", fontWeight: 700, color: "#010B13" }}>
            {loading ? "Генерирую…" : FORMAT_LABELS[format]}
          </span>
          {badge && !loading && (
            <span style={{ fontSize: "10px", fontWeight: 700, background: "#EFF6FF", color: "#6C8CFC", border: "1px solid #D3DDFE", borderRadius: "100px", padding: "2px 8px", textTransform: "uppercase", flexShrink: 0 }}>
              {badge}
            </span>
          )}
        </div>
        <span style={{ fontSize: "13px", color: "#666666", lineHeight: 1.5 }}>
          {loading ? "AI создаёт вопросы по вашей теме…" : FORMAT_DESCRIPTIONS[format]}
        </span>
        {!loading && (
          <span style={{ fontSize: "12px", color: "#ACACAD", fontWeight: 500, marginTop: "1px" }}>{timeLabel}</span>
        )}
      </div>
      {!loading && <span style={{ color: "#6C8CFC", fontSize: "18px", fontWeight: 700, flexShrink: 0 }}>→</span>}
    </button>
  );
}

function Spinner() {
  return (
    <span style={{ display: "inline-block", width: "20px", height: "20px", border: "2.5px solid #D3DDFE", borderTopColor: "#6C8CFC", borderRadius: "50%", animation: "spin-anim 0.7s linear infinite" }} />
  );
}

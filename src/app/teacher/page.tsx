"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { IconQuiz, IconTrueFalse, IconFlashcard, IconFillBlank, IconMatching } from "@/app/icons";

const COUNTS = [5, 10, 15] as const;
const DIFFICULTIES = [
  { key: "easy",   label: "Лёгкий",  color: "#15803D", bg: "#F0FDF4", border: "#86EFAC" },
  { key: "medium", label: "Средний", color: "#B45309", bg: "#FFFBEB", border: "#FCD34D" },
  { key: "hard",   label: "Сложный", color: "#DC2626", bg: "#FFF0F0", border: "#FCA5A5" },
] as const;
type FormatEntry = { key: string; Icon: (p: { size?: number }) => React.ReactElement; label: string; desc: string };
const FORMATS: FormatEntry[] = [
  { key: "quiz",      Icon: IconQuiz,       label: "Квиз",             desc: "4 варианта + таймер на каждый вопрос" },
  { key: "truefalse", Icon: IconTrueFalse,  label: "Правда или ложь",  desc: "Быстрые бинарные суждения" },
  { key: "flashcard", Icon: IconFlashcard,  label: "Флеш-карточки",    desc: "Термин → показать определение" },
  { key: "fillblank", Icon: IconFillBlank,  label: "Заполни пропуск",  desc: "Вставь пропущенное слово" },
  { key: "matching",  Icon: IconMatching,   label: "Сопоставление",    desc: "Соедини термин с определением" },
];

export default function TeacherPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [format, setFormat] = useState("quiz");
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function create() {
    if (!topic.trim()) { setError("Введите тему урока"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), format, count, difficulty, teacherName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");
      router.push(`/teacher/${data.sessionId}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка создания");
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#F5F5F7", display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px 80px", fontFamily: "'Golos Text', system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "520px", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Header */}
        <div style={{ animation: "fade-up 0.4s ease both" }}>
          <a href="/" style={{ fontSize: "13px", fontWeight: 600, color: "#ACACAD", textDecoration: "none", transition: "color .15s" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#010B13"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#ACACAD"}
          >← На главную</a>
          <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "44px", height: "44px", background: "#EFF6FF", border: "1px solid #D3DDFE", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>👩‍🏫</div>
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#010B13", letterSpacing: "-0.5px", lineHeight: 1 }}>Кабинет учителя</h1>
              <p style={{ fontSize: "14px", color: "#666666", marginTop: "4px" }}>Создайте игру — получите ссылку для учеников</p>
            </div>
          </div>
        </div>

        {/* Teacher name */}
        <Field label="Ваше имя (необязательно)" style={{ animation: "fade-up 0.4s ease 60ms both" }}>
          <input value={teacherName} onChange={e => setTeacherName(e.target.value)}
            placeholder="Например: Анна Петровна"
            disabled={loading}
            style={inputStyle()}
            onFocus={e => { e.currentTarget.style.borderColor = "#6C8CFC"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(108,140,252,.15)"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "#E1E1E1"; e.currentTarget.style.boxShadow = "none"; }}
          />
        </Field>

        {/* Topic */}
        <Field label="Тема урока *" style={{ animation: "fade-up 0.4s ease 100ms both" }}>
          <input value={topic} onChange={e => { setTopic(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && !loading && create()}
            placeholder="Например: Фотосинтез, Теорема Пифагора, ВОВ 1941–1945…"
            disabled={loading}
            style={inputStyle(!!error)}
            onFocus={e => { e.currentTarget.style.borderColor = error ? "#FB2C36" : "#6C8CFC"; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(${error ? "251,44,54" : "108,140,252"},.15)`; }}
            onBlur={e => { e.currentTarget.style.borderColor = error ? "#FB2C36" : "#E1E1E1"; e.currentTarget.style.boxShadow = "none"; }}
          />
          {error && <p style={{ fontSize: "13px", color: "#FB2C36", fontWeight: 500, marginTop: "4px" }}>{error}</p>}
        </Field>

        {/* Format */}
        <Field label="Формат игры" style={{ animation: "fade-up 0.4s ease 140ms both" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {FORMATS.map(f => (
              <button key={f.key} onClick={() => setFormat(f.key)} disabled={loading}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "14px 16px", borderRadius: "14px", border: "1.5px solid",
                  borderColor: format === f.key ? "#6C8CFC" : "#E1E1E1",
                  background: format === f.key ? "#EFF6FF" : "#FFFFFF",
                  cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                  transition: "all .15s",
                }}
              >
                <span style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: format === f.key ? "#6C8CFC" : "#888899" }}><f.Icon size={20} /></span>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: format === f.key ? "#6C8CFC" : "#010B13" }}>{f.label}</div>
                  <div style={{ fontSize: "12px", color: "#888899", marginTop: "2px" }}>{f.desc}</div>
                </div>
                {format === f.key && <span style={{ marginLeft: "auto", color: "#6C8CFC", fontSize: "16px", fontWeight: 700 }}>✓</span>}
              </button>
            ))}
          </div>
        </Field>

        {/* Count + Difficulty */}
        <div style={{ display: "flex", gap: "16px", animation: "fade-up 0.4s ease 180ms both" }}>
          <Field label="Вопросов" style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: "6px" }}>
              {COUNTS.map(n => (
                <button key={n} onClick={() => setCount(n)} disabled={loading}
                  style={{ flex: 1, padding: "10px 0", borderRadius: "10px", border: "1.5px solid", borderColor: count === n ? "#6C8CFC" : "#E1E1E1", background: count === n ? "#EFF6FF" : "#FFFFFF", color: count === n ? "#6C8CFC" : "#555566", fontSize: "14px", fontWeight: 700, fontFamily: "inherit", cursor: "pointer", transition: "all .15s" }}
                >{n}</button>
              ))}
            </div>
          </Field>
          <Field label="Сложность" style={{ flex: 2 }}>
            <div style={{ display: "flex", gap: "6px" }}>
              {DIFFICULTIES.map(d => (
                <button key={d.key} onClick={() => setDifficulty(d.key)} disabled={loading}
                  style={{ flex: 1, padding: "10px 4px", borderRadius: "10px", border: "1.5px solid", borderColor: difficulty === d.key ? d.border : "#E1E1E1", background: difficulty === d.key ? d.bg : "#FFFFFF", color: difficulty === d.key ? d.color : "#555566", fontSize: "12px", fontWeight: 700, fontFamily: "inherit", cursor: "pointer", transition: "all .15s" }}
                >{d.label}</button>
              ))}
            </div>
          </Field>
        </div>

        {/* Create button */}
        <div style={{ animation: "fade-up 0.4s ease 220ms both" }}>
          <button onClick={create} disabled={loading}
            style={{
              width: "100%", padding: "18px", borderRadius: "100px",
              background: loading ? "#A5B4FC" : "#6C8CFC",
              color: "#FFFFFF", border: "none",
              fontSize: "16px", fontWeight: 700, fontFamily: "inherit",
              cursor: loading ? "wait" : "pointer",
              transition: "opacity .18s, transform .18s, box-shadow .18s",
              boxShadow: "0 4px 16px rgba(108,140,252,.35)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            }}
            onMouseEnter={e => { if (!loading) { const el = e.currentTarget; el.style.opacity = "0.9"; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 8px 24px rgba(108,140,252,.45)"; } }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.opacity = "1"; el.style.transform = "none"; el.style.boxShadow = "0 4px 16px rgba(108,140,252,.35)"; }}
          >
            {loading ? (
              <><Spinner /> AI генерирует вопросы…</>
            ) : (
              "Создать урок и получить ссылку →"
            )}
          </button>
        </div>

        {/* Info strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", background: "#FFFFFF", border: "1px solid #E1E1E1", borderRadius: "16px", overflow: "hidden", animation: "fade-up 0.4s ease 260ms both" }}>
          {[
            { icon: "🔗", text: "Ссылка для учеников" },
            { icon: "📊", text: "Live-результаты" },
            { icon: "📝", text: "Разбор ошибок" },
          ].map(({ icon, text }, i) => (
            <div key={text} style={{ padding: "14px 10px", textAlign: "center", borderRight: i < 2 ? "1px solid #E1E1E1" : "none" }}>
              <div style={{ fontSize: "20px" }}>{icon}</div>
              <div style={{ fontSize: "11px", color: "#888899", marginTop: "4px", fontWeight: 600, lineHeight: 1.3 }}>{text}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", ...style }}>
      <span style={{ fontSize: "12px", fontWeight: 700, color: "#555566", letterSpacing: "1.5px", textTransform: "uppercase" }}>{label}</span>
      {children}
    </div>
  );
}

function inputStyle(hasError = false): React.CSSProperties {
  return {
    width: "100%", padding: "13px 16px", fontSize: "15px", fontFamily: "inherit",
    border: `1.5px solid ${hasError ? "#FB2C36" : "#E1E1E1"}`,
    borderRadius: "14px", background: "#FFFFFF", color: "#010B13", outline: "none",
    transition: "border-color .15s, box-shadow .15s", boxSizing: "border-box",
  };
}

function Spinner() {
  return <span style={{ display: "inline-block", width: "18px", height: "18px", border: "2.5px solid rgba(255,255,255,.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin-anim 0.7s linear infinite" }} />;
}

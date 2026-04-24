"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import type { Session, StudentResult } from "@/lib/store";
import { IconLink, IconHourglass } from "@/app/icons";

const BLUE     = "#6C8CFC";
const INK      = "#010B13";
const BORDER   = "#E1E1E1";
const SURFACE  = "#F5F5F7";
const OK_TEXT  = "#15803D";
const OK_BG    = "#F0FDF4";
const OK_BDR   = "#86EFAC";
const MID      = "#555566";

const FORMAT_LABELS: Record<string, string> = {
  quiz: "Квиз", truefalse: "Правда или ложь", flashcard: "Флеш-карточки",
};
const DIFF_LABELS: Record<string, string> = {
  easy: "Лёгкий", medium: "Средний", hard: "Сложный",
};

export default function TeacherDashboard() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [copied, setCopied] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [gameUrl, setGameUrl] = useState("");

  useEffect(() => {
    setGameUrl(`${window.location.origin}/game/${sessionId}`);
  }, [sessionId]);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/results`);
      if (!res.ok) return;
      const data = await res.json();
      setSession(data.session);
      setResults(data.results);
      setLastUpdate(new Date());
    } catch { /* ignore */ }
  }, [sessionId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [fetchData]);

  function copyLink() {
    navigator.clipboard.writeText(gameUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!session) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: SURFACE, fontFamily: "'Golos Text', system-ui, sans-serif" }}>
        <div style={{ width: 36, height: 36, border: "3px solid #D3DDFE", borderTopColor: BLUE, borderRadius: "50%", animation: "spin-anim 0.7s linear infinite" }} />
      </main>
    );
  }

  const avgScore = results.length > 0
    ? Math.round(results.reduce((s, r) => s + Math.round((r.score / r.total) * 100), 0) / results.length)
    : null;

  return (
    <main style={{ minHeight: "100vh", background: SURFACE, fontFamily: "'Golos Text', system-ui, sans-serif", padding: "40px 24px 80px" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", animation: "fade-up 0.4s ease both" }}>
          <div>
            <a href="/teacher" style={{ fontSize: "13px", fontWeight: 600, color: "#ACACAD", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = INK}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#ACACAD"}
            >← Создать новый урок</a>
            <h1 style={{ fontSize: "clamp(20px, 4vw, 26px)", fontWeight: 900, color: INK, marginTop: "8px", letterSpacing: "-0.5px", lineHeight: 1.2 }}>
              {session.topic}
            </h1>
            <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
              {[FORMAT_LABELS[session.format], DIFF_LABELS[session.difficulty], `${session.count} вопросов`].map(tag => (
                <span key={tag} style={{ fontSize: "12px", fontWeight: 600, color: MID, background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: "100px", padding: "3px 10px" }}>{tag}</span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#19AA0F", animation: "none" }} />
            <span style={{ fontSize: "12px", color: "#19AA0F", fontWeight: 600 }}>Live</span>
            {lastUpdate && (
              <span style={{ fontSize: "11px", color: "#ACACAD" }}>· обновлено {lastUpdate.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
            )}
          </div>
        </div>

        {/* Share link card */}
        <div style={{ background: "#FFFFFF", border: `1.5px solid ${BLUE}`, borderRadius: "20px", padding: "20px 24px", animation: "fade-up 0.4s ease 80ms both" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: BLUE, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
            <IconLink size={14} /> Ссылка для учеников
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ flex: 1, padding: "12px 16px", background: "#F5F5F7", borderRadius: "12px", fontSize: "14px", color: MID, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {gameUrl}
            </div>
            <button onClick={copyLink} style={{
              flexShrink: 0, padding: "12px 20px", borderRadius: "12px",
              background: copied ? OK_BG : BLUE,
              color: copied ? OK_TEXT : "#FFFFFF",
              border: copied ? `1.5px solid ${OK_BDR}` : "none",
              fontSize: "14px", fontWeight: 700, fontFamily: "inherit",
              cursor: "pointer", transition: "all .2s", whiteSpace: "nowrap",
            }}>
              {copied ? "✓ Скопировано" : "Копировать"}
            </button>
          </div>
          <p style={{ fontSize: "13px", color: "#888899", marginTop: "10px" }}>
            Отправьте эту ссылку ученикам — они откроют без регистрации
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", animation: "fade-up 0.4s ease 140ms both" }}>
          {[
            { value: results.length, label: "Учеников завершили", color: BLUE },
            { value: avgScore !== null ? `${avgScore}%` : "—", label: "Средний результат", color: avgScore !== null ? (avgScore >= 70 ? "#15803D" : avgScore >= 50 ? "#B45309" : "#DC2626") : MID },
            { value: session.count, label: "Вопросов в игре", color: MID },
          ].map(({ value, label, color }) => (
            <div key={label} style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: "16px", padding: "18px 16px", textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: 900, color, letterSpacing: "-1px", lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: "11px", color: "#ACACAD", fontWeight: 600, marginTop: "6px", lineHeight: 1.3 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Results table */}
        <div style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: "20px", overflow: "hidden", animation: "fade-up 0.4s ease 180ms both" }}>
          <div style={{ padding: "18px 24px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "15px", fontWeight: 700, color: INK }}>Результаты учеников</span>
            <span style={{ fontSize: "12px", color: "#ACACAD" }}>Обновляется каждые 4 сек</span>
          </div>

          {results.length === 0 ? (
            <div style={{ padding: "60px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#F5F5F7", border: "1px solid #E1E1E1", display: "flex", alignItems: "center", justifyContent: "center", color: "#ACACAD" }}>
                <IconHourglass size={26} />
              </div>
              <p style={{ fontSize: "15px", fontWeight: 700, color: INK }}>Ждём учеников</p>
              <p style={{ fontSize: "13px", color: "#888899", maxWidth: "280px", lineHeight: 1.6 }}>Как только ученик завершит игру, его результат появится здесь автоматически</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: SURFACE }}>
                    {["#", "Ученик", "Правильно", "Результат", "Время"].map(h => (
                      <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: MID, letterSpacing: "1px", textTransform: "uppercase", borderBottom: `1px solid ${BORDER}`, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => {
                    const pct = Math.round((r.score / r.total) * 100);
                    const ringColor = pct >= 70 ? "#15803D" : pct >= 50 ? "#B45309" : "#DC2626";
                    return (
                      <tr key={r.id} style={{ borderBottom: i < results.length - 1 ? `1px solid ${BORDER}` : "none", transition: "background .15s" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = SURFACE}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                      >
                        <td style={{ padding: "14px 20px", fontSize: "13px", color: "#ACACAD", fontWeight: 600 }}>{i + 1}</td>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: BLUE, flexShrink: 0 }}>
                              {r.studentName[0]?.toUpperCase()}
                            </div>
                            <span style={{ fontSize: "14px", fontWeight: 600, color: INK }}>{r.studentName}</span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "14px", color: MID, fontWeight: 500 }}>
                          {r.score} / {r.total}
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: "80px", height: "6px", background: BORDER, borderRadius: "100px", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${pct}%`, background: ringColor, borderRadius: "100px", transition: "width 0.5s ease" }} />
                            </div>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: ringColor, minWidth: "36px" }}>{pct}%</span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "13px", color: "#888899" }}>
                          {new Date(r.completedAt).toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Session code */}
        <div style={{ textAlign: "center", animation: "fade-up 0.4s ease 220ms both" }}>
          <p style={{ fontSize: "13px", color: "#ACACAD" }}>
            Код сессии: <code style={{ fontFamily: "monospace", fontWeight: 700, color: MID, background: "#FFFFFF", padding: "2px 8px", borderRadius: "6px", border: `1px solid ${BORDER}` }}>{sessionId}</code>
          </p>
        </div>
      </div>
    </main>
  );
}

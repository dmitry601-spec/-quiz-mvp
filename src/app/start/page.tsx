"use client";

import Link from "next/link";
import { GameFormat, FORMAT_LABELS, FORMAT_DESCRIPTIONS } from "@/lib/questions";

const formats: GameFormat[] = ["quiz", "truefalse", "flashcard"];

const FORMAT_NUMS = ["01", "02", "03"];

export default function StartPage() {
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
      {/* Ambient amber glow */}
      <div
        style={{
          pointerEvents: "none",
          position: "fixed",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "700px",
          height: "350px",
          borderRadius: "50%",
          opacity: 0.07,
          filter: "blur(100px)",
          background: "var(--amber)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "520px",
          display: "flex",
          flexDirection: "column",
          gap: "48px",
        }}
      >
        {/* Brand + headline */}
        <div style={{ animation: "fade-up 0.6s ease 0.05s both", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Tag pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              border: "1px solid rgba(255,255,255,.14)",
              borderRadius: "100px",
              padding: "5px 14px",
              width: "fit-content",
            }}
          >
            <span
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: "var(--amber)",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.4px",
                color: "rgba(255,255,255,.45)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              AI-конструктор игр для репетиторов
            </span>
          </div>

          {/* Logo */}
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(42px, 7vw, 62px)",
              fontWeight: 900,
              lineHeight: 1.02,
              letterSpacing: "-2px",
              color: "var(--white)",
            }}
          >
            Play<em style={{ fontStyle: "italic", color: "var(--amber)" }}>Class</em>
          </div>

          {/* Sub-headline */}
          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(18px, 3vw, 24px)",
              fontWeight: 700,
              lineHeight: 1.25,
              letterSpacing: "-0.5px",
              color: "var(--white)",
            }}
          >
            Ученики не скучают.{" "}
            <em style={{ fontStyle: "italic", color: "rgba(255,255,255,.45)" }}>
              Вы не готовитесь
            </em>{" "}
            часами.
          </p>

          <p
            style={{
              fontSize: "15px",
              color: "rgba(255,255,255,.42)",
              lineHeight: 1.75,
              maxWidth: "420px",
            }}
          >
            Опишите тему — AI сгенерирует игру. Ученик откроет по ссылке, без регистрации, за 60 секунд.
          </p>
        </div>

        {/* Format cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "var(--amber)",
              marginBottom: "8px",
            }}
          >
            Выберите формат игры
          </div>

          {formats.map((format, i) => (
            <FormatCard key={format} format={format} num={FORMAT_NUMS[i]} delay={i * 90 + 200} />
          ))}
        </div>

        {/* Stats strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            background: "rgba(255,255,255,.06)",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: "14px",
            overflow: "hidden",
            animation: "fade-up 0.55s ease 560ms both",
          }}
        >
          {[
            { n: "5", l: "минут от темы до игры" },
            { n: "0", l: "регистраций ученику" },
            { n: "∞", l: "тем — AI справится" },
          ].map(({ n, l }, i) => (
            <div
              key={l}
              style={{
                padding: "20px 12px",
                textAlign: "center",
                background: "var(--surface)",
                borderRight: i < 2 ? "1px solid rgba(255,255,255,.06)" : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "36px",
                  fontWeight: 900,
                  letterSpacing: "-2px",
                  lineHeight: 1,
                  color: "var(--amber)",
                  fontStyle: "italic",
                }}
              >
                {n}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,.35)",
                  marginTop: "6px",
                  lineHeight: 1.4,
                }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function FormatCard({
  format,
  num,
  delay,
}: {
  format: GameFormat;
  num: string;
  delay: number;
}) {
  return (
    <Link
      href={`/play/${format}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "20px",
        background: "var(--surface)",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "14px",
        padding: "20px 24px",
        textDecoration: "none",
        transition: "border-color .2s, background .2s, box-shadow .2s",
        animation: `fade-up 0.5s ease ${delay}ms both`,
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "var(--amber-border)";
        el.style.boxShadow = "0 4px 20px rgba(196,123,42,.08)";
        el.style.background = "#1f1a14";
        const arr = el.querySelector(".arrow") as HTMLElement | null;
        if (arr) arr.style.transform = "translateX(4px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(255,255,255,.08)";
        el.style.boxShadow = "none";
        el.style.background = "var(--surface)";
        const arr = el.querySelector(".arrow") as HTMLElement | null;
        if (arr) arr.style.transform = "translateX(0)";
      }}
    >
      {/* Number badge */}
      <div
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "18px",
          fontWeight: 900,
          letterSpacing: "-0.5px",
          color: "var(--amber)",
          width: "44px",
          height: "44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--amber-glow)",
          border: "1px solid var(--amber-border)",
          borderRadius: "10px",
          flexShrink: 0,
        }}
      >
        {num}
      </div>

      {/* Labels */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "17px",
            fontWeight: 700,
            color: "var(--white)",
            letterSpacing: "-0.3px",
          }}
        >
          {FORMAT_LABELS[format]}
        </span>
        <span
          style={{
            fontSize: "13px",
            color: "rgba(255,255,255,.38)",
            lineHeight: 1.5,
          }}
        >
          {FORMAT_DESCRIPTIONS[format]}
        </span>
      </div>

      {/* Arrow */}
      <span
        className="arrow"
        style={{
          color: "var(--amber)",
          fontSize: "18px",
          transition: "transform .2s",
          flexShrink: 0,
        }}
      >
        →
      </span>
    </Link>
  );
}

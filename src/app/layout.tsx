import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlayClass — AI создаёт игры для уроков",
  description: "Опишите тему — AI сгенерирует квиз или игру. Ученик откроет по ссылке, без регистрации, за 60 секунд.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        {/* §14: preconnect для ускорения загрузки шрифтов */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlayClass — AI создаёт игры для уроков",
  description: "Опишите тему — AI сгенерирует квиз или игру. Ученик откроет по ссылке, без регистрации, за 60 секунд.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}

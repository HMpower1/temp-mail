import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Temp Mail — Twoja tymczasowa skrzynka",
  description: "Jednorazowy adres e-mail. Odbieraj wiadomości przez godzinę, bez rejestracji.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className="antialiased">{children}</body>
    </html>
  );
}

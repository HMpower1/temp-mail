import type { Metadata } from "next";
import {headers} from 'next/headers';
import {verificationClient} from '@/lib/ads.mjs';
import "./globals.css";

const metadata: Metadata = {
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

export async function generateMetadata():Promise<Metadata>{
 const client=verificationClient((await headers()).get('host')||'',process.env);
 return {...metadata,other:{...metadata.other,...(client?{'google-adsense-account':client}:{})}};
}

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

import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  DM_Mono,
  Instrument_Sans,
} from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"], // Removed "300"
  variable: "--font-instrument",
});

export const metadata: Metadata = {
  title: "Terminus — Digital Inheritance Protocol",
  description:
    "A decentralised digital inheritance protocol. Where immutable cryptography meets human empathy.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${cormorant.variable} ${dmMono.variable} ${instrument.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
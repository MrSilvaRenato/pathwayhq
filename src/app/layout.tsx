import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PathwayHQ — Athlete development for Australian sport",
  description: "The athlete development platform built on the AIS FTEM framework. Track every athlete's pathway from grassroots to elite. Built for Australian clubs, timed to Brisbane 2032.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${geist.className} min-h-full`}>{children}</body>
    </html>
  );
}

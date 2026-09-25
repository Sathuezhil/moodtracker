import type { Metadata } from "next";
import { Fraunces, Nunito } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { MoodProvider } from "@/context/MoodContext";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Moodly — Daily Mood Tracker",
  description: "A calm place to check in with how you feel.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <MoodProvider>
          <AppShell>{children}</AppShell>
        </MoodProvider>
      </body>
    </html>
  );
}

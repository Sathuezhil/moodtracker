"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Home,
  ImageIcon,
  BookOpen,
  Settings,
  Puzzle,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { PinLock } from "@/components/PinLock";
import { useMoods } from "@/context/MoodContext";
import { cn } from "@/lib/cn";
import { formatLong, todayKey } from "@/lib/dates";
import { PALETTES } from "@/lib/profile";

const LINKS = [
  { href: "/", label: "Dashboard", short: "Home", icon: Home },
  { href: "/calendar", label: "Calendar", short: "Calendar", icon: CalendarDays },
  { href: "/journal", label: "Journal", short: "Journal", icon: BookOpen },
  { href: "/memories", label: "Memories", short: "Memories", icon: ImageIcon },
  { href: "/insights", label: "Insights", short: "Insights", icon: Sparkles },
  { href: "/puzzle", label: "Daily Puzzle", short: "Puzzle", icon: Puzzle },
  { href: "/profile", label: "Profile", short: "Profile", icon: UserRound },
  { href: "/settings", label: "Settings", short: "Settings", icon: Settings },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/journal") return pathname.startsWith("/journal") || pathname.startsWith("/history");
  return pathname.startsWith(href);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { error, clearError, ready, locked, profile } = useMoods();
  const [dateLabel, setDateLabel] = useState("");

  useEffect(() => {
    // Date labels depend on the browser timezone, so they are set after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDateLabel(formatLong(todayKey()));
  }, []);

  if (!ready) {
    return <p className="p-8 text-sm text-[#7c7168]">Opening your journal…</p>;
  }

  if (locked) return <PinLock />;

  return (
    <div className="min-h-full md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-[#3a332e]/8 bg-[#fffaf6]/80 p-5 md:flex">
        <Link href="/profile" className="flex items-center gap-3">
          <Avatar profile={profile} size="sm" />
          <span>
            <span className="block font-serif text-2xl leading-none">Moodly</span>
            <span className="mt-1 block text-sm text-[#7c7168]">
              <span aria-hidden="true">{PALETTES.find((item) => item.id === profile.theme)?.emoji} </span>
              How are you feeling today?
            </span>
          </span>
        </Link>
        <nav aria-label="Primary" className="mt-8 space-y-1">
          {LINKS.map((link) => {
            const Icon = link.icon;
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition hover:bg-[#f6eee8]",
                  active && "bg-[#3a332e] text-white hover:bg-[#3a332e]",
                )}
              >
                <Icon aria-hidden="true" className="size-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        {dateLabel ? (
          <p className="mt-auto text-sm font-semibold text-[#5c534c]">
            <time dateTime={todayKey()}>{dateLabel}</time>
          </p>
        ) : null}
      </aside>

      <div className="min-w-0">
        <header className="flex items-center justify-between border-b border-[#3a332e]/6 bg-[#fbf6f0]/80 px-4 py-3 backdrop-blur md:hidden">
          <Link href="/profile" className="flex items-center gap-2 font-serif text-2xl">
            <Avatar profile={profile} size="sm" />
            Moodly
          </Link>
          {dateLabel ? <time dateTime={todayKey()} className="text-sm font-semibold">{dateLabel}</time> : null}
        </header>
        {error ? (
          <p role="alert" className="mx-4 mt-4 flex justify-between gap-4 rounded-2xl bg-[#fbe8e4] px-4 py-3 text-sm text-[#7a3b32] sm:mx-6">
            {error}
            <button type="button" onClick={clearError} className="font-semibold underline">Dismiss</button>
          </p>
        ) : null}
        <main id="main" className="mx-auto max-w-5xl px-4 py-8 pb-40 sm:px-6 md:pb-12">
          {children}
        </main>
      </div>

      <nav aria-label="Mobile" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-[#3a332e]/8 bg-[#fffaf6]/95 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur md:hidden">
        {LINKS.map((link) => {
          const Icon = link.icon;
          const active = isActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn("flex flex-col items-center gap-0.5 py-1 text-[10px] font-semibold", active ? "text-[#8a4454]" : "text-[#7c7168]")}
            >
              <Icon aria-hidden="true" className="size-4" />
              {link.short}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

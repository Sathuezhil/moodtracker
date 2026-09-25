"use client";

import { currentStreak, longestStreak } from "@/lib/stats";
import type { MoodEntry } from "@/lib/types";

const BADGES = [
  { id: "first", icon: "🌱", name: "First Check-in", test: (entries: MoodEntry[]) => entries.length >= 1 },
  { id: "seven", icon: "💛", name: "7 Day Journey", test: (entries: MoodEntry[]) => longestStreak(entries) >= 7 },
  { id: "thirty", icon: "🌈", name: "30 Day Journey", test: (entries: MoodEntry[]) => longestStreak(entries) >= 30 },
  { id: "journal", icon: "📖", name: "Journal Lover", test: (entries: MoodEntry[]) => entries.filter((entry) => entry.note.trim() || entry.journal.smile || entry.journal.grateful).length >= 5 },
  { id: "memory", icon: "📸", name: "Memory Keeper", test: (entries: MoodEntry[]) => entries.some((entry) => entry.photoId) },
  { id: "streak", icon: "🔥", name: "Streak Master", test: (entries: MoodEntry[]) => currentStreak(entries) >= 7 },
];

export function StreakPanel({ entries }: { entries: MoodEntry[] }) {
  const streak = currentStreak(entries);
  const label =
    streak >= 30 ? "🏆 30 Day Streak" : streak >= 7 ? "🔥 7 Day Streak" : streak >= 3 ? "🔥 3 Day Streak" : streak > 0 ? `🔥 ${streak} Day Streak` : null;

  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-[0_16px_40px_rgba(90,62,54,0.05)]">
      <h2 className="font-serif text-2xl text-[#3a332e]">Your streak</h2>
      {label ? (
        <p className="animate-pop mt-3 font-serif text-3xl text-[#3a332e]">{label}</p>
      ) : (
        <div className="mt-4 text-center">
          <p className="text-3xl" aria-hidden="true">🌱</p>
          <p className="mt-2 font-serif text-xl text-[#3a332e]">Start your first check-in today.</p>
        </div>
      )}
      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {BADGES.map((badge) => {
          const unlocked = badge.test(entries);
          return (
            <li
              key={badge.id}
              className={`rounded-2xl px-3 py-3 text-center ${unlocked ? "bg-[#fbf6e4]" : "bg-[#f6eee8] opacity-60"}`}
            >
              <p className="text-2xl" aria-hidden="true">{badge.icon}</p>
              <p className="mt-1 text-sm font-semibold text-[#3a332e]">{badge.name}</p>
              <p className="text-xs text-[#7c7168]">{unlocked ? "Unlocked" : "Locked"}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

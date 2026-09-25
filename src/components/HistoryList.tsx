"use client";

import Link from "next/link";
import { useState } from "react";
import { DeleteEntryButton } from "@/components/DeleteEntryButton";
import { useMoods } from "@/context/MoodContext";
import { cn } from "@/lib/cn";
import { formatMonthDay } from "@/lib/dates";
import { MOODS, getMood, type MoodId } from "@/lib/types";

export function HistoryList() {
  const { entries } = useMoods();
  const [filter, setFilter] = useState<MoodId | "all">("all");
  const visible =
    filter === "all" ? entries : entries.filter((entry) => entry.mood === filter);

  if (entries.length === 0) {
    return (
      <section className="rounded-[2rem] bg-white/75 px-6 py-12 text-center">
        <p className="text-4xl" aria-hidden="true">📖</p>
        <h2 className="mt-3 font-serif text-3xl text-[#3a332e]">Your story starts here.</h2>
        <p className="mt-2 text-[#5c534c]">A check-in becomes the first page.</p>
      </section>
    );
  }

  return (
    <div>
      <div
        role="toolbar"
        aria-label="Filter by mood"
        className="flex gap-2 overflow-x-auto pb-2"
      >
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          All
        </FilterChip>
        {MOODS.map((mood) => (
          <FilterChip
            key={mood.id}
            active={filter === mood.id}
            onClick={() => setFilter(mood.id)}
          >
            <span aria-hidden="true">{mood.emoji} </span>
            {mood.name}
          </FilterChip>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-8 rounded-[1.5rem] bg-white/70 px-5 py-8 text-center text-[#5c534c]">
          No entries for this mood yet.
        </p>
      ) : (
        <ol className="relative mt-6 space-y-4 border-l border-[#ead3d6] pl-5">
          {visible.map((entry) => {
            const mood = getMood(entry.mood);
            return (
              <li key={entry.id} className="animate-rise">
                <span
                  className="absolute -left-[7px] mt-7 size-3 rounded-full"
                  style={{ background: mood.bar }}
                  aria-hidden="true"
                />
                <article className="rounded-[1.5rem] border border-white/80 bg-white/80 p-5 shadow-[0_12px_30px_rgba(90,62,54,0.05)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-serif text-2xl text-[#3a332e]">
                        <span aria-hidden="true">{mood.emoji} </span>
                        {mood.name}
                      </h2>
                      <p className="text-sm font-semibold text-[#7c7168]">
                        <time dateTime={entry.date}>{formatMonthDay(entry.date)}</time>
                      </p>
                    </div>
                    <DeleteEntryButton entry={entry} label="Delete" />
                  </div>
                  <p className="mt-3 text-[#3a332e]">
                    {entry.note
                      ? `“${entry.note}”`
                      : "A feeling was saved, without a note."}
                  </p>
                  <Link
                    href={`/calendar?date=${entry.date}`}
                    className="mt-3 inline-flex text-sm font-semibold text-[#8a4454] underline-offset-2 hover:underline"
                  >
                    Open in calendar
                  </Link>
                </article>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
        active
          ? "bg-[#3a332e] text-white"
          : "bg-white/80 text-[#5c534c] ring-1 ring-[#3a332e]/10 hover:bg-white",
      )}
    >
      {children}
    </button>
  );
}

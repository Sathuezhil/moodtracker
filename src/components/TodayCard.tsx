"use client";

import { Pencil } from "lucide-react";
import { DeleteEntryButton } from "@/components/DeleteEntryButton";
import { formatLong } from "@/lib/dates";
import { getMood, type MoodEntry } from "@/lib/types";

export function TodayCard({
  entry,
  onEdit,
}: {
  entry: MoodEntry;
  onEdit: () => void;
}) {
  const mood = getMood(entry.mood);

  return (
    <article
      className="animate-rise rounded-[2rem] border border-white/80 p-6 shadow-[0_18px_50px_rgba(90,62,54,0.06)] sm:p-8"
      style={{ background: `linear-gradient(160deg, #fffaf6 0%, ${mood.bg} 100%)` }}
    >
      <div className="flex items-start justify-between gap-4">
        <h2 className="font-serif text-3xl text-[#3a332e]">Today&apos;s Check-in</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-2 text-sm font-semibold text-[#3a332e] ring-1 ring-[#3a332e]/10 hover:bg-white"
          >
            <Pencil aria-hidden="true" className="size-4" />
            Edit
          </button>
          <DeleteEntryButton entry={entry} />
        </div>
      </div>
      <p className="mt-6 text-6xl" aria-hidden="true">
        {mood.emoji}
      </p>
      <p className="mt-3 font-serif text-4xl" style={{ color: mood.ink }}>
        {mood.name}
      </p>
      <p className="mt-1 text-sm font-semibold text-[#7c7168]">
        <time dateTime={entry.date}>{formatLong(entry.date)}</time>
      </p>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#3a332e]">
        {entry.note ? entry.note : "No note for today — just a feeling, and that is enough."}
      </p>
    </article>
  );
}

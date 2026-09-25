"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { AFFIRMATIONS } from "@/lib/content";

function dayIndex(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const day = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  return ((day % AFFIRMATIONS.length) + AFFIRMATIONS.length) % AFFIRMATIONS.length;
}

export function AffirmationCard() {
  const [index, setIndex] = useState<number | null>(null);
  const affirmation = AFFIRMATIONS[index ?? dayIndex()];

  return (
    <section className="animate-rise rounded-[2rem] bg-gradient-to-br from-[#f8efd0] via-[#fffaf6] to-[#e6def3] px-6 py-8 shadow-[0_16px_40px_rgba(90,62,54,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <h2 className="font-serif text-2xl text-[#3a332e]">Today&apos;s Reminder ✨</h2>
        <button
          type="button"
          aria-label="Show another affirmation"
          onClick={() => setIndex(((index ?? dayIndex()) + 1) % AFFIRMATIONS.length)}
          className="grid size-10 place-items-center rounded-full bg-white/80 text-[#3a332e] transition hover:rotate-45"
        >
          <RefreshCw aria-hidden="true" className="size-4" />
        </button>
      </div>
      <p key={affirmation} className="animate-rise mt-4 font-serif text-2xl leading-snug text-[#3a332e] sm:text-3xl">
        “{affirmation}”
      </p>
    </section>
  );
}

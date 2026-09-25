"use client";

import { useState } from "react";
import { SUGGESTIONS } from "@/lib/content";
import type { MoodId } from "@/lib/types";

export function SuggestionCard({ mood }: { mood: MoodId | null }) {
  const [offset, setOffset] = useState(0);
  if (!mood) return null;
  const ideas = SUGGESTIONS[mood];
  const idea = ideas[offset % ideas.length];

  return (
    <section className="animate-rise rounded-[2rem] bg-[#fffaf6] p-6 shadow-[0_16px_40px_rgba(90,62,54,0.05)] ring-1 ring-[#3a332e]/5">
      <h2 className="font-serif text-2xl text-[#3a332e]">Something you can do today</h2>
      <p key={idea} className="animate-rise mt-3 text-lg text-[#3a332e]">
        {idea}
      </p>
      <button
        type="button"
        onClick={() => setOffset((value) => value + 1)}
        className="mt-4 rounded-full px-4 py-2 text-sm font-semibold text-[#8a4454] ring-1 ring-[#e7c4cb]"
      >
        Give me another idea
      </button>
    </section>
  );
}

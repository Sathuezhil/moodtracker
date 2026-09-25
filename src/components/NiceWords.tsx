"use client";

import { useState } from "react";
import { NICE_WORDS } from "@/lib/content";

export function NiceWords() {
  const [index, setIndex] = useState<number | null>(null);
  const message = index === null ? null : NICE_WORDS[index % NICE_WORDS.length];

  return (
    <section className="rounded-[2rem] bg-gradient-to-br from-[#fdecef] to-[#fffaf6] p-6 shadow-[0_16px_40px_rgba(90,62,54,0.05)]">
      <h2 className="font-serif text-2xl text-[#3a332e]">I need to hear something nice 💛</h2>
      {message ? (
        <p key={message} className="animate-rise mt-4 font-serif text-2xl text-[#3a332e]">
          “{message}”
        </p>
      ) : (
        <p className="mt-3 text-[#5c534c]">A small line, whenever you want one.</p>
      )}
      <button
        type="button"
        onClick={() =>
          setIndex((current) =>
            current === null ? Math.floor(Math.random() * NICE_WORDS.length) : current + 1,
          )
        }
        className="mt-4 rounded-full bg-[#3a332e] px-4 py-2 text-sm font-semibold text-white"
      >
        {message ? "Another one" : "Say something nice"}
      </button>
    </section>
  );
}

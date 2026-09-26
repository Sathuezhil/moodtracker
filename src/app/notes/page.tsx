"use client";

import { StickyNotesBoard } from "@/components/sticky-notes/StickyNotesBoard";

export default function NotesPage() {
  return (
    <div className="space-y-6">
      <header className="px-1">
        <h1 className="font-serif text-4xl text-[#3a332e] sm:text-5xl">Little Notes</h1>
        <p className="mt-2 max-w-xl text-[#5c534c]">Your soft wall of thoughts, reminders, and quiet words.</p>
      </header>
      <StickyNotesBoard mode="full" />
    </div>
  );
}

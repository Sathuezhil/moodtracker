"use client";

import { Avatar } from "@/components/Avatar";
import { HistoryList } from "@/components/HistoryList";
import { LoadingState } from "@/components/LoadingState";
import { useMoods } from "@/context/MoodContext";

export default function JournalPage() {
  const { ready, profile } = useMoods();
  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <Avatar profile={profile} size="md" />
        <div>
        <h1 className="font-serif text-4xl text-[#3a332e] sm:text-5xl">Your journal</h1>
        <p className="mt-2 max-w-xl text-[#5c534c]">The days you kept, one note at a time.</p>
        </div>
      </header>
      {ready ? <HistoryList /> : <LoadingState />}
    </div>
  );
}

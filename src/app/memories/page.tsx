"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { useMoods } from "@/context/MoodContext";
import { formatMonthDay } from "@/lib/dates";
import { getPhoto } from "@/lib/photos";
import { MOODS, getMood, journalPreview, type MoodEntry, type MoodId } from "@/lib/types";

export default function MemoriesPage() {
  const { entries, ready, profile } = useMoods();
  const [filter, setFilter] = useState<MoodId | "all">("all");
  const [open, setOpen] = useState<MoodEntry | null>(null);
  const photos = entries.filter((entry) => entry.photoId);
  const visible = filter === "all" ? photos : photos.filter((entry) => entry.mood === filter);

  if (!ready) return <p className="text-sm text-[#7c7168]">Opening your journal…</p>;

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <Avatar profile={profile} size="md" />
        <div>
        <h1 className="font-serif text-4xl text-[#3a332e] sm:text-5xl">My Memories</h1>
        <p className="mt-2 text-[#5c534c]">Moments you chose to keep.</p>
        </div>
      </header>
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Filter active={filter === "all"} onClick={() => setFilter("all")}>All</Filter>
        {MOODS.map((mood) => (
          <Filter key={mood.id} active={filter === mood.id} onClick={() => setFilter(mood.id)}>
            {mood.emoji} {mood.name}
          </Filter>
        ))}
      </div>
      {visible.length === 0 ? (
        <section className="rounded-[2rem] bg-white/75 px-6 py-12 text-center">
          <p className="text-4xl" aria-hidden="true">📸</p>
          <h2 className="mt-3 font-serif text-3xl text-[#3a332e]">Save a moment you&apos;ll want to remember.</h2>
        </section>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {visible.map((entry) => (
            <MemoryCard key={entry.id} entry={entry} onOpen={() => setOpen(entry)} />
          ))}
        </div>
      )}
      {open ? <MemoryDialog entry={open} onClose={() => setOpen(null)} /> : null}
    </div>
  );
}

function Filter({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold ${active ? "bg-[#3a332e] text-white" : "bg-white/80 text-[#5c534c]"}`}>
      {children}
    </button>
  );
}

function MemoryCard({ entry, onOpen }: { entry: MoodEntry; onOpen: () => void }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    if (!entry.photoId) return;
    let active = true;
    getPhoto(entry.photoId).then((data) => {
      if (active) setSrc(data);
    });
    return () => {
      active = false;
    };
  }, [entry.photoId]);

  return (
    <button type="button" onClick={onOpen} className="mb-4 block w-full break-inside-avoid overflow-hidden rounded-[1.5rem] bg-white/85 text-left shadow-sm">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="w-full object-cover" />
      ) : (
        <div className="h-40 bg-[#f6eee8]" />
      )}
      <div className="p-3">
        <p className="text-sm font-semibold text-[#7c7168]">{formatMonthDay(entry.date)} {entry.moodEmoji}</p>
        <p className="mt-1 line-clamp-3 text-[#3a332e]">{journalPreview(entry) || "A quiet memory."}</p>
      </div>
    </button>
  );
}

function MemoryDialog({ entry, onClose }: { entry: MoodEntry; onClose: () => void }) {
  const [src, setSrc] = useState<string | null>(null);
  const mood = getMood(entry.mood);
  useEffect(() => {
    if (!entry.photoId) return;
    getPhoto(entry.photoId).then(setSrc);
  }, [entry.photoId]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#3a332e]/40 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Memory" className="animate-rise max-h-[90vh] w-full max-w-lg overflow-auto rounded-[2rem] bg-[#fffaf6] p-5" onClick={(event) => event.stopPropagation()}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="max-h-80 w-full rounded-[1.25rem] object-cover" />
        ) : null}
        <h2 className="mt-4 font-serif text-3xl" style={{ color: mood.ink }}>{mood.emoji} {mood.name}</h2>
        <p className="text-sm text-[#7c7168]">{formatMonthDay(entry.date)}</p>
        <p className="mt-3 text-[#3a332e]">{journalPreview(entry) || "No note was saved with this photo."}</p>
        <button type="button" onClick={onClose} className="mt-5 rounded-full bg-[#3a332e] px-4 py-2 text-sm font-semibold text-white">Close</button>
      </div>
    </div>
  );
}

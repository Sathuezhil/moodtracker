"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AffirmationCard } from "@/components/AffirmationCard";
import { CheckInForm } from "@/components/CheckInForm";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { NiceWords } from "@/components/NiceWords";
import { StickyNotesBoard } from "@/components/sticky-notes/StickyNotesBoard";
import { SelfCareChecklist } from "@/components/SelfCareChecklist";
import { StreakPanel } from "@/components/StreakBadges";
import { SuggestionCard } from "@/components/SuggestionCard";
import { TodayCard } from "@/components/TodayCard";
import { WeeklyChart } from "@/components/WeeklyChart";
import { useMoods } from "@/context/MoodContext";
import { todayKey } from "@/lib/dates";
import { displayName, greetingFor, isBirthday } from "@/lib/profile";
import { currentStreak, entriesInMonth } from "@/lib/stats";
import { getMood } from "@/lib/types";
import { Avatar } from "@/components/Avatar";
import { getPhoto } from "@/lib/photos";
import { journalPreview } from "@/lib/types";

export default function DashboardPage() {
  const { entries, ready, setAccent, profile } = useMoods();
  const [editing, setEditing] = useState(false);
  const today = todayKey();
  const entry = entries.find((item) => item.date === today) ?? null;

  useEffect(() => {
    if (entry && !editing) setAccent(entry.mood);
  }, [entry, editing, setAccent]);

  if (!ready) return <LoadingState />;

  const memories = entries.filter((item) => item.photoId).slice(0, 3);
  const hello = greetingFor(profile);
  const birthday = isBirthday(profile) && profile.birthdayMode;
  const name = displayName(profile);
  const monthCount = entriesInMonth(entries, new Date()).length;
  const streak = currentStreak(entries);
  const favorite = profile.favoriteMood ? getMood(profile.favoriteMood) : null;

  return (
    <div className="space-y-8">
      <section className="animate-rise flex items-center gap-4 px-1 pt-2">
        <Avatar profile={profile} size="lg" />
        <div>
          <h1 className="font-serif text-4xl leading-tight text-[#3a332e] sm:text-5xl">
            {birthday ? "🎂 " : ""}
            {hello.title}
          </h1>
          <p className="mt-3 max-w-xl text-lg text-[#5c534c]">{hello.subtitle}</p>
          {favorite ? <p className="mt-2 text-sm font-semibold text-[#7c7168]">Your favorite feeling: {favorite.emoji}</p> : null}
        </div>
      </section>
      {birthday ? <BirthdayCard name={name} memory={entry ? journalPreview(entry) : ""} /> : null}
      {name ? (
        <p className="text-[#5c534c]">
          {name}, you&apos;ve checked in {monthCount} {monthCount === 1 ? "time" : "times"} this month.
          {streak > 0 ? ` You're currently on a ${streak}-day streak 🔥` : " Keep taking little moments for yourself."}
        </p>
      ) : null}

      {entries.length === 0 ? <EmptyState /> : null}

      {!entry || editing ? (
        <CheckInForm
          date={today}
          initial={entry}
          onSaved={() => setEditing(false)}
          onCancel={entry ? () => setEditing(false) : undefined}
        />
      ) : (
        <TodayCard entry={entry} onEdit={() => setEditing(true)} />
      )}

      <AffirmationCard />
      <StickyNotesBoard mode="preview" />
      <SelfCareChecklist />
      <SuggestionCard mood={entry && !editing ? entry.mood : null} />
      <StreakPanel entries={entries} />
      <WeeklyChart entries={entries} />
      <RecentMemories entries={memories} />
      <NiceWords />
    </div>
  );
}

function BirthdayCard({ name, memory }: { name: string; memory: string }) {
  return (
    <section className="pastel-surface relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#f8efd0] via-[#fffaf6] to-[#fdecef] px-6 py-8">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {["left-6 top-4", "left-1/3 top-8", "right-10 top-6", "right-1/4 bottom-6"].map((place) => (
          <span key={place} className={`confetti absolute ${place} size-2 rounded-full bg-[#e7a8b4]`} />
        ))}
      </div>
      <h2 className="font-serif text-3xl text-[#3a332e]">Happy Birthday{name ? `, ${name}` : ""}!</h2>
      <p className="mt-2 text-lg text-[#5c534c]">Today is all about you.</p>
      <p className="mt-4 font-serif text-2xl text-[#3a332e]">“You deserve a gentle day, exactly as you are.”</p>
      {memory ? (
        <div className="mt-5 rounded-2xl bg-white/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7c7168]">A birthday memory</p>
          <p className="mt-1 text-[#3a332e]">{memory}</p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-[#7c7168]">Save a birthday memory with today&apos;s check-in if you want to keep it.</p>
      )}
    </section>
  );
}

function RecentMemories({
  entries,
}: {
  entries: { id: string; date: string; moodEmoji: string; photoId: string | null; note: string; journal: { happened: string; smile: string; difficult: string; grateful: string; remember: string } }[];
}) {
  if (entries.length === 0) {
    return (
      <section className="rounded-[2rem] bg-white/75 px-6 py-10 text-center">
        <p className="text-3xl" aria-hidden="true">📸</p>
        <h2 className="mt-2 font-serif text-2xl text-[#3a332e]">Save a moment you&apos;ll want to remember.</h2>
        <Link href="/memories" className="mt-4 inline-flex text-sm font-semibold text-[#8a4454] underline">
          Open memories
        </Link>
      </section>
    );
  }

  return (
    <section>
      <h2 className="font-serif text-2xl text-[#3a332e]">Recent memories</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {entries.map((entry) => (
          <MemoryThumb key={entry.id} entry={entry} />
        ))}
      </div>
    </section>
  );
}

function MemoryThumb({
  entry,
}: {
  entry: { date: string; moodEmoji: string; photoId: string | null; note: string; journal: { happened: string; smile: string; difficult: string; grateful: string; remember: string } };
}) {
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
    <Link href="/memories" className="overflow-hidden rounded-[1.5rem] bg-white/80 shadow-sm">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-36 w-full object-cover" />
      ) : (
        <div className="h-36 bg-[#f6eee8]" />
      )}
      <p className="px-3 py-2 text-sm text-[#3a332e]">
        {entry.moodEmoji} {journalPreview(entry)}
      </p>
    </Link>
  );
}

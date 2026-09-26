"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckInForm } from "@/components/CheckInForm";
import { DeleteEntryButton } from "@/components/DeleteEntryButton";
import { LoadingState } from "@/components/LoadingState";
import { DayNotes } from "@/components/sticky-notes/StickyNotesBoard";
import { useMoods } from "@/context/MoodContext";
import { cn } from "@/lib/cn";
import {
  formatLong,
  formatMonthYear,
  parseDateKey,
  startOfMonth,
  toDateKey,
  todayKey,
} from "@/lib/dates";
import { getMood, journalOf, journalPreview, type MoodEntry } from "@/lib/types";
import { CARE_ITEMS } from "@/lib/content";
import { getPhoto } from "@/lib/photos";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarView() {
  const { entries, ready } = useMoods();
  const params = useSearchParams();
  const requested = params.get("date");
  const initialKey =
    requested && /^\d{4}-\d{2}-\d{2}$/.test(requested) ? requested : todayKey();

  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(parseDateKey(initialKey)),
  );
  const [selectedKey, setSelectedKey] = useState(initialKey);
  const [editing, setEditing] = useState(false);

  const byDate = useMemo(
    () => new Map(entries.map((entry) => [entry.date, entry])),
    [entries],
  );

  const cells = useMemo(() => {
    const first = startOfMonth(visibleMonth);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [visibleMonth]);

  const selected = byDate.get(selectedKey);
  const selectedMood = selected ? getMood(selected.mood) : null;
  const isToday = selectedKey === todayKey();

  if (!ready) return <LoadingState />;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
      <section className="rounded-[2rem] border border-white/80 bg-white/80 p-4 shadow-[0_16px_40px_rgba(90,62,54,0.05)] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-serif text-3xl text-[#3a332e]">
            {formatMonthYear(visibleMonth)}
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() =>
                setVisibleMonth(
                  new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1),
                )
              }
              className="grid size-10 place-items-center rounded-full bg-[#f6eee8] text-[#3a332e] hover:bg-[#efe4db]"
            >
              <ChevronLeft aria-hidden="true" className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Next month"
              onClick={() =>
                setVisibleMonth(
                  new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1),
                )
              }
              className="grid size-10 place-items-center rounded-full bg-[#f6eee8] text-[#3a332e] hover:bg-[#efe4db]"
            >
              <ChevronRight aria-hidden="true" className="size-5" />
            </button>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-wide text-[#8a7e76] sm:gap-2">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {cells.map((date) => {
            const key = toDateKey(date);
            const entry = byDate.get(key);
            const inMonth = date.getMonth() === visibleMonth.getMonth();
            const selectedDay = key === selectedKey;
            const today = key === todayKey();
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedKey(key);
                  setEditing(false);
                  if (!inMonth) setVisibleMonth(startOfMonth(date));
                }}
                aria-pressed={selectedDay}
                aria-label={`${formatLong(key)}${entry ? `, ${getMood(entry.mood).name}` : ", no check-in"}`}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center rounded-2xl text-sm transition hover:bg-[#f6eee8]",
                  !inMonth && "opacity-40",
                  selectedDay && "bg-[#3a332e] text-white hover:bg-[#3a332e]",
                  today && !selectedDay && "ring-1 ring-[#e7c4cb]",
                )}
              >
                <span className="text-xs font-semibold sm:text-sm">{date.getDate()}</span>
                {entry ? (
                  <span
                    className={cn("text-base leading-none sm:text-lg", selectedDay && "animate-pop")}
                    aria-hidden="true"
                  >
                    {entry.moodEmoji}
                  </span>
                ) : (
                  <span className="text-base text-transparent" aria-hidden="true">
                    ·
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <aside className="rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-[0_16px_40px_rgba(90,62,54,0.05)]">
        {editing ? (
          <CheckInForm
            key={selectedKey}
            compact
            date={selectedKey}
            initial={selected}
            heading={
              selected
                ? isToday
                  ? "Edit today"
                  : "Edit this day"
                : "How do you feel?"
            }
            onSaved={() => setEditing(false)}
            onCancel={() => setEditing(false)}
          />
        ) : selected && selectedMood ? (
          <div key={selected.id} className="animate-rise">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8a7e76]">
              {isToday ? "Today" : "That day"}
            </p>
            <p className="mt-4 text-5xl" aria-hidden="true">
              {selectedMood.emoji}
            </p>
            <h2 className="mt-3 font-serif text-4xl" style={{ color: selectedMood.ink }}>
              {selectedMood.name}
            </h2>
            <p className="mt-1 text-sm font-semibold text-[#7c7168]">
              <time dateTime={selected.date}>{formatLong(selected.date)}</time>
            </p>
            <DayExtras entry={selected} />
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-full bg-[#3a332e] px-4 py-2 text-sm font-semibold text-white"
              >
                Edit
              </button>
              <DeleteEntryButton entry={selected} />
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8a7e76]">
              {formatLong(selectedKey)}
            </p>
            <h2 className="mt-3 font-serif text-3xl text-[#3a332e]">No check-in yet</h2>
            <p className="mt-2 text-[#5c534c]">
              This day is still open. You can leave a mood whenever you are ready.
            </p>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="mt-5 rounded-full bg-[#3a332e] px-4 py-2.5 text-sm font-semibold text-white"
            >
              {isToday ? "Add today's mood" : "Add a mood"}
            </button>
            <DayNotes dateKey={selectedKey} />
          </div>
        )}
      </aside>
    </div>
  );
}

function DayExtras({ entry }: { entry: MoodEntry }) {
  const { careFor } = useMoods();
  const journal = journalOf(entry);
  const care = careFor(entry.date);
  const done = CARE_ITEMS.filter((item) => care[item.id]).length;
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
    <div className="mt-4 space-y-3 text-[#3a332e]">
      <p>{journalPreview(entry) || "No note was saved for this day."}</p>
      {journal.smile ? <p>Smile: {journal.smile}</p> : null}
      {journal.difficult ? <p>Difficult: {journal.difficult}</p> : null}
      {journal.grateful ? <p>Grateful: {journal.grateful}</p> : null}
      {journal.remember ? <p>Remember: {journal.remember}</p> : null}
      {entry.photoId && src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="max-h-48 w-full rounded-2xl object-cover" />
      ) : null}
      <p className="text-sm text-[#7c7168]">Self-care {done} / {CARE_ITEMS.length}</p>
      <DayNotes dateKey={entry.date} />
    </div>
  );
}

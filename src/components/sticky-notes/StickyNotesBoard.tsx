"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { StickyNoteCard } from "@/components/sticky-notes/StickyNoteCard";
import { StickyNoteModal } from "@/components/sticky-notes/StickyNoteModal";
import { useMoods } from "@/context/MoodContext";
import { todayKey } from "@/lib/dates";
import {
  filterNotes,
  loadNotes,
  newNoteId,
  NOTE_COLORS,
  saveNotes,
  type NoteCategory,
  type NoteColorId,
  type NoteFilter,
  type StickyNote,
} from "@/lib/sticky-notes";
import type { MoodId } from "@/lib/types";

const FILTERS: { id: NoteFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "pinned", label: "Pinned" },
  { id: "Personal", label: "Personal" },
  { id: "Reminder", label: "Reminder" },
  { id: "Idea", label: "Ideas" },
  { id: "Gratitude", label: "Gratitude" },
  { id: "Goal", label: "Goals" },
];

export function StickyNotesBoard({ mode = "preview" }: { mode?: "preview" | "full" }) {
  const { entries } = useMoods();
  const [notes, setNotes] = useState<StickyNote[] | null>(null);
  const [filter, setFilter] = useState<NoteFilter>("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<StickyNote | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<StickyNote | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    // Notes live in the browser and are read after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotes(loadNotes());
  }, []);

  const persist = useCallback((next: StickyNote[]) => {
    saveNotes(next);
    setNotes(next);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (!notes) {
    return <p className="text-sm text-[#7c7168]">Opening your little notes…</p>;
  }

  const todayMood = entries.find((entry) => entry.date === todayKey())?.mood;
  const visible = filterNotes(notes, mode === "preview" ? "all" : filter, mode === "preview" ? "" : query);
  const preview = visible.slice(0, 6);

  function saveNote(input: { text: string; color: NoteColorId; category: NoteCategory }) {
    const now = new Date().toISOString();
    if (editing) {
      persist(
        notes!.map((note) =>
          note.id === editing.id
            ? { ...note, ...input, updatedAt: now, demo: false }
            : note,
        ),
      );
      setToast("Note updated.");
    } else {
      const count = notes!.length;
      const next: StickyNote = {
        id: newNoteId(),
        text: input.text,
        color: input.color,
        category: input.category,
        mood: todayMood as MoodId | undefined,
        createdAt: now,
        updatedAt: now,
        pinned: false,
        x: 8 + (count % 3) * 30,
        y: 8 + Math.floor(count % 4) * 18,
      };
      persist([next, ...notes!]);
      setToast("Note saved 💛");
    }
    setCreating(false);
    setEditing(null);
  }

  function cycleColor(note: StickyNote) {
    const index = NOTE_COLORS.findIndex((item) => item.id === note.color);
    const next = NOTE_COLORS[(index + 1) % NOTE_COLORS.length].id;
    persist(
      notes!.map((item) =>
        item.id === note.id ? { ...item, color: next, updatedAt: new Date().toISOString() } : item,
      ),
    );
  }

  return (
    <section className="rounded-[2rem] bg-white/80 p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-3xl text-[#3a332e]">{mode === "full" ? "All Little Notes" : "Little Notes"}</h2>
          <p className="mt-1 text-[#5c534c]">Leave a little note for yourself 💛</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setCreating(true);
          }}
          className="min-h-11 rounded-full bg-[#3a332e] px-4 text-sm font-semibold text-white"
        >
          + Add Note
        </button>
      </div>

      {mode === "full" ? (
        <div className="mt-5 space-y-3">
          <label className="block text-sm font-semibold text-[#3a332e]">
            <span className="sr-only">Search your notes</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search your notes..."
              className="w-full rounded-2xl border border-[#eadfd6] bg-[#fffaf6] px-4 py-3 font-normal"
            />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Note filters">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={filter === item.id}
                onClick={() => setFilter(item.id)}
                className={`min-h-10 shrink-0 rounded-full px-3 text-sm font-semibold ${filter === item.id ? "bg-[#3a332e] text-white" : "bg-[#f6eee8] text-[#3a332e]"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {(mode === "preview" ? preview : visible).length === 0 ? (
        <EmptyNotes
          onAdd={() => {
            setEditing(null);
            setCreating(true);
          }}
          searching={Boolean(query) || filter !== "all"}
        />
      ) : mode === "full" ? (
        <div className="relative mt-6 min-h-[28rem] overflow-hidden rounded-[1.5rem] bg-[#fffaf6]/70 ring-1 ring-[#eadfd6]/70">
          {visible.map((note) => (
            <StickyNoteCard
              key={note.id}
              note={note}
              free
              onEdit={() => setEditing(note)}
              onDelete={() => setPendingDelete(note)}
              onTogglePin={() =>
                persist(
                  notes.map((item) =>
                    item.id === note.id
                      ? { ...item, pinned: !item.pinned, updatedAt: new Date().toISOString() }
                      : item,
                  ),
                )
              }
              onChangeColor={() => cycleColor(note)}
              onMove={(x, y) =>
                persist(notes.map((item) => (item.id === note.id ? { ...item, x, y } : item)))
              }
            />
          ))}
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {preview.map((note) => (
            <StickyNoteCard
              key={note.id}
              note={note}
              onEdit={() => setEditing(note)}
              onDelete={() => setPendingDelete(note)}
              onTogglePin={() =>
                persist(
                  notes.map((item) =>
                    item.id === note.id
                      ? { ...item, pinned: !item.pinned, updatedAt: new Date().toISOString() }
                      : item,
                  ),
                )
              }
              onChangeColor={() => cycleColor(note)}
            />
          ))}
        </div>
      )}

      {mode === "preview" && notes.length > 0 ? (
        <Link href="/notes" className="mt-5 inline-flex text-sm font-semibold text-[#8a4454] underline">
          View All Notes →
        </Link>
      ) : null}

      <StickyNoteModal
        open={creating || Boolean(editing)}
        initial={editing}
        defaultMood={todayMood}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSave={saveNote}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this note?"
        message="This little note will be removed from your wall."
        confirmLabel="Delete"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          persist(notes.filter((note) => note.id !== pendingDelete.id));
          setPendingDelete(null);
          setToast("Note deleted.");
        }}
      />

      {toast ? (
        <p role="status" className="animate-pop fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-full bg-[#3a332e] px-4 py-2 text-sm font-semibold text-white md:bottom-8">
          {toast}
        </p>
      ) : null}
    </section>
  );
}

function EmptyNotes({ onAdd, searching }: { onAdd: () => void; searching: boolean }) {
  if (searching) {
    return <p className="mt-8 text-center text-[#5c534c]">No notes found.</p>;
  }
  return (
    <div className="mt-8 rounded-[1.5rem] bg-[#fffaf6] px-6 py-10 text-center">
      <p className="text-4xl" aria-hidden="true">
        📝
      </p>
      <h3 className="mt-3 font-serif text-2xl text-[#3a332e]">Your little wall is empty</h3>
      <p className="mt-2 text-[#5c534c]">Write something for your future self.</p>
      <button type="button" onClick={onAdd} className="mt-5 min-h-11 rounded-full bg-[#3a332e] px-4 text-sm font-semibold text-white">
        + Add Your First Note
      </button>
    </div>
  );
}

export function DayNotes({ dateKey }: { dateKey: string }) {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotes(loadNotes().filter((note) => note.createdAt.slice(0, 10) === dateKey));
  }, [dateKey]);
  if (notes.length === 0) return null;
  return (
    <div className="mt-4 rounded-2xl bg-[#fffaf6] px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-[#7c7168]">Little Notes</p>
      <ul className="mt-2 space-y-2">
        {notes.map((note) => (
          <li key={note.id} className="font-serif text-[#3a332e]">
            “{note.text}”
          </li>
        ))}
      </ul>
    </div>
  );
}

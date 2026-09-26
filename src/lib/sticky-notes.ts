import { todayKey } from "@/lib/dates";
import { isMoodId, type MoodId } from "@/lib/types";

export const NOTES_KEY = "moodly-sticky-notes";

export const NOTE_COLORS = [
  { id: "yellow", label: "Soft yellow", bg: "#fbf3d0", ink: "#6b5a1e" },
  { id: "peach", label: "Peach", bg: "#f8e4d4", ink: "#7a4a2e" },
  { id: "pink", label: "Pink", bg: "#f8e0e6", ink: "#7a3b4a" },
  { id: "lavender", label: "Lavender", bg: "#ebe4f5", ink: "#4f3d6b" },
  { id: "mint", label: "Mint", bg: "#dff0e6", ink: "#2f5a42" },
  { id: "blue", label: "Light blue", bg: "#e0edf7", ink: "#2f4f6b" },
] as const;

export type NoteColorId = (typeof NOTE_COLORS)[number]["id"];

export const NOTE_CATEGORIES = [
  "Personal",
  "Reminder",
  "Idea",
  "Gratitude",
  "Goal",
  "Random",
] as const;

export type NoteCategory = (typeof NOTE_CATEGORIES)[number];

export type StickyNote = {
  id: string;
  text: string;
  color: NoteColorId;
  category: NoteCategory;
  mood?: MoodId;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  x: number;
  y: number;
  demo?: boolean;
};

export type NoteFilter =
  | "all"
  | "today"
  | "pinned"
  | "Personal"
  | "Reminder"
  | "Idea"
  | "Gratitude"
  | "Goal"
  | "Random";

function isColor(value: unknown): value is NoteColorId {
  return NOTE_COLORS.some((color) => color.id === value);
}

function isCategory(value: unknown): value is NoteCategory {
  return NOTE_CATEGORIES.includes(value as NoteCategory);
}

function isNote(value: unknown): value is StickyNote {
  if (!value || typeof value !== "object") return false;
  const note = value as Partial<StickyNote>;
  return (
    typeof note.id === "string" &&
    typeof note.text === "string" &&
    isColor(note.color) &&
    isCategory(note.category) &&
    typeof note.createdAt === "string" &&
    typeof note.updatedAt === "string" &&
    typeof note.pinned === "boolean" &&
    typeof note.x === "number" &&
    typeof note.y === "number"
  );
}

export function colorStyle(color: NoteColorId): { bg: string; ink: string } {
  return NOTE_COLORS.find((item) => item.id === color) ?? NOTE_COLORS[0];
}

export function createDemoNotes(now = new Date()): StickyNote[] {
  const stamp = now.toISOString();
  const texts = [
    "Remember to drink enough water today 💧",
    "I'm proud of myself for getting through today 🤍",
    "One small step is still progress ✨",
    "Call Mom ❤️",
  ];
  return texts.map((text, index) => ({
    id: `demo-${index + 1}`,
    text,
    color: NOTE_COLORS[index % NOTE_COLORS.length].id,
    category: (["Reminder", "Gratitude", "Goal", "Personal"] as NoteCategory[])[index],
    createdAt: stamp,
    updatedAt: stamp,
    pinned: index === 0,
    x: 12 + (index % 2) * 48,
    y: 12 + Math.floor(index / 2) * 42,
    demo: true,
  }));
}

export function loadNotes(): StickyNote[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(NOTES_KEY);
  if (!raw) {
    const demos = createDemoNotes();
    saveNotes(demos);
    return demos;
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isNote).map((note) => ({
      ...note,
      mood: note.mood && isMoodId(note.mood) ? note.mood : undefined,
      text: note.text.slice(0, 280),
    }));
  } catch {
    return [];
  }
}

export function saveNotes(notes: StickyNote[]): void {
  window.localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export function notesForDate(notes: StickyNote[], dateKey: string): StickyNote[] {
  return notes.filter((note) => note.createdAt.slice(0, 10) === dateKey);
}

export function filterNotes(notes: StickyNote[], filter: NoteFilter, query: string): StickyNote[] {
  const q = query.trim().toLowerCase();
  const today = todayKey();
  return notes
    .filter((note) => {
      if (filter === "today") return note.createdAt.slice(0, 10) === today;
      if (filter === "pinned") return note.pinned;
      if (filter !== "all") return note.category === filter;
      return true;
    })
    .filter((note) => {
      if (!q) return true;
      return (
        note.text.toLowerCase().includes(q) ||
        note.category.toLowerCase().includes(q) ||
        (note.mood ?? "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.updatedAt.localeCompare(a.updatedAt);
    });
}

export function newNoteId(): string {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

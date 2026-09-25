export const MOODS = [
  {
    id: "happy",
    name: "Happy",
    emoji: "😊",
    bg: "#FBF6E4",
    border: "#E6D39A",
    glow: "0 12px 32px rgba(214, 176, 84, 0.38)",
    ink: "#7A5C16",
    bar: "#E3C56A",
    level: 6,
  },
  {
    id: "calm",
    name: "Calm",
    emoji: "😌",
    bg: "#EAF5EE",
    border: "#B7D7C4",
    glow: "0 12px 32px rgba(120, 174, 144, 0.35)",
    ink: "#2F6248",
    bar: "#8FBF9F",
    level: 4,
  },
  {
    id: "loved",
    name: "Loved",
    emoji: "🥰",
    bg: "#FDECEF",
    border: "#F0C2CB",
    glow: "0 12px 32px rgba(214, 140, 156, 0.38)",
    ink: "#8A4454",
    bar: "#E7A8B4",
    level: 5,
  },
  {
    id: "okay",
    name: "Okay",
    emoji: "😐",
    bg: "#F4EFEA",
    border: "#E0D5CB",
    glow: "0 12px 32px rgba(168, 148, 132, 0.32)",
    ink: "#65584E",
    bar: "#CDBBAE",
    level: 3,
  },
  {
    id: "sad",
    name: "Sad",
    emoji: "😔",
    bg: "#ECEAF8",
    border: "#CFC9EA",
    glow: "0 12px 32px rgba(148, 138, 196, 0.36)",
    ink: "#514A74",
    bar: "#B7B0D8",
    level: 2,
  },
  {
    id: "angry",
    name: "Angry",
    emoji: "😡",
    bg: "#FBEFE8",
    border: "#F0CDBB",
    glow: "0 12px 32px rgba(206, 140, 108, 0.36)",
    ink: "#844C38",
    bar: "#E2B09A",
    level: 1,
  },
] as const;

export type MoodId = (typeof MOODS)[number]["id"];
export type Mood = (typeof MOODS)[number];

export type Journal = {
  happened: string;
  smile: string;
  difficult: string;
  grateful: string;
  remember: string;
};

export const EMPTY_JOURNAL: Journal = {
  happened: "",
  smile: "",
  difficult: "",
  grateful: "",
  remember: "",
};

export type MoodEntry = {
  id: string;
  date: string;
  mood: MoodId;
  moodEmoji: string;
  note: string;
  journal: Journal;
  photoId: string | null;
  createdAt: string;
};

export function journalOf(entry: Pick<MoodEntry, "note" | "journal">): Journal {
  return {
    happened: entry.journal?.happened || entry.note || "",
    smile: entry.journal?.smile || "",
    difficult: entry.journal?.difficult || "",
    grateful: entry.journal?.grateful || "",
    remember: entry.journal?.remember || "",
  };
}

export function journalPreview(entry: Pick<MoodEntry, "note" | "journal">): string {
  const journal = journalOf(entry);
  return (
    journal.happened ||
    journal.smile ||
    journal.grateful ||
    journal.remember ||
    journal.difficult ||
    ""
  );
}

export function getMood(id: MoodId): Mood {
  const mood = MOODS.find((item) => item.id === id);
  if (!mood) {
    throw new Error(`Unknown mood: ${id}`);
  }
  return mood;
}

export function isMoodId(value: string): value is MoodId {
  return MOODS.some((mood) => mood.id === value);
}

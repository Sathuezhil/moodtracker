import { addDays, parseDateKey, toDateKey } from "@/lib/dates";
import { isPuzzleType, type PuzzleType } from "@/lib/puzzles";

const PUZZLE_KEY = "moodly.puzzles.v1";

export type PuzzleReaction = "fun" | "relaxing" | "challenging" | "okay";

export type PuzzleRecord = {
  date: string;
  puzzleId: string;
  correct: boolean;
  usedHint: boolean;
  points: number;
  given: string;
  reaction: PuzzleReaction | null;
};

export type PuzzleState = {
  records: PuzzleRecord[];
  choices: Record<string, PuzzleType>;
};

export const EMPTY_PUZZLE_STATE: PuzzleState = { records: [], choices: {} };

function isReaction(value: unknown): value is PuzzleReaction {
  return value === "fun" || value === "relaxing" || value === "challenging" || value === "okay";
}

function isRecord(value: unknown): value is PuzzleRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<PuzzleRecord>;
  return (
    typeof record.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(record.date) &&
    typeof record.puzzleId === "string" &&
    typeof record.correct === "boolean" &&
    typeof record.usedHint === "boolean" &&
    typeof record.points === "number" &&
    typeof record.given === "string"
  );
}

export function loadPuzzleState(): PuzzleState {
  if (typeof window === "undefined") return EMPTY_PUZZLE_STATE;
  const raw = window.localStorage.getItem(PUZZLE_KEY);
  if (!raw) return EMPTY_PUZZLE_STATE;
  try {
    const parsed = JSON.parse(raw) as { records?: unknown; choices?: unknown };
    const records = Array.isArray(parsed.records) ? parsed.records.filter(isRecord) : [];
    const byDate = new Map<string, PuzzleRecord>();
    for (const record of records) {
      byDate.set(record.date, {
        ...record,
        points: record.correct ? record.points : 0,
        reaction: isReaction(record.reaction) ? record.reaction : null,
      });
    }
    const choices: Record<string, PuzzleType> = {};
    if (parsed.choices && typeof parsed.choices === "object") {
      for (const [date, type] of Object.entries(parsed.choices)) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(date) && typeof type === "string" && isPuzzleType(type)) choices[date] = type;
      }
    }
    return { records: [...byDate.values()], choices };
  } catch {
    return EMPTY_PUZZLE_STATE;
  }
}

export function savePuzzleState(state: PuzzleState): void {
  window.localStorage.setItem(PUZZLE_KEY, JSON.stringify(state));
}

export function recordForDate(state: PuzzleState, date: string): PuzzleRecord | null {
  return state.records.find((record) => record.date === date) ?? null;
}

export function choosePuzzleType(state: PuzzleState, date: string, type: PuzzleType): PuzzleState {
  return { ...state, choices: { ...state.choices, [date]: type } };
}

export function clearPuzzleChoice(state: PuzzleState, date: string): PuzzleState {
  const choices = { ...state.choices };
  delete choices[date];
  return { ...state, choices };
}

export function completePuzzle(state: PuzzleState, record: PuzzleRecord): PuzzleState {
  if (state.records.some((item) => item.date === record.date)) return state;
  return { ...state, records: [...state.records, record] };
}

export function saveReaction(state: PuzzleState, date: string, reaction: PuzzleReaction): PuzzleState {
  return {
    ...state,
    records: state.records.map((record) => (record.date === date ? { ...record, reaction } : record)),
  };
}

export function totalPoints(state: PuzzleState): number {
  return state.records.reduce((sum, record) => sum + record.points, 0);
}

export function completedCount(state: PuzzleState): number {
  return state.records.length;
}

export function correctCount(state: PuzzleState): number {
  return state.records.filter((record) => record.correct).length;
}

export function accuracy(state: PuzzleState): number {
  const total = completedCount(state);
  if (total === 0) return 0;
  return Math.round((correctCount(state) / total) * 100);
}

export function currentPuzzleStreak(state: PuzzleState, now = new Date()): number {
  const dates = new Set(state.records.map((record) => record.date));
  let cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!dates.has(toDateKey(cursor))) cursor = addDays(cursor, -1);
  let streak = 0;
  while (dates.has(toDateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function longestPuzzleStreak(state: PuzzleState): number {
  const dates = [...new Set(state.records.map((record) => record.date))].sort();
  if (dates.length === 0) return 0;
  let best = 1;
  let run = 1;
  for (let index = 1; index < dates.length; index += 1) {
    const nextDay = toDateKey(addDays(parseDateKey(dates[index - 1]), 1));
    if (dates[index] === nextDay) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}

export function streakTitle(streak: number): string {
  if (streak >= 30) return `🏆 ${streak} Day Puzzle Streak`;
  if (streak >= 7) return `🔥 ${streak} Day Puzzle Streak`;
  if (streak >= 1) return `🧩 ${streak} Day Puzzle Streak`;
  return "Your streak starts with today's puzzle";
}

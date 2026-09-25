import { addDays, isSameMonth, parseDateKey, todayKey, toDateKey } from "@/lib/dates";
import { getMood, type Mood, type MoodEntry, type MoodId } from "@/lib/types";

export function countMood(
  entries: MoodEntry[],
  mood: MoodId,
  month?: Date,
): number {
  return entries.filter((entry) => {
    if (entry.mood !== mood) return false;
    if (!month) return true;
    return isSameMonth(parseDateKey(entry.date), month);
  }).length;
}

export function entriesInMonth(entries: MoodEntry[], month: Date): MoodEntry[] {
  return entries.filter((entry) =>
    isSameMonth(parseDateKey(entry.date), month),
  );
}

export function mostCommonMood(entries: MoodEntry[]): Mood | null {
  if (entries.length === 0) return null;
  const counts = new Map<MoodId, number>();
  for (const entry of entries) {
    counts.set(entry.mood, (counts.get(entry.mood) ?? 0) + 1);
  }
  let winner: MoodId = entries[0].mood;
  let best = 0;
  for (const [mood, count] of counts) {
    if (count > best) {
      best = count;
      winner = mood;
    }
  }
  return getMood(winner);
}

export function currentStreak(entries: MoodEntry[], now = new Date()): number {
  const dates = new Set(entries.map((entry) => entry.date));
  let cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!dates.has(toDateKey(cursor))) {
    cursor = addDays(cursor, -1);
  }
  let streak = 0;
  while (dates.has(toDateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function entryForDate(
  entries: MoodEntry[],
  dateKey: string,
): MoodEntry | undefined {
  return entries.find((entry) => entry.date === dateKey);
}

export function todayEntry(entries: MoodEntry[], now = new Date()): MoodEntry | undefined {
  return entryForDate(entries, todayKey(now));
}

export function longestStreak(entries: MoodEntry[]): number {
  if (entries.length === 0) return 0;
  const dates = [...new Set(entries.map((entry) => entry.date))].sort();
  let best = 1;
  let run = 1;
  for (let index = 1; index < dates.length; index += 1) {
    const previous = parseDateKey(dates[index - 1]);
    const current = parseDateKey(dates[index]);
    const nextDay = toDateKey(addDays(previous, 1));
    if (toDateKey(current) === nextDay) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}

export function difficultDays(entries: MoodEntry[], month?: Date): number {
  return (
    countMood(entries, "sad", month) + countMood(entries, "angry", month)
  );
}

export function monthDayCounts(
  entries: MoodEntry[],
  month: Date,
): { date: string; level: number | null }[] {
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  return Array.from({ length: days }, (_, index) => {
    const date = toDateKey(new Date(month.getFullYear(), month.getMonth(), index + 1));
    const entry = entries.find((item) => item.date === date);
    return { date, level: entry ? getMood(entry.mood).level : null };
  });
}

import { CARE_ITEMS, type CareId } from "@/lib/content";
import { clearPhotos, getPhoto, savePhoto } from "@/lib/photos";
import type { PinRecord } from "@/lib/pin";
import {
  EMPTY_JOURNAL,
  isMoodId,
  journalOf,
  type Journal,
  type MoodEntry,
  type MoodId,
} from "@/lib/types";

const ENTRIES_KEY = "moodly.entries.v1";
const CARE_KEY = "moodly.care.v1";
const THEME_KEY = "moodly.theme.v1";
const PIN_KEY = "moodly.pin.v1";

export type ThemeMode = "light" | "dark";

export type CareMap = Record<string, Partial<Record<CareId, boolean>>>;

export type NewMoodInput = {
  date: string;
  mood: MoodId;
  journal: Journal;
  photoId: string | null;
};

export type ExportBundle = {
  version: 1;
  entries: MoodEntry[];
  photos: Record<string, string>;
  checklist: CareMap | null;
  theme: ThemeMode | null;
};

function readJson(key: string): unknown {
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error(
      "Couldn't save. Storage may be full or blocked in this browser.",
    );
  }
}

function normalizeJournal(value: unknown, note: string): Journal {
  const source = value && typeof value === "object" ? (value as Partial<Journal>) : {};
  return {
    happened: typeof source.happened === "string" ? source.happened : note,
    smile: typeof source.smile === "string" ? source.smile : "",
    difficult: typeof source.difficult === "string" ? source.difficult : "",
    grateful: typeof source.grateful === "string" ? source.grateful : "",
    remember: typeof source.remember === "string" ? source.remember : "",
  };
}

function isMoodEntry(value: unknown): value is MoodEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<MoodEntry>;
  if (
    typeof entry.id !== "string" ||
    typeof entry.date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(entry.date) ||
    typeof entry.mood !== "string" ||
    !isMoodId(entry.mood) ||
    typeof entry.moodEmoji !== "string" ||
    typeof entry.note !== "string" ||
    typeof entry.createdAt !== "string"
  ) {
    return false;
  }
  entry.journal = normalizeJournal(entry.journal, entry.note);
  entry.photoId = typeof entry.photoId === "string" ? entry.photoId : null;
  entry.note = entry.journal.happened;
  return true;
}

export function loadEntries(): MoodEntry[] {
  if (typeof window === "undefined") return [];
  const parsed = readJson(ENTRIES_KEY);
  if (!Array.isArray(parsed)) return [];
  const byDate = new Map<string, MoodEntry>();
  for (const item of parsed) {
    if (!isMoodEntry(item)) continue;
    const current = byDate.get(item.date);
    if (!current || item.createdAt > current.createdAt) {
      byDate.set(item.date, item);
    }
  }
  return [...byDate.values()].sort((a, b) => b.date.localeCompare(a.date));
}

export function saveEntries(entries: MoodEntry[]): void {
  writeJson(ENTRIES_KEY, entries);
}

export function loadCareMap(): CareMap {
  const parsed = readJson(CARE_KEY);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  const legacy = parsed as { date?: string; checks?: Partial<Record<CareId, boolean>> };
  if (typeof legacy.date === "string" && legacy.checks) {
    return { [legacy.date]: legacy.checks };
  }
  const map: CareMap = {};
  for (const [date, checks] of Object.entries(parsed as CareMap)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !checks) continue;
    map[date] = {};
    for (const item of CARE_ITEMS) {
      if (checks[item.id] === true) map[date][item.id] = true;
    }
  }
  return map;
}

export function saveCareMap(care: CareMap): void {
  writeJson(CARE_KEY, care);
}

export function loadTheme(): ThemeMode | null {
  const value = window.localStorage.getItem(THEME_KEY);
  return value === "light" || value === "dark" ? value : null;
}

export function saveTheme(theme: ThemeMode): void {
  window.localStorage.setItem(THEME_KEY, theme);
}

export function loadPin(): PinRecord | null {
  const parsed = readJson(PIN_KEY) as Partial<PinRecord> | null;
  if (!parsed || typeof parsed.salt !== "string" || typeof parsed.hash !== "string") {
    return null;
  }
  return { salt: parsed.salt, hash: parsed.hash };
}

export function savePin(record: PinRecord | null): void {
  if (!record) {
    window.localStorage.removeItem(PIN_KEY);
    return;
  }
  writeJson(PIN_KEY, record);
}

export async function buildExport(entries: MoodEntry[]): Promise<ExportBundle> {
  const photos: Record<string, string> = {};
  for (const entry of entries) {
    if (!entry.photoId) continue;
    const data = await getPhoto(entry.photoId);
    if (data) photos[entry.photoId] = data;
  }
  return {
    version: 1,
    entries,
    photos,
    checklist: readJson(CARE_KEY) as CareMap | null,
    theme: loadTheme(),
  };
}

export function parseImport(value: unknown): ExportBundle {
  if (!value || typeof value !== "object") {
    throw new Error("That file isn't a Moodly export.");
  }
  const bundle = value as Partial<ExportBundle>;
  if (bundle.version !== 1 || !Array.isArray(bundle.entries)) {
    throw new Error("That file isn't a Moodly export.");
  }
  const entries = bundle.entries.filter(isMoodEntry);
  if (entries.length !== bundle.entries.length) {
    throw new Error("Some entries in that file couldn't be read.");
  }
  const photos: Record<string, string> = {};
  if (bundle.photos && typeof bundle.photos === "object") {
    for (const [id, data] of Object.entries(bundle.photos)) {
      if (typeof data === "string" && data.startsWith("data:image/")) {
        photos[id] = data;
      }
    }
  }
  return {
    version: 1,
    entries,
    photos,
    checklist:
      bundle.checklist && typeof bundle.checklist === "object"
        ? (bundle.checklist as CareMap)
        : null,
    theme: bundle.theme === "light" || bundle.theme === "dark" ? bundle.theme : null,
  };
}

export async function restoreImport(bundle: ExportBundle): Promise<void> {
  await clearPhotos();
  for (const [id, data] of Object.entries(bundle.photos)) {
    await savePhoto(id, data);
  }
  saveEntries(bundle.entries);
  if (bundle.checklist) saveCareMap(bundle.checklist);
  if (bundle.theme) saveTheme(bundle.theme);
}

export async function clearAllData(): Promise<void> {
  window.localStorage.removeItem(ENTRIES_KEY);
  window.localStorage.removeItem(CARE_KEY);
  await clearPhotos();
}

export { EMPTY_JOURNAL, journalOf };

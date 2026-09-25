"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CareId } from "@/lib/content";
import { todayKey } from "@/lib/dates";
import { deletePhoto } from "@/lib/photos";
import { createSalt, hashPin, isFourDigitPin, type PinRecord } from "@/lib/pin";
import {
  buildExport,
  clearAllData,
  loadCareMap,
  loadEntries,
  loadPin,
  loadTheme,
  parseImport,
  restoreImport,
  saveCareMap,
  saveEntries,
  savePin,
  saveTheme,
  type ExportBundle,
  type NewMoodInput,
  type ThemeMode,
} from "@/lib/storage";
import { emptyProfile, loadProfile, saveProfile, type PaletteId, type UserProfile } from "@/lib/profile";
import { getMood, type MoodEntry, type MoodId } from "@/lib/types";

const UNLOCK_KEY = "moodly.unlocked";

type MoodContextValue = {
  entries: MoodEntry[];
  ready: boolean;
  locked: boolean;
  error: string | null;
  clearError: () => void;
  upsertEntry: (input: NewMoodInput) => void;
  deleteEntry: (id: string) => void;
  care: Partial<Record<CareId, boolean>>;
  careFor: (date: string) => Partial<Record<CareId, boolean>>;
  toggleCare: (id: CareId) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  accent: MoodId | null;
  setAccent: (mood: MoodId | null) => void;
  pinEnabled: boolean;
  unlock: (pin: string) => Promise<boolean>;
  enablePin: (pin: string) => Promise<void>;
  changePin: (current: string, next: string) => Promise<void>;
  disablePin: (pin: string) => Promise<void>;
  exportData: () => Promise<void>;
  importData: (fileText: string) => Promise<void>;
  clearData: () => Promise<void>;
  profile: UserProfile;
  updateProfile: (profile: UserProfile) => void;
};

const MoodContext = createContext<MoodContextValue | null>(null);

export function MoodProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [careMap, setCareMap] = useState<Record<string, Partial<Record<CareId, boolean>>>>({});
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [accent, setAccent] = useState<MoodId | null>(null);
  const [pin, setPin] = useState<PinRecord | null>(null);
  const [profile, setProfile] = useState<UserProfile>(() => emptyProfile("1970-01-01"));

  useEffect(() => {
    const storedTheme = loadTheme();
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextTheme = storedTheme ?? (systemDark ? "dark" : "light");
    const storedPin = loadPin();
    const unlocked = sessionStorage.getItem(UNLOCK_KEY) === "1";
    // Local data is only available in the browser, after the first paint.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(loadEntries());
    setCareMap(loadCareMap());
    setThemeState(nextTheme);
    setPin(storedPin);
    const loadedProfile = loadProfile(todayKey());
    if (!window.localStorage.getItem("moodly.profile.v1")) saveProfile(loadedProfile);
    setProfile(loadedProfile);
    setLocked(Boolean(storedPin) && !unlocked);
    setReady(true);
  }, []);

  useEffect(() => {
    const midnight = profile.theme === "midnight";
    document.documentElement.classList.toggle("dark", midnight || theme === "dark");
    document.documentElement.dataset.theme = midnight ? "dark" : theme;
    document.documentElement.dataset.palette = profile.theme;
  }, [theme, profile.theme]);

  useEffect(() => {
    document.documentElement.dataset.mood = accent ?? "";
  }, [accent]);

  const persist = useCallback((next: MoodEntry[]) => {
    try {
      saveEntries(next);
      setEntries(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your mood.");
    }
  }, []);

  const upsertEntry = useCallback(
    (input: NewMoodInput) => {
      const mood = getMood(input.mood);
      const existing = entries.find((entry) => entry.date === input.date);
      const note = input.journal.happened.trim();
      const nextEntry: MoodEntry = existing
        ? {
            ...existing,
            mood: mood.id,
            moodEmoji: mood.emoji,
            note,
            journal: { ...input.journal, happened: note },
            photoId: input.photoId,
          }
        : {
            id: crypto.randomUUID(),
            date: input.date,
            mood: mood.id,
            moodEmoji: mood.emoji,
            note,
            journal: { ...input.journal, happened: note },
            photoId: input.photoId,
            createdAt: new Date().toISOString(),
          };
      if (existing?.photoId && existing.photoId !== input.photoId) {
        void deletePhoto(existing.photoId);
      }
      const next = [
        ...entries.filter((entry) => entry.date !== input.date),
        nextEntry,
      ].sort((a, b) => b.date.localeCompare(a.date));
      persist(next);
    },
    [entries, persist],
  );

  const deleteEntry = useCallback(
    (id: string) => {
      const entry = entries.find((item) => item.id === id);
      if (entry?.photoId) void deletePhoto(entry.photoId);
      persist(entries.filter((item) => item.id !== id));
    },
    [entries, persist],
  );

  const toggleCare = useCallback((id: CareId) => {
    const today = todayKey();
    setCareMap((current) => {
      const day = { ...(current[today] ?? {}) };
      if (day[id]) delete day[id];
      else day[id] = true;
      const next = { ...current, [today]: day };
      try {
        saveCareMap(next);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't save your checklist.");
      }
      return next;
    });
  }, []);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
    saveTheme(next);
    setProfile((current) => {
      const themeName: PaletteId = next === "dark" ? "midnight" : current.theme === "midnight" ? "bloom" : current.theme;
      const updated = { ...current, theme: themeName };
      saveProfile(updated);
      return updated;
    });
  }, []);

  const unlock = useCallback(
    async (value: string) => {
      if (!pin || !isFourDigitPin(value)) return false;
      const hash = await hashPin(value, pin.salt);
      if (hash !== pin.hash) return false;
      sessionStorage.setItem(UNLOCK_KEY, "1");
      setLocked(false);
      return true;
    },
    [pin],
  );

  const enablePin = useCallback(async (value: string) => {
    if (!isFourDigitPin(value)) throw new Error("Use a 4-digit PIN.");
    const salt = createSalt();
    const record = { salt, hash: await hashPin(value, salt) };
    savePin(record);
    setPin(record);
    sessionStorage.setItem(UNLOCK_KEY, "1");
  }, []);

  const changePin = useCallback(
    async (current: string, next: string) => {
      if (!pin) throw new Error("Journal lock is off.");
      if (!isFourDigitPin(next)) throw new Error("Use a 4-digit PIN.");
      const currentHash = await hashPin(current, pin.salt);
      if (currentHash !== pin.hash) throw new Error("That PIN doesn't match.");
      const salt = createSalt();
      const record = { salt, hash: await hashPin(next, salt) };
      savePin(record);
      setPin(record);
    },
    [pin],
  );

  const disablePin = useCallback(
    async (value: string) => {
      if (!pin) return;
      const hash = await hashPin(value, pin.salt);
      if (hash !== pin.hash) throw new Error("That PIN doesn't match.");
      savePin(null);
      setPin(null);
      setLocked(false);
      sessionStorage.removeItem(UNLOCK_KEY);
    },
    [pin],
  );

  const exportData = useCallback(async () => {
    const bundle = await buildExport(entries);
    const blob = new Blob([JSON.stringify(bundle, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `moodly-${todayKey()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [entries]);

  const importData = useCallback(async (fileText: string) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(fileText);
    } catch {
      throw new Error("That file isn't valid JSON.");
    }
    const bundle: ExportBundle = parseImport(parsed);
    await restoreImport(bundle);
    setEntries(loadEntries());
    setCareMap(loadCareMap());
    if (bundle.theme) setThemeState(bundle.theme);
  }, []);

  const updateProfile = useCallback((next: UserProfile) => {
    saveProfile(next);
    setProfile(next);
    const mode = next.theme === "midnight" ? "dark" : "light";
    setThemeState(mode);
    saveTheme(mode);
  }, []);

  const clearData = useCallback(async () => {
    await clearAllData();
    setEntries([]);
    setCareMap({});
    setAccent(null);
  }, []);

  const value = useMemo(
    () => ({
      entries,
      ready,
      locked,
      error,
      clearError: () => setError(null),
      upsertEntry,
      deleteEntry,
      care: careMap[todayKey()] ?? {},
      careFor: (date: string) => careMap[date] ?? {},
      toggleCare,
      theme,
      setTheme,
      accent,
      setAccent,
      pinEnabled: Boolean(pin),
      unlock,
      enablePin,
      changePin,
      disablePin,
      exportData,
      importData,
      clearData,
      profile,
      updateProfile,
    }),
    [
      entries,
      ready,
      locked,
      error,
      upsertEntry,
      deleteEntry,
      careMap,
      toggleCare,
      theme,
      accent,
      pin,
      setTheme,
      unlock,
      enablePin,
      changePin,
      disablePin,
      exportData,
      importData,
      clearData,
      profile,
      updateProfile,
    ],
  );

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>;
}

export function useMoods(): MoodContextValue {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error("useMoods must be used within MoodProvider");
  }
  return context;
}

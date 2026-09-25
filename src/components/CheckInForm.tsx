"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { BreathingExercise } from "@/components/BreathingExercise";
import { useMoods } from "@/context/MoodContext";
import { JOURNAL_FIELDS } from "@/lib/content";
import { cn } from "@/lib/cn";
import { todayKey } from "@/lib/dates";
import { fileToDataUrl, getPhoto, savePhoto } from "@/lib/photos";
import {
  EMPTY_JOURNAL,
  MOODS,
  getMood,
  journalOf,
  type Journal,
  type MoodEntry,
  type MoodId,
} from "@/lib/types";

type CheckInFormProps = {
  date: string;
  initial?: MoodEntry | null;
  onSaved?: () => void;
  onCancel?: () => void;
  heading?: string;
  compact?: boolean;
};

export function CheckInForm({
  date,
  initial,
  onSaved,
  onCancel,
  heading = "How do you feel?",
  compact = false,
}: CheckInFormProps) {
  const { upsertEntry, setAccent } = useMoods();
  const [moodId, setMoodId] = useState<MoodId | null>(initial?.mood ?? null);
  const [journal, setJournal] = useState<Journal>(
    initial ? journalOf(initial) : EMPTY_JOURNAL,
  );
  const [photoId, setPhotoId] = useState<string | null>(initial?.photoId ?? null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [breathing, setBreathing] = useState(false);

  useEffect(() => {
    setAccent(moodId);
  }, [moodId, setAccent]);

  useEffect(() => {
    if (!photoId) return;
    let active = true;
    getPhoto(photoId).then((data) => {
      if (active) setPreview(data);
    });
    return () => {
      active = false;
    };
  }, [photoId]);

  const selected = moodId ? getMood(moodId) : null;
  const isUpdate = Boolean(initial);
  const isToday = date === todayKey();
  const saveLabel = isUpdate
    ? isToday
      ? "Update Today's Mood"
      : "Update this day"
    : isToday
      ? "Save Today's Mood"
      : "Save this day";

  function handleSave() {
    if (!moodId) {
      setFormError("Choose how you feel first.");
      return;
    }
    setFormError(null);
    upsertEntry({ date, mood: moodId, journal, photoId });
    setSavedFlash(true);
    window.setTimeout(() => {
      setSavedFlash(false);
      onSaved?.();
    }, 650);
  }

  return (
    <section
      id="check-in"
      className={cn(
        "rounded-[2rem] border border-white bg-white shadow-[0_18px_50px_rgba(90,62,54,0.06)]",
        compact
          ? "mx-auto w-full max-w-[17.5rem] px-3 py-6"
          : "px-4 py-10 sm:px-10 sm:py-12",
      )}
    >
      <h2
        className={cn(
          "text-center font-serif tracking-tight text-[#2c2824]",
          compact ? "text-3xl" : "text-4xl sm:text-5xl",
        )}
      >
        {heading}
      </h2>
      <div
        role="radiogroup"
        aria-label="Select your mood"
        className={cn(
          "mx-auto flex items-end justify-center",
          compact ? "mt-5 gap-1.5" : "mt-10 gap-2 sm:gap-4",
        )}
      >
        {MOODS.map((mood) => {
          const active = mood.id === moodId;
          return (
            <button
              key={mood.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => {
                setMoodId(mood.id);
                setFormError(null);
              }}
              className={cn(
                "group flex shrink-0 flex-col items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8a4454]",
                compact ? "w-8 gap-1.5" : "w-12 gap-2.5 sm:w-14",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "flex w-full items-center justify-center rounded-full transition duration-300 group-hover:scale-[1.04]",
                  compact ? "h-14 text-base" : "h-24 text-2xl sm:h-[7.5rem] sm:text-3xl",
                  active && "scale-[1.06]",
                )}
                style={{
                  background: mood.bg,
                  boxShadow: active ? mood.glow : undefined,
                }}
              >
                {mood.emoji}
              </span>
              <span
                className={cn(
                  "font-semibold leading-none",
                  compact ? "text-[10px]" : "text-sm",
                )}
                style={{ color: mood.ink }}
              >
                {mood.name}
              </span>
            </button>
          );
        })}
      </div>

      {selected ? (
        <p role="status" aria-live="polite" className="animate-rise mt-6 text-center font-serif text-xl text-[#3a332e]">
          {`You're feeling ${selected.name}${isToday ? " today" : ""}.`}
        </p>
      ) : null}

      {formError ? (
        <p role="alert" className="mt-4 text-center text-sm text-[#8a4454]">
          {formError}
        </p>
      ) : null}

      {selected ? (
        <div className="animate-rise mt-8 space-y-5">
          {JOURNAL_FIELDS.map((field) => (
            <div key={field.key}>
              <label htmlFor={field.key} className="font-serif text-2xl text-[#3a332e]">
                {field.label}
              </label>
              <textarea
                id={field.key}
                value={journal[field.key]}
                onChange={(event) =>
                  setJournal((current) => ({ ...current, [field.key]: event.target.value }))
                }
                placeholder={field.placeholder}
                rows={3}
                maxLength={800}
                className="mt-2 w-full resize-y rounded-[1.5rem] border border-[#eadfd6] bg-[#fffaf6] px-4 py-3 text-base text-[#3a332e] outline-none ring-[#e7c4cb] placeholder:text-[#a8988e] focus:ring-2"
              />
            </div>
          ))}
          <div>
            <p className="font-serif text-2xl text-[#3a332e]">Add a Memory 📷</p>
            <label className="mt-2 inline-flex cursor-pointer rounded-full bg-[#f6eee8] px-4 py-2 text-sm font-semibold text-[#3a332e]">
              Choose a photo
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  try {
                    const dataUrl = await fileToDataUrl(file);
                    const id = crypto.randomUUID();
                    await savePhoto(id, dataUrl);
                    setPhotoId(id);
                    setPreview(dataUrl);
                    setFormError(null);
                  } catch {
                    setFormError("Couldn't save that photo on this device.");
                  }
                }}
              />
            </label>
            {photoId && preview ? (
              // Local data URLs are not served by the image optimizer.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Selected memory"
                className="animate-rise mt-3 max-h-56 w-full rounded-[1.5rem] object-cover"
              />
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={savedFlash}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-80",
                savedFlash ? "bg-[#3f6b52]" : "bg-[#3a332e] hover:bg-[#2c2724]",
              )}
            >
              {savedFlash ? (
                <>
                  <Check aria-hidden="true" className="size-4" />
                  Saved
                </>
              ) : (
                saveLabel
              )}
            </button>
            <button
              type="button"
              onClick={() => setBreathing(true)}
              className="rounded-full px-5 py-3 text-sm font-semibold text-[#2f6248] ring-1 ring-[#b7d7c4]"
            >
              Take a Breath
            </button>
            {onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full px-5 py-3 text-sm font-semibold text-[#5c534c] hover:bg-[#f6eee8]"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      {breathing ? <BreathingExercise onClose={() => setBreathing(false)} /> : null}
    </section>
  );
}

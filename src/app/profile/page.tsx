"use client";

import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useMoods } from "@/context/MoodContext";
import { fileToDataUrl } from "@/lib/photos";
import { PALETTES, type UserProfile } from "@/lib/profile";
import { formatMonthDay } from "@/lib/dates";
import { MOODS, type MoodId } from "@/lib/types";

export default function ProfilePage() {
  const { profile, ready } = useMoods();
  if (!ready) return <p className="text-sm text-[#7c7168]">Opening your journal…</p>;
  return <ProfileEditor key={profile.memberSince} profile={profile} />;
}

function ProfileEditor({ profile }: { profile: UserProfile }) {
  const { updateProfile, pinEnabled, enablePin, changePin, disablePin, exportData, importData, clearData } = useMoods();
  const [draft, setDraft] = useState<UserProfile>(profile);
  const [message, setMessage] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [nextPin, setNextPin] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  function save(event: React.FormEvent) {
    event.preventDefault();
    if (draft.name.trim().length > 40) {
      setMessage("Name needs to stay under 40 characters.");
      return;
    }
    if (draft.birthday && draft.birthday > new Date().toISOString().slice(0, 10)) {
      setMessage("Birthday can't be in the future.");
      return;
    }
    try {
      updateProfile({ ...draft, name: draft.name.trim(), nickname: draft.nickname.trim(), bio: draft.bio.trim() });
      setMessage("Saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Couldn't save your profile.");
    }
  }

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Choose an image file.");
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setDraft((current) => ({ ...current, profileImage: dataUrl }));
      setMessage(null);
    } catch {
      setMessage("Couldn't use that photo.");
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <header className="flex items-center gap-4">
        <Avatar profile={draft} size="lg" />
        <div>
          <h1 className="font-serif text-4xl text-[#3a332e]">Hi, {draft.nickname.trim() || draft.name.trim() || "there"} 💛</h1>
          <p className="mt-1 text-[#5c534c]">{draft.bio.trim() || "Your little space to understand yourself better."}</p>
          <p className="mt-2 text-sm text-[#7c7168]">Member since {formatMonthDay(profile.memberSince)}</p>
          {draft.favoriteMood ? (
            <p className="mt-2 text-sm text-[#5c534c]">
              Your favorite mood {MOODS.find((mood) => mood.id === draft.favoriteMood)?.emoji} {MOODS.find((mood) => mood.id === draft.favoriteMood)?.name}
            </p>
          ) : null}
        </div>
      </header>

      <section className="rounded-[2rem] bg-white/80 p-6">
        <h2 className="font-serif text-2xl text-[#3a332e]">Profile</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <label className="cursor-pointer rounded-full bg-[#f6eee8] px-4 py-2 text-sm font-semibold">
            {draft.profileImage ? "Replace image" : "Upload photo"}
            <input type="file" accept="image/*" className="sr-only" onChange={(event) => void onPhoto(event.target.files?.[0])} />
          </label>
          {draft.profileImage ? (
            <button type="button" onClick={() => setDraft((current) => ({ ...current, profileImage: null }))} className="rounded-full px-4 py-2 text-sm font-semibold text-[#8a4454] ring-1 ring-[#e7c4cb]">
              Remove image
            </button>
          ) : null}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Your Name" value={draft.name} onChange={(name) => setDraft({ ...draft, name })} maxLength={40} />
          <Field label="What should we call you?" value={draft.nickname} onChange={(nickname) => setDraft({ ...draft, nickname })} maxLength={24} />
          <label className="text-sm font-semibold text-[#3a332e]">
            Birthday
            <input type="date" value={draft.birthday} onChange={(event) => setDraft({ ...draft, birthday: event.target.value })} className="mt-1 w-full rounded-2xl border border-[#eadfd6] bg-[#fffaf6] px-3 py-2 font-normal" />
          </label>
          <label className="text-sm font-semibold text-[#3a332e] sm:col-span-2">
            About You
            <textarea value={draft.bio} maxLength={240} rows={3} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} className="mt-1 w-full rounded-2xl border border-[#eadfd6] bg-[#fffaf6] px-3 py-2 font-normal" />
          </label>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white/80 p-6">
        <h2 className="font-serif text-2xl text-[#3a332e]">Preferences</h2>
        <p className="mt-4 text-sm font-semibold text-[#3a332e]">Favorite Mood</p>
        <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Favorite mood">
          {MOODS.map((mood) => (
            <button
              key={mood.id}
              type="button"
              role="radio"
              aria-checked={draft.favoriteMood === mood.id}
              onClick={() => setDraft({ ...draft, favoriteMood: mood.id as MoodId })}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${draft.favoriteMood === mood.id ? "bg-[#3a332e] text-white" : "bg-[#f6eee8]"}`}
            >
              {mood.emoji} {mood.name}
            </button>
          ))}
        </div>
        <h3 className="mt-6 font-serif text-xl text-[#3a332e]">Choose Your Moodly Theme</h3>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {PALETTES.map((palette) => (
            <button key={palette.id} type="button" aria-pressed={draft.theme === palette.id} onClick={() => setDraft({ ...draft, theme: palette.id })} className={`rounded-2xl px-3 py-3 text-sm font-semibold ${draft.theme === palette.id ? "bg-[#3a332e] text-white" : "bg-[#f6eee8]"}`}>
              {palette.emoji} {palette.name}
            </button>
          ))}
        </div>
        <label className="mt-4 flex items-center gap-3 text-sm font-semibold">
          <input type="checkbox" checked={draft.showGreeting} onChange={(event) => setDraft({ ...draft, showGreeting: event.target.checked })} className="size-5 accent-[#3f6b52]" />
          Show daily greeting
        </label>
        <label className="mt-3 flex items-center gap-3 text-sm font-semibold">
          <input type="checkbox" checked={draft.birthdayMode} onChange={(event) => setDraft({ ...draft, birthdayMode: event.target.checked })} className="size-5 accent-[#3f6b52]" />
          Birthday mode
        </label>
      </section>

      <section className="rounded-[2rem] bg-white/80 p-6">
        <h2 className="font-serif text-2xl text-[#3a332e]">Privacy</h2>
        <p className="mt-1 text-sm text-[#7c7168]">{pinEnabled ? "A PIN is on." : "Optional journal lock. The PIN is stored as a hash."}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="PIN" value={pin} onChange={(value) => setPin(value.replace(/\D/g, "").slice(0, 4))} maxLength={4} />
          <Field label="New PIN" value={nextPin} onChange={(value) => setNextPin(value.replace(/\D/g, "").slice(0, 4))} maxLength={4} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {!pinEnabled ? (
            <button type="button" onClick={() => void enablePin(pin).then(() => setMessage("PIN saved.")).catch((error: Error) => setMessage(error.message))} className="rounded-full bg-[#3a332e] px-4 py-2 text-sm font-semibold text-white">Enable PIN</button>
          ) : (
            <>
              <button type="button" onClick={() => void changePin(pin, nextPin).then(() => setMessage("PIN changed.")).catch((error: Error) => setMessage(error.message))} className="rounded-full bg-[#3a332e] px-4 py-2 text-sm font-semibold text-white">Change PIN</button>
              <button type="button" onClick={() => void disablePin(pin).then(() => setMessage("PIN removed.")).catch((error: Error) => setMessage(error.message))} className="rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-[#3a332e]/15">Disable PIN</button>
            </>
          )}
          <button type="button" onClick={() => void exportData()} className="rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-[#3a332e]/15">Export data</button>
          <label className="cursor-pointer rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-[#3a332e]/15">
            Import data
            <input type="file" accept="application/json" className="sr-only" onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              try {
                await importData(await file.text());
                setMessage("Your journal was restored.");
              } catch (error) {
                setMessage(error instanceof Error ? error.message : "Couldn't import that file.");
              }
            }} />
          </label>
          <button type="button" onClick={() => setConfirmClear(true)} className="rounded-full bg-[#8a4454] px-4 py-2 text-sm font-semibold text-white">Delete data</button>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button type="submit" className="rounded-full bg-[#3a332e] px-5 py-3 text-sm font-semibold text-white">Save profile</button>
        {message ? <p role="status" className="text-sm text-[#5c534c]">{message}</p> : null}
      </div>
      <ConfirmDialog
        open={confirmClear}
        title="Clear all journal data?"
        message="Moods, notes, photos, and your checklist will be removed from this browser. Your profile stays."
        confirmLabel="Clear"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          void clearData();
          setConfirmClear(false);
          setMessage("Your journal data was cleared.");
        }}
      />
    </form>
  );
}

function Field({ label, value, onChange, maxLength }: { label: string; value: string; onChange: (value: string) => void; maxLength: number }) {
  const id = label.toLowerCase().replace(/[^a-z]+/g, "-");
  return (
    <label htmlFor={id} className="text-sm font-semibold text-[#3a332e]">
      {label}
      <input id={id} value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-2xl border border-[#eadfd6] bg-[#fffaf6] px-3 py-2 font-normal" />
    </label>
  );
}

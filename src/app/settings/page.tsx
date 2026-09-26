"use client";

import { useState } from "react";
import Link from "next/link";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useMoods } from "@/context/MoodContext";

export default function SettingsPage() {
  const { theme, setTheme, exportData, importData, clearData } = useMoods();
  const [message, setMessage] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-4xl text-[#3a332e] sm:text-5xl">Settings</h1>
        <p className="mt-2 text-[#5c534c]">Theme and your journal data.</p>
      </header>

      <section className="rounded-[2rem] bg-white/80 p-6">
        <h2 className="font-serif text-2xl text-[#3a332e]">Appearance</h2>
        <div className="mt-4 flex gap-2">
          {(["light", "dark"] as const).map((mode) => (
            <button key={mode} type="button" aria-pressed={theme === mode} onClick={() => setTheme(mode)} className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${theme === mode ? "bg-[#3a332e] text-white" : "ring-1 ring-[#3a332e]/15"}`}>
              {mode}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] bg-white/80 p-6">
        <h2 className="font-serif text-2xl text-[#3a332e]">Journal lock</h2>
        <p className="mt-2 text-sm text-[#5c534c]">Set or change your PIN in Profile.</p>
        <Link href="/profile" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[#3a332e] px-4 text-sm font-semibold text-white">
          Open Profile
        </Link>
      </section>

      <section className="rounded-[2rem] bg-white/80 p-6">
        <h2 className="font-serif text-2xl text-[#3a332e]">Export My Data</h2>
        <button type="button" onClick={() => void exportData()} className="mt-4 rounded-full bg-[#3a332e] px-4 py-2 text-sm font-semibold text-white">Download JSON</button>
        <h2 className="mt-8 font-serif text-2xl text-[#3a332e]">Import My Data</h2>
        <label className="mt-4 inline-flex cursor-pointer rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-[#3a332e]/15">
          Restore a file
          <input
            type="file"
            accept="application/json"
            className="sr-only"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              try {
                await importData(await file.text());
                setMessage("Your journal was restored.");
              } catch (error) {
                setMessage(error instanceof Error ? error.message : "Couldn't import that file.");
              }
            }}
          />
        </label>
        <h2 className="mt-8 font-serif text-2xl text-[#3a332e]">Clear All Data</h2>
        <button type="button" onClick={() => setConfirmClear(true)} className="mt-4 rounded-full bg-[#8a4454] px-4 py-2 text-sm font-semibold text-white">Clear journal</button>
        {message ? <p role="status" className="mt-4 text-sm text-[#5c534c]">{message}</p> : null}
      </section>

      <ConfirmDialog
        open={confirmClear}
        title="Clear all journal data?"
        message="Moods, notes, photos, and today's checklist will be removed from this browser."
        confirmLabel="Clear"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          void clearData();
          setConfirmClear(false);
          setMessage("Your journal data was cleared.");
        }}
      />
    </div>
  );
}

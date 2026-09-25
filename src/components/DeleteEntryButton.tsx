"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useMoods } from "@/context/MoodContext";
import { formatMonthDay } from "@/lib/dates";
import { getMood, type MoodEntry } from "@/lib/types";

export function DeleteEntryButton({
  entry,
  label,
}: {
  entry: MoodEntry;
  label?: string;
}) {
  const { deleteEntry } = useMoods();
  const [open, setOpen] = useState(false);
  const mood = getMood(entry.mood);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Delete check-in for ${formatMonthDay(entry.date)}`}
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-[#8a4454] ring-1 ring-[#e7c4cb] hover:bg-[#fdecef]"
      >
        <Trash2 aria-hidden="true" className="size-4" />
        {label ?? "Delete"}
      </button>
      <ConfirmDialog
        open={open}
        title="Delete this check-in?"
        message={`Your ${mood.name.toLowerCase()} note for ${formatMonthDay(entry.date)} will be removed.`}
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          deleteEntry(entry.id);
          setOpen(false);
        }}
      />
    </>
  );
}

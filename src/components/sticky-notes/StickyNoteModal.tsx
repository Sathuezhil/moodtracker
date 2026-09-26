"use client";

import { useId, useRef, useState } from "react";
import {
  NOTE_CATEGORIES,
  NOTE_COLORS,
  type NoteCategory,
  type NoteColorId,
  type StickyNote,
} from "@/lib/sticky-notes";

export function StickyNoteModal({
  open,
  initial,
  defaultMood,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: StickyNote | null;
  defaultMood?: string;
  onClose: () => void;
  onSave: (input: { text: string; color: NoteColorId; category: NoteCategory }) => void;
}) {
  if (!open) return null;
  return (
    <StickyNoteModalForm
      key={initial?.id ?? "new"}
      initial={initial}
      defaultMood={defaultMood}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

function StickyNoteModalForm({
  initial,
  defaultMood,
  onClose,
  onSave,
}: {
  initial: StickyNote | null;
  defaultMood?: string;
  onClose: () => void;
  onSave: (input: { text: string; color: NoteColorId; category: NoteCategory }) => void;
}) {
  const titleId = useId();
  const [text, setText] = useState(initial?.text ?? "");
  const [color, setColor] = useState<NoteColorId>(initial?.color ?? "yellow");
  const [category, setCategory] = useState<NoteCategory>(initial?.category ?? "Personal");
  const areaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#3a332e]/35 p-4"
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-[1.75rem] bg-[#fffaf6] p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          if (!text.trim()) return;
          onSave({ text: text.trim().slice(0, 280), color, category });
        }}
      >
        <h2 id={titleId} className="font-serif text-2xl text-[#3a332e]">
          {initial ? "Edit note" : "Add a little note"}
        </h2>
        {defaultMood && !initial ? (
          <p className="mt-1 text-sm text-[#7c7168]">Today&apos;s mood will be saved with this note.</p>
        ) : null}
        <label className="mt-4 block text-sm font-semibold text-[#3a332e]">
          Note
          <textarea
            ref={areaRef}
            value={text}
            maxLength={280}
            rows={4}
            placeholder="What's on your mind?"
            autoFocus
            onChange={(event) => setText(event.target.value)}
            className="mt-1 w-full rounded-2xl border border-[#eadfd6] bg-white px-3 py-2 font-normal text-[#3a332e]"
          />
        </label>
        <p className="mt-4 text-sm font-semibold text-[#3a332e]">Note color</p>
        <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Note color">
          {NOTE_COLORS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={color === item.id}
              aria-label={item.label}
              onClick={() => setColor(item.id)}
              className={`size-9 rounded-full ring-2 ${color === item.id ? "ring-[#3a332e]" : "ring-transparent"}`}
              style={{ backgroundColor: item.bg }}
            />
          ))}
        </div>
        <label className="mt-4 block text-sm font-semibold text-[#3a332e]">
          Category
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as NoteCategory)}
            className="mt-1 w-full rounded-2xl border border-[#eadfd6] bg-white px-3 py-2 font-normal"
          >
            {NOTE_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2.5 text-sm font-semibold ring-1 ring-[#3a332e]/15">
            Cancel
          </button>
          <button type="submit" className="rounded-full bg-[#3a332e] px-4 py-2.5 text-sm font-semibold text-white">
            Save Note
          </button>
        </div>
      </form>
    </div>
  );
}

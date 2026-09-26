"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Pin } from "lucide-react";
import { formatMonthDay } from "@/lib/dates";
import { colorStyle, type StickyNote } from "@/lib/sticky-notes";
import { getMood } from "@/lib/types";

export function StickyNoteCard({
  note,
  free,
  onEdit,
  onDelete,
  onTogglePin,
  onChangeColor,
  onMove,
}: {
  note: StickyNote;
  free?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  onChangeColor: () => void;
  onMove?: (x: number, y: number) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const style = colorStyle(note.color);
  const mood = note.mood ? getMood(note.mood) : null;
  const cardRef = useRef<HTMLElement>(null);
  const drag = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menuOpen]);

  function onPointerDown(event: React.PointerEvent) {
    if (!free || !onMove) return;
    if ((event.target as HTMLElement).closest("button")) return;
    const parent = cardRef.current?.offsetParent as HTMLElement | null;
    if (!parent) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: note.x,
      originY: note.y,
    };
  }

  function onPointerMove(event: React.PointerEvent) {
    if (!drag.current || !onMove || !cardRef.current) return;
    const parent = cardRef.current.offsetParent as HTMLElement | null;
    if (!parent) return;
    const dx = ((event.clientX - drag.current.startX) / parent.clientWidth) * 100;
    const dy = ((event.clientY - drag.current.startY) / parent.clientHeight) * 100;
    const nextX = Math.min(78, Math.max(0, drag.current.originX + dx));
    const nextY = Math.min(70, Math.max(0, drag.current.originY + dy));
    onMove(nextX, nextY);
  }

  function onPointerUp() {
    drag.current = null;
  }

  const rotation = ((note.id.charCodeAt(note.id.length - 1) % 7) - 3) * 1.2;

  return (
    <article
      ref={cardRef}
      className={`animate-pop pastel-surface group relative flex min-h-[9.5rem] w-full flex-col rounded-[1.4rem] p-4 shadow-[0_10px_24px_rgba(90,62,54,0.08)] transition hover:-translate-y-0.5 dark:shadow-[0_10px_24px_rgba(0,0,0,0.25)] ${free ? "absolute w-[42%] cursor-grab touch-none active:cursor-grabbing sm:w-[28%]" : ""}`}
      style={{
        backgroundColor: style.bg,
        color: style.ink,
        left: free ? `${note.x}%` : undefined,
        top: free ? `${note.y}%` : undefined,
        transform: `rotate(${free ? rotation : rotation * 0.4}deg)`,
        zIndex: note.pinned ? 5 : 1,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1 text-xs font-semibold opacity-80">
          {note.pinned ? <span aria-label="Pinned">📌</span> : null}
          <span>{note.category}</span>
        </div>
        <div className="relative">
          <button
            type="button"
            aria-label="Note menu"
            aria-expanded={menuOpen}
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen((open) => !open);
            }}
            className="grid size-8 place-items-center rounded-full hover:bg-black/5"
          >
            <MoreHorizontal className="size-4" />
          </button>
          {menuOpen ? (
            <div
              role="menu"
              className="absolute right-0 z-20 mt-1 min-w-[9rem] rounded-2xl bg-white/95 p-1 text-[#3a332e] shadow-lg"
              onClick={(event) => event.stopPropagation()}
            >
              <MenuItem
                label="Edit"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit();
                }}
              />
              <MenuItem
                label="Change Color"
                onClick={() => {
                  setMenuOpen(false);
                  onChangeColor();
                }}
              />
              <MenuItem
                label={note.pinned ? "Unpin" : "Pin"}
                onClick={() => {
                  setMenuOpen(false);
                  onTogglePin();
                }}
              />
              <MenuItem
                label="Delete"
                danger
                onClick={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
      <p className="mt-3 flex-1 font-serif text-lg leading-snug">{note.text}</p>
      <div className="mt-3 flex items-end justify-between gap-2 text-xs opacity-75">
        <time dateTime={note.createdAt}>{formatMonthDay(note.createdAt.slice(0, 10))}</time>
        {mood ? (
          <span className="truncate">
            {mood.emoji} {mood.name}
          </span>
        ) : null}
      </div>
      <button
        type="button"
        aria-label={note.pinned ? "Unpin note" : "Pin note"}
        onClick={(event) => {
          event.stopPropagation();
          onTogglePin();
        }}
        className="absolute bottom-3 right-3 grid size-8 place-items-center rounded-full opacity-0 transition group-hover:opacity-100 hover:bg-black/5 focus:opacity-100"
      >
        <Pin className={`size-3.5 ${note.pinned ? "fill-current" : ""}`} />
      </button>
    </article>
  );
}

function MenuItem({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold ${danger ? "text-[#8a4454]" : ""}`}
    >
      {label}
    </button>
  );
}

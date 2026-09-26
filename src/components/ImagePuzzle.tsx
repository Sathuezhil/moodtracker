"use client";

import { useMemo, useState } from "react";
import { puzzleNumber } from "@/lib/puzzles";

const COLS = 5;
const ROWS = 2;
const PIECES = COLS * ROWS;
const DAY_COUNT = 30;

function shuffled(seed: number): number[] {
  const order = Array.from({ length: PIECES }, (_, index) => index);
  let value = Math.abs(seed) + 1;
  for (let index = order.length - 1; index > 0; index -= 1) {
    value = (value * 16807 + 1) % 2147483647;
    const swap = value % (index + 1);
    [order[index], order[swap]] = [order[swap], order[index]];
  }
  if (order.every((piece, index) => piece === index)) {
    [order[0], order[1]] = [order[1], order[0]];
  }
  return order;
}

function imageFor(scene: string, dateKey: string): string {
  if (scene.startsWith("day-")) return `/puzzles/${scene}.jpg`;
  const day = String(((puzzleNumber(dateKey) - 1) % DAY_COUNT) + 1).padStart(2, "0");
  return `/puzzles/day-${day}.jpg`;
}

export function ImagePuzzle({
  dateKey,
  round,
  scene,
  hintOpen,
  onSolved,
}: {
  dateKey: string;
  round: number;
  scene: string;
  hintOpen: boolean;
  onSolved: () => void;
}) {
  const src = imageFor(scene, dateKey);
  const start = useMemo(() => shuffled(puzzleNumber(dateKey) + scene.length * 17 + round * 97), [dateKey, scene, round]);
  const [order, setOrder] = useState(start);
  const [selected, setSelected] = useState<number | null>(null);

  function choose(slot: number) {
    if (selected === null) {
      setSelected(slot);
      return;
    }
    if (selected === slot) {
      setSelected(null);
      return;
    }
    const next = [...order];
    [next[selected], next[slot]] = [next[slot], next[selected]];
    setOrder(next);
    setSelected(null);
    if (next.every((piece, index) => piece === index)) onSolved();
  }

  return (
    <div className="mt-6">
      <p className="text-center text-sm text-[#5c534c]">Tap two pieces to swap them. Match them to the photo above.</p>
      <div className="mx-auto mt-4 max-w-sm overflow-hidden rounded-2xl shadow-[0_8px_24px_rgba(90,62,54,0.08)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="Today's full picture" className="aspect-[5/2] w-full object-cover" />
      </div>
      {hintOpen ? <p className="mt-2 text-center text-sm text-[#5c534c]">Use the photo as a guide for the corners and sky.</p> : null}
      <div className="mt-4 grid w-full min-w-0 grid-cols-5 gap-1.5">
        {order.map((piece, slot) => {
          const col = piece % COLS;
          const row = Math.floor(piece / COLS);
          return (
            <button
              key={slot}
              type="button"
              aria-label={`Piece ${piece + 1}`}
              aria-pressed={selected === slot}
              onClick={() => choose(slot)}
              className={`relative aspect-square min-h-14 min-w-0 touch-manipulation overflow-hidden rounded-xl bg-[#f6eee8] ${selected === slot ? "ring-4 ring-[#8a4454]" : "ring-1 ring-[#3a332e]/10"}`}
              style={{
                backgroundImage: `url(${src})`,
                backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
                backgroundPosition: `${(col / (COLS - 1)) * 100}% ${(row / (ROWS - 1)) * 100}%`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

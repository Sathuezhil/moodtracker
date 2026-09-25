"use client";

import { useMemo, useState } from "react";
import { puzzleNumber } from "@/lib/puzzles";

const COLS = 5;
const ROWS = 2;
const PIECES = COLS * ROWS;

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
      <p className="text-center text-sm text-[#5c534c]">Tap two pieces to swap them. There are 10 pieces.</p>
      {hintOpen ? (
        <div className="mx-auto mt-4 max-w-sm overflow-hidden rounded-2xl">
          <Scene scene={scene} />
        </div>
      ) : null}
      <div className="mt-4 grid w-full min-w-0 grid-cols-5 gap-1.5">
        {order.map((piece, slot) => (
          <button
            key={slot}
            type="button"
            aria-label={`Piece ${piece + 1}`}
            aria-pressed={selected === slot}
            onClick={() => choose(slot)}
            className={`relative aspect-square min-h-14 min-w-0 overflow-hidden rounded-xl ${selected === slot ? "ring-4 ring-[#8a4454]" : "ring-1 ring-[#3a332e]/10"}`}
          >
            <span
              className="absolute left-0 top-0 h-[200%] w-[500%]"
              style={{
                transform: `translate(-${(piece % COLS) * 20}%, -${Math.floor(piece / COLS) * 50}%)`,
              }}
            >
              <Scene scene={scene} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Scene({ scene }: { scene: string }) {
  const sky =
    scene === "nature"
      ? "from-[#d7eadc] to-[#f7fbf6]"
      : scene === "sunshine"
        ? "from-[#f8efd0] to-[#fffaf2]"
        : scene === "lavender"
          ? "from-[#e6def3] to-[#fbf8ff]"
          : "from-[#f8e4ea] to-[#fffaf6]";
  return (
    <div className={`relative h-full w-full bg-gradient-to-b ${sky}`}>
      <span className={`absolute left-[6%] top-[10%] size-[16%] rounded-full ${scene === "lavender" ? "bg-[#f4efe8]" : "bg-[#f6d98a]"}`} />
      <span className="absolute right-[8%] top-[16%] size-[10%] rounded-full bg-white/80" />
      <span className="absolute right-[18%] top-[8%] size-[8%] rounded-full bg-white/70" />
      <span className="absolute bottom-0 left-0 h-[42%] w-full bg-[#8fbf98]" />
      <span className="absolute bottom-[22%] left-[8%] h-[30%] w-[24%] rounded-t-full bg-[#6fa67a]" />
      <span className="absolute bottom-[18%] right-[6%] h-[36%] w-[28%] rounded-t-full bg-[#7eae86]" />
      <span className="absolute bottom-[30%] left-[38%] h-[24%] w-[3%] rounded-full bg-[#6b5344]" />
      <span className="absolute bottom-[40%] left-[30%] size-[14%] rounded-full bg-[#e7a8b4]" />
      <span className="absolute bottom-[38%] left-[46%] size-[9%] rounded-full bg-[#f4d5d8]" />
      <span className="absolute bottom-[24%] left-[62%] size-[8%] rounded-full bg-[#f2c1b0]" />
      <span className="absolute bottom-[20%] left-[12%] size-[6%] rounded-full bg-[#fff4ea]" />
    </div>
  );
}

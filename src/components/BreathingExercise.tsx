"use client";

import { useEffect, useRef, useState } from "react";

const CYCLE = [
  { label: "Breathe In", seconds: 4, scale: 1.18 },
  { label: "Hold", seconds: 4, scale: 1.18 },
  { label: "Breathe Out", seconds: 6, scale: 0.82 },
] as const;

export function BreathingExercise({ onClose }: { onClose: () => void }) {
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(60);
  const [phase, setPhase] = useState(0);
  const phaseLeft = useRef<number>(CYCLE[0].seconds);

  useEffect(() => {
    if (!running || left <= 0) return;
    const timer = window.setInterval(() => {
      setLeft((value) => Math.max(0, value - 1));
      phaseLeft.current -= 1;
      if (phaseLeft.current <= 0) {
        setPhase((current) => {
          const next = (current + 1) % CYCLE.length;
          phaseLeft.current = CYCLE[next].seconds;
          return next;
        });
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, left]);

  const current = CYCLE[phase];

  function reset() {
    setRunning(false);
    setLeft(60);
    setPhase(0);
    phaseLeft.current = CYCLE[0].seconds;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#3a332e]/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="breath-title"
        className="animate-rise w-full max-w-md rounded-[2rem] bg-[#fffaf6] p-8 text-center"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="breath-title" className="font-serif text-3xl text-[#3a332e]">
          Take a Breath 🌿
        </h2>
        <div className="mt-8 grid place-items-center">
          <div
            className="grid size-44 place-items-center rounded-full bg-[#e7f0e8] text-sm font-semibold text-[#2f6248] transition-transform ease-in-out"
            style={{
              transform: `scale(${running ? current.scale : 1})`,
              transitionDuration: `${current.seconds}s`,
            }}
          >
            {left === 0 ? "Done" : current.label}
          </div>
        </div>
        <p className="mt-6 text-sm text-[#7c7168]">{left}s left</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => setRunning(true)} className="rounded-full bg-[#3a332e] px-4 py-2 text-sm font-semibold text-white">
            Start
          </button>
          <button type="button" onClick={() => setRunning(false)} className="rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-[#3a332e]/15">
            Pause
          </button>
          <button type="button" onClick={reset} className="rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-[#3a332e]/15">
            Reset
          </button>
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm font-semibold text-[#8a4454]">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useMoods } from "@/context/MoodContext";

export function PinLock() {
  const { unlock } = useMoods();
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const ok = await unlock(pin);
    if (!ok) {
      setMessage("That PIN doesn't match.");
      setPin("");
    }
  }

  return (
    <div className="grid min-h-full place-items-center px-4 py-16">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-[2rem] bg-white/85 p-8 text-center shadow-[0_18px_50px_rgba(90,62,54,0.08)] dark:bg-[#2a2420]"
      >
        <p className="text-3xl" aria-hidden="true">🔐</p>
        <h1 className="mt-3 font-serif text-3xl text-[#3a332e] dark:text-[#f6efe9]">
          Journal Lock
        </h1>
        <p className="mt-2 text-sm text-[#5c534c] dark:text-[#d9cdc4]">
          Enter your 4-digit PIN to open Moodly.
        </p>
        <label htmlFor="pin" className="sr-only">
          4-digit PIN
        </label>
        <input
          id="pin"
          inputMode="numeric"
          autoComplete="off"
          maxLength={4}
          value={pin}
          onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
          className="mt-6 w-full rounded-2xl border border-[#eadfd6] bg-[#fffaf6] px-4 py-3 text-center text-2xl tracking-[0.4em] text-[#3a332e] outline-none focus:ring-2 focus:ring-[#e7c4cb]"
        />
        {message ? (
          <p role="alert" className="mt-3 text-sm text-[#8a4454]">
            {message}
          </p>
        ) : null}
        <button
          type="submit"
          className="mt-5 w-full rounded-full bg-[#3a332e] px-5 py-3 text-sm font-semibold text-white"
        >
          Unlock
        </button>
      </form>
    </div>
  );
}

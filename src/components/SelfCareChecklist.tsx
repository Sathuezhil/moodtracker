"use client";

import { CARE_ITEMS } from "@/lib/content";
import { useMoods } from "@/context/MoodContext";

export function SelfCareChecklist() {
  const { care, toggleCare } = useMoods();
  const done = CARE_ITEMS.filter((item) => care[item.id]).length;
  const width = (done / CARE_ITEMS.length) * 100;

  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-[0_16px_40px_rgba(90,62,54,0.05)]">
      <div className="flex items-end justify-between gap-3">
        <h2 className="font-serif text-2xl text-[#3a332e]">Take care of yourself</h2>
        <p className="text-sm font-semibold text-[#7c7168]">
          {done} / {CARE_ITEMS.length} completed
        </p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#f3ebe4]" aria-hidden="true">
        <div
          className="h-full rounded-full bg-[#8fbf9f] transition-all duration-500"
          style={{ width: `${width}%` }}
        />
      </div>
      <ul className="mt-4 space-y-2">
        {CARE_ITEMS.map((item) => {
          const checked = Boolean(care[item.id]);
          return (
            <li key={item.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl px-2 py-2 hover:bg-[#fbf6f0]">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCare(item.id)}
                  className="size-5 accent-[#3f6b52]"
                />
                <span className={checked ? "text-[#7c7168] line-through" : "text-[#3a332e]"}>
                  {item.label}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

import { monthDayCounts } from "@/lib/stats";
import type { MoodEntry } from "@/lib/types";

export function MonthlyTrend({ entries }: { entries: MoodEntry[] }) {
  const days = monthDayCounts(entries, new Date());

  return (
    <section className="animate-rise rounded-[2rem] border border-white/80 bg-white/80 p-5 sm:p-8">
      <h2 className="font-serif text-3xl text-[#3a332e]">This month</h2>
      <div className="mt-6 flex h-28 items-end gap-1 overflow-hidden">
        {days.map((day) => (
          <div
            key={day.date}
            className="min-w-0 flex-1 rounded-full bg-[#eadfd6]"
            style={{
              height: day.level ? `${24 + ((day.level - 1) / 5) * 76}%` : "8%",
              background: day.level ? "#e7a8b4" : "#eadfd6",
            }}
            title={day.date}
          />
        ))}
      </div>
    </section>
  );
}

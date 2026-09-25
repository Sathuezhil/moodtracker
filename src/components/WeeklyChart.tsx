import { lastNDays, toDateKey, formatWeekday } from "@/lib/dates";
import { getMood, type MoodEntry } from "@/lib/types";

export function WeeklyChart({ entries }: { entries: MoodEntry[] }) {
  const days = lastNDays(7);
  const byDate = new Map(entries.map((entry) => [entry.date, entry]));

  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-[0_16px_40px_rgba(90,62,54,0.05)] sm:p-8">
      <h2 className="font-serif text-3xl text-[#3a332e]">This week</h2>
      <p className="mt-1 text-sm text-[#7c7168]">The last seven days, kept light.</p>
      <div className="mt-8 grid grid-cols-7 items-end gap-1.5 sm:gap-3">
        {days.map((day) => {
          const key = toDateKey(day);
          const entry = byDate.get(key);
          const mood = entry ? getMood(entry.mood) : null;
          const height = mood ? 28 + ((mood.level - 1) / 5) * 72 : 10;
          return (
            <div key={key} className="flex flex-col items-center gap-2">
              <span className="text-lg sm:text-2xl" aria-hidden="true">
                {mood ? mood.emoji : "·"}
              </span>
              <div className="flex h-36 w-full items-end justify-center sm:h-40">
                <div
                  className="w-3 rounded-full sm:w-4"
                  style={{
                    height: `${height}%`,
                    background: mood ? mood.bar : "#eadfd6",
                    opacity: mood ? 1 : 0.7,
                  }}
                />
              </div>
              <span className="text-[11px] font-semibold text-[#7c7168] sm:text-xs">
                {formatWeekday(day)}
              </span>
              <span className="sr-only">
                {formatWeekday(day)}
                {mood ? `: ${mood.name}` : ": no check-in"}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

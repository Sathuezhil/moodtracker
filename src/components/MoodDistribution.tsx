import { MOODS, type MoodEntry } from "@/lib/types";

export function MoodDistribution({ entries }: { entries: MoodEntry[] }) {
  const total = entries.length || 1;

  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-[0_16px_40px_rgba(90,62,54,0.05)] sm:p-8">
      <h2 className="font-serif text-3xl text-[#3a332e]">How your days lean</h2>
      <ul className="mt-6 space-y-4">
        {MOODS.map((mood) => {
          const count = entries.filter((entry) => entry.mood === mood.id).length;
          const width = entries.length === 0 ? 0 : (count / total) * 100;
          return (
            <li key={mood.id}>
              <div className="mb-1.5 flex items-center justify-between text-sm font-semibold text-[#3a332e]">
                <span>
                  <span aria-hidden="true">{mood.emoji} </span>
                  {mood.name}
                </span>
                <span>{count}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[#f3ebe4]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${width}%`, background: mood.bar }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

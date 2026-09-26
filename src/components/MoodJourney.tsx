import { entriesInMonth, mostCommonMood, countMood } from "@/lib/stats";
import type { MoodEntry } from "@/lib/types";

export function MoodJourney({ entries }: { entries: MoodEntry[] }) {
  const now = new Date();
  const monthEntries = entriesInMonth(entries, now);
  const common = mostCommonMood(monthEntries);
  const calmDays = countMood(entries, "calm", now);
  const monthName = now.toLocaleDateString("en-US", { month: "long" });

  return (
    <section className="pastel-surface overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#fdecef] via-[#fffaf6] to-[#e7f0e8] p-6 shadow-[0_16px_40px_rgba(90,62,54,0.05)] sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a4454]">
        Mood Journey
      </p>
      <h2 className="mt-2 font-serif text-3xl text-[#3a332e]">
        {monthName}, in your own words
      </h2>
      {monthEntries.length === 0 ? (
        <p className="mt-4 max-w-xl text-[#5c534c]">
          This month is still a quiet page. A single check-in begins the story.
        </p>
      ) : (
        <ul className="mt-6 space-y-3 text-lg text-[#3a332e]">
          <li className="rounded-2xl bg-white/70 px-4 py-3">
            This month you checked in {monthEntries.length}{" "}
            {monthEntries.length === 1 ? "time" : "times"}.
          </li>
          <li className="rounded-2xl bg-white/70 px-4 py-3">
            {common
              ? `Your most common mood was ${common.emoji} ${common.name}.`
              : "Your moods are still taking shape."}
          </li>
          <li className="rounded-2xl bg-white/70 px-4 py-3">
            You had {calmDays} calm {calmDays === 1 ? "day" : "days"} this month.
          </li>
        </ul>
      )}
    </section>
  );
}

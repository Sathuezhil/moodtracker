import { countMood, currentStreak, entriesInMonth, mostCommonMood } from "@/lib/stats";
import type { MoodEntry } from "@/lib/types";

export function MonthReflection({ entries }: { entries: MoodEntry[] }) {
  const month = new Date();
  const monthEntries = entriesInMonth(entries, month);
  const common = mostCommonMood(monthEntries);
  const calm = countMood(entries, "calm", month);
  const streak = currentStreak(entries);
  const monthName = month.toLocaleDateString("en-US", { month: "long" });

  if (monthEntries.length === 0) {
    return (
      <section className="rounded-[2rem] bg-white/75 px-6 py-10 text-center">
        <p className="text-3xl" aria-hidden="true">📊</p>
        <h2 className="mt-2 font-serif text-2xl text-[#3a332e]">Check in for a few days and your patterns will appear here.</h2>
      </section>
    );
  }

  return (
    <section className="pastel-surface rounded-[2rem] bg-gradient-to-br from-[#fdecef] via-[#fffaf6] to-[#e7f0e8] p-6 sm:p-8">
      <h2 className="font-serif text-3xl text-[#3a332e]">Your Month in a Few Words 🌸</h2>
      <div className="mt-4 space-y-3 text-lg leading-relaxed text-[#3a332e]">
        <p>You checked in {monthEntries.length} {monthEntries.length === 1 ? "time" : "times"} this {monthName}.</p>
        {common ? <p>{common.emoji} {common.name} was your most frequent mood.</p> : null}
        <p>You had {calm} calm {calm === 1 ? "day" : "days"} and a {streak}-day check-in streak.</p>
        <p>You&apos;ve made space to notice your feelings — and that&apos;s something worth celebrating.</p>
      </div>
    </section>
  );
}

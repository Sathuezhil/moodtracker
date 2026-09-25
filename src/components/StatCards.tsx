import { currentStreak, difficultDays, longestStreak, mostCommonMood, countMood } from "@/lib/stats";
import type { MoodEntry } from "@/lib/types";

export function StatCards({ entries }: { entries: MoodEntry[] }) {
  const common = mostCommonMood(entries);
  const streak = currentStreak(entries);
  const longest = longestStreak(entries);
  const cards = [
    { label: "Total check-ins", value: String(entries.length), hint: "Days you showed up" },
    { label: "Most common mood", value: common ? `${common.emoji} ${common.name}` : "—", hint: "This look back" },
    { label: "Happy days", value: String(countMood(entries, "happy")), hint: "😊 kept so far" },
    { label: "Calm days", value: String(countMood(entries, "calm")), hint: "😌 kept so far" },
    { label: "Difficult days", value: String(difficultDays(entries)), hint: "Sad or angry days" },
    { label: "Current streak", value: `${streak} ${streak === 1 ? "day" : "days"}`, hint: "Checking in, gently" },
    { label: "Longest streak", value: `${longest} ${longest === 1 ? "day" : "days"}`, hint: "Your longest run" },
  ];

  return (
    <section aria-label="Mood statistics">
      <h2 className="font-serif text-3xl text-[#3a332e]">Your Month in Emotions</h2>
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-[1.5rem] border border-white/80 bg-white/80 p-4 shadow-[0_12px_30px_rgba(90,62,54,0.05)]"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-[#7c7168]">
              {card.label}
            </p>
            <p className="mt-3 font-serif text-2xl text-[#3a332e]">{card.value}</p>
            <p className="mt-1 text-xs text-[#8a7e76]">{card.hint}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

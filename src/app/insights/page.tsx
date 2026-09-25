"use client";

import { LoadingState } from "@/components/LoadingState";
import { MonthReflection } from "@/components/MonthReflection";
import { MonthlyTrend } from "@/components/MonthlyTrend";
import { MoodDistribution } from "@/components/MoodDistribution";
import { StatCards } from "@/components/StatCards";
import { StreakPanel } from "@/components/StreakBadges";
import { WeeklyChart } from "@/components/WeeklyChart";
import { useMoods } from "@/context/MoodContext";

export default function InsightsPage() {
  const { entries, ready } = useMoods();

  return (
    <div className="space-y-8">
      <header className="px-1">
        <h1 className="font-serif text-4xl text-[#3a332e] sm:text-5xl">
          Patterns in your days
        </h1>
        <p className="mt-2 max-w-xl text-[#5c534c]">
          Nothing to optimize. Just a softer way to see how you have been.
        </p>
      </header>
      {!ready ? (
        <LoadingState />
      ) : entries.length === 0 ? (
        <section className="rounded-[2rem] bg-white/75 px-6 py-12 text-center">
          <p className="text-4xl" aria-hidden="true">📊</p>
          <h2 className="mt-3 font-serif text-3xl text-[#3a332e]">Check in for a few days and your patterns will appear here.</h2>
        </section>
      ) : (
        <>
          <StatCards entries={entries} />
          <WeeklyChart entries={entries} />
          <MonthlyTrend entries={entries} />
          <MoodDistribution entries={entries} />
          <StreakPanel entries={entries} />
          <MonthReflection entries={entries} />
        </>
      )}
    </div>
  );
}

import { Quote } from "lucide-react";
import { quoteForDate } from "@/lib/quotes";

export function DailyQuote() {
  const quote = quoteForDate();

  return (
    <section className="animate-rise rounded-[2rem] bg-gradient-to-br from-[#f8efd0] via-[#fffaf6] to-[#e6def3] px-6 py-8 shadow-[0_16px_40px_rgba(90,62,54,0.05)]">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#8a6a1f]">
        <Quote aria-hidden="true" className="size-4" />
        Today&apos;s note to you
      </p>
      <blockquote className="mt-3 font-serif text-2xl leading-snug text-[#3a332e] sm:text-3xl">
        “{quote}”
      </blockquote>
    </section>
  );
}

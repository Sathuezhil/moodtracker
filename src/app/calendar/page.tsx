import { Suspense } from "react";
import { CalendarView } from "@/components/CalendarView";
import { LoadingState } from "@/components/LoadingState";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <header className="px-1">
        <h1 className="font-serif text-4xl text-[#3a332e] sm:text-5xl">
          Your month, softly marked
        </h1>
        <p className="mt-2 max-w-xl text-[#5c534c]">
          Each saved feeling leaves a small trace on the day it belonged to.
        </p>
      </header>
      <Suspense fallback={<LoadingState />}>
        <CalendarView />
      </Suspense>
    </div>
  );
}

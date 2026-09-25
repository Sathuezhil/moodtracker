export function LoadingState() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <p className="text-sm text-[#7c7168]">Opening your journal…</p>
      <div className="h-44 animate-pulse rounded-[2rem] bg-white/70" />
      <div className="h-28 animate-pulse rounded-[2rem] bg-white/60" />
    </div>
  );
}

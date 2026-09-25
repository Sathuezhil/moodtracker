export const QUOTES = [
  "Be gentle with yourself today.",
  "Your feelings are valid.",
  "Small moments can make a beautiful day.",
  "You don't have to be perfect to be at peace.",
  "Rest is part of growing.",
  "Notice one soft thing about today.",
  "It's okay to feel more than one thing.",
  "You are allowed to take up space.",
  "Progress can look like a quiet day.",
  "Breathe. You are already here.",
  "Kindness toward yourself changes the day.",
  "Let today be enough.",
  "Your story is still unfolding.",
  "Soft days count too.",
] as const;

export function quoteForDate(date = new Date()): string {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (date.getTime() - start.getTime()) / 86_400_000,
  );
  return QUOTES[((dayOfYear % QUOTES.length) + QUOTES.length) % QUOTES.length];
}

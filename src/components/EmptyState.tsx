import Link from "next/link";

type EmptyStateProps = {
  action?: "scroll" | "link";
};

export function EmptyState({ action = "scroll" }: EmptyStateProps) {
  const className =
    "inline-flex rounded-full bg-[#3a332e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2c2724]";

  return (
    <section className="animate-rise rounded-[2rem] border border-white/80 bg-white/75 px-6 py-12 text-center shadow-[0_16px_50px_rgba(90,62,54,0.06)]">
      <p className="text-4xl" aria-hidden="true">
        🌱
      </p>
      <h2 className="mt-4 font-serif text-3xl text-[#3a332e]">
        Your mood journey starts here.
      </h2>
      <p className="mx-auto mt-3 max-w-md text-[#5c534c]">
        Check in today and start building your personal mood history.
      </p>
      <div className="mt-6">
        {action === "scroll" ? (
          <a href="#check-in" className={className}>
            Add Today&apos;s Mood
          </a>
        ) : (
          <Link href="/#check-in" className={className}>
            Add Today&apos;s Mood
          </Link>
        )}
      </div>
    </section>
  );
}

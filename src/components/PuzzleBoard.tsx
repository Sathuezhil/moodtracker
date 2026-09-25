"use client";

import { useEffect, useState } from "react";
import { formatLong, formatMonthDay, todayKey } from "@/lib/dates";
import { ImagePuzzle } from "@/components/ImagePuzzle";
import {
  answersMatch,
  isPuzzleType,
  puzzleById,
  puzzleForType,
  puzzleNumber,
  sequenceLabel,
  TYPE_CHOICES,
  TYPE_LABELS,
  type Puzzle,
  type PuzzleType,
} from "@/lib/puzzles";
import {
  accuracy,
  choosePuzzleType,
  completePuzzle,
  completedCount,
  correctCount,
  currentPuzzleStreak,
  loadPuzzleState,
  longestPuzzleStreak,
  recordForDate,
  savePuzzleState,
  streakTitle,
  totalPoints,
  type PuzzleRecord,
  type PuzzleState,
} from "@/lib/puzzle-storage";

export function PuzzleBoard() {
  const [dateKey, setDateKey] = useState("");
  const [state, setState] = useState<PuzzleState | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);
  const [round, setRound] = useState(0);

  useEffect(() => {
    const today = todayKey();
    // Puzzle progress lives in the browser and is read after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDateKey(today);
    setState(loadPuzzleState());
  }, []);

  if (!dateKey || !state) {
    return <p className="text-sm text-[#7c7168]">Opening today&apos;s puzzle…</p>;
  }

  const todayRecord = recordForDate(state, dateKey);
  const chosen = state.choices[dateKey] ?? (todayRecord ? puzzleById(todayRecord.puzzleId)?.type : undefined);
  const today = chosen && isPuzzleType(chosen) ? puzzleForType(dateKey, chosen) : null;
  const past = [...state.records].filter((record) => record.date !== dateKey).sort((a, b) => b.date.localeCompare(a.date));
  const viewed = viewing ? state.records.find((record) => record.date === viewing) ?? null : null;
  const streak = currentPuzzleStreak(state);
  const longest = longestPuzzleStreak(state);
  const points = totalPoints(state);

  function commit(next: PuzzleState) {
    savePuzzleState(next);
    setState(next);
  }

  return (
    <div className="space-y-8">
      <header className="px-1">
        <h1 className="font-serif text-4xl text-[#3a332e] sm:text-5xl">Today&apos;s Little Challenge 🧩</h1>
        <p className="mt-2 max-w-xl text-lg text-[#5c534c]">Take a tiny break and give your brain a little workout.</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Today" value={formatMonthDay(dateKey)} />
        <Stat label="Puzzle" value={`#${puzzleNumber(dateKey)}`} />
        <Stat label="Difficulty" value={today ? capitalize(today.difficulty) : "Your pick"} />
        <Stat label="Streak" value={streakTitle(streak)} />
      </section>

      <TypePicker
        selected={chosen && isPuzzleType(chosen) ? chosen : null}
        onChoose={(type) => {
          const next = puzzleForType(dateKey, type);
          window.sessionStorage.removeItem(`moodly.puzzle.seen.${next.id}`);
          setRound((value) => value + 1);
          commit(choosePuzzleType(state, dateKey, type));
        }}
      />
      {today ? (
        <PlayCard
          key={`${today.id}-${round}`}
          puzzle={today}
          dateKey={dateKey}
          round={round}
          alreadyScored={Boolean(todayRecord)}
          onRefresh={() => {
            window.sessionStorage.removeItem(`moodly.puzzle.seen.${today.id}`);
            setRound((value) => value + 1);
          }}
          onFinish={(record) => {
            if (todayRecord) return;
            commit(completePuzzle(state, record));
          }}
        />
      ) : null}

      <section aria-label="Puzzle statistics">
        <h2 className="font-serif text-3xl text-[#3a332e]">Your puzzle stats</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
          <Stat label="Completed" value={String(completedCount(state))} />
          <Stat label="Total points" value={String(points)} />
          <Stat label="Current streak" value={`${streak} ${streak === 1 ? "day" : "days"}`} />
          <Stat label="Longest streak" value={`${longest} ${longest === 1 ? "day" : "days"}`} />
          <Stat label="Correct answers" value={String(correctCount(state))} />
          <Stat label="Accuracy" value={`${accuracy(state)}%`} />
        </div>
      </section>

      <section>
        <h2 className="font-serif text-3xl text-[#3a332e]">Previous Challenges</h2>
        {past.length === 0 ? (
          <p className="mt-3 rounded-[2rem] bg-white/75 px-6 py-8 text-[#5c534c]">Finished puzzles will gather here, one quiet day at a time.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {past.map((record) => {
              const puzzle = puzzleById(record.puzzleId) ?? puzzleForType(record.date, "word-scramble");
              return (
                <li key={record.date}>
                  <button
                    type="button"
                    onClick={() => setViewing(record.date === viewing ? null : record.date)}
                    className="flex w-full items-center justify-between gap-3 rounded-[1.5rem] bg-white/80 px-4 py-4 text-left"
                  >
                    <span>
                      <span className="block font-semibold text-[#3a332e]">{formatMonthDay(record.date)}</span>
                      <span className="mt-1 block text-sm text-[#5c534c]">🧩 {TYPE_LABELS[puzzle.type]}</span>
                    </span>
                    <span className="text-right text-sm font-semibold text-[#5c534c]">
                      {record.correct ? "✓ Completed" : "Finished"}
                      <span className="mt-1 block">+{record.points} points</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {viewed ? <HistoryDetail date={viewed.date} record={viewed} /> : null}
      </section>
    </div>
  );
}

function TypePicker({ selected, onChoose }: { selected: PuzzleType | null; onChoose: (type: PuzzleType) => void }) {
  return (
    <section className="rounded-[2rem] bg-white/80 p-5 sm:p-8">
      <h2 className="font-serif text-3xl text-[#3a332e]">Choose a puzzle</h2>
      <p className="mt-2 text-[#5c534c]">Every type is here. Pick one and play.</p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {TYPE_CHOICES.map((choice) => (
          <button
            key={choice.type}
            type="button"
            aria-pressed={selected === choice.type}
            onClick={() => onChoose(choice.type)}
            className={`min-h-16 rounded-2xl px-3 text-lg font-semibold ${selected === choice.type ? "bg-[#3a332e] text-white" : "bg-[#f6eee8] text-[#3a332e]"}`}
          >
            {choice.emoji} {choice.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function PlayCard({
  puzzle,
  dateKey,
  round,
  alreadyScored,
  onFinish,
  onRefresh,
}: {
  puzzle: Puzzle;
  dateKey: string;
  round: number;
  alreadyScored: boolean;
  onFinish: (record: PuzzleRecord) => void;
  onRefresh: () => void;
}) {
  const [given, setGiven] = useState("");
  const [hintOpen, setHintOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [memoryAsk, setMemoryAsk] = useState(false);
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (puzzle.type !== "memory") return;
    const seenKey = `moodly.puzzle.seen.${puzzle.id}`;
    if (window.sessionStorage.getItem(seenKey) === "1") {
      // The symbols were already hidden in this tab.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMemoryAsk(true);
      return;
    }
    if (count <= 0) {
      window.sessionStorage.setItem(seenKey, "1");
      setMemoryAsk(true);
      return;
    }
    const timer = window.setTimeout(() => setCount((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [count, puzzle.id, puzzle.type]);

  function finish(value: string) {
    const correct = answersMatch(puzzle, value);
    if (!correct && !puzzle.singleAttempt) {
      setMessage("Not quite! Give it another try.");
      return;
    }
    onFinish({
      date: todayKey(),
      puzzleId: puzzle.id,
      correct,
      usedHint: hintOpen,
      points: correct ? (hintOpen ? puzzle.points / 2 : puzzle.points) : 0,
      given: value,
      reaction: null,
    });
  }

  return (
    <section className="rounded-[2rem] bg-white/80 p-5 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#7c7168]">{TYPE_LABELS[puzzle.type]}</p>
        <button type="button" onClick={onRefresh} className="min-h-11 rounded-full px-3 text-sm font-semibold text-[#8a4454]">
          Refresh
        </button>
      </div>
      <h2 className="mt-2 font-serif text-3xl text-[#3a332e]">{puzzle.question}</h2>
      {alreadyScored ? <p className="mt-2 text-sm text-[#7c7168]">Today&apos;s points are already saved. This round is just for fun.</p> : null}
      {puzzle.type === "image" ? (
        <ImagePuzzle dateKey={dateKey} round={round} scene={puzzle.scene ?? "bloom"} hintOpen={hintOpen} onSolved={() => finish("picture")} />
      ) : (
        <Prompt puzzle={puzzle} memoryAsk={memoryAsk} count={count} />
      )}
      {puzzle.type === "image" || (puzzle.type === "memory" && !memoryAsk) ? null : (
        <AnswerControls puzzle={puzzle} given={given} setGiven={setGiven} onSubmit={finish} />
      )}
      {puzzle.hint ? (
        <div className="mt-5">
          <button type="button" onClick={() => setHintOpen(true)} className="min-h-12 rounded-full bg-[#f6eee8] px-5 text-base font-semibold">
            💡 Need a hint?
          </button>
          {hintOpen ? <p className="mt-3 text-[#5c534c]">{puzzle.hint} Using a hint changes a correct answer to +5 points.</p> : null}
        </div>
      ) : null}
      {message ? <p role="status" className="mt-4 font-semibold text-[#8a4454]">{message}</p> : null}
    </section>
  );
}

function Prompt({ puzzle, memoryAsk, count }: { puzzle: Puzzle; memoryAsk: boolean; count: number }) {
  const prompt = sequenceLabel(puzzle);
  if (puzzle.type === "word-scramble" && puzzle.scrambled) {
    return <p className="mt-6 text-center font-serif text-3xl tracking-[0.35em] text-[#3a332e]">{puzzle.scrambled.split("").join(" ")}</p>;
  }
  if (prompt) return <p className="mt-6 text-center font-serif text-3xl text-[#3a332e]">{prompt}</p>;
  if (puzzle.type === "memory" && puzzle.symbols) {
    if (!memoryAsk) {
      return (
        <div className="mt-6 text-center">
          <p className="text-sm font-semibold text-[#7c7168]">Look closely · {count}</p>
          <p className="mt-4 text-4xl leading-relaxed">{puzzle.symbols.join("  ")}</p>
        </div>
      );
    }
    return <p className="mt-6 text-center text-[#5c534c]">The symbols are hidden. Which one was shown?</p>;
  }
  return null;
}

function AnswerControls({
  puzzle,
  given,
  setGiven,
  onSubmit,
}: {
  puzzle: Puzzle;
  given: string;
  setGiven: (value: string) => void;
  onSubmit: (value: string) => void;
}) {
  if (puzzle.type === "odd-one-out" && puzzle.items) {
    return (
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {puzzle.items.map((item, index) => (
          <button key={`${item}-${index}`} type="button" onClick={() => onSubmit(item)} className="grid size-16 place-items-center rounded-2xl bg-[#f6eee8] text-3xl" aria-label={`Choose ${item}`}>
            {item}
          </button>
        ))}
      </div>
    );
  }
  if (puzzle.options.length > 0) {
    return (
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {puzzle.options.map((option) => (
          <button key={option} type="button" onClick={() => onSubmit(option)} className="min-h-14 rounded-2xl bg-[#f6eee8] px-4 text-lg font-semibold text-[#3a332e]">
            {option}
          </button>
        ))}
      </div>
    );
  }
  return (
    <form
      className="mt-6 flex flex-col gap-3 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        if (!given.trim()) return;
        onSubmit(given);
      }}
    >
      <label className="sr-only" htmlFor="puzzle-answer">Your answer</label>
      <input
        id="puzzle-answer"
        value={given}
        onChange={(event) => setGiven(event.target.value)}
        autoComplete="off"
        className="min-h-14 flex-1 rounded-2xl border border-[#eadfd6] bg-[#fffaf6] px-4 text-lg"
      />
      <button type="submit" className="min-h-14 rounded-full bg-[#3a332e] px-6 text-base font-semibold text-white">
        Submit
      </button>
    </form>
  );
}

function HistoryDetail({ date, record }: { date: string; record: PuzzleRecord }) {
  const puzzle = puzzleById(record.puzzleId) ?? puzzleForType(date, "word-scramble");
  return (
    <article className="mt-4 rounded-[2rem] bg-white/80 p-5">
      <h3 className="font-serif text-2xl text-[#3a332e]">{formatLong(date)}</h3>
      <p className="mt-1 text-sm text-[#7c7168]">{TYPE_LABELS[puzzle.type]} · {capitalize(puzzle.difficulty)}</p>
      <p className="mt-4 font-semibold text-[#3a332e]">{puzzle.question}</p>
      <p className="mt-2 text-[#5c534c]">{sequenceLabel(puzzle) || puzzle.scrambled?.split("").join(" ") || puzzle.items?.join(" ") || ""}</p>
      <p className="mt-3 text-[#3a332e]">Your answer: {record.given || "—"}</p>
      <p className="mt-1 text-[#3a332e]">Correct answer: {puzzle.answer}</p>
      <p className="mt-2 text-[#5c534c]">{puzzle.explanation}</p>
      <p className="mt-3 text-sm font-semibold text-[#7c7168]">This day already awarded +{record.points} points.</p>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[1.5rem] bg-white/80 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[#7c7168]">{label}</p>
      <p className="mt-2 font-serif text-xl text-[#3a332e]">{value}</p>
    </article>
  );
}

function capitalize(value: string): string {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

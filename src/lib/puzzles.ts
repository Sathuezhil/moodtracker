import { parseDateKey } from "@/lib/dates";

export type PuzzleType =
  | "word-scramble"
  | "number-pattern"
  | "odd-one-out"
  | "memory"
  | "emoji"
  | "riddle"
  | "image";

export type Difficulty = "easy" | "medium" | "hard";

export type Puzzle = {
  id: string;
  type: PuzzleType;
  difficulty: Difficulty;
  question: string;
  answer: string;
  aliases: string[];
  options: string[];
  hint: string;
  explanation: string;
  points: number;
  singleAttempt: boolean;
  scrambled?: string;
  items?: string[];
  symbols?: string[];
  scene?: string;
};

export const TYPE_LABELS: Record<PuzzleType, string> = {
  "word-scramble": "Word Scramble",
  "number-pattern": "Number Pattern",
  "odd-one-out": "Odd One Out",
  memory: "Memory Challenge",
  emoji: "Emoji Puzzle",
  riddle: "Riddle",
  image: "Image Puzzle",
};

export const TYPE_CHOICES: { type: PuzzleType; emoji: string; label: string }[] = [
  { type: "word-scramble", emoji: "🔤", label: "Word" },
  { type: "number-pattern", emoji: "🔢", label: "Number" },
  { type: "image", emoji: "🖼️", label: "Image" },
  { type: "odd-one-out", emoji: "👀", label: "Odd one out" },
  { type: "memory", emoji: "💭", label: "Memory" },
  { type: "emoji", emoji: "😊", label: "Emoji" },
  { type: "riddle", emoji: "💬", label: "Riddle" },
];

const EPOCH = Date.UTC(2026, 0, 1);

function puzzle(
  id: string,
  type: PuzzleType,
  difficulty: Difficulty,
  question: string,
  answer: string,
  extra: Partial<Puzzle> = {},
): Puzzle {
  return {
    id,
    type,
    difficulty,
    question,
    answer,
    aliases: extra.aliases ?? [],
    options: extra.options ?? [],
    hint: extra.hint ?? "",
    explanation: extra.explanation ?? "",
    points: 10,
    singleAttempt: extra.singleAttempt ?? false,
    scrambled: extra.scrambled,
    items: extra.items,
    symbols: extra.symbols,
    scene: extra.scene,
  };
}

export const PUZZLES: Puzzle[] = [
  puzzle("emoji-001", "emoji", "easy", "What phrase does this represent?", "Believe", {
    options: ["Believe", "Beehive", "Leaflet", "Honey"],
    hint: "Say the pictures out loud.",
    explanation: "A bee plus a leaf sounds like “believe.”",
  }),
  puzzle("riddle-001", "riddle", "easy", "I have keys but no locks. I have space but no room. What am I?", "Keyboard", {
    aliases: ["A keyboard", "Computer keyboard"],
    hint: "You use it to type.",
    explanation: "A keyboard has keys and a space bar.",
  }),
  puzzle("odd-001", "odd-one-out", "easy", "Which one is different?", "🍌", {
    items: ["🍎", "🍎", "🍎", "🍌", "🍎"],
    hint: "Four of these belong in the same fruit bowl.",
    explanation: "The banana is the only one that is not an apple.",
  }),
  puzzle("word-001", "word-scramble", "easy", "Unscramble this word.", "FLOWER", {
    scrambled: "REWOFL",
    hint: "Something that blooms.",
    explanation: "Flower is a bloom you might keep in a little vase.",
  }),
  puzzle("number-001", "number-pattern", "easy", "What comes next?", "32", {
    options: ["12", "24", "32", "36"],
    hint: "Each number is twice the one before it.",
    explanation: "2, 4, 8, 16, then 32. Each step doubles.",
  }),
  puzzle("memory-001", "memory", "easy", "Which symbol was shown?", "🌙", {
    symbols: ["🌸", "🌿", "🌙", "☀️", "💛", "🕊️"],
    options: ["🌙", "🍎", "🎹", "🚗"],
    hint: "It shows up when the day gets quiet.",
    explanation: "The moon was in the set. The other choices were not.",
    singleAttempt: true,
  }),
  puzzle("emoji-002", "emoji", "easy", "What phrase does this represent?", "After the rain", {
    options: ["After the rain", "Storm cloud", "Puddle jump", "Rainbow road"],
    hint: "One picture often follows the other.",
    explanation: "Rain followed by a rainbow is the calm after the rain.",
  }),
  puzzle("riddle-002", "riddle", "easy", "What has hands but cannot clap?", "Clock", {
    aliases: ["A clock"],
    hint: "It hangs on a wall and tells you the hour.",
    explanation: "A clock has hands that point to the time.",
  }),
  puzzle("odd-002", "odd-one-out", "easy", "Which one is different?", "🌼", {
    items: ["🌸", "🌸", "🌸", "🌼", "🌸"],
    hint: "Look for the bloom with a different shape.",
    explanation: "The daisy is the only one that is not a cherry blossom.",
  }),
  puzzle("word-002", "word-scramble", "easy", "Unscramble this word.", "CALM", {
    scrambled: "MLAC",
    hint: "A soft, quiet feeling.",
    explanation: "Calm is the gentle mood this little space is made for.",
  }),
  puzzle("number-002", "number-pattern", "easy", "What comes next?", "15", {
    options: ["13", "15", "18", "21"],
    hint: "Count by threes.",
    explanation: "3, 6, 9, 12, then 15.",
  }),
  puzzle("memory-002", "memory", "easy", "Which symbol was shown?", "🌿", {
    symbols: ["🌷", "🌿", "☁️", "✨", "🍵", "📖"],
    options: ["🌿", "🎸", "🚀", "🍩"],
    hint: "It belongs in a garden.",
    explanation: "The leafy sprig was shown. The others were not.",
    singleAttempt: true,
  }),
  puzzle("emoji-003", "emoji", "medium", "What phrase does this represent?", "Bookworm", {
    options: ["Bookworm", "Library", "Bookmark", "Caterpillar"],
    hint: "Someone who loves to read.",
    explanation: "A book plus a bug is a bookworm.",
  }),
  puzzle("riddle-003", "riddle", "medium", "What gets wetter the more it dries?", "Towel", {
    aliases: ["A towel"],
    hint: "You reach for it after a shower.",
    explanation: "A towel dries you and gets wetter itself.",
  }),
  puzzle("odd-003", "odd-one-out", "medium", "Which one is different?", "😌", {
    items: ["😊", "😊", "😌", "😊", "😊"],
    hint: "One face is quieter than the others.",
    explanation: "The calm face is the only one that is not a happy smile.",
  }),
  puzzle("word-003", "word-scramble", "medium", "Unscramble this word.", "GENTLE", {
    scrambled: "ELTNEG",
    hint: "Soft, kind, and unhurried.",
    explanation: "Gentle describes a light touch or a kind word.",
  }),
  puzzle("number-003", "number-pattern", "medium", "What comes next?", "8", {
    options: ["6", "7", "8", "9"],
    hint: "Add the two numbers before it.",
    explanation: "1, 1, 2, 3, 5, then 8. This is the Fibonacci pattern.",
  }),
  puzzle("memory-003", "memory", "medium", "Which symbol was shown?", "🍵", {
    symbols: ["🕯️", "🍵", "🫧", "🧸", "🌙", "🧦", "🌼"],
    options: ["🍵", "🏀", "🚁", "🧲"],
    hint: "You might hold it with both hands.",
    explanation: "The teacup was in the set.",
    singleAttempt: true,
  }),
  puzzle("emoji-004", "emoji", "medium", "What phrase does this represent?", "Night sky", {
    options: ["Night sky", "Morning", "Eclipse", "Lantern"],
    hint: "Look up after sunset.",
    explanation: "A moon and a star belong to the night sky.",
  }),
  puzzle("riddle-004", "riddle", "medium", "I have cities, but no houses. I have mountains, but no trees. What am I?", "Map", {
    aliases: ["A map"],
    hint: "You unfold it before a trip.",
    explanation: "A map shows cities and mountains without being a place itself.",
  }),
  puzzle("odd-004", "odd-one-out", "medium", "Which one is different?", "⭐", {
    items: ["🌙", "🌙", "🌙", "⭐", "🌙"],
    hint: "One of these twinkles.",
    explanation: "The star is the only one that is not a moon.",
  }),
  puzzle("word-004", "word-scramble", "medium", "Unscramble this word.", "BREATHE", {
    scrambled: "TAERBHE",
    hint: "In for four, out for six.",
    explanation: "Breathe is the little pause in the breathing exercise.",
  }),
  puzzle("number-004", "number-pattern", "medium", "What comes next?", "80", {
    options: ["45", "60", "80", "100"],
    hint: "Double it again.",
    explanation: "5, 10, 20, 40, then 80.",
  }),
  puzzle("memory-004", "memory", "medium", "Which symbol was shown?", "🦋", {
    symbols: ["🦋", "🌺", "🐚", "🍯", "🌈", "🦢", "🍀", "🪻"],
    options: ["🦋", "🎺", "🛹", "🧪"],
    hint: "It has wings and likes flowers.",
    explanation: "The butterfly was shown with the other gentle symbols.",
    singleAttempt: true,
  }),
  puzzle("emoji-005", "emoji", "medium", "What phrase does this represent?", "Time to sleep", {
    options: ["Time to sleep", "Alarm clock", "Daydream", "Running late"],
    hint: "The second picture is what you do at night.",
    explanation: "A clock plus sleep means it is time to rest.",
  }),
  puzzle("riddle-005", "riddle", "hard", "What has a head and a tail but no body?", "Coin", {
    aliases: ["A coin"],
    hint: "You might find it in a pocket.",
    explanation: "A coin has a head side and a tail side.",
  }),
  puzzle("odd-005", "odd-one-out", "easy", "Which one is different?", "🐱", {
    items: ["🐶", "🐶", "🐱", "🐶", "🐶"],
    hint: "One of them meows.",
    explanation: "The cat is the only one that is not a dog.",
  }),
  puzzle("word-005", "word-scramble", "hard", "Unscramble this word.", "SUNLIGHT", {
    scrambled: "THGILNUS",
    hint: "It warms the afternoon.",
    explanation: "Sunlight is the warm brightness of the sun.",
  }),
  puzzle("number-005", "number-pattern", "medium", "What comes next?", "17", {
    options: ["15", "16", "17", "20"],
    hint: "The gap grows by one each time.",
    explanation: "2, 3, 5, 8, 12, then 17. The steps are +1, +2, +3, +4, +5.",
  }),
  puzzle("memory-005", "memory", "hard", "Which symbol was shown?", "🐚", {
    symbols: ["🐚", "🪸", "🫧", "🐠", "🌊", "⚓", "🏝️"],
    options: ["🐚", "🌵", "🎻", "🪐"],
    hint: "You might find it on a beach.",
    explanation: "The shell was part of the seaside set.",
    singleAttempt: true,
  }),
  puzzle("emoji-006", "emoji", "hard", "What phrase does this represent?", "Once in a blue moon", {
    options: ["Once in a blue moon", "Full moon", "Blue sky", "Midnight"],
    hint: "It means something very rare.",
    explanation: "The number one, a blue circle, and a moon spell the phrase.",
  }),
  puzzle("riddle-006", "riddle", "hard", "The more you take, the more you leave behind. What are they?", "Footsteps", {
    aliases: ["Footstep", "Steps", "Footprints"],
    hint: "They follow you on a walk.",
    explanation: "Each step you take leaves another footstep behind.",
  }),
  puzzle("odd-006", "odd-one-out", "hard", "Which one is different?", "🫖", {
    items: ["☕", "☕", "🫖", "☕", "☕"],
    hint: "One of these pours for everyone else.",
    explanation: "The teapot is the only one that is not a cup.",
  }),
  puzzle("word-006", "word-scramble", "hard", "Unscramble this word.", "LAVENDER", {
    scrambled: "DRENLEVA",
    hint: "A purple theme in this app.",
    explanation: "Lavender is both a flower and one of the Moodly themes.",
  }),
  puzzle("number-006", "number-pattern", "hard", "What comes next?", "25", {
    options: ["20", "24", "25", "36"],
    hint: "Think of square numbers.",
    explanation: "1, 4, 9, 16, then 25. Those are 1² through 5².",
  }),
  puzzle("image-001", "image", "easy", "Put the 10 pieces back together.", "picture", {
    scene: "bloom",
    hint: "The soft pink bloom sits in the middle.",
    explanation: "You joined the garden picture back into one image.",
  }),
  puzzle("image-002", "image", "easy", "Put the 10 pieces back together.", "picture", {
    scene: "nature",
    hint: "Green hills sit under a pale sky.",
    explanation: "You joined the calm nature picture back into one image.",
  }),
  puzzle("image-003", "image", "medium", "Put the 10 pieces back together.", "picture", {
    scene: "sunshine",
    hint: "The sun is in the upper left.",
    explanation: "You joined the sunshine picture back into one image.",
  }),
  puzzle("image-004", "image", "medium", "Put the 10 pieces back together.", "picture", {
    scene: "lavender",
    hint: "A purple evening sky sits over a small moon.",
    explanation: "You joined the lavender picture back into one image.",
  }),
  puzzle("memory-006", "memory", "hard", "Which symbol was shown?", "🪻", {
    symbols: ["🪻", "🕯️", "📜", "🪶", "🕰️", "💠", "🦢", "🔔"],
    options: ["🪻", "🚜", "🎮", "🍿"],
    hint: "It is a purple flower.",
    explanation: "The lavender sprig was in the set.",
    singleAttempt: true,
  }),
];

export function puzzleNumber(dateKey: string): number {
  const date = parseDateKey(dateKey);
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((utc - EPOCH) / 86400000) + 1;
}

export function puzzleForDate(dateKey: string): Puzzle {
  const index = ((puzzleNumber(dateKey) - 1) % PUZZLES.length + PUZZLES.length) % PUZZLES.length;
  return PUZZLES[index];
}

export function puzzleForType(dateKey: string, type: PuzzleType): Puzzle {
  const pool = PUZZLES.filter((item) => item.type === type);
  const index = ((puzzleNumber(dateKey) - 1) % pool.length + pool.length) % pool.length;
  return pool[index];
}

export function puzzleById(id: string): Puzzle | null {
  return PUZZLES.find((item) => item.id === id) ?? null;
}

export function isPuzzleType(value: string): value is PuzzleType {
  return value in TYPE_LABELS;
}

export function sequenceLabel(item: Puzzle): string {
  if (item.type === "number-pattern" && item.id === "number-001") return "2, 4, 8, 16, ?";
  if (item.type === "number-pattern" && item.id === "number-002") return "3, 6, 9, 12, ?";
  if (item.type === "number-pattern" && item.id === "number-003") return "1, 1, 2, 3, 5, ?";
  if (item.type === "number-pattern" && item.id === "number-004") return "5, 10, 20, 40, ?";
  if (item.type === "number-pattern" && item.id === "number-005") return "2, 3, 5, 8, 12, ?";
  if (item.type === "number-pattern" && item.id === "number-006") return "1, 4, 9, 16, ?";
  if (item.type === "emoji" && item.id === "emoji-001") return "🐝 + 🍃";
  if (item.type === "emoji" && item.id === "emoji-002") return "🌧️ + 🌈";
  if (item.type === "emoji" && item.id === "emoji-003") return "📖 + 🐛";
  if (item.type === "emoji" && item.id === "emoji-004") return "🌙 + ⭐";
  if (item.type === "emoji" && item.id === "emoji-005") return "⏰ + 💤";
  if (item.type === "emoji" && item.id === "emoji-006") return "1️⃣ + 🔵 + 🌙";
  return "";
}

export function answersMatch(item: Puzzle, given: string): boolean {
  const normalize = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  const expected = [item.answer, ...item.aliases].map(normalize);
  return expected.includes(normalize(given));
}

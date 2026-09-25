import type { MoodId } from "@/lib/types";

export const SUGGESTIONS: Record<MoodId, string[]> = {
  happy: [
    "Capture this moment",
    "Share your happiness with someone",
    "Do something creative",
    "Write down what feels good right now",
  ],
  calm: [
    "Take a few deep breaths",
    "Enjoy a quiet cup of tea",
    "Spend 10 minutes without your phone",
    "Sit by a window and do nothing for a moment",
  ],
  loved: [
    "Send a kind note to someone you care about",
    "Keep a small reminder of this feeling",
    "Do one gentle thing just for you",
    "Tell yourself what you would tell a friend",
  ],
  okay: [
    "Name one small thing that went fine today",
    "Step outside for a few minutes",
    "Put on a song you already know",
    "Leave one task for tomorrow",
  ],
  sad: [
    "Talk to someone you trust",
    "Take a short walk",
    "Give yourself some quiet time",
    "Wrap up in something warm and rest",
  ],
  angry: [
    "Take a few slow breaths",
    "Step away for a few minutes",
    "Write down what's bothering you",
    "Move your body until the edge softens",
  ],
};

export const AFFIRMATIONS = [
  "Be gentle with yourself today.",
  "You don't have to have everything figured out.",
  "Small progress is still progress.",
  "You deserve moments of peace.",
  "Your feelings are allowed to take up space.",
  "Rest is part of taking care of yourself.",
  "You can begin again as many times as you need.",
  "Soft days still count.",
];

export const NICE_WORDS = [
  "You are allowed to have difficult days.",
  "You've made it through every difficult day so far.",
  "Rest is not wasted time.",
  "Be proud of the little things too.",
  "You don't have to earn a quiet moment.",
  "Being here, and noticing, is already enough.",
  "You can move slowly and still be moving.",
  "Someone is glad you are you, even on ordinary days.",
];

export const CARE_ITEMS = [
  { id: "water", label: "Drink enough water" },
  { id: "walk", label: "Take a short walk" },
  { id: "food", label: "Eat something nourishing" },
  { id: "screen", label: "Take a screen break" },
  { id: "sleep", label: "Get enough sleep" },
  { id: "joy", label: "Do something you enjoy" },
] as const;

export type CareId = (typeof CARE_ITEMS)[number]["id"];

export const JOURNAL_FIELDS = [
  { key: "happened", label: "What happened today?", placeholder: "Write a little about your day..." },
  { key: "smile", label: "What made me smile?", placeholder: "A small moment is enough..." },
  { key: "difficult", label: "What was difficult?", placeholder: "You can set it down here..." },
  { key: "grateful", label: "One thing I'm grateful for", placeholder: "Even something ordinary..." },
  { key: "remember", label: "Something I want to remember", placeholder: "Keep it for later..." },
] as const;

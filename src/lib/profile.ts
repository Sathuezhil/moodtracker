import { isMoodId, type MoodId } from "@/lib/types";

export const PALETTES = [
  { id: "bloom", name: "Soft Bloom", emoji: "🌸" },
  { id: "nature", name: "Calm Nature", emoji: "🌿" },
  { id: "midnight", name: "Midnight", emoji: "🌙" },
  { id: "sunshine", name: "Sunshine", emoji: "☀️" },
  { id: "lavender", name: "Lavender", emoji: "🪻" },
] as const;

export type PaletteId = (typeof PALETTES)[number]["id"];

export type UserProfile = {
  name: string;
  nickname: string;
  birthday: string;
  bio: string;
  favoriteMood: MoodId | "";
  profileImage: string | null;
  theme: PaletteId;
  showGreeting: boolean;
  birthdayMode: boolean;
  memberSince: string;
};

const PROFILE_KEY = "moodly.profile.v1";

export function emptyProfile(today: string): UserProfile {
  return {
    name: "",
    nickname: "",
    birthday: "",
    bio: "",
    favoriteMood: "",
    profileImage: null,
    theme: "bloom",
    showGreeting: true,
    birthdayMode: true,
    memberSince: today,
  };
}

export function displayName(profile: UserProfile): string {
  return profile.nickname.trim() || profile.name.trim();
}

export function initials(profile: UserProfile): string {
  const source = displayName(profile);
  if (!source) return "M";
  return source.slice(0, 1).toUpperCase();
}

export function isPaletteId(value: string): value is PaletteId {
  return PALETTES.some((palette) => palette.id === value);
}

export function loadProfile(today: string): UserProfile {
  const fallback = emptyProfile(today);
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(PROFILE_KEY);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    return {
      name: typeof parsed.name === "string" ? parsed.name.slice(0, 40) : "",
      nickname: typeof parsed.nickname === "string" ? parsed.nickname.slice(0, 24) : "",
      birthday: typeof parsed.birthday === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.birthday) ? parsed.birthday : "",
      bio: typeof parsed.bio === "string" ? parsed.bio.slice(0, 240) : "",
      favoriteMood: typeof parsed.favoriteMood === "string" && isMoodId(parsed.favoriteMood) ? parsed.favoriteMood : "",
      profileImage: typeof parsed.profileImage === "string" && parsed.profileImage.startsWith("data:image/") ? parsed.profileImage : null,
      theme: typeof parsed.theme === "string" && isPaletteId(parsed.theme) ? parsed.theme : "bloom",
      showGreeting: parsed.showGreeting !== false,
      birthdayMode: parsed.birthdayMode !== false,
      memberSince: typeof parsed.memberSince === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.memberSince) ? parsed.memberSince : today,
    };
  } catch {
    return fallback;
  }
}

export function saveProfile(profile: UserProfile): void {
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    throw new Error("Couldn't save your profile. The photo may be too large for this browser.");
  }
}

export function greetingFor(profile: UserProfile, now = new Date()): { title: string; subtitle: string } {
  const name = displayName(profile);
  const hour = now.getHours();
  const birthday = isBirthday(profile, now);
  if (birthday && profile.birthdayMode) {
    return {
      title: name ? `Happy Birthday, ${name}!` : "Happy Birthday!",
      subtitle: "Today is all about you.",
    };
  }
  if (!profile.showGreeting) {
    return {
      title: name ? `Hi, ${name} 💛` : "Check in with yourself 💛",
      subtitle: profile.bio.trim() || "Your little space to understand yourself better.",
    };
  }
  if (hour < 12) {
    return {
      title: name ? `Good morning, ${name} ☀️` : "Good morning 💛",
      subtitle: profile.bio.trim() || "Your little space to understand yourself better.",
    };
  }
  if (hour < 17) {
    return {
      title: name ? `Hope your day is going well, ${name} 💛` : "Hope your day is going well 💛",
      subtitle: profile.bio.trim() || "Take a moment to notice how you feel today.",
    };
  }
  if (hour < 21) {
    return {
      title: name ? `Good evening, ${name} 🌙` : "Good evening 💛",
      subtitle: profile.bio.trim() || "Your little space to understand yourself better.",
    };
  }
  return {
    title: name ? `Take a little time for yourself tonight, ${name} ✨` : "Take a little time for yourself tonight ✨",
    subtitle: profile.bio.trim() || "Soft evenings still count.",
  };
}

export function isBirthday(profile: UserProfile, now = new Date()): boolean {
  if (!profile.birthday) return false;
  const [, month, day] = profile.birthday.split("-").map(Number);
  return now.getMonth() + 1 === month && now.getDate() === day;
}

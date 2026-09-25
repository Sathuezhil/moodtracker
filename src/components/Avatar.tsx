import { initials, type UserProfile } from "@/lib/profile";
import { cn } from "@/lib/cn";

const SIZES = {
  sm: "size-9 text-sm",
  md: "size-14 text-xl",
  lg: "size-28 text-4xl",
};

export function Avatar({
  profile,
  size = "md",
  className,
}: {
  profile: UserProfile;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const label = initials(profile);
  return (
    <span
      className={cn(
        "inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-[#f4d5d8] font-serif text-[#8a4454]",
        SIZES[size],
        className,
      )}
    >
      {profile.profileImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.profileImage} alt="" className="size-full object-cover" />
      ) : (
        <span aria-hidden="true">{label}</span>
      )}
      <span className="sr-only">{profile.name || profile.nickname || "Profile"}</span>
    </span>
  );
}

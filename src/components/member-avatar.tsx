import { cn } from "@/lib/utils";

const TONES = [
  "bg-primary text-primary-foreground",
  "bg-trust text-trust-foreground",
  "bg-teal text-primary-foreground",
  "bg-primary-deep text-primary-foreground",
  "bg-success text-primary-foreground",
] as const;

export function MemberAvatar({
  name,
  tone = 0,
  size = "md",
  className,
}: {
  name: string;
  tone?: 0 | 1 | 2 | 3 | 4;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "h-7 w-7 text-[11px]",
    md: "h-9 w-9 text-sm",
    lg: "h-12 w-12 text-base",
  };
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-display font-bold ring-2 ring-card",
        sizes[size],
        TONES[tone],
        className,
      )}
      title={name}
    >
      {name.slice(0, 1)}
    </span>
  );
}

export function AvatarStack({
  members,
  size = "sm",
}: {
  members: { id: string; name: string; tone: 0 | 1 | 2 | 3 | 4 }[];
  size?: "sm" | "md";
}) {
  return (
    <div className="flex -space-x-2">
      {members.map((m) => (
        <MemberAvatar key={m.id} name={m.name} tone={m.tone} size={size} />
      ))}
    </div>
  );
}

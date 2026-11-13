import { cn, hueFrom, initials } from "@/lib/utils";

const sizes = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
  xl: "size-20 text-2xl",
};

export function Avatar({ name, size = "sm", className }: { name: string; size?: keyof typeof sizes; className?: string }) {
  const h = hueFrom(name);
  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-2 ring-card", sizes[size], className)}
      style={{ background: `hsl(${h} 70% 92%)`, color: `hsl(${h} 55% 30%)` }}
    >
      {initials(name)}
    </span>
  );
}

export function AvatarStack({ names, max = 4, size = "xs" }: { names: string[]; max?: number; size?: keyof typeof sizes }) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return (
    <div className="flex -space-x-1.5" role="img" aria-label={names.join(", ")}>
      {shown.map((n, i) => (
        <Avatar key={`${n}-${i}`} name={n} size={size} />
      ))}
      {rest > 0 && (
        <span className={cn("inline-flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground ring-2 ring-card", sizes[size])}>
          +{rest}
        </span>
      )}
    </div>
  );
}

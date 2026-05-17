import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { icon: 32, fullHeight: 28 },
  md: { icon: 36, fullHeight: 32 },
  lg: { icon: 48, fullHeight: 40 },
} as const;

type LogoProps = {
  variant?: "icon" | "full";
  size?: keyof typeof SIZES;
  showWordmark?: boolean;
  href?: string;
  className?: string;
};

export function Logo({
  variant = "full",
  size = "md",
  showWordmark = true,
  href = "/" as string | undefined,
  className,
}: LogoProps) {
  const dims = SIZES[size];
  const isIconOnly = variant === "icon" || !showWordmark;

  const content = (
    <>
      <Image
        src="/brand/logo-icon.svg"
        alt=""
        width={dims.icon}
        height={dims.icon}
        className="shrink-0 drop-shadow-sm"
        priority
      />
      {!isIconOnly && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-bold tracking-tight text-zinc-900 dark:text-zinc-50",
              size === "lg" ? "text-2xl" : size === "md" ? "text-lg" : "text-base",
            )}
          >
            Care
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              era
            </span>
          </span>
          {size === "lg" && (
            <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
              Career guidance
            </span>
          )}
        </span>
      )}
    </>
  );

  const wrapperClass = cn(
    "inline-flex items-center gap-2.5",
    className,
  );

  if (href && href.length > 0) {
    return (
      <Link href={href} className={wrapperClass} aria-label="Careera home">
        {content}
      </Link>
    );
  }

  return <div className={wrapperClass}>{content}</div>;
}

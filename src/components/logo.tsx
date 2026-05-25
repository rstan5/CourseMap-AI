import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  href?: string;
  size?: "sm" | "md";
}

export function Logo({
  className,
  showText = true,
  href,
  size = "md",
}: LogoProps) {
  const iconSize = size === "sm" ? 36 : 44;

  const content = (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src="/logo.png"
        alt="CourseMap"
        width={iconSize}
        height={iconSize}
        className={cn(
          "shrink-0 rounded-xl object-contain",
          size === "sm" ? "h-9 w-9" : "h-11 w-11"
        )}
        priority
      />
      {showText && (
        <span className="text-xl font-bold text-foreground">CourseMap</span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}

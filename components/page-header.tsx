import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  accent?: "tg" | "ig" | "wa" | "ai" | "primary";
  actions?: React.ReactNode;
  className?: string;
}

const accentBg: Record<string, string> = {
  tg: "bg-tg/10 text-tg",
  ig: "bg-ig/10 text-ig",
  wa: "bg-wa/10 text-wa",
  ai: "bg-ai/10 text-ai",
  primary: "bg-primary/10 text-primary",
};

export function PageHeader({
  title,
  description,
  icon,
  accent = "primary",
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex items-center gap-3.5">
        {icon && (
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl [&_svg]:h-[22px] [&_svg]:w-[22px]",
              accentBg[accent],
            )}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
            {title}
          </h1>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}

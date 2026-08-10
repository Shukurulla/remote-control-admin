import * as React from "react";
import { cn } from "@/lib/utils";
import { actionById } from "@/lib/actions";
import type { ActionId } from "@/lib/types";

const accentClass: Record<string, string> = {
  tg: "bg-tg/10 text-tg",
  ig: "bg-ig/10 text-ig",
  wa: "bg-wa/10 text-wa",
  ai: "bg-ai/10 text-ai",
};

const sizes = {
  sm: "h-8 w-8 rounded-md [&_svg]:h-4 [&_svg]:w-4",
  md: "h-10 w-10 rounded-lg [&_svg]:h-5 [&_svg]:w-5",
  lg: "h-12 w-12 rounded-xl [&_svg]:h-6 [&_svg]:w-6",
};

export function ActionIcon({
  actionId,
  size = "md",
  className,
}: {
  actionId: ActionId;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const action = actionById(actionId);
  if (!action) return null;
  const Icon = action.icon;
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center",
        sizes[size],
        accentClass[action.accent],
        className,
      )}
    >
      <Icon />
    </div>
  );
}

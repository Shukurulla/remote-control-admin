import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  hint?: string;
  tone?: "default" | "success" | "warning" | "destructive" | "primary";
  className?: string;
}

const toneStyles: Record<string, { icon: string; value: string }> = {
  default: { icon: "bg-muted text-muted-foreground", value: "text-foreground" },
  primary: { icon: "bg-primary/10 text-primary", value: "text-foreground" },
  success: { icon: "bg-success/15 text-success", value: "text-success" },
  warning: { icon: "bg-warning/15 text-warning", value: "text-foreground" },
  destructive: {
    icon: "bg-destructive/15 text-destructive",
    value: "text-foreground",
  },
};

export function StatCard({
  label,
  value,
  icon,
  hint,
  tone = "default",
  className,
}: StatCardProps) {
  const styles = toneStyles[tone];
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p
            className={cn(
              "mt-2 text-3xl font-bold tracking-tight tabular-nums",
              styles.value,
            )}
          >
            {value}
          </p>
          {hint && (
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg [&_svg]:h-5 [&_svg]:w-5",
              styles.icon,
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

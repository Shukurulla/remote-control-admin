"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { PROGRESS_STEPS, progressStepIndex } from "@/lib/constants";
import type { ProgressStep, ProgressEntry } from "@/lib/types";
import { Loader2, Check, X, Minus } from "lucide-react";

const VISIBLE_STEPS = PROGRESS_STEPS.filter(
  (s) => s.step !== "failed",
);

interface DeviceProgressProps {
  currentStep?: ProgressStep;
  stepMessage?: string;
  progressHistory?: ProgressEntry[];
}

export function DeviceProgress({
  currentStep,
  stepMessage,
  progressHistory,
}: DeviceProgressProps) {
  if (!currentStep && !progressHistory?.length) {
    return (
      <span className="text-xs text-muted-foreground italic">
        Progress kutilmoqda…
      </span>
    );
  }

  const isFailed = currentStep === "failed";
  const currentIdx = currentStep ? progressStepIndex(currentStep) : -1;

  const failedEntry = progressHistory?.find((e) => e.step === "failed");

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        {VISIBLE_STEPS.map((s, i) => {
          const stepIdx = progressStepIndex(s.step);
          const isDone = currentIdx > stepIdx || currentStep === "completed";
          const isActive = currentIdx === stepIdx && !isFailed;
          const isPast = currentIdx > stepIdx;

          let icon: React.ReactNode;
          if (isDone) {
            icon = <Check className="h-3 w-3" />;
          } else if (isActive) {
            icon = <Loader2 className="h-3 w-3 animate-spin" />;
          } else if (isFailed && stepIdx >= currentIdx) {
            icon = <X className="h-3 w-3" />;
          } else {
            icon = <Minus className="h-3 w-3" />;
          }

          return (
            <React.Fragment key={s.step}>
              {i > 0 && (
                <div
                  className={cn(
                    "h-0.5 w-3 flex-shrink-0 rounded-full transition-colors",
                    isPast || isDone
                      ? "bg-emerald-500"
                      : isFailed && stepIdx >= currentIdx
                        ? "bg-destructive/40"
                        : "bg-muted",
                  )}
                />
              )}
              <div
                title={s.label}
                className={cn(
                  "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] transition-colors",
                  isDone
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : isActive
                      ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                      : isFailed && stepIdx >= currentIdx
                        ? "bg-destructive/15 text-destructive"
                        : "bg-muted text-muted-foreground/50",
                )}
              >
                {icon}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Joriy holat matni */}
      <p
        className={cn(
          "text-[11px] leading-tight truncate max-w-[280px]",
          isFailed
            ? "text-destructive font-medium"
            : currentStep === "completed"
              ? "text-emerald-600 dark:text-emerald-400 font-medium"
              : "text-muted-foreground",
        )}
      >
        {isFailed && failedEntry
          ? failedEntry.message || "Xatolik yuz berdi"
          : stepMessage ||
            PROGRESS_STEPS.find((s) => s.step === currentStep)?.label ||
            ""}
      </p>
    </div>
  );
}

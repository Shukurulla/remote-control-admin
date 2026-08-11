"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  PROGRESS_STEPS,
  progressStepIndex,
  progressStepMeta,
} from "@/lib/constants";
import type { ProgressStep, ProgressEntry } from "@/lib/types";
import { Loader2, Check, X, Minus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const VISIBLE_STEPS = PROGRESS_STEPS.filter((s) => s.step !== "failed");

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
  const isFailed = currentStep === "failed";
  const currentIdx = currentStep ? progressStepIndex(currentStep) : -1;
  const failedEntry = progressHistory?.find((e) => e.step === "failed");

  // Xatolik qaysi bosqichda yuz bergani — history dagi so'nggi bosqich (failed dan oldin)
  const failedAtIdx = React.useMemo(() => {
    if (!isFailed || !progressHistory?.length) return -1;
    const beforeFailed = [...progressHistory]
      .reverse()
      .find((e) => e.step !== "failed");
    return beforeFailed ? progressStepIndex(beforeFailed.step) : -1;
  }, [isFailed, progressHistory]);

  if (!currentStep && !progressHistory?.length) {
    return (
      <span className="text-xs italic text-muted-foreground">
        Progress kutilmoqda…
      </span>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          {VISIBLE_STEPS.map((s, i) => {
            const stepIdx = progressStepIndex(s.step);
            const isDone = currentIdx > stepIdx || currentStep === "completed";
            const isActive = currentIdx === stepIdx && !isFailed;
            const isPast = currentIdx > stepIdx;
            const isFailedStep = isFailed && stepIdx === failedAtIdx + 1;

            let icon: React.ReactNode;
            if (isDone) {
              icon = <Check className="h-3 w-3" />;
            } else if (isActive) {
              icon = <Loader2 className="h-3 w-3 animate-spin" />;
            } else if (isFailedStep) {
              icon = <X className="h-3 w-3" />;
            } else {
              icon = <Minus className="h-3 w-3" />;
            }

            const historyEntry = progressHistory?.find(
              (e) => e.step === s.step,
            );

            return (
              <React.Fragment key={s.step}>
                {i > 0 && (
                  <div
                    className={cn(
                      "h-0.5 w-3 flex-shrink-0 rounded-full transition-colors",
                      isPast || isDone
                        ? "bg-emerald-500"
                        : isFailed && stepIdx > failedAtIdx
                          ? "bg-destructive/40"
                          : "bg-muted",
                    )}
                  />
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "flex h-5 w-5 flex-shrink-0 cursor-help items-center justify-center rounded-full text-[10px] transition-colors",
                        isDone
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : isActive
                            ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                            : isFailedStep
                              ? "bg-destructive/15 text-destructive"
                              : "bg-muted text-muted-foreground/50",
                      )}
                    >
                      {icon}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[260px]">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span>{s.icon}</span>
                        <span className="font-semibold">{s.label}</span>
                      </div>
                      <p className="text-[10.5px] text-muted-foreground">
                        {s.description}
                      </p>
                      {historyEntry?.message && (
                        <p className="pt-1 text-[10.5px] text-foreground">
                          «{historyEntry.message}»
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </React.Fragment>
            );
          })}
        </div>

        {/* Joriy holat matni */}
        <p
          className={cn(
            "max-w-[280px] truncate text-[11px] leading-tight",
            isFailed
              ? "font-medium text-destructive"
              : currentStep === "completed"
                ? "font-medium text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground",
          )}
        >
          {isFailed && failedEntry
            ? failedEntry.message || "Xatolik yuz berdi"
            : stepMessage ||
              progressStepMeta(currentStep as ProgressStep)?.label ||
              ""}
        </p>
      </div>
    </TooltipProvider>
  );
}

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  PROGRESS_STEPS,
  progressStepIndex,
  progressStepMeta,
} from "@/lib/constants";
import type { ProgressStep, ProgressEntry } from "@/lib/types";
import {
  Check,
  Loader2,
  X,
  Clock,
  Info,
  AlertTriangle,
  CircleDashed,
} from "lucide-react";

interface DeviceProgressTimelineProps {
  currentStep?: ProgressStep;
  progressHistory?: ProgressEntry[];
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  return `${hh}:${mm}:${ss}.${ms}`;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)} s`;
  const m = Math.floor(s / 60);
  const rs = Math.round(s - m * 60);
  return `${m}m ${rs}s`;
}

export function DeviceProgressTimeline({
  currentStep,
  progressHistory,
}: DeviceProgressTimelineProps) {
  const history = React.useMemo(
    () => progressHistory ?? [],
    [progressHistory],
  );
  const isFailed =
    currentStep === "failed" || history.some((h) => h.step === "failed");
  const isCompleted = currentStep === "completed";
  const currentIdx = currentStep ? progressStepIndex(currentStep) : -1;

  // Xatolik qaysi bosqichda yuz bergan
  const failedAtIdx = React.useMemo(() => {
    if (!isFailed) return -1;
    const beforeFailed = [...history].reverse().find((e) => e.step !== "failed");
    return beforeFailed ? progressStepIndex(beforeFailed.step) : -1;
  }, [isFailed, history]);

  const failedEntry = history.find((h) => h.step === "failed");

  // Har bir bosqich uchun holatni aniqlaymiz
  const rows = PROGRESS_STEPS.filter((s) => s.step !== "failed").map((meta) => {
    const idx = progressStepIndex(meta.step);
    const historyEntry = history.find((h) => h.step === meta.step);
    const prevEntry = historyEntry
      ? [...history]
          .filter((h) => h.timestamp < historyEntry.timestamp)
          .sort((a, b) => b.timestamp - a.timestamp)[0]
      : undefined;

    let state: "done" | "active" | "failed" | "pending" | "skipped";
    if (isCompleted && idx <= currentIdx) state = "done";
    else if (historyEntry) state = "done";
    else if (isFailed && idx === failedAtIdx + 1) state = "failed";
    else if (isFailed && idx > failedAtIdx) state = "skipped";
    else if (currentIdx === idx && !isFailed) state = "active";
    else if (currentIdx > idx) state = "done";
    else state = "pending";

    return {
      meta,
      state,
      historyEntry,
      prevEntry,
    };
  });

  // Umumiy davomiylik (birinchi -> so'nggi hodisa)
  const totalDuration = React.useMemo(() => {
    if (history.length < 2) return 0;
    const sorted = [...history].sort((a, b) => a.timestamp - b.timestamp);
    return sorted[sorted.length - 1].timestamp - sorted[0].timestamp;
  }, [history]);

  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
      {/* Xulosa satri */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Bosqichlar:</span>
          <span className="font-semibold tabular-nums">
            {history.filter((h) => h.step !== "failed").length} /{" "}
            {PROGRESS_STEPS.length - 1}
          </span>
        </div>
        {totalDuration > 0 && (
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Umumiy vaqt:</span>
            <span className="font-semibold tabular-nums">
              {formatDuration(totalDuration)}
            </span>
          </div>
        )}
        {isFailed && (
          <div className="flex items-center gap-1.5 text-destructive">
            <AlertTriangle className="h-3 w-3" />
            <span className="font-semibold">Xatolik bilan to'xtadi</span>
          </div>
        )}
        {isCompleted && (
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <Check className="h-3 w-3" />
            <span className="font-semibold">Muvaffaqiyatli tugadi</span>
          </div>
        )}
      </div>

      {/* Xatolik xulosasi (yuqorida ajratib ko'rsatiladi) */}
      {failedEntry && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3">
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-destructive">
            <AlertTriangle className="h-3.5 w-3.5" />
            Xatolik tafsiloti
          </div>
          <p className="text-sm text-destructive">
            {failedEntry.message || "Noma'lum xatolik"}
          </p>
          {failedAtIdx >= 0 && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Bosqich:{" "}
              <span className="font-medium">
                {progressStepMeta(
                  PROGRESS_STEPS[failedAtIdx + 1]?.step ?? "failed",
                )?.label ?? "—"}
              </span>{" "}
              — {formatTime(failedEntry.timestamp)}
            </p>
          )}
        </div>
      )}

      {/* Bosqichlar timeline */}
      <ol className="relative space-y-1 pl-1">
        {rows.map((row, i) => {
          const { meta, state, historyEntry, prevEntry } = row;
          const stepDuration =
            historyEntry && prevEntry
              ? historyEntry.timestamp - prevEntry.timestamp
              : 0;

          const isLast = i === rows.length - 1;

          const iconNode =
            state === "done" ? (
              <Check className="h-3.5 w-3.5" />
            ) : state === "active" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : state === "failed" ? (
              <X className="h-3.5 w-3.5" />
            ) : state === "skipped" ? (
              <CircleDashed className="h-3.5 w-3.5" />
            ) : (
              <span className="text-[9px]">{i + 1}</span>
            );

          const dotClass = cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-2 ring-background",
            state === "done" && "bg-emerald-500 text-white",
            state === "active" && "bg-blue-500 text-white",
            state === "failed" && "bg-destructive text-destructive-foreground",
            state === "skipped" && "bg-muted text-muted-foreground/60",
            state === "pending" && "bg-muted text-muted-foreground",
          );

          const lineClass = cn(
            "absolute left-[11px] top-6 h-full w-0.5 -translate-x-1/2",
            state === "done" ? "bg-emerald-500/50" : "bg-border",
          );

          return (
            <li key={meta.step} className="relative flex gap-3 pb-2">
              {!isLast && <span className={lineClass} aria-hidden />}
              <div className={dotClass}>{iconNode}</div>
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{meta.icon}</span>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        state === "failed" && "text-destructive",
                        state === "active" &&
                          "text-blue-600 dark:text-blue-400",
                        state === "done" &&
                          "text-emerald-700 dark:text-emerald-400",
                        state === "skipped" && "text-muted-foreground",
                        state === "pending" && "text-muted-foreground",
                      )}
                    >
                      {meta.label}
                    </span>
                  </div>
                  {historyEntry && (
                    <div className="flex items-center gap-2 text-[10.5px] text-muted-foreground tabular-nums">
                      <span>{formatTime(historyEntry.timestamp)}</span>
                      {stepDuration > 0 && (
                        <span className="rounded bg-muted px-1.5 py-0.5">
                          +{formatDuration(stepDuration)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bosqich tavsifi */}
                <div className="mt-0.5 flex items-start gap-1.5 text-[11.5px] text-muted-foreground">
                  <Info className="mt-0.5 h-3 w-3 shrink-0 opacity-60" />
                  <span>{meta.description}</span>
                </div>

                {/* Cihoz yuborgan xabar */}
                {historyEntry?.message && (
                  <p
                    className={cn(
                      "mt-1 rounded border-l-2 bg-background/60 px-2 py-1 text-[12px]",
                      state === "failed"
                        ? "border-destructive text-destructive"
                        : state === "done"
                          ? "border-emerald-500 text-foreground"
                          : "border-blue-500 text-foreground",
                    )}
                  >
                    «{historyEntry.message}»
                  </p>
                )}

                {/* Nima uchun yuz beriishi mumkin bo'lgan sabab (failed bosqichda) */}
                {state === "failed" && meta.troubleshoot && (
                  <p className="mt-1 flex items-start gap-1.5 rounded bg-destructive/5 px-2 py-1 text-[11.5px] text-destructive">
                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                    <span>
                      <span className="font-semibold">Ehtimoliy sabab: </span>
                      {meta.troubleshoot}
                    </span>
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

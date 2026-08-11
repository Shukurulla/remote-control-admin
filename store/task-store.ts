"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Task, TaskStatus, TaskUnit, UnitStatus, ProgressStep, ProgressEntry } from "@/lib/types";

/** Vazifa umumiy holatini bajaruvchilar holatidan hisoblash */
export function deriveStatus(units: TaskUnit[]): TaskStatus {
  if (!units.length) return "failed";
  const done = units.filter((u) => u.status === "executed").length;
  const failed = units.filter((u) => u.status === "failed").length;
  const pending = units.filter(
    (u) => u.status === "pending" || u.status === "sent",
  ).length;

  if (pending > 0) return "running";
  if (failed === units.length) return "failed";
  if (failed > 0) return "partial";
  if (done === units.length) return "completed";
  return "partial";
}

function genId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* noop */
  }
  return `t_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

interface TaskState {
  tasks: Task[];

  createTask: (input: Omit<Task, "id" | "createdAt" | "status">) => Task;
  updateUnit: (
    taskId: string,
    deviceId: string,
    patch: Partial<Pick<TaskUnit, "status" | "comment" | "commandId">>,
  ) => void;
  updateUnitProgress: (
    deviceId: string,
    commandId: string,
    step: ProgressStep,
    message: string,
  ) => void;
  /** Backenddan olingan progressHistory bilan unitni to'ldirish (task holati tekshirilmaydi) */
  hydrateUnitProgress: (
    commandId: string,
    history: ProgressEntry[],
    status?: UnitStatus,
  ) => void;
  finalizeTask: (taskId: string) => void;
  removeTask: (taskId: string) => void;
  clearFinished: () => void;
  /** Uzoq vaqtdan beri yangilanmagan running vazifalarni failed deb belgilash.
   *  maxAgeMs — vazifa (yoki uning oxirgi progress hodisasi) qanchagacha eski
   *  bo'lsa "eskirgan" hisoblanishi. Standart: 5 daqiqa. Qaytaradi: nechta
   *  vazifa belgilangani. */
  markStaleAsFailed: (maxAgeMs?: number) => number;

  getTask: (taskId: string) => Task | undefined;
  activeTasks: () => Task[];
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],

      createTask: (input) => {
        const task: Task = {
          ...input,
          id: genId(),
          createdAt: Date.now(),
          status: deriveStatus(input.units),
        };
        set((s) => ({ tasks: [task, ...s.tasks].slice(0, 200) }));
        return task;
      },

      updateUnit: (taskId, deviceId, patch) => {
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id !== taskId) return t;
            const units = t.units.map((u) =>
              u.deviceId === deviceId
                ? { ...u, ...patch, updatedAt: Date.now() }
                : u,
            );
            return { ...t, units, status: deriveStatus(units) };
          }),
        }));
      },

      updateUnitProgress: (deviceId, commandId, step, message) => {
        const entry: ProgressEntry = { step, message, timestamp: Date.now() };
        set((s) => ({
          tasks: s.tasks.map((t) => {
            const hasUnit = t.units.some(
              (u) => u.deviceId === deviceId && u.commandId === commandId,
            );
            if (!hasUnit) return t;
            const units = t.units.map((u) => {
              if (u.deviceId !== deviceId || u.commandId !== commandId) return u;
              const history = [...(u.progressHistory ?? []), entry];
              return {
                ...u,
                currentStep: step,
                stepMessage: message,
                progressHistory: history,
                updatedAt: Date.now(),
              };
            });
            return { ...t, units, status: deriveStatus(units) };
          }),
        }));
      },

      hydrateUnitProgress: (commandId, history, status) => {
        if (!commandId) return;
        set((s) => ({
          tasks: s.tasks.map((t) => {
            const hasUnit = t.units.some((u) => u.commandId === commandId);
            if (!hasUnit) return t;
            const units = t.units.map((u) => {
              if (u.commandId !== commandId) return u;
              const last = history[history.length - 1];
              return {
                ...u,
                status: status ?? u.status,
                currentStep: last?.step ?? u.currentStep,
                stepMessage: last?.message ?? u.stepMessage,
                progressHistory: history.length ? history : u.progressHistory,
                updatedAt: Date.now(),
              };
            });
            return { ...t, units, status: deriveStatus(units) };
          }),
        }));
      },

      finalizeTask: (taskId) => {
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id !== taskId) return t;
            const status = deriveStatus(t.units);
            return {
              ...t,
              status,
              finishedAt: status === "running" ? t.finishedAt : Date.now(),
            };
          }),
        }));
      },

      removeTask: (taskId) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== taskId) })),

      clearFinished: () =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.status === "running") })),

      markStaleAsFailed: (maxAgeMs = 5 * 60 * 1000) => {
        const now = Date.now();
        const cutoff = now - maxAgeMs;
        let markedCount = 0;
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.status !== "running") return t;
            const lastActivity = Math.max(
              t.createdAt,
              ...t.units.map((u) => u.updatedAt),
            );
            if (lastActivity >= cutoff) return t;
            const units = t.units.map((u) => {
              if (u.status !== "pending" && u.status !== "sent") return u;
              return {
                ...u,
                status: "failed" as UnitStatus,
                stepMessage:
                  u.stepMessage ||
                  "Vaqti tugadi — telefondan javob kelmadi (timeout)",
                updatedAt: now,
              };
            });
            const newStatus = deriveStatus(units);
            if (newStatus !== "running") markedCount += 1;
            return {
              ...t,
              units,
              status: newStatus,
              finishedAt: newStatus === "running" ? t.finishedAt : now,
            };
          }),
        }));
        return markedCount;
      },

      getTask: (taskId) => get().tasks.find((t) => t.id === taskId),
      activeTasks: () => get().tasks.filter((t) => t.status === "running"),
    }),
    {
      name: "smm-tasks",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

export const UNIT_STATUS_ORDER: UnitStatus[] = [
  "executed",
  "sent",
  "pending",
  "failed",
];

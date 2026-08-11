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
  finalizeTask: (taskId: string) => void;
  removeTask: (taskId: string) => void;
  clearFinished: () => void;

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
            if (t.status !== "running") return t;
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
            return { ...t, units };
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

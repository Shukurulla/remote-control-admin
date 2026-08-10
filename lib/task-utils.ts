import { actionById } from "@/lib/actions";
import type { Task, TaskUnit } from "@/lib/types";

export interface TaskCounts {
  total: number;
  executed: number;
  sent: number;
  pending: number;
  failed: number;
  done: number; // executed + sent (backendga yetgan)
  progress: number; // 0..100
}

export function taskCounts(task: Task): TaskCounts {
  const total = task.units.length || 1;
  const executed = task.units.filter((u) => u.status === "executed").length;
  const sent = task.units.filter((u) => u.status === "sent").length;
  const pending = task.units.filter((u) => u.status === "pending").length;
  const failed = task.units.filter((u) => u.status === "failed").length;
  const done = executed + sent;
  const settled = executed + failed;
  return {
    total: task.units.length,
    executed,
    sent,
    pending,
    failed,
    done,
    progress: Math.round((settled / total) * 100),
  };
}

export function taskActionLabel(task: Task): string {
  return actionById(task.actionId)?.label ?? task.actionId;
}

export function taskTargetText(task: Task): string {
  if (task.postUrl) return task.postUrl;
  if (task.recipient) return task.recipient;
  return "—";
}

export function taskSubtitle(task: Task): string {
  if (task.text) return task.text;
  if (task.ai?.description) return task.ai.description;
  return taskTargetText(task);
}

export const UNIT_SORT: Record<TaskUnit["status"], number> = {
  failed: 0,
  pending: 1,
  sent: 2,
  executed: 3,
};

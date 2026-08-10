import * as React from "react";
import Link from "next/link";
import { ChevronRight, Smartphone } from "lucide-react";
import { cn, timeAgo, truncate } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { ActionIcon } from "@/components/action-icon";
import { TaskStatusBadge } from "@/components/status-badges";
import { taskActionLabel, taskCounts, taskSubtitle } from "@/lib/task-utils";
import type { Task } from "@/lib/types";

const barColor: Record<string, string> = {
  running: "bg-warning",
  completed: "bg-success",
  partial: "bg-warning",
  failed: "bg-destructive",
};

export function TaskListItem({ task }: { task: Task }) {
  const c = taskCounts(task);
  return (
    <Link
      href={`/tasks/${task.id}`}
      className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/30"
    >
      <ActionIcon actionId={task.actionId} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold">
            {taskActionLabel(task)}
          </span>
          <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
            <Smartphone className="h-3 w-3" />
            {c.total}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {truncate(taskSubtitle(task), 64)}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <Progress
            value={c.progress}
            className="h-1.5 max-w-[160px]"
            indicatorClassName={barColor[task.status]}
          />
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {c.executed + c.failed}/{c.total}
          </span>
        </div>
      </div>

      <div className="hidden flex-col items-end gap-1.5 sm:flex">
        <TaskStatusBadge status={task.status} />
        <span className="text-[11px] text-muted-foreground">
          {timeAgo(task.createdAt)}
        </span>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

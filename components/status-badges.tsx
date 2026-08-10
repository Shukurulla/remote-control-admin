import * as React from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TASK_STATUS, UNIT_STATUS } from "@/lib/constants";
import type { TaskStatus, UnitStatus } from "@/lib/types";

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const meta = TASK_STATUS[status];
  return (
    <Badge variant={meta.variant}>
      {status === "running" && <Loader2 className="h-3 w-3 animate-spin" />}
      {meta.label}
    </Badge>
  );
}

export function UnitStatusBadge({ status }: { status: UnitStatus }) {
  const meta = UNIT_STATUS[status];
  return (
    <Badge variant={meta.variant}>
      {status === "sent" && <Loader2 className="h-3 w-3 animate-spin" />}
      {meta.label}
    </Badge>
  );
}

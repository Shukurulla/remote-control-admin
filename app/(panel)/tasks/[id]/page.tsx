"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  RefreshCw,
  Rocket,
  Trash2,
  Link2,
  User,
  Copy,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate, timeAgo } from "@/lib/utils";
import { actionById } from "@/lib/actions";
import { retryFailed } from "@/lib/task-runner";
import { commandsApi } from "@/lib/api";
import { useTaskStore } from "@/store/task-store";
import type { ProgressEntry, ProgressStep, UnitStatus } from "@/lib/types";
import { taskCounts } from "@/lib/task-utils";
import { UNIT_SORT } from "@/lib/task-utils";
import { EmptyState } from "@/components/empty-state";
import { ActionIcon } from "@/components/action-icon";
import { DeviceProgress } from "@/components/device-progress";
import { DeviceProgressTimeline } from "@/components/device-progress-timeline";
import { TaskStatusBadge, UnitStatusBadge } from "@/components/status-badges";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function statusFromCommand(status?: string): UnitStatus | undefined {
  switch (status) {
    case "executed":
      return "executed";
    case "failed":
      return "failed";
    case "sent":
    case "delivered":
    case "executing":
      return "sent";
    case "pending":
      return "pending";
    default:
      return undefined;
  }
}

export default function TaskMonitorPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const task = useTaskStore((s) => s.tasks.find((t) => t.id === params.id));
  const removeTask = useTaskStore((s) => s.removeTask);
  const hydrateUnitProgress = useTaskStore((s) => s.hydrateUnitProgress);

  // Backenddagi progress ni yuklash — real-time uzilgan holatlar uchun ham
  // to'liq bosqichlar ko'rinishi kerak. Har 3 sekundda ishlaydigan taskda esa
  // real-time bilan bir vaqtda ma'lumotni yangilab boradi.
  const commandIds = React.useMemo(
    () =>
      (task?.units ?? [])
        .map((u) => u.commandId)
        .filter((id): id is string => Boolean(id)),
    [task?.units],
  );
  const commandIdsKey = commandIds.join(",");

  React.useEffect(() => {
    if (!commandIds.length) return;
    let cancelled = false;

    async function pull() {
      try {
        const records = await commandsApi.batch(commandIds);
        if (cancelled) return;
        for (const rec of records) {
          if (!rec._id) continue;
          const history: ProgressEntry[] = (rec.progressHistory ?? []).map(
            (h) => ({
              step: h.step as ProgressStep,
              message: h.message ?? "",
              timestamp: h.timestamp
                ? new Date(h.timestamp).getTime()
                : Date.now(),
            }),
          );
          hydrateUnitProgress(rec._id, history, statusFromCommand(rec.status));
        }
      } catch {
        /* silent */
      }
    }

    void pull();
    const stillRunning = task?.status === "running";
    if (!stillRunning) return;
    const id = setInterval(pull, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commandIdsKey, task?.status, hydrateUnitProgress]);

  if (!task) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/tasks">
            <ArrowLeft className="h-4 w-4" />
            Vazifalar
          </Link>
        </Button>
        <EmptyState
          icon={<Rocket />}
          title="Vazifa topilmadi"
          description="Bu vazifa o'chirilgan yoki mavjud emas."
          action={
            <Button asChild>
              <Link href="/new-task">Yangi vazifa</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const action = actionById(task.actionId);
  const c = taskCounts(task);
  const units = [...task.units].sort(
    (a, b) => UNIT_SORT[a.status] - UNIT_SORT[b.status],
  );
  const isAi = action?.mode === "ai";
  const showProgress = task.actionId === "ig_comment" || task.actionId === "ig_ai_comment";

  const barColor =
    task.status === "failed"
      ? "bg-destructive"
      : task.status === "completed"
        ? "bg-success"
        : "bg-warning";

  function onRetry() {
    retryFailed(task!.id);
    toast.info("Xato telefonlarga qayta yuborilmoqda…");
  }

  function onDelete() {
    removeTask(task!.id);
    toast.success("Vazifa o'chirildi");
    router.push("/tasks");
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/tasks">
          <ArrowLeft className="h-4 w-4" />
          Vazifalar
        </Link>
      </Button>

      {/* Sarlavha */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <ActionIcon actionId={task.actionId} size="lg" />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight">
                {action?.label ?? task.actionId}
              </h1>
              <TaskStatusBadge status={task.status} />
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {formatDate(task.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {c.failed > 0 && task.status !== "running" && (
            <Button variant="outline" onClick={onRetry}>
              <RefreshCw className="h-4 w-4" />
              Xatolarni qayta yuborish ({c.failed})
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href={`/new-task?type=${task.actionId}`}>
              <Copy className="h-4 w-4" />
              Nusxa
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-muted-foreground hover:text-destructive"
            title="O'chirish"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Jami telefon" value={c.total} tone="primary" />
        <StatCard label="Bajarildi" value={c.executed} tone="success" />
        <StatCard
          label="Kutilmoqda"
          value={c.pending + c.sent}
          tone="warning"
        />
        <StatCard label="Xato" value={c.failed} tone="destructive" />
      </div>

      {/* Maqsad + progress */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            {task.postUrl && (
              <a
                href={task.postUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-primary hover:underline"
              >
                <Link2 className="h-4 w-4" />
                Post havolasi
              </a>
            )}
            {task.recipient && (
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-muted-foreground" />
                {task.recipient}
              </span>
            )}
          </div>
          {(task.text || task.ai?.description) && (
            <p className="rounded-lg border bg-muted/30 p-3 text-sm">
              {task.text || task.ai?.description}
            </p>
          )}
          <Separator />
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Umumiy progress</span>
              <span className="font-semibold tabular-nums">{c.progress}%</span>
            </div>
            <Progress value={c.progress} indicatorClassName={barColor} />
          </div>
        </CardContent>
      </Card>

      {/* Telefonlar jadvali */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {showProgress && <TableHead className="w-[40px]" />}
                <TableHead>Telefon</TableHead>
                {isAi && <TableHead>Yozilgan izoh</TableHead>}
                {showProgress && <TableHead>Progress</TableHead>}
                <TableHead className="w-[130px]">Holat</TableHead>
                <TableHead className="w-[120px] text-right">Vaqt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map((u) => (
                <DeviceRow
                  key={u.deviceId}
                  deviceName={u.deviceName}
                  comment={u.comment}
                  status={u.status}
                  updatedAt={u.updatedAt}
                  currentStep={u.currentStep}
                  stepMessage={u.stepMessage}
                  progressHistory={u.progressHistory}
                  showAi={isAi}
                  showProgress={showProgress}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

interface DeviceRowProps {
  deviceName: string;
  comment?: string;
  status: UnitStatus;
  updatedAt: number;
  currentStep?: ProgressStep;
  stepMessage?: string;
  progressHistory?: ProgressEntry[];
  showAi: boolean;
  showProgress: boolean;
}

function DeviceRow({
  deviceName,
  comment,
  status,
  updatedAt,
  currentStep,
  stepMessage,
  progressHistory,
  showAi,
  showProgress,
}: DeviceRowProps) {
  const [open, setOpen] = React.useState(false);
  const hasTimeline =
    showProgress && (Boolean(currentStep) || (progressHistory?.length ?? 0) > 0);
  // Xatolik yoki jarayondagi qatorlar avtomatik ochilib turadi (foydalanuvchi bosishi shart emas)
  const autoOpen = status === "failed";

  const expanded = open || autoOpen;
  const columnSpan =
    1 + (showAi ? 1 : 0) + (showProgress ? 2 : 0) + 2; // toggle + name + [comment] + [progress] + status + time

  return (
    <>
      <TableRow className={cn(expanded && "border-b-0")}>
        {showProgress && (
          <TableCell className="pr-0">
            {hasTimeline ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen((v) => !v)}
                className="h-7 w-7"
                aria-label={expanded ? "Yopish" : "Batafsil"}
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    expanded && "rotate-180",
                  )}
                />
              </Button>
            ) : null}
          </TableCell>
        )}
        <TableCell className="font-medium">{deviceName}</TableCell>
        {showAi && (
          <TableCell className="max-w-[360px] text-sm text-muted-foreground">
            {comment ? (
              <span className="line-clamp-2">{comment}</span>
            ) : (
              "—"
            )}
          </TableCell>
        )}
        {showProgress && (
          <TableCell>
            <DeviceProgress
              currentStep={currentStep}
              stepMessage={stepMessage}
              progressHistory={progressHistory}
            />
          </TableCell>
        )}
        <TableCell>
          <UnitStatusBadge status={status} />
        </TableCell>
        <TableCell className="text-right text-xs text-muted-foreground">
          {timeAgo(updatedAt)}
        </TableCell>
      </TableRow>
      {expanded && hasTimeline && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={columnSpan} className="bg-muted/20 py-3">
            <DeviceProgressTimeline
              currentStep={currentStep}
              progressHistory={progressHistory}
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

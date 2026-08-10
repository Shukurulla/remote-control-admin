"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ScrollText, Search, Download } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { useTaskStore } from "@/store/task-store";
import { actionById } from "@/lib/actions";
import { taskActionLabel, taskCounts, taskTargetText } from "@/lib/task-utils";
import { TASK_STATUS } from "@/lib/constants";
import type { Channel, TaskStatus } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { TaskStatusBadge } from "@/components/status-badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const RANGES = [
  { value: "all", label: "Butun davr", ms: Infinity },
  { value: "today", label: "Bugun", ms: 24 * 3600 * 1000 },
  { value: "7d", label: "7 kun", ms: 7 * 24 * 3600 * 1000 },
  { value: "30d", label: "30 kun", ms: 30 * 24 * 3600 * 1000 },
];

const channelDot: Record<string, string> = {
  instagram: "bg-ig",
  telegram: "bg-tg",
  whatsapp: "bg-wa",
};

export default function JournalPage() {
  const router = useRouter();
  const tasks = useTaskStore((s) => s.tasks);

  const [channel, setChannel] = React.useState<Channel | "all">("all");
  const [status, setStatus] = React.useState<TaskStatus | "all">("all");
  const [range, setRange] = React.useState("all");
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const rangeMs = RANGES.find((r) => r.value === range)?.ms ?? Infinity;
    const now = Date.now();
    return tasks.filter((t) => {
      const action = actionById(t.actionId);
      if (channel !== "all" && action?.channel !== channel) return false;
      if (status !== "all" && t.status !== status) return false;
      if (rangeMs !== Infinity && now - t.createdAt > rangeMs) return false;
      if (q) {
        return (
          taskActionLabel(t).toLowerCase().includes(q) ||
          taskTargetText(t).toLowerCase().includes(q) ||
          (t.text ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tasks, channel, status, range, query]);

  function exportCsv() {
    const header = [
      "Sana",
      "Amal",
      "Kanal",
      "Maqsad",
      "Telefonlar",
      "Bajarildi",
      "Xato",
      "Holat",
    ];
    const rows = filtered.map((t) => {
      const action = actionById(t.actionId);
      const c = taskCounts(t);
      return [
        formatDate(t.createdAt),
        taskActionLabel(t),
        action?.channelLabel ?? "",
        taskTargetText(t),
        String(c.total),
        String(c.executed),
        String(c.failed),
        TASK_STATUS[t.status].label,
      ];
    });
    const csv = [header, ...rows]
      .map((r) =>
        r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smm-jurnal-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jurnal"
        description="Barcha vazifalar tarixi. Filtrlang va hisobotni CSV ko'rinishida yuklab oling."
        icon={<ScrollText />}
        actions={
          <Button
            variant="outline"
            onClick={exportCsv}
            disabled={!filtered.length}
          >
            <Download className="h-4 w-4" />
            CSV yuklash
          </Button>
        }
      />

      {tasks.length === 0 ? (
        <EmptyState
          icon={<ScrollText />}
          title="Jurnal bo'sh"
          description="Vazifalar bajarilgach, ular shu yerda qayd etiladi."
        />
      ) : (
        <>
          {/* Filtrlar */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Maqsad yoki matn bo'yicha qidirish…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select
                value={channel}
                onValueChange={(v) => setChannel(v as Channel | "all")}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Kanal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha kanallar</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as TaskStatus | "all")}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Holat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha holat</SelectItem>
                  <SelectItem value="running">Jarayonda</SelectItem>
                  <SelectItem value="completed">Bajarildi</SelectItem>
                  <SelectItem value="partial">Qisman</SelectItem>
                  <SelectItem value="failed">Xato</SelectItem>
                </SelectContent>
              </Select>
              <Select value={range} onValueChange={setRange}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RANGES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Jadval */}
          <Card>
            <CardContent className="p-0">
              {filtered.length === 0 ? (
                <div className="p-10">
                  <EmptyState
                    icon={<Search />}
                    title="Natija topilmadi"
                    description="Filtrlarni o'zgartirib ko'ring."
                    className="border-0"
                  />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[150px]">Sana</TableHead>
                      <TableHead>Amal</TableHead>
                      <TableHead>Maqsad</TableHead>
                      <TableHead className="w-[90px] text-center">
                        Telefon
                      </TableHead>
                      <TableHead className="w-[110px] text-center">
                        Natija
                      </TableHead>
                      <TableHead className="w-[150px]">Holat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((t) => {
                      const action = actionById(t.actionId);
                      const c = taskCounts(t);
                      return (
                        <TableRow
                          key={t.id}
                          className="cursor-pointer"
                          onClick={() => router.push(`/tasks/${t.id}`)}
                        >
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDate(t.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "h-2 w-2 shrink-0 rounded-full",
                                  channelDot[action?.channel ?? ""],
                                )}
                              />
                              <span className="font-medium">
                                {taskActionLabel(t)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[240px] truncate text-sm text-muted-foreground">
                            {taskTargetText(t)}
                          </TableCell>
                          <TableCell className="text-center tabular-nums">
                            {c.total}
                          </TableCell>
                          <TableCell className="text-center text-sm tabular-nums">
                            <span className="text-success">{c.executed}</span>
                            {" / "}
                            <span className="text-destructive">{c.failed}</span>
                          </TableCell>
                          <TableCell>
                            <TaskStatusBadge status={t.status} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

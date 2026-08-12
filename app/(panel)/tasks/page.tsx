"use client";

import * as React from "react";
import Link from "next/link";
import { ListChecks, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/store/task-store";
import { taskActionLabel, taskSubtitle } from "@/lib/task-utils";
import type { TaskStatus } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { TaskListItem } from "@/components/task-list-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Filter = "all" | TaskStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Hammasi" },
  { value: "running", label: "Jarayonda" },
  { value: "completed", label: "Bajarildi" },
  { value: "partial", label: "Qisman" },
  { value: "failed", label: "Xato" },
];

export default function TasksPage() {
  const tasks = useTaskStore((s) => s.tasks);
  const [filter, setFilter] = React.useState<Filter>("all");
  const [query, setQuery] = React.useState("");

  const counts = React.useMemo(() => {
    const c: Record<string, number> = { all: tasks.length };
    for (const t of tasks) c[t.status] = (c[t.status] ?? 0) + 1;
    return c;
  }, [tasks]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      if (filter !== "all" && t.status !== filter) return false;
      if (!q) return true;
      return (
        taskActionLabel(t).toLowerCase().includes(q) ||
        taskSubtitle(t).toLowerCase().includes(q)
      );
    });
  }, [tasks, filter, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vazifalar"
        description="Yaratilgan barcha vazifalar va ularning bajarilish holati."
        icon={<ListChecks />}
        actions={
          <Button asChild>
            <Link href="/new-task">
              <Plus className="h-4 w-4" />
              Yangi vazifa
            </Link>
          </Button>
        }
      />

      {tasks.length === 0 ? (
        <EmptyState
          icon={<ListChecks />}
          title="Hali vazifa yo'q"
          description="Birinchi vazifangizni yarating — izoh yoki xabar yuboring."
          action={
            <Button asChild>
              <Link href="/new-task">
                <Plus className="h-4 w-4" />
                Yangi vazifa
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          {/* Filtr + qidiruv */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map((f) => {
                const active = filter === f.value;
                const n = counts[f.value] ?? 0;
                if (f.value !== "all" && n === 0) return null;
                return (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent",
                    )}
                  >
                    {f.label}
                    <Badge
                      variant={active ? "default" : "muted"}
                      className="h-5 min-w-5 justify-center px-1 tabular-nums"
                    >
                      {n}
                    </Badge>
                  </button>
                );
              })}
            </div>
            <div className="relative sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Vazifa qidirish…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Ro'yxat */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Search />}
              title="Hech narsa topilmadi"
              description="Filtr yoki qidiruvni o'zgartiring."
            />
          ) : (
            <div className="space-y-2.5">
              {filtered.map((t) => (
                <TaskListItem key={t.id} task={t} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

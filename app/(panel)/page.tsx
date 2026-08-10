"use client";

import * as React from "react";
import Link from "next/link";
import {
  Smartphone,
  Activity,
  CheckCircle2,
  Rocket,
  ArrowRight,
  Plus,
  Zap,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useDeviceStore } from "@/store/device-store";
import { useTaskStore } from "@/store/task-store";
import { taskCounts } from "@/lib/task-utils";
import { ACTIONS } from "@/lib/actions";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { TaskListItem } from "@/components/task-list-item";
import { ActionIcon } from "@/components/action-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function isToday(ts: number) {
  const d = new Date(ts);
  const n = new Date();
  return (
    d.getDate() === n.getDate() &&
    d.getMonth() === n.getMonth() &&
    d.getFullYear() === n.getFullYear()
  );
}

export default function DashboardPage() {
  const username = useAuthStore((s) => s.username);
  const devices = useDeviceStore((s) => s.devices);
  const tasks = useTaskStore((s) => s.tasks);

  const online = devices.filter((d) => d.isOnline).length;
  const active = tasks.filter((t) => t.status === "running");
  const todays = tasks.filter((t) => isToday(t.createdAt));

  // Bugungi muvaffaqiyat foizi
  const { exec, fail } = todays.reduce(
    (acc, t) => {
      const c = taskCounts(t);
      acc.exec += c.executed;
      acc.fail += c.failed;
      return acc;
    },
    { exec: 0, fail: 0 },
  );
  const successRate = exec + fail > 0 ? Math.round((exec / (exec + fail)) * 100) : null;

  const recent = tasks.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Salomlashuv */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Assalomu alaykum, {username ?? "Admin"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Bugungi ish holati va tezkor amallar.
          </p>
        </div>
        <Button asChild size="lg" className="shrink-0">
          <Link href="/new-task">
            <Plus className="h-4 w-4" />
            Yangi vazifa
          </Link>
        </Button>
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Online telefon"
          value={online}
          hint={`${devices.length} tadan`}
          icon={<Smartphone />}
          tone="success"
        />
        <StatCard
          label="Faol vazifalar"
          value={active.length}
          icon={<Activity />}
          tone={active.length ? "warning" : "default"}
        />
        <StatCard
          label="Bugungi vazifalar"
          value={todays.length}
          icon={<Rocket />}
          tone="primary"
        />
        <StatCard
          label="Bugungi natija"
          value={successRate === null ? "—" : `${successRate}%`}
          hint={successRate === null ? "ma'lumot yo'q" : `${exec} bajarildi`}
          icon={<CheckCircle2 />}
          tone="success"
        />
      </div>

      {/* Tezkor amallar */}
      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <Zap className="h-4 w-4 text-primary" />
          <CardTitle>Tezkor amal boshlash</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {ACTIONS.map((a) => (
            <Link
              key={a.id}
              href={`/new-task?type=${a.id}`}
              className="group flex flex-col items-start gap-2 rounded-xl border p-3 transition-colors hover:border-primary/40 hover:bg-accent/40"
            >
              <ActionIcon actionId={a.id} size="sm" />
              <div>
                <div className="flex items-center gap-1 text-sm font-semibold leading-tight">
                  {a.short}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {a.channelLabel}
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Faol vazifalar */}
      {active.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Faol vazifalar</h2>
            <Badge variant="warning">{active.length}</Badge>
          </div>
          <div className="space-y-2.5">
            {active.map((t) => (
              <TaskListItem key={t.id} task={t} />
            ))}
          </div>
        </div>
      )}

      {/* So'nggi vazifalar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">So'nggi vazifalar</h2>
          {tasks.length > 0 && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tasks">
                Barchasi
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
        {recent.length === 0 ? (
          <EmptyState
            icon={<Rocket />}
            title="Hali vazifa yo'q"
            description="Birinchi vazifangizni yaratib, telefonlarga izoh yoki xabar yuboring."
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
          <div className="space-y-2.5">
            {recent.map((t) => (
              <TaskListItem key={t.id} task={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  RefreshCw,
  Smartphone,
  Wifi,
  WifiOff,
  Plus,
  Link2,
  User,
} from "lucide-react";
import { cn, deviceLabel, formatDate, timeAgo, truncate } from "@/lib/utils";
import { commandsApi } from "@/lib/api";
import { actionByCommand } from "@/lib/actions";
import { useDeviceStore } from "@/store/device-store";
import type { CommandRecord, CommandStatus } from "@/lib/types";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BadgeVariant } from "@/lib/constants";

const CMD_STATUS: Record<CommandStatus, { label: string; variant: BadgeVariant }> = {
  executed: { label: "Bajarildi", variant: "success" },
  failed: { label: "Xato", variant: "destructive" },
  pending: { label: "Kutilmoqda", variant: "warning" },
};

function paramText(r: CommandRecord) {
  const p = r.params;
  if (!p) return "—";
  if (p.postUrl)
    return (
      <span className="flex items-center gap-1">
        <Link2 className="h-3 w-3 shrink-0" />
        {truncate(p.postUrl, 40)}
      </span>
    );
  if (p.recipient)
    return (
      <span className="flex items-center gap-1">
        <User className="h-3 w-3 shrink-0" />
        {p.recipient}
        {p.message ? ` · ${truncate(p.message, 24)}` : ""}
      </span>
    );
  if (p.commentText) return truncate(p.commentText, 46);
  if (p.message) return truncate(p.message, 46);
  return "—";
}

export default function DeviceDetailPage() {
  const params = useParams<{ id: string }>();
  const deviceId = params.id;
  const device = useDeviceStore((s) => s.byId(deviceId));

  const [records, setRecords] = React.useState<CommandRecord[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchHistory = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await commandsApi.history(deviceId);
      setRecords(Array.isArray(data) ? data : []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  React.useEffect(() => {
    fetchHistory();
    const t = setInterval(fetchHistory, 15000);
    return () => clearInterval(t);
  }, [fetchHistory]);

  const name = device ? deviceLabel(device) : deviceId.slice(0, 14);
  const isOnline = device?.isOnline ?? false;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/devices">
          <ArrowLeft className="h-4 w-4" />
          Telefonlar
        </Link>
      </Button>

      {/* Sarlavha */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight">{name}</h1>
              {isOnline ? (
                <Badge variant="success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Online
                </Badge>
              ) : (
                <Badge variant="muted">
                  <WifiOff className="h-3 w-3" />
                  Offline
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {device
                ? [device.brand, device.model].filter(Boolean).join(" ") ||
                  "Model noma'lum"
                : "Qurilma ma'lumoti yuklanmadi"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchHistory} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Yangilash
          </Button>
          <Button asChild>
            <Link href="/new-task">
              <Plus className="h-4 w-4" />
              Vazifa berish
            </Link>
          </Button>
        </div>
      </div>

      {/* Ma'lumot */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-muted-foreground">Holat</div>
            <div className="mt-1 flex items-center gap-1.5 font-semibold">
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4 text-success" /> Online
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-muted-foreground" /> Offline
                </>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-muted-foreground">Model</div>
            <div className="mt-1 truncate font-semibold">
              {device
                ? [device.brand, device.model].filter(Boolean).join(" ") || "—"
                : "—"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-muted-foreground">Qurilma ID</div>
            <div className="mt-1 truncate font-mono text-sm">{deviceId}</div>
          </CardContent>
        </Card>
      </div>

      {/* Buyruqlar tarixi */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Buyruqlar tarixi</h2>
        {loading && records.length === 0 ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <EmptyState
            icon={<Smartphone />}
            title="Buyruqlar yo'q"
            description="Bu telefonga hali buyruq yuborilmagan."
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Buyruq</TableHead>
                    <TableHead>Tafsilot</TableHead>
                    <TableHead className="w-[120px]">Holat</TableHead>
                    <TableHead className="w-[130px] text-right">Vaqt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.slice(0, 30).map((r, i) => {
                    const action = actionByCommand(r.command);
                    const st = CMD_STATUS[(r.status as CommandStatus) ?? "pending"];
                    return (
                      <TableRow key={r._id ?? i}>
                        <TableCell className="font-medium">
                          {action?.label ?? r.command}
                        </TableCell>
                        <TableCell className="max-w-[280px] truncate text-sm text-muted-foreground">
                          {paramText(r)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={st?.variant ?? "muted"}>
                            {st?.label ?? r.status}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className="text-right text-xs text-muted-foreground"
                          title={formatDate(r.createdAt)}
                        >
                          {timeAgo(r.createdAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

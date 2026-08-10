"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Smartphone,
  Wifi,
  WifiOff,
  RefreshCw,
  Search,
  ChevronRight,
} from "lucide-react";
import { cn, deviceLabel } from "@/lib/utils";
import { useDeviceStore } from "@/store/device-store";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

type Filter = "all" | "online" | "offline";

export default function DevicesPage() {
  const router = useRouter();
  const devices = useDeviceStore((s) => s.devices);
  const loading = useDeviceStore((s) => s.loading);
  const loaded = useDeviceStore((s) => s.loaded);
  const load = useDeviceStore((s) => s.load);

  const [filter, setFilter] = React.useState<Filter>("all");
  const [query, setQuery] = React.useState("");

  const online = devices.filter((d) => d.isOnline).length;

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return devices.filter((d) => {
      if (filter === "online" && !d.isOnline) return false;
      if (filter === "offline" && d.isOnline) return false;
      if (!q) return true;
      return (
        deviceLabel(d).toLowerCase().includes(q) ||
        `${d.brand ?? ""} ${d.model ?? ""}`.toLowerCase().includes(q) ||
        d.deviceId.toLowerCase().includes(q)
      );
    });
  }, [devices, filter, query]);

  const FILTERS: { value: Filter; label: string; n: number }[] = [
    { value: "all", label: "Hammasi", n: devices.length },
    { value: "online", label: "Online", n: online },
    { value: "offline", label: "Offline", n: devices.length - online },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Telefonlar"
        description="Tizimga ulangan qurilmalar parki va ularning holati."
        icon={<Smartphone />}
        actions={
          <Button variant="outline" onClick={() => load()} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Yangilash
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Jami"
          value={devices.length}
          icon={<Smartphone />}
          tone="primary"
        />
        <StatCard label="Online" value={online} icon={<Wifi />} tone="success" />
        <StatCard
          label="Offline"
          value={devices.length - online}
          icon={<WifiOff />}
          tone="default"
        />
      </div>

      {loading && !loaded ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : !devices.length ? (
        <EmptyState
          icon={<Smartphone />}
          title="Hali qurilma ulanmagan"
          description="Telefon ilovasi serverga ulanganda bu yerda paydo bo'ladi."
          action={
            <Button variant="outline" onClick={() => load()}>
              <RefreshCw className="h-4 w-4" />
              Qayta tekshirish
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
                      {f.n}
                    </Badge>
                  </button>
                );
              })}
            </div>
            <div className="relative sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Telefon qidirish…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Jadval */}
          <Card>
            <CardContent className="p-0">
              {filtered.length === 0 ? (
                <div className="p-10">
                  <EmptyState
                    icon={<Search />}
                    title="Topilmadi"
                    description="Filtr yoki qidiruvni o'zgartiring."
                    className="border-0"
                  />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Telefon</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead className="w-[120px]">Holat</TableHead>
                      <TableHead className="hidden lg:table-cell">ID</TableHead>
                      <TableHead className="w-[44px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((d) => (
                      <TableRow
                        key={d.deviceId}
                        className="cursor-pointer"
                        onClick={() => router.push(`/devices/${d.deviceId}`)}
                      >
                        <TableCell className="font-medium">
                          {deviceLabel(d)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {[d.brand, d.model].filter(Boolean).join(" ") || "—"}
                        </TableCell>
                        <TableCell>
                          {d.isOnline ? (
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
                        </TableCell>
                        <TableCell className="hidden font-mono text-xs text-muted-foreground/70 lg:table-cell">
                          {d.deviceId.slice(0, 18)}
                        </TableCell>
                        <TableCell>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ))}
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

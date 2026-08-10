"use client";

import * as React from "react";
import { Search, Smartphone, WifiOff, Shuffle, X } from "lucide-react";
import { cn, deviceLabel } from "@/lib/utils";
import { useDeviceStore } from "@/store/device-store";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/empty-state";

interface DevicePickerProps {
  selected: string[];
  onChange: (ids: string[]) => void;
}

const RANDOM_PRESETS = [5, 10, 25];

export function DevicePicker({ selected, onChange }: DevicePickerProps) {
  const devices = useDeviceStore((s) => s.devices);
  const [query, setQuery] = React.useState("");

  const online = React.useMemo(
    () => devices.filter((d) => d.isOnline),
    [devices],
  );
  const offline = React.useMemo(
    () => devices.filter((d) => !d.isOnline),
    [devices],
  );
  const selectedSet = React.useMemo(() => new Set(selected), [selected]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (d: (typeof devices)[number]) =>
      !q ||
      deviceLabel(d).toLowerCase().includes(q) ||
      `${d.brand ?? ""} ${d.model ?? ""}`.toLowerCase().includes(q) ||
      d.deviceId.toLowerCase().includes(q);
    return { online: online.filter(match), offline: offline.filter(match) };
  }, [online, offline, query]);

  function toggle(id: string) {
    if (selectedSet.has(id)) onChange(selected.filter((x) => x !== id));
    else onChange([...selected, id]);
  }

  function selectAllOnline() {
    onChange(online.map((d) => d.deviceId));
  }

  function pickRandom(n: number) {
    const pool = [...online];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    onChange(pool.slice(0, n).map((d) => d.deviceId));
  }

  const allOnlineSelected =
    online.length > 0 && online.every((d) => selectedSet.has(d.deviceId));

  return (
    <div className="flex flex-col gap-3">
      {/* Tez tanlash */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={allOnlineSelected ? "default" : "outline"}
          size="sm"
          onClick={selectAllOnline}
          disabled={!online.length}
        >
          Barcha online ({online.length})
        </Button>
        {RANDOM_PRESETS.filter((n) => n < online.length).map((n) => (
          <Button
            key={n}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => pickRandom(n)}
          >
            <Shuffle className="h-3.5 w-3.5" />
            {n} ta
          </Button>
        ))}
        {selected.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange([])}
            className="ml-auto text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Tozalash
          </Button>
        )}
      </div>

      {/* Qidiruv */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Telefon qidirish…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Ro'yxat */}
      {!devices.length ? (
        <EmptyState
          icon={<Smartphone />}
          title="Qurilma yo'q"
          description="Hali hech bir telefon ulanmagan."
          className="py-8"
        />
      ) : (
        <ScrollArea className="h-[320px] rounded-lg border">
          <div className="flex flex-col gap-1 p-2">
            {filtered.online.map((d) => {
              const checked = selectedSet.has(d.deviceId);
              return (
                <button
                  key={d.deviceId}
                  type="button"
                  onClick={() => toggle(d.deviceId)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-2.5 text-left transition-colors",
                    checked
                      ? "border-primary/50 bg-primary/5"
                      : "border-transparent hover:bg-accent/50",
                  )}
                >
                  <Checkbox checked={checked} className="pointer-events-none" tabIndex={-1} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {deviceLabel(d)}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                      Online
                      {(d.brand || d.model) && (
                        <span className="truncate">
                          · {[d.brand, d.model].filter(Boolean).join(" ")}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

            {filtered.offline.length > 0 && (
              <>
                <div className="px-1 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                  Offline ({filtered.offline.length})
                </div>
                {filtered.offline.map((d) => (
                  <div
                    key={d.deviceId}
                    className="flex cursor-not-allowed items-center gap-3 rounded-lg border border-transparent p-2.5 opacity-50"
                  >
                    <Checkbox checked={false} disabled />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {deviceLabel(d)}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <WifiOff className="h-3 w-3" />
                        Offline
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </ScrollArea>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Tanlangan telefonlar</span>
        <Badge variant={selected.length ? "default" : "muted"}>
          {selected.length} ta
        </Badge>
      </div>
    </div>
  );
}

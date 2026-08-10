"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Radio, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, NAV_GROUPS } from "@/lib/constants";
import { useDeviceStore } from "@/store/device-store";
import { useTaskStore } from "@/store/task-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SystemStatus() {
  const devices = useDeviceStore((s) => s.devices);
  const online = devices.filter((d) => d.isOnline).length;
  return (
    <div className="mx-3 rounded-xl border bg-card p-3.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Radio className="h-3.5 w-3.5 text-success" />
          Tizim holati
        </span>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <div className="text-xl font-bold tabular-nums text-success">
            {online}
          </div>
          <div className="text-[11px] text-muted-foreground">Online</div>
        </div>
        <div>
          <div className="text-xl font-bold tabular-nums">{devices.length}</div>
          <div className="text-[11px] text-muted-foreground">Jami telefon</div>
        </div>
      </div>
    </div>
  );
}

export function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const activeCount = useTaskStore(
    (s) => s.tasks.filter((t) => t.status === "running").length,
  );

  return (
    <div className="flex h-full flex-col gap-4 py-4">
      {/* Brend */}
      <div className="flex items-center gap-2.5 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/30">
          <Smartphone className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold">SMM Panel</div>
          <div className="text-[11px] text-muted-foreground">
            Boshqaruv tizimi
          </div>
        </div>
      </div>

      {/* Asosiy amal */}
      <div className="px-3">
        <Button asChild className="w-full justify-start gap-2 shadow-sm">
          <Link href="/new-task" onClick={onNavigate}>
            <Plus className="h-4 w-4" />
            Yangi vazifa
          </Link>
        </Button>
      </div>

      {/* Navigatsiya */}
      <ScrollArea className="flex-1 px-3">
        <nav className="flex flex-col gap-5 pb-4">
          {NAV_GROUPS.map((group) => {
            const items = NAV_ITEMS.filter((i) => i.group === group);
            if (!items.length) return null;
            return (
              <div key={group} className="flex flex-col gap-1">
                <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  {group}
                </div>
                {items.map((item) => {
                  const active = isActive(pathname, item.href, item.exact);
                  const Icon = item.icon;
                  const showCount = item.href === "/tasks" && activeCount > 0;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-sidebar-accent text-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                      )}
                      <Icon
                        className={cn(
                          "h-[18px] w-[18px] shrink-0",
                          active && "text-primary",
                        )}
                      />
                      <span className="flex-1 truncate">{item.title}</span>
                      {showCount && (
                        <Badge
                          variant="warning"
                          className="h-5 min-w-5 justify-center px-1.5 tabular-nums"
                        >
                          {activeCount}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      <SystemStatus />
    </div>
  );
}

export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r bg-sidebar lg:block">
      <SidebarBody />
    </aside>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Menu, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn, initials } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { useAuthStore } from "@/store/auth-store";
import { useDeviceStore } from "@/store/device-store";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarBody } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";

function useActiveTitle() {
  const pathname = usePathname();
  const item =
    NAV_ITEMS.find((i) =>
      i.exact ? pathname === i.href : pathname.startsWith(i.href),
    ) ?? NAV_ITEMS[0];
  return item.title;
}

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const title = useActiveTitle();
  const { username, logout } = useAuthStore();
  const load = useDeviceStore((s) => s.load);
  const loading = useDeviceStore((s) => s.loading);
  const online = useDeviceStore(
    (s) => s.devices.filter((d) => d.isOnline).length,
  );
  const [mobileOpen, setMobileOpen] = React.useState(false);

  function handleLogout() {
    logout();
    toast.success("Tizimdan chiqdingiz");
    router.replace("/login");
  }

  const onNewTaskPage = pathname.startsWith("/new-task");

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
      {/* Mobil menyu */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menyu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SidebarBody onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <h1 className="truncate text-base font-semibold sm:text-lg">{title}</h1>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <div className="hidden items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium md:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span className="tabular-nums">{online}</span>
          <span className="text-muted-foreground">online</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => load()}
          aria-label="Yangilash"
          title="Yangilash"
        >
          <RefreshCw
            className={cn("h-[18px] w-[18px]", loading && "animate-spin")}
          />
        </Button>

        <ThemeToggle />

        {!onNewTaskPage && (
          <Button asChild size="sm" className="hidden gap-1.5 sm:inline-flex">
            <Link href="/new-task">
              <Plus className="h-4 w-4" />
              Yangi vazifa
            </Link>
          </Button>
        )}

        <Separator orientation="vertical" className="mx-0.5 hidden h-6 sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <Avatar className="h-9 w-9 border">
                <AvatarFallback>{initials(username ?? "Admin")}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials(username ?? "Admin")}</AvatarFallback>
              </Avatar>
              <div className="leading-tight">
                <div className="text-sm font-semibold">
                  {username ?? "Admin"}
                </div>
                <div className="text-xs font-normal text-muted-foreground">
                  Administrator
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Chiqish
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

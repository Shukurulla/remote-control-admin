"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Smartphone } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useDeviceStore } from "@/store/device-store";
import { useSocket } from "@/hooks/use-socket";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { Toaster } from "@/components/ui/toaster";

function Splash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Smartphone className="h-6 w-6" />
      </div>
      <p className="text-sm text-muted-foreground">Yuklanmoqda…</p>
    </div>
  );
}

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const loadDevices = useDeviceStore((s) => s.load);

  // Token tekshiruvi
  React.useEffect(() => {
    if (status === "loading") bootstrap();
  }, [status, bootstrap]);

  // Autentifikatsiyadan keyin qurilmalarni yuklash + davriy yangilash
  React.useEffect(() => {
    if (status !== "authenticated") return;
    loadDevices();
    const id = setInterval(() => loadDevices({ silent: true }), 30000);
    return () => clearInterval(id);
  }, [status, loadDevices]);

  // Ruxsatsiz bo'lsa login sahifasiga
  React.useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  // Real-time hodisalar
  useSocket(status === "authenticated");

  if (status !== "authenticated") return <Splash />;

  return (
    <div className="min-h-screen">
      <AppSidebar />
      <div className="lg:pl-72">
        <AppHeader />
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}

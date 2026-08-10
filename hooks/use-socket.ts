"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { socketUrl } from "@/lib/api";
import { useDeviceStore } from "@/store/device-store";
import { useTaskStore } from "@/store/task-store";
import { actionByCommand } from "@/lib/actions";
import type { CommandResultEvent } from "@/lib/types";

/**
 * Autentifikatsiyadan keyin ulanadigan Socket.io hook.
 * - device_online / device_offline → qurilmalar ro'yxatini yangilaydi
 * - command_result → tegishli vazifadagi telefon holatini tasdiqlaydi
 */
export function useSocket(enabled: boolean) {
  const socketRef = useRef<Socket | null>(null);
  const load = useDeviceStore((s) => s.load);

  useEffect(() => {
    if (!enabled) return;

    const socket = io(socketUrl(), {
      path: "/socket.io",
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionDelay: 1500,
    });
    socketRef.current = socket;

    const refresh = () => load({ silent: true });

    socket.on("device_online", refresh);
    socket.on("device_offline", refresh);

    socket.on("command_result", (data: CommandResultEvent) => {
      refresh();
      if (!data?.deviceId) return;

      const finalStatus = data.status === "executed" ? "executed" : "failed";
      const action = data.command ? actionByCommand(data.command) : undefined;

      const { tasks, updateUnit, finalizeTask } = useTaskStore.getState();
      // Shu qurilma bo'yicha tasdiq kutayotgan eng so'nggi faol vazifa
      const task = tasks.find(
        (t) =>
          t.status === "running" &&
          (!action || t.actionId === action.id) &&
          t.units.some(
            (u) => u.deviceId === data.deviceId && u.status === "sent",
          ),
      );
      if (!task) return;
      updateUnit(task.id, data.deviceId, { status: finalStatus });
      finalizeTask(task.id);
    });

    return () => {
      socket.off("device_online", refresh);
      socket.off("device_offline", refresh);
      socket.off("command_result");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled, load]);

  return socketRef;
}

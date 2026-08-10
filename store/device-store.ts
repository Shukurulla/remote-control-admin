"use client";

import { create } from "zustand";
import { devicesApi } from "@/lib/api";
import type { Device } from "@/lib/types";

interface DeviceState {
  devices: Device[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  lastUpdated: number | null;

  load: (opts?: { silent?: boolean }) => Promise<void>;

  byId: (id: string) => Device | undefined;
  onlineDevices: () => Device[];
  onlineCount: () => number;
}

export const useDeviceStore = create<DeviceState>((set, get) => ({
  devices: [],
  loading: false,
  loaded: false,
  error: null,
  lastUpdated: null,

  load: async (opts) => {
    if (!opts?.silent) set({ loading: true });
    try {
      const devices = await devicesApi.list();
      set({
        devices: Array.isArray(devices) ? devices : [],
        loading: false,
        loaded: true,
        error: null,
        lastUpdated: Date.now(),
      });
    } catch (e) {
      set({
        loading: false,
        loaded: true,
        error: e instanceof Error ? e.message : "Qurilmalarni yuklab bo'lmadi",
      });
    }
  },

  byId: (id) => get().devices.find((d) => d.deviceId === id),
  onlineDevices: () => get().devices.filter((d) => d.isOnline),
  onlineCount: () => get().devices.filter((d) => d.isOnline).length,
}));

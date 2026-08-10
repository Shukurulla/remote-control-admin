"use client";

import { create } from "zustand";
import { authApi, clearToken, getToken, setToken } from "@/lib/api";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  status: AuthStatus;
  username: string | null;
  /** Ilova ochilganda tokenni tekshirish */
  bootstrap: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: "loading",
  username: null,

  bootstrap: async () => {
    const token = getToken();
    if (!token) {
      set({ status: "unauthenticated", username: null });
      return;
    }
    try {
      const data = await authApi.verify();
      if (data.valid) {
        set({ status: "authenticated", username: data.username ?? "Admin" });
      } else {
        clearToken();
        set({ status: "unauthenticated", username: null });
      }
    } catch {
      // Tarmoq xatosi — foydalanuvchini chiqarib yubormaymiz,
      // lekin holatni aniqlaymiz
      clearToken();
      set({ status: "unauthenticated", username: null });
    }
  },

  login: async (username, password) => {
    const data = await authApi.login(username, password);
    setToken(data.token);
    set({ status: "authenticated", username: data.username ?? username });
  },

  logout: () => {
    clearToken();
    set({ status: "unauthenticated", username: null });
  },
}));

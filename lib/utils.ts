import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Sana/vaqtni o'zbekcha formatda ko'rsatish */
export function formatDate(input?: string | number | Date): string {
  if (!input) return "—";
  try {
    return new Date(input).toLocaleString("uz-UZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

/** "5 daqiqa oldin" ko'rinishida nisbiy vaqt */
export function timeAgo(input?: string | number | Date): string {
  if (!input) return "—";
  const then = new Date(input).getTime();
  if (Number.isNaN(then)) return "—";
  const diff = Math.max(0, Date.now() - then);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "hozirgina";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} daqiqa oldin`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} soat oldin`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} kun oldin`;
  return formatDate(input);
}

/** Matnni kerakli uzunlikda qirqish */
export function truncate(text: string, max = 42): string {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/** Qurilma uchun ko'rsatiladigan nom */
export function deviceLabel(d: {
  deviceName?: string;
  brand?: string;
  model?: string;
  deviceId: string;
}): string {
  if (d.deviceName) return d.deviceName;
  const bm = [d.brand, d.model].filter(Boolean).join(" ").trim();
  return bm || d.deviceId.slice(0, 12);
}

/** Ism/nomdan initsiallar */
export function initials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

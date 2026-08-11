import {
  LayoutDashboard,
  Plus,
  ListChecks,
  ScrollText,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import type { AiLang, AiTone, ProgressStep, TaskStatus, UnitStatus } from "./types";

// ── Navigatsiya ─────────────────────────────────────────────
export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
  group: "Boshqaruv" | "Vazifalar" | "Resurslar";
  exact?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Ish stoli",
    href: "/",
    icon: LayoutDashboard,
    description: "Umumiy holat va faol vazifalar",
    group: "Boshqaruv",
    exact: true,
  },
  {
    title: "Yangi vazifa",
    href: "/new-task",
    icon: Plus,
    description: "Izoh yoki xabar vazifasini yaratish",
    group: "Vazifalar",
  },
  {
    title: "Vazifalar",
    href: "/tasks",
    icon: ListChecks,
    description: "Faol va yakunlangan vazifalar",
    group: "Vazifalar",
  },
  {
    title: "Jurnal",
    href: "/journal",
    icon: ScrollText,
    description: "Barcha amallar tarixi va hisobot",
    group: "Vazifalar",
  },
  {
    title: "Telefonlar",
    href: "/devices",
    icon: Smartphone,
    description: "Qurilmalar parki va holati",
    group: "Resurslar",
  },
];

export const NAV_GROUPS: NavItem["group"][] = [
  "Boshqaruv",
  "Vazifalar",
  "Resurslar",
];

// ── Holat metama'lumotlari ──────────────────────────────────
export type BadgeVariant =
  | "default"
  | "secondary"
  | "success"
  | "destructive"
  | "warning"
  | "muted"
  | "outline";

export const TASK_STATUS: Record<
  TaskStatus,
  { label: string; variant: BadgeVariant }
> = {
  running: { label: "Jarayonda", variant: "warning" },
  completed: { label: "Bajarildi", variant: "success" },
  partial: { label: "Qisman bajarildi", variant: "warning" },
  failed: { label: "Xato", variant: "destructive" },
};

export const UNIT_STATUS: Record<
  UnitStatus,
  { label: string; variant: BadgeVariant }
> = {
  pending: { label: "Navbatda", variant: "muted" },
  sent: { label: "Yuborildi", variant: "default" },
  executed: { label: "Bajarildi", variant: "success" },
  failed: { label: "Xato", variant: "destructive" },
};

// ── Progress bosqichlari ───────────────────────────────────
export const PROGRESS_STEPS: {
  step: ProgressStep;
  label: string;
  icon: string;
}[] = [
  { step: "received", label: "Buyruq qabul qilindi", icon: "📩" },
  { step: "opening_app", label: "Instagram ochilmoqda", icon: "📱" },
  { step: "app_opened", label: "Instagram ochildi", icon: "✅" },
  { step: "opening_comment", label: "Comment oynasi ochilmoqda", icon: "💬" },
  { step: "comment_opened", label: "Comment oynasi ochildi", icon: "✅" },
  { step: "typing", label: "Comment yozilmoqda", icon: "⌨️" },
  { step: "posting", label: "Comment yuborilmoqda", icon: "📤" },
  { step: "completed", label: "Muvaffaqiyatli!", icon: "🎉" },
  { step: "failed", label: "Xatolik", icon: "❌" },
];

export function progressStepIndex(step: ProgressStep): number {
  const idx = PROGRESS_STEPS.findIndex((s) => s.step === step);
  return idx >= 0 ? idx : -1;
}

// ── AI sozlamalari ──────────────────────────────────────────
export const AI_LANGS: { value: AiLang; label: string; flag: string }[] = [
  { value: "uz", label: "O'zbekcha", flag: "🇺🇿" },
  { value: "qq", label: "Qaraqalpaqcha", flag: "🏳️" },
  { value: "kz", label: "Qozaqcha", flag: "🇰🇿" },
  { value: "ru", label: "Ruscha", flag: "🇷🇺" },
];

export const AI_TONES: { value: AiTone; label: string; emoji: string }[] = [
  { value: "positive", label: "Ijobiy", emoji: "👍" },
  { value: "neutral", label: "Neytral", emoji: "😐" },
  { value: "negative", label: "Salbiy", emoji: "👎" },
];

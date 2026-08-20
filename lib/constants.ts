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
export interface ProgressStepMeta {
  step: ProgressStep;
  label: string;
  icon: string;
  description: string;
  troubleshoot?: string;
}

export const PROGRESS_STEPS: ProgressStepMeta[] = [
  {
    step: "received",
    label: "Buyruq qabul qilindi",
    icon: "📩",
    description: "Telefon serverdan vazifani qabul qildi va bajarishga tayyorlandi.",
  },
  {
    step: "opening_app",
    label: "Instagram ochilmoqda",
    icon: "📱",
    description: "Accessibility service Instagram ilovasini foreground ga chiqarmoqda.",
    troubleshoot: "Instagram o'rnatilmagan yoki ilova crash bo'lgan bo'lishi mumkin.",
  },
  {
    step: "app_opened",
    label: "Instagram ochildi",
    icon: "✅",
    description: "Instagram ilovasi foreground'da. Endi berilgan post havolasi ochiladi.",
  },
  {
    step: "post_loading",
    label: "Post yuklanmoqda",
    icon: "⏳",
    description: "Instagram post kontentini yuklamoqda (video, rasm, tavsif).",
    troubleshoot: "Internet sekin yoki post uchirilgan bo'lishi mumkin.",
  },
  {
    step: "post_loaded",
    label: "Post ochildi",
    icon: "✅",
    description: "Post kontenti ekranda ko'rinmoqda (like, comment, share iconlari topildi).",
  },
  {
    step: "checking_permission",
    label: "Comment ruxsati tekshirilmoqda",
    icon: "🔍",
    description: "Postda comment yozishga ruxsat borligi tekshirilmoqda (cheklangan/o'chirilgan holatlar).",
    troubleshoot: "Muallif commentlarni o'chirgan yoki cheklagan bo'lishi mumkin.",
  },
  {
    step: "opening_comment",
    label: "Comment oynasi ochilmoqda",
    icon: "💬",
    description: "Comment tugmasi qidirilmoqda va bosilmoqda.",
    troubleshoot: "UI o'zgargan yoki comment tugmasi mavjud emas.",
  },
  {
    step: "comment_opened",
    label: "Comment oynasi ochildi",
    icon: "✅",
    description: "Comment yozish input oynasi topildi va yozish uchun tayyor.",
  },
  {
    step: "typing",
    label: "Comment yozilmoqda",
    icon: "⌨️",
    description: "Comment matni input maydoniga kiritilmoqda.",
    troubleshoot: "Klaviatura ochilmagan yoki input maydoni ishlamayapti.",
  },
  {
    step: "text_verified",
    label: "Matn tasdiqlandi",
    icon: "✍️",
    description: "Kiritilgan matn input maydonida ko'rinishi tekshirildi.",
    troubleshoot: "Matn yozilgandek ko'rindi lekin haqiqatda kiritilmadi.",
  },
  {
    step: "posting",
    label: "Post tugmasi bosildi",
    icon: "📤",
    description: "\"Post\" tugmasi topildi va bosildi.",
    troubleshoot: "Post tugmasi topilmadi yoki bosilmadi.",
  },
  {
    step: "verifying",
    label: "Natija tekshirilmoqda",
    icon: "🔎",
    description: "Comment haqiqatan joylanganini tekshirmoqda: input tozalandimi, feed'da ko'rinyaptimi, xatolik xabari bormi.",
    troubleshoot: "Instagram commentni rad qilgan bo'lishi mumkin (spam bloki, cheklangan post, rate limit).",
  },
  {
    step: "completed",
    label: "Muvaffaqiyatli!",
    icon: "🎉",
    description: "Comment haqiqatan joylanganligi tasdiqlandi. Vazifa tugadi.",
  },
  {
    step: "failed",
    label: "Xatolik",
    icon: "❌",
    description: "Vazifa bajarilmadi. Xato tafsilotlarini pastdan ko'ring.",
  },
];

export function progressStepIndex(step: ProgressStep): number {
  const idx = PROGRESS_STEPS.findIndex((s) => s.step === step);
  return idx >= 0 ? idx : -1;
}

export function progressStepMeta(step: ProgressStep): ProgressStepMeta | undefined {
  return PROGRESS_STEPS.find((s) => s.step === step);
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

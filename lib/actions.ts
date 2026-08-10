import {
  Instagram,
  MessageCircle,
  Send,
  MessageSquareText,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { ActionId, Channel, CommandName, TargetKind } from "./types";

/**
 * Amal katalogi — vazifa yaratish oqimining o'zagi.
 * Har bir "amal turi" qaysi kanal, qaysi backend buyrug'i va qanday
 * maydonlar kerakligini belgilaydi. Barcha sahifalar shu katalogdan oziqlanadi.
 */
export interface ActionDef {
  id: ActionId;
  channel: Channel;
  channelLabel: string;
  label: string;
  short: string;
  description: string;
  /** AI rejimi /api/commands/ai-comment ni ishlatadi, aks holda /api/commands/send */
  mode: "send" | "ai";
  command?: CommandName;
  target: TargetKind;
  targetLabel: string;
  targetPlaceholder: string;
  textLabel: string;
  textPlaceholder: string;
  accent: "tg" | "ig" | "wa" | "ai";
  icon: LucideIcon;
}

export const ACTIONS: ActionDef[] = [
  {
    id: "ig_comment",
    channel: "instagram",
    channelLabel: "Instagram",
    label: "Instagram izoh",
    short: "IG izoh",
    description: "Post havolasiga bir xil izoh qoldirish",
    mode: "send",
    command: "post_instagram_comment",
    target: "post",
    targetLabel: "Instagram post havolasi",
    targetPlaceholder: "https://www.instagram.com/p/XXXXXXX/",
    textLabel: "Izoh matni",
    textPlaceholder: "Bu yerga izoh matnini yozing…",
    accent: "ig",
    icon: Instagram,
  },
  {
    id: "ig_ai_comment",
    channel: "instagram",
    channelLabel: "Instagram",
    label: "AI Instagram izoh",
    short: "AI izoh",
    description: "Gemini har telefon uchun noyob izoh yozadi",
    mode: "ai",
    target: "post",
    targetLabel: "Instagram post havolasi",
    targetPlaceholder: "https://www.instagram.com/p/XXXXXXX/",
    textLabel: "Post tavsifi (Gemini uchun)",
    textPlaceholder:
      "Masalan: Bu video Chevrolet Nexia 2 ni zamonaviy uslubda ko'rsatadi…",
    accent: "ai",
    icon: Sparkles,
  },
  {
    id: "tg_comment",
    channel: "telegram",
    channelLabel: "Telegram",
    label: "Telegram izoh",
    short: "TG izoh",
    description: "Kanal postiga izoh qoldirish",
    mode: "send",
    command: "post_telegram_comment",
    target: "post",
    targetLabel: "Telegram post havolasi",
    targetPlaceholder: "https://t.me/kanalname/123",
    textLabel: "Izoh matni",
    textPlaceholder: "Bu yerga izoh matnini yozing…",
    accent: "tg",
    icon: MessageCircle,
  },
  {
    id: "tg_message",
    channel: "telegram",
    channelLabel: "Telegram",
    label: "Telegram xabar",
    short: "TG xabar",
    description: "Foydalanuvchiga to'g'ridan-to'g'ri xabar (DM)",
    mode: "send",
    command: "send_telegram_message",
    target: "recipient",
    targetLabel: "Qabul qiluvchi (username / ism)",
    targetPlaceholder: "Shukurulla",
    textLabel: "Xabar matni",
    textPlaceholder: "Salom!",
    accent: "tg",
    icon: Send,
  },
  {
    id: "wa_message",
    channel: "whatsapp",
    channelLabel: "WhatsApp",
    label: "WhatsApp xabar",
    short: "WA xabar",
    description: "WhatsApp orqali xabar yuborish",
    mode: "send",
    command: "send_whatsapp_message",
    target: "recipient",
    targetLabel: "Qabul qiluvchi (ism / raqam)",
    targetPlaceholder: "Ali Karimov",
    textLabel: "Xabar matni",
    textPlaceholder: "Xabar matnini yozing…",
    accent: "wa",
    icon: MessageSquareText,
  },
];

export function actionById(id: string): ActionDef | undefined {
  return ACTIONS.find((a) => a.id === id);
}

/** Backend buyruq nomidan amal ta'rifini topish (jurnal/tarix uchun) */
export function actionByCommand(command: string): ActionDef | undefined {
  return ACTIONS.find((a) => a.command === command);
}

export const CHANNELS: {
  id: Channel;
  label: string;
  accent: "tg" | "ig" | "wa";
}[] = [
  { id: "instagram", label: "Instagram", accent: "ig" },
  { id: "telegram", label: "Telegram", accent: "tg" },
  { id: "whatsapp", label: "WhatsApp", accent: "wa" },
];

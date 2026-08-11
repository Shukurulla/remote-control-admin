// ── Backend API bilan mos keladigan tiplar ──────────────────

export interface Device {
  deviceId: string;
  deviceName?: string;
  brand?: string;
  model?: string;
  isOnline: boolean;
  [key: string]: unknown;
}

export type CommandStatus = "pending" | "executed" | "failed";

export type CommandName =
  | "post_telegram_comment"
  | "post_instagram_comment"
  | "send_telegram_message"
  | "send_whatsapp_message";

export interface CommandParams {
  postUrl?: string;
  commentText?: string;
  recipient?: string;
  message?: string;
  [key: string]: unknown;
}

export interface CommandRecord {
  _id?: string;
  command: CommandName | string;
  params?: CommandParams;
  status: CommandStatus;
  createdAt?: string;
  deviceId?: string;
}

export interface AiCommentResult {
  deviceId: string;
  comment: string;
  status: string;
  success: boolean;
  commandId?: string;
}

export interface AiCommentResponse {
  results: AiCommentResult[];
}

export interface LoginResponse {
  token: string;
  username: string;
  error?: string;
}

export interface VerifyResponse {
  valid: boolean;
  username?: string;
}

export interface CommandResultEvent {
  command: CommandName | string;
  status: CommandStatus;
  deviceId?: string;
  commandId?: string;
}

export interface CommandProgressEvent {
  commandId: string;
  deviceId: string;
  command: string;
  step: ProgressStep;
  message?: string;
  timestamp: string;
}

export type AiTone = "positive" | "neutral" | "negative";
export type AiLang = "uz" | "qq" | "kz" | "ru";

// ── Vazifa modeli (frontend abstraksiyasi) ──────────────────
// Backend faqat qurilma bo'yicha buyruqlarni biladi. "Vazifa" — bu
// operator uchun bitta amalni (bir nechta telefonga) yagona ish sifatida
// birlashtiruvchi mijoz tomonidagi qatlam (localStorage'da saqlanadi).

export type Channel = "instagram" | "telegram" | "whatsapp";

export type ActionId =
  | "ig_comment"
  | "ig_ai_comment"
  | "tg_comment"
  | "tg_message"
  | "wa_message";

export type TargetKind = "post" | "recipient";

/** Bitta telefon uchun vazifa natijasi holati */
export type UnitStatus = "pending" | "sent" | "executed" | "failed";

export type ProgressStep =
  | "received"
  | "opening_app"
  | "app_opened"
  | "opening_comment"
  | "comment_opened"
  | "typing"
  | "posting"
  | "completed"
  | "failed";

export interface ProgressEntry {
  step: ProgressStep;
  message: string;
  timestamp: number;
}

export interface TaskUnit {
  deviceId: string;
  deviceName: string;
  status: UnitStatus;
  comment?: string;
  updatedAt: number;
  commandId?: string;
  currentStep?: ProgressStep;
  stepMessage?: string;
  progressHistory?: ProgressEntry[];
}

/** Vazifaning umumiy holati */
export type TaskStatus = "running" | "completed" | "partial" | "failed";

export interface Task {
  id: string;
  actionId: ActionId;
  createdAt: number;
  finishedAt?: number;
  // Maqsad
  postUrl?: string;
  recipient?: string;
  text?: string; // izoh yoki xabar matni
  ai?: { description: string; tone: AiTone; lang: AiLang };
  // Bajaruvchilar
  units: TaskUnit[];
  status: TaskStatus;
}

import { commandsApi } from "@/lib/api";
import { actionById, type ActionDef } from "@/lib/actions";
import { useTaskStore } from "@/store/task-store";
import type { ActionId, AiLang, AiTone, CommandParams } from "@/lib/types";

export interface RunInput {
  actionId: ActionId;
  postUrl?: string;
  recipient?: string;
  text?: string;
  ai?: { description: string; tone: AiTone; lang: AiLang };
  devices: { deviceId: string; deviceName: string }[];
}

function buildParams(action: ActionDef, input: RunInput): CommandParams {
  if (action.target === "post") {
    return { postUrl: input.postUrl, commentText: input.text };
  }
  return { recipient: input.recipient, message: input.text };
}

/**
 * Vazifani yaratadi va fonda ishga tushiradi (kutilmaydi).
 * Vazifa ID'sini darhol qaytaradi — chaqiruvchi monitoring sahifasiga o'tadi,
 * natijalar esa store orqali jonli yangilanadi.
 */
export function runTask(input: RunInput): string {
  const action = actionById(input.actionId);
  if (!action) throw new Error("Noma'lum amal turi");

  const store = useTaskStore.getState();
  const task = store.createTask({
    actionId: input.actionId,
    postUrl: input.postUrl,
    recipient: input.recipient,
    text: input.text,
    ai: input.ai,
    units: input.devices.map((d) => ({
      deviceId: d.deviceId,
      deviceName: d.deviceName,
      status: "pending",
      updatedAt: Date.now(),
    })),
  });

  void process(task.id, action, input);
  return task.id;
}

async function process(taskId: string, action: ActionDef, input: RunInput) {
  const { updateUnit, finalizeTask } = useTaskStore.getState();

  if (action.mode === "ai") {
    try {
      const data = await commandsApi.aiComment({
        postUrl: input.postUrl ?? "",
        postDescription: input.ai?.description ?? "",
        tone: input.ai?.tone ?? "positive",
        lang: input.ai?.lang ?? "uz",
        deviceIds: input.devices.map((d) => d.deviceId),
      });
      const map = new Map((data.results ?? []).map((r) => [r.deviceId, r]));
      for (const d of input.devices) {
        const r = map.get(d.deviceId);
        if (r && r.success) {
          updateUnit(taskId, d.deviceId, {
            status: "sent",
            comment: r.comment,
            commandId: r.commandId,
          });
        } else {
          updateUnit(taskId, d.deviceId, {
            status: "failed",
            comment: r?.comment,
          });
        }
      }
    } catch {
      for (const d of input.devices) {
        updateUnit(taskId, d.deviceId, { status: "failed" });
      }
    }
    finalizeTask(taskId);
    return;
  }

  // send rejimi — har bir qurilmaga ketma-ket
  const params = buildParams(action, input);
  for (const d of input.devices) {
    try {
      const res = await commandsApi.send(d.deviceId, action.command!, params);
      const cmdId = res?.command && typeof res.command === "object"
        ? (res.command as Record<string, unknown>)._id as string | undefined
        : undefined;
      updateUnit(taskId, d.deviceId, {
        status: res && res.success === false ? "failed" : "sent",
        commandId: cmdId,
      });
    } catch {
      updateUnit(taskId, d.deviceId, { status: "failed" });
    }
  }
  finalizeTask(taskId);
}

/** Xato bo'lgan telefonlarga vazifani qayta yuborish */
export function retryFailed(taskId: string): void {
  const store = useTaskStore.getState();
  const task = store.getTask(taskId);
  if (!task) return;
  const action = actionById(task.actionId);
  if (!action) return;

  const failed = task.units.filter((u) => u.status === "failed");
  if (!failed.length) return;

  const input: RunInput = {
    actionId: task.actionId,
    postUrl: task.postUrl,
    recipient: task.recipient,
    text: task.text,
    ai: task.ai,
    devices: failed.map((u) => ({
      deviceId: u.deviceId,
      deviceName: u.deviceName,
    })),
  };

  // Qayta urinishdan oldin holatni tiklaymiz
  failed.forEach((u) =>
    store.updateUnit(taskId, u.deviceId, { status: "pending" }),
  );
  void process(taskId, action, input);
}

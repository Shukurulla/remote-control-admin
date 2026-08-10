"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Link2,
  User,
  Rocket,
  Bot,
  CheckCircle2,
  CircleDashed,
} from "lucide-react";
import { toast } from "sonner";
import { cn, deviceLabel, truncate } from "@/lib/utils";
import { ACTIONS, actionById, CHANNELS } from "@/lib/actions";
import { AI_LANGS, AI_TONES } from "@/lib/constants";
import { runTask } from "@/lib/task-runner";
import { useDeviceStore } from "@/store/device-store";
import type { ActionId, AiLang, AiTone } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { ActionIcon } from "@/components/action-icon";
import { DevicePicker } from "@/components/device-picker";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function StepLabel({ n, title }: { n: number; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        {n}
      </span>
      <h2 className="text-sm font-semibold">{title}</h2>
    </div>
  );
}

function Composer() {
  const router = useRouter();
  const params = useSearchParams();
  const devices = useDeviceStore((s) => s.devices);

  const [actionId, setActionId] = React.useState<ActionId | null>(
    (params.get("type") as ActionId) &&
      actionById(params.get("type") as string)
      ? (params.get("type") as ActionId)
      : null,
  );
  const [postUrl, setPostUrl] = React.useState("");
  const [recipient, setRecipient] = React.useState("");
  const [text, setText] = React.useState("");
  const [aiDescription, setAiDescription] = React.useState("");
  const [aiLang, setAiLang] = React.useState<AiLang>("uz");
  const [aiTone, setAiTone] = React.useState<AiTone>("positive");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [launching, setLaunching] = React.useState(false);

  const action = actionId ? actionById(actionId) : undefined;

  // Validatsiya
  const targetOk = action
    ? action.target === "post"
      ? postUrl.trim().length > 0
      : recipient.trim().length > 0
    : false;
  const textOk = action
    ? action.mode === "ai"
      ? aiDescription.trim().length > 0
      : text.trim().length > 0
    : false;
  const devicesOk = selected.length > 0;
  const canLaunch = Boolean(action) && targetOk && textOk && devicesOk;

  function launch() {
    if (!action || !canLaunch) return;
    setLaunching(true);
    try {
      const chosen = selected
        .map((id) => devices.find((d) => d.deviceId === id))
        .filter(Boolean)
        .map((d) => ({
          deviceId: d!.deviceId,
          deviceName: deviceLabel(d!),
        }));

      const taskId = runTask({
        actionId: action.id,
        postUrl: action.target === "post" ? postUrl.trim() : undefined,
        recipient: action.target === "recipient" ? recipient.trim() : undefined,
        text: action.mode === "send" ? text.trim() : undefined,
        ai:
          action.mode === "ai"
            ? { description: aiDescription.trim(), tone: aiTone, lang: aiLang }
            : undefined,
        devices: chosen,
      });
      toast.success(`Vazifa boshlandi — ${chosen.length} ta telefon`);
      router.push(`/tasks/${taskId}`);
    } catch (e) {
      setLaunching(false);
      toast.error(e instanceof Error ? e.message : "Vazifani boshlab bo'lmadi");
    }
  }

  const checklist = [
    { label: "Amal turi", ok: Boolean(action) },
    { label: "Maqsad va matn", ok: targetOk && textOk },
    { label: "Telefonlar", ok: devicesOk },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yangi vazifa"
        description="Amal turini tanlang, maqsad va matnni kiriting, telefonlarni belgilang."
        icon={<Rocket />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Chap: forma */}
        <div className="order-2 min-w-0 space-y-6 lg:order-1">
          {/* 1. Amal turi */}
          <Card>
            <CardContent className="pt-6">
              <StepLabel n={1} title="Amal turini tanlang" />
              <div className="space-y-4">
                {CHANNELS.map((ch) => {
                  const items = ACTIONS.filter((a) => a.channel === ch.id);
                  return (
                    <div key={ch.id}>
                      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {ch.label}
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {items.map((a) => {
                          const active = actionId === a.id;
                          return (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => setActionId(a.id)}
                              className={cn(
                                "flex items-start gap-3 rounded-xl border p-3 text-left transition-colors",
                                active
                                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                                  : "hover:border-primary/40 hover:bg-accent/40",
                              )}
                            >
                              <ActionIcon actionId={a.id} size="sm" />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 text-sm font-semibold">
                                  {a.label}
                                  {a.mode === "ai" && (
                                    <Badge
                                      variant="secondary"
                                      className="bg-ai/15 px-1.5 py-0 text-[10px] font-bold text-ai"
                                    >
                                      AI
                                    </Badge>
                                  )}
                                </div>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {a.description}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 2. Maqsad va matn */}
          <Card className={cn(!action && "opacity-60")}>
            <CardContent className="space-y-5 pt-6">
              <StepLabel n={2} title="Maqsad va matn" />
              {!action ? (
                <p className="text-sm text-muted-foreground">
                  Avval yuqoridan amal turini tanlang.
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>{action.targetLabel}</Label>
                    <div className="relative">
                      {action.target === "post" ? (
                        <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      ) : (
                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      )}
                      <Input
                        className="pl-9"
                        placeholder={action.targetPlaceholder}
                        value={action.target === "post" ? postUrl : recipient}
                        onChange={(e) =>
                          action.target === "post"
                            ? setPostUrl(e.target.value)
                            : setRecipient(e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {action.mode === "ai" ? (
                    <>
                      <div className="space-y-2">
                        <Label>{action.textLabel}</Label>
                        <Textarea
                          rows={4}
                          placeholder={action.textPlaceholder}
                          value={aiDescription}
                          onChange={(e) => setAiDescription(e.target.value)}
                        />
                        <p className="flex items-center gap-1.5 text-xs text-ai">
                          <Bot className="h-3.5 w-3.5" />
                          Har bir telefon uchun alohida noyob izoh yoziladi.
                        </p>
                      </div>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Izoh tili</Label>
                          <Select
                            value={aiLang}
                            onValueChange={(v) => setAiLang(v as AiLang)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {AI_LANGS.map((l) => (
                                <SelectItem key={l.value} value={l.value}>
                                  <span className="flex items-center gap-2">
                                    <span>{l.flag}</span>
                                    {l.label}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Ohang</Label>
                          <RadioGroup
                            value={aiTone}
                            onValueChange={(v) => setAiTone(v as AiTone)}
                            className="grid grid-cols-3 gap-2"
                          >
                            {AI_TONES.map((t) => (
                              <Label
                                key={t.value}
                                htmlFor={`t-${t.value}`}
                                className={cn(
                                  "flex cursor-pointer flex-col items-center gap-1 rounded-lg border p-2.5 text-xs transition-colors",
                                  aiTone === t.value
                                    ? "border-primary bg-primary/5"
                                    : "hover:bg-accent/50",
                                )}
                              >
                                <RadioGroupItem
                                  id={`t-${t.value}`}
                                  value={t.value}
                                  className="sr-only"
                                />
                                <span className="text-lg">{t.emoji}</span>
                                {t.label}
                              </Label>
                            ))}
                          </RadioGroup>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Label>{action.textLabel}</Label>
                      <Textarea
                        rows={4}
                        placeholder={action.textPlaceholder}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* 3. Telefonlar */}
          <Card>
            <CardContent className="pt-6">
              <StepLabel n={3} title="Telefonlarni tanlang" />
              <DevicePicker selected={selected} onChange={setSelected} />
            </CardContent>
          </Card>
        </div>

        {/* O'ng: xulosa va ishga tushirish */}
        <div className="order-1 lg:order-2">
          <Card className="lg:sticky lg:top-24">
            <CardContent className="space-y-4 pt-6">
              <h3 className="text-sm font-semibold">Xulosa</h3>

              {action ? (
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <ActionIcon actionId={action.id} size="sm" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{action.label}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {action.channelLabel}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Amal tanlanmagan
                </p>
              )}

              <div className="space-y-2.5 text-sm">
                {checklist.map((c) => (
                  <div key={c.label} className="flex items-center gap-2">
                    {c.ok ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <CircleDashed className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span
                      className={cn(
                        c.ok ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {c.label}
                    </span>
                  </div>
                ))}
              </div>

              {(targetOk || textOk) && action && (
                <>
                  <Separator />
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {action.target === "post" && postUrl && (
                      <p className="truncate">🔗 {truncate(postUrl, 34)}</p>
                    )}
                    {action.target === "recipient" && recipient && (
                      <p className="truncate">👤 {recipient}</p>
                    )}
                    {action.mode === "send" && text && (
                      <p className="line-clamp-2">💬 {text}</p>
                    )}
                    {action.mode === "ai" && aiDescription && (
                      <p className="line-clamp-2">🤖 {aiDescription}</p>
                    )}
                  </div>
                </>
              )}

              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Telefonlar</span>
                <span className="font-semibold tabular-nums">
                  {selected.length} ta
                </span>
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={!canLaunch || launching}
                onClick={launch}
              >
                <Rocket className="h-4 w-4" />
                {selected.length > 0
                  ? `${selected.length} ta telefonga yuborish`
                  : "Ishga tushirish"}
              </Button>
              {!canLaunch && (
                <p className="text-center text-xs text-muted-foreground">
                  Barcha bosqichlarni to'ldiring
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function NewTaskPage() {
  return (
    <Suspense fallback={null}>
      <Composer />
    </Suspense>
  );
}

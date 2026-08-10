# SMM Bot — Admin Panel (Next.js + shadcn/ui)

Telefonlar tarmog'i orqali Telegram, Instagram va WhatsApp'da avtomatlashtirilgan
izoh va xabar yuborishni boshqaruvchi admin panel. Bu — eski `HTML/CSS/JS`
versiyasining **Next.js 14 + TypeScript + Tailwind + shadcn/ui** ga ko'chirilgan,
dark/light mavzuli, professional variantidir.

> Mavjud backend API'lari **o'zgartirilmagan** — panel eski endpointlar bilan
> aynan bir xil ishlaydi.

## Texnologiyalar

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (Radix UI)
- **Zustand** — holat boshqaruvi (auth + qurilma tanlash)
- **socket.io-client** — real-time qurilma holati va buyruq natijalari
- **next-themes** — dark/light mavzu (standart: qorong'i, to'liq #000 emas)
- **sonner** — bildirishnomalar (toast)

## Ishga tushirish

```bash
npm install
npm run dev
```

Panel `http://localhost:3001` da ochiladi.

### Backendga ulanish

Panel `/api/*` va `/socket.io/*` so'rovlarini mavjud backendga **proxy** qiladi.
Backend manzilini `.env.local` orqali sozlang (`.env.example` dan nusxa oling):

```bash
BACKEND_URL=http://localhost:3000
```

`next.config.mjs` dagi `rewrites` shu manzilga yo'naltiradi, shuning uchun
frontend kodida nisbiy yo'llar (`/api/...`) o'zgarmasdan ishlaydi va CORS
muammosi bo'lmaydi.

## Ishlab chiqarish (production)

```bash
npm run build
npm run start
```

## Loyiha tuzilishi

Tizim **vazifa-markazli** (task-centric): operator amal turini tanlaydi →
maqsad/matn kiritadi → telefonlarni belgilaydi → **yagona vazifa** yaratadi va
uning bajarilishini **jonli** kuzatadi. Barcha kanallar (TG/IG/WA/AI) bitta
oqimda birlashadi.

```
app/
  layout.tsx              # Root layout, mavzu, fontlar, Toaster
  login/page.tsx          # Kirish sahifasi
  (panel)/
    layout.tsx            # Auth guard + sidebar/header + socket
    page.tsx              # Ish stoli (operatsion markaz)
    new-task/            # Yangi vazifa yaratish oqimi (yagona)
    tasks/               # Vazifalar ro'yxati
    tasks/[id]/          # Vazifa monitoringi (jonli, har telefon holati)
    journal/             # Jurnal + CSV hisobot
    devices/             # Telefonlar parki (jadval)
    devices/[id]/        # Telefon detali + buyruqlar tarixi
components/
  ui/                     # shadcn/ui primitivlari
  app-sidebar.tsx         # Yon menyu (+ Yangi vazifa, tizim holati)
  app-header.tsx          # Yuqori panel
  device-picker.tsx       # Vazifa uchun telefon tanlash
  task-list-item.tsx      # Vazifa qatori (jonli progress)
  action-icon.tsx, status-badges.tsx, ...
lib/
  api.ts                  # API klient (eski endpointlar — o'zgarmagan)
  actions.ts              # Amal katalogi (5 amal turi)
  task-runner.ts          # Vazifani ishga tushirish + jonli yangilash
  task-utils.ts, types.ts, constants.ts, utils.ts
store/
  auth-store.ts           # Autentifikatsiya holati
  device-store.ts         # Qurilmalar ro'yxati (jonli)
  task-store.ts           # Vazifalar (localStorage'da saqlanadi)
hooks/
  use-socket.ts           # Socket.io — qurilma va vazifa tasdig'i
legacy/                   # Eski HTML/CSS/JS versiyasi (zaxira)
```

**Vazifa (Task)** — bu backendda emas, frontendda (localStorage) saqlanadigan
qatlam: bitta amalni bir nechta telefonga yuborishni yagona kuzatiladigan ish
sifatida birlashtiradi. Har bir telefon holati `send` javobi va Socket.io
`command_result` tasdig'i asosida jonli yangilanadi.

## Saqlangan API'lar

| Endpoint | Metod | Vazifa |
| --- | --- | --- |
| `/api/auth/login` | POST | Tizimga kirish |
| `/api/auth/verify` | GET | Token tekshirish |
| `/api/devices` | GET | Qurilmalar ro'yxati |
| `/api/commands/send` | POST | Buyruq yuborish (TG/IG izoh, TG/WA xabar) |
| `/api/commands/ai-comment` | POST | Gemini AI izoh generatsiya + yuborish |
| `/api/commands/history/:deviceId` | GET | Buyruqlar tarixi |
| Socket.io | — | `device_online`, `device_offline`, `command_result` |

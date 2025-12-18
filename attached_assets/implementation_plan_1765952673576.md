# Janji.in - Implementation Plan & Design System

## 1. Visual Design Strategy (The "Janji Vibe")
Based on the "Clean & Glassmorphism" reference (Dr. Haylie/To-Do concept), we will adopt a **Modern Premium** aesthetic.

*   **Design Philosophy:** "Uncluttered & Trustworthy".
*   **Visual Drivers:**
    *   **Glassmorphism:** Used for 'floating' interaction cards (e.g., confirmation modals, bottom sheets).
    *   **Soft Gradients:** Subtle backgrounds (Slate-50 to Slate-100) to avoid harsh stark white.
    *   **Rounded Geometry:** Heavy use of `rounded-2xl` and `rounded-3xl` for friendly, approachable feel.

### Design Tokens (Tailwind Config)

#### Color System
*   **Primary (Brand):** `Teal-600` (Main Actions) -> `#0d9488`
    *   *Why:* Serene, professional (fits Salon/Clinic), distinct from generic Blue.
*   **Secondary (Accent):** `Violet-500` (Highlights) -> `#8b5cf6`
    *   *Why:* Adds a touch of creativity/luxury for the "Premium" feel.
*   **Backgrounds:**
    *   `bg-page`: `slate-50` (Main app background)
    *   `bg-card`: `white` (Content containers)
    *   `bg-glass`: `white/80` + `backdrop-blur-md` (Overlays)
*   **Typography:**
    *   **Headings:** `text-slate-900`, Tracking `-0.025em`, Weight `600/700`.
    *   **Body:** `text-slate-600`, Weight `400/500`.
    *   **Muted:** `text-slate-400`.

#### Typography Scale
*   `text-xs`: 12px (Captions)
*   `text-sm`: 14px (Body/Input)
*   `text-base`: 16px (Standard)
*   `text-lg`: 18px (Card Titles)
*   `text-xl`: 20px (Section Headers)
*   `text-2xl`: 24px (Page Titles)
*   `text-3xl`: 30px (Marketing Hero)

#### Spacing & Radius
*   **Radius:**
    *   `rounded-lg` (Inputs, Small Buttons)
    *   `rounded-xl` (Cards, Dialogs)
    *   `rounded-full` (Pills, Avatars)
*   **Shadows:**
    *   `shadow-sm`: Subtle borders.
    *   `shadow-soft`: Custom `0 4px 20px -2px rgba(0, 0, 0, 0.05)` for floating cards.

### UI Component Library (Shadcn/UI)
We will leverage **shadcn/ui** for speed, customized with our tokens.

*   **Core:** `Button`, `Input`, `Label`, `Card`, `Avatar`.
*   **Feedback:** `Toast` (Sonner), `Skeleton`, `Badge` (Status).
*   **Layout:** `Sheet` (Mobile Menu), `Drawer` (Mobile Bottom Sheet for Selection).
*   **Data:** `Calendar` (DayPicker), `Select`, `Table` (Dashboard).

---

## 2. Environment Configuration

### Required Environment Variables (`.env.local` / `.env.production`)

```bash
# === App ===
NEXT_PUBLIC_APP_URL="https://app.janji.in"
NEXT_PUBLIC_BOOKING_DOMAIN="janji.in"

# === Supabase (Auth & DB) ===
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="public-anon-key"
SUPABASE_SERVICE_ROLE_KEY="secret-service-role" # For Admin tasks only

# === Payments (Xendit) ===
XENDIT_SECRET_KEY="xnd_..."
XENDIT_CALLBACK_TOKEN="token_..."

# === WhatsApp Integration (WAHA) ===
# Using WhatsApp HTTP API (WAHA) or similar provider
WA_API_URL="https://wa.api.endpoint"
WA_API_KEY="secret_wa_key"

# === Google Calendar ===
GOOGLE_CLIENT_ID="...apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="..."
```

---

## 3. CI/CD Pipeline & DevOps

### Pipeline (GitHub Actions)
**Trigger:** Push to `main`.

1.  **Lint & Type Check:**
    *   `npm run lint`
    *   `npm run type-check` (Strict TypeScript)
2.  **Test (Unit):**
    *   `npm run test` (Jest/Vitest for core logic like Pricing calc).
3.  **Build (Preview):**
    *   Test generic `npm run build` to catch Next.js build errors.
4.  **Deploy:**
    *   Auto-deploy via Vercel GitHub Integration (Zero config required mostly).

### Deployment Checklist
1.  [ ] **Supabase:** Run Drizzle Migrations (`npm run db:push`).
2.  [ ] **Supabase:** Enable RLS Policies on all tables.
3.  [ ] **Supabase:** Configure Auth Redirect URLs (`https://app.janji.in/auth/callback`).
4.  [ ] **Vercel:** Add all Environment Variables.
5.  [ ] **Xendit:** Set Callback URL to `https://app.janji.in/api/webhooks/xendit`.
6.  [ ] **Domain:** Configure DNS for `janji.in` and `*.janji.in` (Wildcard for slugs).

---

## 4. Risk Assessment & Mitigation

| Risk Area | Scenario | Risk Level | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **WhatsApp** | Number Banned by WA | High | Use "Transactional" template messages strictly. Don't spam. Use rotating numbers or official Whatsapp Business API (BSP) if volume grows. |
| **Payments** | Xendit Downtime | Medium | Default to "Pay at Location" fallback option if API fails. |
| **Data** | Malicious Booking Spam | Medium | Rate limiting (Redis). Require WA OTP (Phase 2) or small DP via Xendit to look legitimate. |
| **Scale** | 1000s of concurrent reads | Low | Supabase is scalable. Heavy caching on public booking pages (ISR). |
| **Legal** | Data Privacy (Indonesia) | Medium | Servers in Singapore (AWS/Supabase standard). Privacy Policy clear on Data Usage. |

---

## 5. WhatsApp Integration Strategy (WAHA)
*Tool: WAHA (WhatsApp HTTP API)*

**Flow:**
1.  **Event:** `BOOKING_CREATED`
2.  **Action:** Server sends POST to WAHA.
3.  **Message Content:**
    > "Halo Kak {name}! Janji kamu sama {business} udah dikonfirmasi ya. 🗓️ {date} @ {time}. Jangan telat ya! - Janji.in"

**Reminder Job:**
*   Cron Job (Vercel Cron) runs every 15 mins.
*   Query `bookings` where `start_time` is in 1 hour AND `status = confirmed`.
*   Send Reminder Message.

---

## 6. Next Steps (Construction)
1.  **Initialize Project:** Next.js + Tailwind + Shadcn.
2.  **Commit 1:** Layouts & Design Tokens setup.
3.  **Commit 2:** Supabase + Drizzle integration.

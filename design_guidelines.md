# Janji.in - Design Guidelines

## Design Philosophy
**"Uncluttered & Trustworthy"** - Modern Premium aesthetic for Indonesian UKM service businesses.

## Visual System

### Colors (Tailwind)
- **Primary**: `teal-600` (#0d9488) - Main actions, links, active states
- **Accent**: `violet-500` (#8b5cf6) - Highlights, premium features, badges
- **Backgrounds**: 
  - Page: `slate-50`
  - Cards: `white`
  - Glass overlays: `white/80` + `backdrop-blur-md`
- **Text**:
  - Headings: `slate-900` (font-semibold/bold)
  - Body: `slate-600` (font-normal/medium)  
  - Muted/Labels: `slate-400`
- **Status Colors**: `green-500` (confirmed), `yellow-500` (pending), `red-500` (cancelled), `blue-500` (completed)

### Typography Scale
- Hero/Marketing: `text-3xl` (30px) - `text-4xl` (36px)
- Page Titles: `text-2xl` (24px)
- Section Headers: `text-xl` (20px)
- Card Titles: `text-lg` (18px)
- Body/Standard: `text-base` (16px)
- Inputs/Small Body: `text-sm` (14px)
- Captions/Meta: `text-xs` (12px)

**Font**: System font stack (default Tailwind) with `tracking-tight` on headings

### Spacing Primitives
Use Tailwind units: **2, 4, 6, 8, 12, 16, 20, 24, 32**
- Component padding: `p-4` to `p-6`
- Section spacing: `py-12` to `py-20`
- Card gaps: `gap-4` to `gap-6`

### Border Radius
- Inputs/Small Buttons: `rounded-lg`
- Cards/Dialogs: `rounded-xl` to `rounded-2xl`
- Pills/Avatars: `rounded-full`
- Heavy use of larger radius for friendly, approachable feel

### Shadows
- Subtle borders: `shadow-sm`
- Floating cards: Custom `shadow-soft` (0 4px 20px -2px rgba(0,0,0,0.05))
- Modals/Drawers: `shadow-lg`

## Component Library (Shadcn/UI)
Use these shadcn components consistently:
- **Core**: Button, Input, Label, Card, Avatar, Badge
- **Feedback**: Toast (Sonner), Skeleton (mandatory for loading), Alert
- **Layout**: Sheet (mobile menu), Drawer (bottom sheets), Dialog
- **Data**: Calendar (DayPicker), Select, Table
- **Forms**: Form (react-hook-form integration)

## Page-Specific Layouts

### Landing Page (Marketing)
- **Hero**: Full-width section with emotional hook copy "CAPE BALESIN CHAT 'KAK CEK SLOT KOSONG'?"
- Large CTA button (teal-600) with secondary ghost button
- Include hero image: Modern Indonesian business owner using tablet/phone in salon/shop setting
- **Features Grid**: 3 columns (lg:grid-cols-3) with Lucide icons, titles, descriptions
- **Social Proof**: Logo carousel or avatar group of merchants
- **Pricing Cards**: Side-by-side comparison (Gratis/Maju/Sukses tiers)

### Booking Page (Public - `[slug].janji.in`)
- Clean, minimal header with business logo and back button
- Business profile card: Image, name, tagline, location (Lucide MapPin icon)
- **Service List**: Cards with service image placeholder, name, duration (Clock icon), price in IDR format (Rp 50.000)
- Bottom Sheet (Drawer) for time slot selection with:
  - Staff selector (pills/buttons)
  - Date picker (Today/Tomorrow shortcuts)
  - Time grid (3-4 columns on desktop, 2 on mobile)
  - Disabled slots for booked times
- Confirmation summary card with glassmorphism effect
- Primary CTA: "BOOKING SEKARANG (Kirim WA)" with WhatsApp icon

### Owner Dashboard
- **Calendar View**: CSS Grid layout, time slots as rows, staff as columns
- Appointment cards: Small rounded rectangles, status badge (top-right), truncated text
- Color-coded by status (green/yellow/red borders)
- Stats ticker: Horizontal row with metric cards (white bg, subtle shadow)
- Mobile: Bottom navigation bar (fixed) with icons (Home/Calendar/Services/Settings)

### Onboarding Wizard
- Progress indicator (shadcn Progress component) at top
- Large form fields with helper text
- Slug input: Auto-generated from business name, editable with real-time availability check
- Template selection: Radio cards with icons (Scissors for Barber, Sparkles for Salon, Stethoscope for Dental)

## Mandatory UX Patterns

### Loading States
- **Never** use spinner-only loading
- Always use Skeleton loaders (shadcn Skeleton)
- Maintain layout structure during loading

### Error States
- Red alert box (shadcn Alert variant="destructive")
- Actionable error message: "Gagal memuat. [Coba Lagi]" button
- Friendly, Indonesian copy

### Empty States
- Centered illustration or icon (Lucide icons)
- Friendly copy: "Belum ada booking hari ini. Santai dulu bos."
- Optional CTA if applicable

### Form Validation
- Inline validation (react-hook-form + Zod)
- Error messages below inputs (text-sm text-red-500)
- Success states with checkmark icons

## Images & Assets

### Icons
Use **Lucide React** exclusively via NPM (not CDN)
Common icons: Calendar, Clock, MapPin, Users, Settings, Check, X, ChevronRight, WhatsApp (MessageCircle)

### Images Needed
1. **Landing Hero**: Indonesian salon/barbershop owner with tablet (vibrant, authentic)
2. **Service Placeholders**: Generic icons for service categories (can use Lucide icons as fallback)
3. **Empty State Illustrations**: Simple line art (use Lucide icons or placeholder comments for custom illustrations)

### Logo Placement
- Business logo: Avatar component (rounded-full, 48px-64px)
- Janji.in logo: Simple text logo in navbar (text-xl font-bold text-teal-600)

## Mobile Responsiveness
- Mobile-first design (base styles for mobile)
- Breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px)
- Bottom navigation on mobile (fixed position)
- Full-screen modals on mobile, dialogs on desktop
- Drawers (bottom sheets) for selection flows on mobile

## Animations
**Minimal and purposeful only**:
- Page transitions: Simple fade (200ms)
- Button hovers: Slight scale or color shift
- Modal/Drawer: Slide-up animation (shadcn default)
- NO decorative animations, NO scroll-triggered effects

## Accessibility
- All interactive elements keyboard accessible
- Focus rings visible (ring-2 ring-teal-600)
- Sufficient color contrast (WCAG AA)
- Form labels always visible
- ARIA labels for icon-only buttons

## Indonesian Localization
- All copy in Bahasa Indonesia (casual, friendly tone)
- Currency format: "Rp 50.000" (dot separator)
- Date format: "Senin, 17 Des" (Indonesian day/month abbreviations)
- Time: 24-hour format (14:00, not 2:00 PM)
- WhatsApp references: "WA" abbreviation accepted
# Janji.in - Booking Platform for Indonesian Service Businesses

## Overview

Janji.in is a booking appointment platform designed for Indonesian UKM (small-medium) service businesses like salons, barbershops, clinics, and other service providers. The platform transforms manual WhatsApp-based booking into an automated system with features like instant online booking, automatic deposit collection (DP), WhatsApp notifications, and Google Calendar sync.

The core value proposition is "Website booking instan untuk jasamu" - turning "Tanya-tanya" (inquiries) into "Ting-Ting" (money coming in) by reducing no-shows and admin overhead.

## Recent Changes

- **December 2025**: Added self-hosted deployment guide (SELF_HOSTED_DEPLOYMENT.md)
- **December 2025**: Fixed password validation - now requires 8+ characters with uppercase, lowercase, and numbers
- **December 2025**: Added comprehensive documentation to all key server and client files
- **December 2025**: Fixed error handling in API client to parse JSON error messages

## User Preferences

- **Communication style**: Simple, everyday language (Indonesian audience)
- **Password requirements**: Minimum 8 characters, uppercase, lowercase, and numbers

---

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, built with Vite
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: Shadcn/UI component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens following a "Modern Premium" aesthetic
- **Design System**: Teal primary color (#0d9488), Violet accent (#8b5cf6), glassmorphism effects, rounded corners (rounded-xl/2xl)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful JSON API with `/api` prefix
- **WebSocket**: Real-time messaging at `/ws` path
- **Security**: Helmet, CORS, Rate Limiting, JWT authentication
- **Build**: esbuild for server bundling, Vite for client

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` - contains tables for businesses, services, staff, customers, appointments, and operating hours
- **Migrations**: Drizzle Kit with `npm run db:push`

---

## Project Structure

```
Janji-In/
├── client/                 # React frontend
│   ├── public/             # Static assets (favicon)
│   ├── src/
│   │   ├── components/     # UI components
│   │   │   ├── ui/         # Shadcn/UI base components
│   │   │   ├── AppointmentCalendar.tsx
│   │   │   ├── ChatWidget.tsx
│   │   │   ├── theme-provider.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── context/        # React contexts
│   │   │   └── AuthContext.tsx  # Authentication state
│   │   ├── hooks/          # Custom React hooks
│   │   │   ├── use-mobile.tsx
│   │   │   └── use-toast.ts
│   │   ├── lib/            # Utilities
│   │   │   ├── queryClient.ts   # API request utilities
│   │   │   └── utils.ts         # Helper functions
│   │   ├── pages/          # Route pages
│   │   │   ├── admin.tsx        # Admin dashboard
│   │   │   ├── booking.tsx      # Public booking page
│   │   │   ├── dashboard.tsx    # Business dashboard
│   │   │   ├── landing.tsx      # Homepage
│   │   │   ├── login.tsx        # Login page
│   │   │   ├── onboarding.tsx   # Business setup
│   │   │   ├── register.tsx     # Registration page
│   │   │   └── reschedule.tsx   # Reschedule appointments
│   │   ├── App.tsx         # Main app with routes
│   │   ├── index.css       # Global styles
│   │   └── main.tsx        # Entry point
│   └── index.html          # HTML template
│
├── server/                 # Express backend
│   ├── auth.ts             # Authentication (JWT, password hashing)
│   ├── database-storage.ts # PostgreSQL implementation
│   ├── db.ts               # Database connection
│   ├── index.ts            # Server entry point
│   ├── notification.ts     # Email/WhatsApp notifications
│   ├── payment.ts          # Payment processing
│   ├── routes.ts           # API route definitions
│   ├── static.ts           # Static file serving
│   ├── storage.ts          # Storage interface + in-memory impl
│   ├── vite.ts             # Vite dev server integration
│   └── websocket.ts        # WebSocket for real-time chat
│
├── shared/                 # Shared code
│   └── schema.ts           # Database schema + validation
│
├── attached_assets/        # Design specs and docs
│
├── SELF_HOSTED_DEPLOYMENT.md  # Deployment guide
├── drizzle.config.ts       # Drizzle ORM config
├── package.json            # Dependencies
├── tailwind.config.ts      # Tailwind CSS config
├── tsconfig.json           # TypeScript config
└── vite.config.ts          # Vite build config
```

---

## Key Files Reference

### Server Files

| File | Purpose | When to Edit |
|------|---------|--------------|
| `server/index.ts` | Express app setup, middleware, server start | Add middleware, change port |
| `server/auth.ts` | JWT auth, password hashing, route protection | Auth logic changes |
| `server/routes.ts` | All API endpoints | Add/modify API endpoints |
| `server/db.ts` | PostgreSQL connection | Database config changes |
| `server/storage.ts` | Data access interface + memory storage | Storage interface changes |
| `server/database-storage.ts` | PostgreSQL storage implementation | Database queries |
| `server/websocket.ts` | Real-time WebSocket server | Chat/notification features |

### Client Files

| File | Purpose | When to Edit |
|------|---------|--------------|
| `client/src/App.tsx` | Routes and app structure | Add new pages/routes |
| `client/src/context/AuthContext.tsx` | Auth state management | Auth flow changes |
| `client/src/lib/queryClient.ts` | API request utilities | API communication |
| `client/src/pages/*.tsx` | Individual page components | UI changes |

### Shared Files

| File | Purpose | When to Edit |
|------|---------|--------------|
| `shared/schema.ts` | Database tables + validation | Schema changes |

---

## API Endpoints Reference

### Authentication
```
POST /api/auth/register      - Create new account
POST /api/auth/login         - Login and get JWT token
POST /api/auth/forgot-password - Request password reset
POST /api/auth/reset-password - Reset password with token
GET  /api/auth/me            - Get current user (requires auth)
```

### Businesses
```
POST /api/businesses         - Create business (onboarding)
GET  /api/businesses/check-slug/:slug - Check slug availability
PATCH /api/businesses/:businessId - Update business
```

### Dashboard
```
GET /api/dashboard/:businessId - Get all dashboard data
GET /api/dashboard/:businessId/appointments/:date - Get appointments by date
```

### Services & Staff
```
POST   /api/businesses/:businessId/services - Create service
PATCH  /api/services/:id - Update service
DELETE /api/services/:id - Delete service
POST   /api/businesses/:businessId/staff - Create staff
PATCH  /api/staff/:id - Update staff
DELETE /api/staff/:id - Delete staff
```

### Appointments
```
GET   /api/appointments/:id - Get single appointment
PATCH /api/appointments/:id/status - Update status
POST  /api/appointments/:id/reschedule - Request reschedule
POST  /api/appointments/:id/confirm-reschedule - Confirm reschedule
```

---

## Debugging Guide

### Log Locations

| Environment | Log Type | Location |
|-------------|----------|----------|
| Development | Server logs | Terminal/workflow output |
| Development | Browser logs | Browser DevTools Console (F12) |
| Production (PM2) | Server logs | `pm2 logs janjiin` |
| Production (systemd) | Server logs | `journalctl -u janjiin -f` |
| PostgreSQL | Database logs | `/var/log/postgresql/postgresql-*-main.log` |

### Step-by-Step Debugging

#### 1. Registration/Login Fails
**Symptoms**: "Password tidak valid" or validation errors

**Step-by-step diagnosis**:
```bash
# 1. Check server logs for validation errors
# Look for "POST /api/auth/register" or "POST /api/auth/login"

# 2. Test API directly with curl
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Password123","confirmPassword":"Password123"}'

# 3. Valid response should return user and token
# Error response shows: {"message":"error description"}
```

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- Example: `Password123`, `MySecure1Pass`

#### 2. API Returns 401 Unauthorized
**Symptoms**: User gets logged out, API calls fail

**Step-by-step diagnosis**:
```bash
# 1. Check if token exists in localStorage
# Browser Console: localStorage.getItem('janji_in_token')

# 2. Verify token is being sent
# Network tab > Request Headers > Authorization: Bearer ...

# 3. Test token validity
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 4. Check JWT_SECRET hasn't changed (invalidates all tokens)
# If changed, users must log in again
```

**Common causes**:
- Token expired (7 days default)
- Token not in request header
- JWT_SECRET environment variable changed
- Token corrupted in localStorage

#### 3. Database Connection Failed
**Symptoms**: "Connection refused", "ENOTFOUND", or empty data

**Step-by-step diagnosis**:
```bash
# 1. Verify DATABASE_URL is set
echo $DATABASE_URL
# Should show: postgresql://user:pass@host:5432/dbname

# 2. Test PostgreSQL is running
sudo systemctl status postgresql

# 3. Test connection directly
psql $DATABASE_URL -c "SELECT 1"

# 4. Check database exists
psql $DATABASE_URL -c "\dt"
# Should list tables: users, businesses, appointments, etc.

# 5. If tables missing, push schema
npm run db:push
```

**Common causes**:
- PostgreSQL service not running
- Wrong credentials in DATABASE_URL
- Database doesn't exist
- Firewall blocking port 5432

#### 4. Frontend Not Loading
**Symptoms**: Blank page, network errors, or styling missing

**Step-by-step diagnosis**:
```bash
# 1. Check server is running
curl http://localhost:5000
# Should return HTML content

# 2. Check browser console for errors (F12 > Console)
# Look for: JavaScript errors, failed resource loads

# 3. Check Network tab for failed requests
# Red entries indicate problems

# 4. Verify vite.config.ts has allowedHosts
# Must include: allowedHosts: true

# 5. For production, verify build exists
ls -la dist/
# Should have: index.cjs and public/ folder
```

**Common causes**:
- Vite dev server not running (development)
- `npm run build` not executed (production)
- allowedHosts not configured (Replit/proxy environments)
- Import errors in React components

#### 5. WebSocket Connection Failed
**Symptoms**: Chat not working, real-time updates missing, console errors

**Step-by-step diagnosis**:
```bash
# 1. Check browser console for WebSocket errors
# Look for: "WebSocket connection to 'ws://...' failed"

# 2. Verify WebSocket server is running
# Server logs should show: "WebSocket server initialized"

# 3. Test WebSocket connection (in browser console)
const ws = new WebSocket('ws://localhost:5000/ws');
ws.onopen = () => console.log('Connected');
ws.onerror = (e) => console.log('Error', e);

# 4. For production with Nginx, verify proxy config
# Must include WebSocket upgrade headers
```

**Nginx WebSocket config**:
```nginx
location /ws {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

#### 6. Build/Compilation Errors
**Symptoms**: npm run build fails, TypeScript errors

**Step-by-step diagnosis**:
```bash
# 1. Check TypeScript errors
npm run check
# Shows all TypeScript issues

# 2. Check for missing dependencies
npm install

# 3. Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# 4. Check for circular imports
# Error message usually includes file path
```

### Quick Health Check Commands

```bash
# Server running?
curl -s http://localhost:5000/api/auth/me | head -c 100

# Database connected?
npm run db:push 2>&1 | head -5

# Build working?
npm run build 2>&1 | tail -10

# All processes running?
pm2 status  # (production with PM2)
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `PORT` | No | 5000 | Server port |
| `NODE_ENV` | No | development | Environment mode |
| `JWT_SECRET` | Yes* | (insecure) | Secret for JWT tokens |
| `ALLOWED_ORIGINS` | No | localhost | CORS allowed origins |

*Required for production

---

## Development Workflow

### Starting Development
```bash
cd Janji-In
npm install
npm run db:push  # Create database tables
npm run dev      # Start dev server
```

### Making Changes
1. Edit code (auto-reloads in development)
2. Test changes in browser
3. Check server logs for errors

### Building for Production
```bash
npm run build    # Creates dist/ folder
npm start        # Run production server
```

### Database Changes
```bash
# After modifying shared/schema.ts
npm run db:push  # Sync schema to database
```

---

## Deployment

See `SELF_HOSTED_DEPLOYMENT.md` for complete self-hosted deployment instructions including:
- System requirements
- PostgreSQL setup
- Nginx configuration
- SSL/HTTPS setup
- PM2 process management

---

## External Dependencies

### Database
- PostgreSQL (configured via `DATABASE_URL` environment variable)
- Drizzle ORM for type-safe database queries
- Drizzle Zod for schema-to-validation conversion

### UI Framework
- Shadcn/UI components (Button, Card, Dialog, Form, etc.)
- Radix UI primitives for accessibility
- Lucide React for icons
- Tailwind CSS for styling

### Planned Integrations
- **Payments**: Xendit (Invoice/QRIS) for Indonesian payment processing
- **Calendar**: Google Calendar API for 2-way sync
- **Notifications**: WhatsApp integration for booking confirmations

### Development Tools
- Vite with HMR for development
- esbuild for production server bundling
- TypeScript for type safety throughout

### Key NPM Packages
- `@tanstack/react-query` - Server state management
- `react-hook-form` + `@hookform/resolvers` - Form handling with Zod validation
- `date-fns` - Date manipulation
- `wouter` - Client-side routing
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT authentication
- `helmet` - Security headers
- `ws` - WebSocket server

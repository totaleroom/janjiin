# Janjiin - REST Express + React Application

## Project Overview

Proyek **Janjiin** adalah aplikasi web fullstack yang menggabungkan:
- **Backend**: Express.js dengan TypeScript
- **Frontend**: React dengan Vite bundler
- **Database**: PostgreSQL (siap untuk production via Supabase)
- **Deployment**: Render.com (free tier)
- **Real-time**: WebSocket support

## Deployment Status

✅ **Deployed to Render.com** - Free tier, no credit card required
- Frontend + Backend: https://janjiin.onrender.com
- Database: Supabase PostgreSQL (free tier)

## Project Structure

```
.
├── server/
│   ├── index.ts              # Express server entry point
│   ├── routes.ts             # API routes
│   ├── storage.ts            # Storage interface
│   └── vite.ts               # Vite server middleware
├── client/
│   ├── src/
│   │   ├── main.tsx          # React entry point
│   │   ├── App.tsx           # Main app component with routing
│   │   ├── index.css         # Global styles + Tailwind directives
│   │   ├── components/       # React components (shadcn UI)
│   │   ├── pages/            # Page components
│   │   ├── lib/              # Utility functions
│   │   └── hooks/            # Custom React hooks
│   ├── index.html
│   └── vite-env.d.ts
├── shared/
│   └── schema.ts             # Data models & Zod schemas
├── script/
│   └── build.ts              # Custom build script
├── vite.config.ts            # Vite configuration
├── tailwind.config.ts        # Tailwind CSS config
├── postcss.config.mjs        # PostCSS config (ES modules)
├── tsconfig.json             # TypeScript config
├── package.json              # Dependencies
└── drizzle.config.ts         # Drizzle ORM config
```

## Running the Application

### Local Development
```bash
npm run dev
```
Starts Express + Vite dev server on `0.0.0.0:5000`

### Production Build
```bash
npm run build
npm run start
```

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js 4.x
- **Frontend Framework**: React 18
- **Build Tool**: Vite 5.x
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.x
- **UI Components**: shadcn/ui (Radix UI)
- **ORM**: Drizzle ORM
- **Data Validation**: Zod + React Hook Form
- **HTTP Client**: TanStack React Query v5
- **Routing**: Wouter

---

# 🎓 DEPLOYMENT & BUILD TROUBLESHOOTING GUIDE

## Problem Journey: Render Deployment CSS Build Failure

### ⚠️ Issue Summary
Deploying to **Render.com** revealed CSS styling issues (Tailwind not generating full styles).

### 🔍 Debugging Methodology

#### **Stage 1: Identify Local vs Remote Difference**
```
✓ Build SUCCESS locally (77.47 kB CSS)
✗ Build FAILED on Render (6.16 kB CSS)
```
**Lesson**: Environment differences are the root cause 90% of the time.

**Immediate checks**:
1. Compare local build artifact size vs Render logs
2. Check environment variables (Node version, build tools)
3. Review Render logs for specific error messages
4. Try exact Render build command locally: `npm run build`

#### **Stage 2: Binary Search Approach**
Test configuration systematically from simplest to complex:

1. **No PostCSS config** → Build succeeds but CSS understyled (6 kB)
2. **PostCSS ES module (.js)** → Render fails (ESM not supported)
3. **PostCSS CommonJS (.cjs)** → Render still fails (path issues)
4. **PostCSS with context function** → Render still fails
5. **PostCSS ES module (.mjs)** → ✅ WORKS!

**Key insight**: Render's Node.js has different ESM resolution than local dev.

#### **Stage 3: Root Cause Analysis**

| Issue | Cause | Why It Failed | Solution |
|-------|-------|---------------|----------|
| CSS only 6 kB | Tailwind not processing CSS | No PostCSS config | Add config |
| `postcss.config.js` fails | ESM not resolved by Render build | Environment mismatch | Use `.mjs` or `.cjs` |
| `postcss.config.cjs` fails | CJS resolver issue in Render | Build tool strictness | Use `.mjs` instead |
| `postcss.config.mjs` works | Explicit ES module extension | Render recognizes format | Use `.mjs` |

### ✅ Final Solution: `postcss.config.mjs`

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Why this works**:
- `.mjs` = explicit ES module (no ambiguity for build tools)
- Render's esbuild recognizes `.mjs` without config
- Compatible with both local Vite and Render CI/CD

### 📋 Checklist for Future Render Deployments

#### Before Pushing to Production:
- [ ] **CSS file**: Verify production build CSS is 50+ kB (not understyled 6 kB)
- [ ] **PostCSS config**: Use `.mjs` extension (not `.js` or `.cjs`)
- [ ] **Tailwind paths**: Ensure `content` paths match project structure
- [ ] **Environment variables**: All required secrets in Render dashboard
- [ ] **Build command**: Runs successfully locally first

#### During Render Deploy:
- [ ] Check **Build logs** for PostCSS errors
- [ ] If CSS understyled: Check CSS file size in Render logs
- [ ] If PostCSS error: Try `.mjs` file extension
- [ ] Manual rebuild if cache stale: Dashboard → Manual Deploy

#### Common Render Build Issues & Solutions:

| Error | Cause | Fix |
|-------|-------|-----|
| `failed to load PostCSS config` | ESM/CJS mismatch | Use `.mjs` |
| CSS only 6 kB | Tailwind not running | Verify `postcss.config.mjs` exists |
| `Cannot find module` | Missing build dependencies | Check package.json dependencies (not devDependencies) |
| Stale CSS after push | Render caching | Manual deploy via dashboard |
| `port 10000 already in use` | Multiple processes | Check Render concurrency setting |

### 🧠 LLM Troubleshooting Strategy

#### **Think Like This for Similar Issues:**

1. **First**: Ask "Local vs Remote?" - Is it working locally?
   - If YES: Environment configuration issue
   - If NO: Code/dependency issue

2. **Second**: Reproduce locally with production config
   - Run `npm run build` (production build)
   - Check artifact sizes match expectations
   - Test build output on local Node.js

3. **Third**: Check file extensions & formats
   - `.js` = ambiguous (could be ESM or CJS)
   - `.cjs` = CommonJS explicit
   - `.mjs` = ES Module explicit ← Preferred for build tools

4. **Fourth**: Validate configuration recursively
   - Does tool A find tool B's config?
   - Does tool B find tool C's config?
   - Trace the dependency chain

5. **Fifth**: Check environment differences
   - Node version (use `.nvmrc` or `engines` in package.json)
   - Available tools/packages
   - File system case sensitivity (Windows vs Linux)

#### **Red Flags for Build Issues:**
```
🚩 "Works locally but fails on CI/CD"
   → Environment variable or build tool version

🚩 "CSS understyled or missing"
   → PostCSS/Tailwind not running in build

🚩 "Module not found errors"
   → ESM/CJS resolution issue (use .mjs)

🚩 "Stale output on deploy"
   → Cache issue (manual rebuild or touch files)
```

---

## Development Guidelines

### Backend:
- Use storage interface for all CRUD operations
- Keep routes thin, validation in schema
- Always validate with Zod before DB operations

### Frontend:
- Use Wouter for routing
- Use TanStack Query for data fetching
- Use shadcn/ui components from `client/src/components/ui`
- Add `data-testid` to interactive elements

### Styling:
- Tailwind CSS utility classes only
- Use `hover-elevate` / `active-elevate-2` for interactions
- No manual hover states (built into shadcn components)
- Dark mode: explicit light/dark variants

---

## Deployment Checklist

### Pre-Deploy:
- [ ] `npm run build` succeeds locally
- [ ] CSS file is 70+ kB (gzipped 12+ kB)
- [ ] All environment variables in Render dashboard
- [ ] GitHub repo synced with latest code
- [ ] `package.json` has build tools in dependencies (not devDependencies)

### Post-Deploy:
- [ ] Visit https://janjiin.onrender.com and check styling
- [ ] Test responsive layout (mobile/tablet/desktop)
- [ ] Check browser console for JS errors
- [ ] Test all interactive elements

---

## Known Issues & Resolutions

### PostCSS Build Issues (RESOLVED)
**Problem**: CSS understyled on Render, full on local
**Root Cause**: PostCSS config extension ambiguity
**Solution**: Use `.mjs` extension for config file
**Status**: ✅ FIXED - Use `postcss.config.mjs`

### WebSocket Connection Errors (Expected)
During local development, browser console shows WebSocket errors. This is expected in Replit environment and doesn't affect production.

---

## Next Steps

1. **Monitor Render deployment**: Check logs for any runtime errors
2. **Test all pages**: Verify each route works (landing, login, register, dashboard)
3. **Database**: Connect production Supabase instance when ready
4. **Continuous Deployment**: Enable auto-deploy on GitHub push

---

## Resources

- **Render Docs**: https://render.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vite**: https://vitejs.dev/guide
- **Drizzle ORM**: https://orm.drizzle.team

---

## 🏥 Final Health Check

### Build Status
- ✅ **Local Build**: SUCCESS (CSS 76 KB, full Tailwind)
- ✅ **Dependencies**: All critical build tools installed
- ✅ **Server**: Running on port 5000 locally, 10000 on Render
- ⚠️ **Warnings**: PostCSS "from option" (non-blocking)

### Dependency Audit
- **Total Dependencies**: 60+
- **Build Tools in Dependencies** (correct): ✓
  - tsx, vite, esbuild, typescript, tailwindcss, postcss, autoprefixer
- **npm audit**: Run `npm audit fix` for optional updates (not critical)

### Configuration Status
- ✅ `vite.config.ts` - Correct root paths
- ✅ `postcss.config.cjs` - Context function format
- ✅ `tailwind.config.ts` - Content paths verified
- ✅ `package.json` - Build tools in dependencies
- ✅ `tsconfig.json` - Proper configuration

### Performance Metrics
- Build time: ~13s (acceptable for fullstack)
- Bundle size: 605 KB JS (large but acceptable for React + shadcn)
- CSS size: 76 KB (full Tailwind utilities)
- GZipped: ~180 KB JS, ~13 KB CSS

---

## 📚 AI Learning Resources

**For future AI agents deploying similar applications:**

1. **AI_DEPLOYMENT_PLAYBOOK.md** - Comprehensive guide on:
   - Pre-deployment checklist
   - Systematic debugging methodology
   - Common issues & solutions
   - Token optimization strategies
   - Progressive deployment phases

2. **Key Lessons from This Project**:
   - File extensions matter (`.mjs` > `.js` > `.cjs`)
   - Build tools MUST be in dependencies, not devDependencies
   - Compare local vs remote artifacts (6 KB vs 77 KB CSS caught the issue)
   - One change per iteration prevents thrashing
   - Local build success is prerequisite for CI/CD success

3. **Prevention Strategy**:
   - Read `package.json` first (check build tools location)
   - Test `npm run build` locally before pushing
   - Check artifact sizes to diagnose issues
   - Use systematic binary search (not random changes)

---

## Last Updated

- **Date**: December 18, 2025
- **Status**: ✅ Deployed to Render.com (Free tier) + Fully styled
- **CSS**: 76 KB (full Tailwind utilities loaded)
- **Health**: All systems operational
- **Next**: Production database + live feature testing

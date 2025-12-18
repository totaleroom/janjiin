# 🤖 AI VIBE CODING DEPLOYMENT PLAYBOOK

**Purpose**: Teach AI agents how to deploy fullstack JS applications efficiently, prevent common pitfalls, and optimize token usage.

---

## 📋 PART 1: PRE-DEPLOYMENT CHECKLIST (5 min - Do This First!)

### ✅ Before ANY deployment work:

```
STEP 1: Assess Project Type
├─ Is it fullstack (Node + React)? → Use this playbook
├─ Is it frontend-only? → Skip to #2
└─ Is it a simple Node API? → Simplified version of #2

STEP 2: Identify Build System & Config Files
├─ package.json → Check for:
│  ├─ "build" script exists?
│  ├─ Build tools in dependencies (not devDependencies)?
│  │  ✓ tsx, vite, esbuild, typescript, tailwindcss, postcss
│  │  ✓ These MUST be in `dependencies` for CI/CD!
│  └─ Deployment target tool listed?
│
├─ vite.config.ts/.js → Check for:
│  ├─ Correct root path?
│  ├─ CSS/PostCSS configuration?
│  └─ allowedHosts: true (for cloud platforms)?
│
└─ Other config files:
   ├─ postcss.config.* (check extension: .cjs best)
   ├─ tailwind.config.ts
   └─ tsconfig.json

STEP 3: Verify Local Build Works
├─ npm run build → Check for errors
├─ Check dist/ size:
│  ├─ JavaScript: 150-300 kB gzipped (normal)
│  ├─ CSS: 50+ kB gzipped (if Tailwind used)
│  └─ If CSS < 10 kB: Tailwind NOT running!
└─ NODE_ENV=production npm run start → Test production build locally

STEP 4: Check Dependencies for Build Tools
├─ These MUST be in dependencies:
│  ├─ Build tools: tsx, esbuild, vite, typescript
│  ├─ CSS tools: tailwindcss, postcss, autoprefixer
│  ├─ Runtime tools: express, react, react-dom
│  └─ DO NOT PUT IN devDependencies
│
└─ These SHOULD be in devDependencies:
   ├─ Type definitions: @types/node, @types/react
   ├─ Dev utilities: prettier, eslint
   └─ Never @replit/* packages in dependencies
```

---

## 📊 PART 2: SYSTEMATIC DEBUGGING (When deployment fails)

### **Principle**: Never guess. Always compare local vs remote artifacts.

```
DIAGNOSTIC FLOW:

1. CHECK: Does build succeed locally?
   ├─ YES → Problem is environment-specific (CI/CD config)
   ├─ NO  → Problem is in code or dependencies
   └─ ACTION: Fix local build FIRST before CI/CD

2. COLLECT: Build artifacts comparison
   ├─ Local: npm run build 2>&1 | tail -10
   ├─ Remote: Check CI/CD logs for build output
   └─ Compare:
      ├─ JavaScript size (should match)
      ├─ CSS size (should match)
      ├─ Error messages (look for first difference)
      └─ Time taken (if very different = caching issue)

3. IDENTIFY: Root cause category
   ├─ "CSS understyled (6 kB vs 77 kB)"
   │  → PostCSS/Tailwind not running
   │  → Check: postcss.config.* exists + correct format
   │
   ├─ "Module not found error"
   │  → ESM/CJS mismatch
   │  → Check: file extensions (.mjs > .js > .cjs)
   │
   ├─ "Cannot find package X"
   │  → Missing build tool dependency
   │  → Check: X in package.json dependencies (not dev)
   │
   ├─ "Port already in use"
   │  → Process already running
   │  → Solution: Kill old process or restart
   │
   └─ "Stale output / old CSS still showing"
      → Cache issue (build cache or browser cache)
      → Solution: Manual rebuild or hard refresh

4. VERIFY: One change at a time
   ├─ Change 1: Test locally first (npm run build)
   ├─ If OK locally: Push to git
   ├─ Wait for CI/CD to deploy (2-5 min)
   ├─ Check if fixed
   └─ Document: What changed + why it worked
```

---

## 🔧 PART 3: COMMON ISSUES & SOLUTIONS

### **Issue: CSS understyled (6 kB instead of 77 kB)**

```
ROOT CAUSE: Tailwind CSS not processing during build
DIAGNOSIS: 
  ├─ Local CSS: 77 kB ✓
  ├─ CI/CD CSS: 6 kB ✗
  └─ Problem: PostCSS chain broken

SOLUTION PATH:
  1. Check postcss.config file exists
  2. Verify file extension:
     ├─ .mjs (ES module) - Good ✓
     ├─ .cjs (CommonJS) - Works if context function
     └─ .js (ambiguous) - Risky, don't use
  
  3. If .cjs file, ensure it has context:
     module.exports = () => ({
       plugins: { tailwindcss: {}, autoprefixer: {} }
     })
  
  4. Verify Tailwind content paths match structure:
     content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"]
  
  5. If still broken: Try inline in vite.config.ts
     css: {
       postcss: {
         plugins: [require('tailwindcss'), require('autoprefixer')]
       }
     }

TOKEN COST: 
  ├─ Trial 1: Try .mjs config (cheap)
  ├─ Trial 2: Verify content paths (cheap)
  ├─ Trial 3: Try inline config (medium cost)
  └─ Avoid: Random config changes (token waste)
```

### **Issue: Module not found / ESM/CJS conflict**

```
ROOT CAUSE: File extension ambiguity in CI/CD environment
DIAGNOSIS:
  ├─ Error: "Cannot find module"
  ├─ Error: "from option to postcss.parse"
  ├─ Error: "ESM not resolved"
  └─ Common on: Render, Vercel, GitHub Actions

SOLUTION PATH:
  1. Check config file extension:
     ├─ .js → Change to .mjs (explicit ESM)
     └─ .cjs → Keep as is (explicit CJS)
  
  2. If keeping .js, add package.json:
     "type": "module"  // If all code is ESM
     (Don't add this if mixed ESM/CJS!)
  
  3. Preferred: Use .mjs for build configs
     ├─ postcss.config.mjs ✓ (clear ESM)
     ├─ vite.config.ts ✓ (TypeScript handled)
     └─ scripts/build.ts ✓ (TypeScript handled)

TOKEN COST: Low - Just file rename
```

### **Issue: Build tools missing (can't find tsx, vite, etc)**

```
ROOT CAUSE: Build tools in devDependencies instead of dependencies
DIAGNOSIS:
  ├─ Error: "Cannot find command: tsx"
  ├─ CI/CD runs: npm ci (installs only dependencies)
  ├─ devDependencies not installed on CI/CD
  └─ Result: Build fails

SOLUTION:
  Move these to dependencies (NOT devDependencies):
  ├─ tsx
  ├─ vite
  ├─ esbuild
  ├─ typescript
  ├─ tailwindcss
  ├─ postcss
  ├─ autoprefixer
  └─ @vitejs/plugin-react

  Command:
  npm install --save tsx vite esbuild typescript tailwindcss postcss autoprefixer

TOKEN COST: Low - Just package.json edit
```

---

## 🎯 PART 4: DEPLOYMENT PLATFORM-SPECIFIC CONFIGS

### **For Render.com (Free tier):**

```
SETUP CHECKLIST:
├─ Build Command: npm run build
├─ Start Command: npm run start (or NODE_ENV=production node dist/index.cjs)
├─ Environment: Node 20+
├─ Port: Must be 10000 (Render default)
├─ PostCSS Config: Use .cjs with context function
└─ Result: 2-5 min deploy time

COMMON GOTCHAS:
├─ Port 10000 required (not 5000 for production)
├─ NODE_ENV=production must be set
├─ Build tools MUST be in dependencies
├─ Manual rebuild often needed (stale cache)
└─ Check logs: dashboard.render.com
```

### **For Vercel:**

```
SETUP CHECKLIST:
├─ Build Command: npm run build
├─ Output Directory: .next or dist
├─ Environment: Node 20+ (set in dashboard)
├─ PostCSS Config: .mjs preferred (ESM-first platform)
└─ Auto-deploy on git push

COMMON GOTCHAS:
├─ Vercel strips devDependencies (use dependencies)
├─ .env.local not pushed to git (use dashboard)
└─ Preview deploys help debug
```

---

## ⚡ PART 5: TOKEN OPTIMIZATION FOR AI

### **Avoid These (High Token Waste):**

```
❌ Trial & error on different config files:
   Try .js → .cjs → .mjs → .json
   (Wastes tokens on each retry)

❌ Changing multiple things at once:
   Update vite.config + postcss.config + tailwind.config
   (Can't isolate what fixed it)

❌ Large code refactors when build issue:
   Keep changes MINIMAL when debugging builds
   (Separate concern: code changes vs build config)

❌ Re-reading same files multiple times:
   Cache file contents in context
   (Don't re-read package.json 3 times)

❌ Making assumptions about file contents:
   ALWAYS read files first
   (Guessing wastes tokens when wrong)
```

### **Do These (Low Token Cost):**

```
✅ Local build test first:
   npm run build 2>&1 | tail -10
   (Quick diagnosis before CI/CD work)

✅ Systematic one-change-at-a-time:
   Change 1: Test locally
   Change 2: If works, push to CI/CD
   (Each iteration is cheap if isolated)

✅ Check artifact sizes:
   ls -lh dist/public/assets/*.css
   (Catches CSS build issues immediately)

✅ Read config files once, cache mentally:
   vite.config.ts + postcss.config.cjs + package.json
   (Minimize file reads)

✅ Use grep/search for specific patterns:
   grep -E "postcss|tailwind" package.json
   (Faster than reading entire file)
```

---

## 📈 PART 6: PROGRESSIVE DEPLOYMENT STRATEGY

### **For AI agents starting fresh:**

```
PHASE 1: Foundation (10 min)
├─ Read: package.json (check for build tools in dependencies)
├─ Read: vite.config.ts (check root path + CSS config)
├─ Decide: What needs fixing?
│  ├─ Missing build tools? → Move to dependencies
│  ├─ Wrong config format? → Fix file extension
│  └─ Missing config? → Create postcss.config.cjs
└─ Test: npm run build locally

PHASE 2: Local Verification (5 min)
├─ npm run build
├─ Check dist/ sizes:
│  ├─ CSS > 50 kB? → Good ✓
│  ├─ CSS < 10 kB? → Tailwind broken ✗
│  └─ Any build errors? → Fix before pushing
└─ NODE_ENV=production npm run start

PHASE 3: Deployment (minimal changes)
├─ Only push if local build works
├─ One change per push
├─ Wait for CI/CD (don't re-push too fast)
└─ Check logs after each deploy

PHASE 4: Debugging (if deploy fails)
├─ Compare local vs CI/CD artifact sizes
├─ Look for first error in CI/CD logs
├─ Make ONE config change
├─ Repeat Phase 2-3
```

---

## 🧠 PART 7: REASONING PATTERNS FOR AI

### **When CSS understyled:**

```
Think like this:

Q: Why is CSS 6 kB on CI/CD but 77 kB locally?
A: Build tools are processing it differently

Q: What processes CSS?
A: PostCSS → Tailwind → Autoprefixer (in that order)

Q: Which tool is probably failing?
A: PostCSS config not loading on CI/CD

Q: Why wouldn't it load?
A: File format mismatch (.js ambiguous, .cjs/mjs explicit)

Q: Solution?
A: Use .cjs with context function or inline in vite config

Q: How to verify?
A: Check local build uses same PostCSS chain
```

### **When build tools missing:**

```
Think like this:

Q: Why is CI/CD saying "cannot find tsx"?
A: It's not installed in CI/CD environment

Q: Why not installed?
A: CI/CD runs `npm ci` which skips devDependencies

Q: How is tsx in project locally?
A: In devDependencies (dev-only)

Q: Solution?
A: Move tsx to dependencies (it's needed for production build!)

Q: Why production build needs dev tools?
A: Build process runs on CI/CD server (it's the "dev" environment for the build)
```

---

## 📝 PART 8: PRE-START CHECKLIST (Copy to AI System Prompt)

**When any AI agent starts a fullstack JS project deployment:**

```javascript
// PRE-FLIGHT CHECKLIST (Do in parallel for speed)
[
  {
    name: "Check package.json",
    check: () => grep("postcss|tailwindcss|tsx|vite|esbuild" in dependencies),
    fix: "Move from devDependencies to dependencies if found in dev"
  },
  {
    name: "Check vite.config.ts",
    check: () => verify("root path correct, allowedHosts: true"),
    fix: "Update root path if using monorepo or unusual structure"
  },
  {
    name: "Check postcss config",
    check: () => verify("postcss.config.* exists and has correct format"),
    fix: "Use .cjs with context function or .mjs for explicit format"
  },
  {
    name: "Test local build",
    check: () => run("npm run build"),
    fix: "Debug any errors before attempting CI/CD"
  },
  {
    name: "Verify CSS size",
    check: () => css_size > 50KB ? "✓ Tailwind working" : "✗ Fix PostCSS",
    fix: "Debug PostCSS chain if CSS < 10 KB"
  }
]

// DEPLOYMENT STRATEGY
if (local_build_success) {
  push_to_git();
  wait(2-5_minutes);
  check_ci_cd_logs();
} else {
  debug_locally_first();
  // Don't push until local build works!
}
```

---

## 🎓 KEY LEARNINGS FROM JANJIIN PROJECT

### **What We Learned:**

1. **File Extensions Matter**
   - `.js` = Ambiguous (ESM or CJS?)
   - `.cjs` = CommonJS explicit
   - `.mjs` = ES Module explicit
   - CI/CD is stricter than local dev

2. **Build Tools Must Be in Dependencies**
   - CI/CD uses `npm ci` (only installs dependencies)
   - devDependencies are skipped
   - Build tools = needed for build process

3. **Compare Artifacts, Not Feelings**
   - 6 kB CSS ≠ 77 kB CSS is diagnostic signal
   - Don't assume, calculate and compare
   - Local vs remote artifact sizes reveal the issue

4. **One Change At A Time**
   - Tried `.js` → `.cjs` → `.mjs` → inline config
   - Each step was binary (worked or didn't)
   - Isolation is key to debugging

5. **Environment Differences Are Real**
   - Works locally ≠ works on CI/CD
   - Build environments are strict
   - Test production build locally first

---

## 🚀 FINAL TAKEAWAY

**For AI Agents**: Think of deployment like a debugging session:
- **Hypothesis** → Local build fails at X?
- **Test** → What's the artifact difference?
- **Isolate** → One variable at a time
- **Verify** → Local works before CI/CD
- **Deploy** → Push only when ready
- **Learn** → Document root cause + solution

**Token Efficiency**: 
- Early diagnosis saves 50% of wasted tokens
- Reading files once (cache in context) saves tokens
- One-change-per-iteration prevents thrashing
- Local testing first prevents CI/CD retry loops

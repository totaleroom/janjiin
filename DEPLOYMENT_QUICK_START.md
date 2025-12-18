# ⚡ Quick Start - AI Agent Deployment Checklist

**Use this for EVERY fullstack JS deployment**. Copy into your AI system prompt.

---

## 🚀 60-SECOND PRE-FLIGHT CHECK

```bash
# 1. Dependencies in right place?
grep '"postcss"\|"tailwindcss"\|"tsx"\|"vite"\|"esbuild"' package.json | grep dependencies

# 2. Local build works?
npm run build 2>&1 | tail -3

# 3. CSS size correct?
ls -lh dist/public/assets/*.css

# Expected: 70+ KB CSS = Tailwind working ✓
# Got: 6 KB CSS = Tailwind BROKEN ✗
```

---

## 📋 QUICK DECISION TREE

```
IS LOCAL BUILD WORKING?
├─ YES → Go to section: PUSH TO CI/CD
└─ NO → Go to section: FIX LOCAL BUILD

ERROR: CSS UNDERSTYLED (6 KB instead of 70+ KB)?
├─ Check: postcss.config.* exists?
├─ Check: File extension correct (.cjs with context)?
├─ Fix: Run npm run build to verify

ERROR: MODULE NOT FOUND?
├─ Check: File extension (use .mjs for configs)
├─ Check: Build tool in dependencies? (not devDependencies)
├─ Fix: npm install --save [tool-name]

ERROR: "CANNOT FIND COMMAND tsx/vite/etc"?
├─ Cause: Tool in devDependencies
├─ Fix: Move to dependencies
├─ Verify: npm list --depth=0 | grep [tool]

BUILD SUCCEEDS LOCALLY BUT FAILS ON CI/CD?
├─ Check: Artifact sizes match?
├─ Check: Log for first error
├─ Fix: ONE change at a time (not multiple)
└─ Retry: After each change, wait 2-5 min for CI/CD
```

---

## 🔧 MOST COMMON FIXES (In Priority Order)

### Fix 1: Move Build Tools to Dependencies
```bash
npm install --save tsx vite esbuild typescript tailwindcss postcss autoprefixer @vitejs/plugin-react
```
**Why**: CI/CD uses `npm ci` → only installs dependencies

---

### Fix 2: Fix PostCSS Config Format
```bash
# Option A: Use .cjs with context function (RECOMMENDED)
cat > postcss.config.cjs << 'EOF'
module.exports = () => ({
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
})
EOF

# Option B: Delete config, inline in vite.config.ts (if A fails)
rm postcss.config.*
# Then update vite.config.ts to include css: { postcss: { plugins } }
```
**Why**: .mjs and .cjs are explicit, .js is ambiguous on CI/CD

---

### Fix 3: Check Vite Config
```typescript
// vite.config.ts should have:
export default defineConfig({
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
  },
  server: {
    allowedHosts: true, // CRITICAL for cloud platforms
  },
})
```

---

## 📊 DIAGNOSIS MATRIX

| Symptom | Cause | Fix | Priority |
|---------|-------|-----|----------|
| CSS 6 KB (not 70+) | Tailwind not running | Check postcss.config exists + format | 🔴 HIGH |
| "Cannot find tsx" | Build tool in devDeps | Move to dependencies | 🔴 HIGH |
| Module not found | ESM/CJS mismatch | Use .mjs config | 🟡 MEDIUM |
| Port already in use | Old process | Restart server | 🟡 MEDIUM |
| Stale CSS | Build/browser cache | Manual rebuild | 🟡 MEDIUM |
| PostCSS warning | Non-critical | Ignore or suppress | 🟢 LOW |

---

## ✅ DEPLOYMENT CHECKLIST (Final)

- [ ] `npm run build` succeeds locally
- [ ] CSS file 70+ KB (not understyled)
- [ ] All dependencies check passed (no devDeps for build tools)
- [ ] postcss.config.cjs exists (or inline in vite.config.ts)
- [ ] vite.config.ts has allowedHosts: true
- [ ] One git commit ready to push
- [ ] Watched Render/CI/CD logs after push
- [ ] Verified deployed CSS is styled (not understyled)

---

## 🚀 DEPLOY WORKFLOW

```
Step 1: Verify Local → npm run build SUCCESS
        ├─ Check CSS > 70 KB
        └─ If not, fix postcss.config first

Step 2: Commit → git add . && git commit -m "message" && git push

Step 3: Wait → 2-5 minutes for CI/CD build

Step 4: Check → Look at CI/CD logs for errors
        ├─ CSS size correct?
        ├─ Any build errors?
        └─ If failed, repeat Step 1-3 with ONE fix

Step 5: Verify → Visit deployed site
        ├─ Is CSS styled? (buttons green, spacing correct)
        ├─ Check browser console for errors
        └─ If not styled, check CSS file size in CI/CD logs
```

---

## 💡 TOKEN OPTIMIZATION FOR AI

**Do:**
- ✓ Read package.json once (cache in context)
- ✓ Test local build before CI/CD
- ✓ One change per git commit
- ✓ Compare artifact sizes (diagnostic)
- ✓ Check CSS size immediately (catches Tailwind issues)

**Don't:**
- ✗ Try multiple config formats simultaneously
- ✗ Make large code changes while debugging build issues
- ✗ Re-read files you already know
- ✗ Assume—always verify with commands
- ✗ Push to CI/CD before local build works

---

## 📚 For More Details

- **Full guide**: See `AI_DEPLOYMENT_PLAYBOOK.md`
- **Project setup**: See `replit.md`
- **This project status**: All ✅ (see `replit.md` → Final Health Check)

---

Last Updated: December 18, 2025
Ready for: Future AI deployments (Janjiin is LIVE ✅)

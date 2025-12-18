# Janjiin - REST Express + React Application

## Project Overview

Proyek **Janjiin** adalah aplikasi web fullstack yang menggabungkan:
- **Backend**: Express.js dengan TypeScript
- **Frontend**: React dengan Vite bundler
- **Database**: PostgreSQL (siap untuk production)
- **Real-time**: WebSocket support

## Migration Status

✅ **Migration Completed** - Proyek berhasil dimigrasikan dari Replit Agent ke Replit Environment

### Changes Made:
- Fixed critical directory typo: `client/scr` → `client/src` (Vite build issue)
- All Node.js packages installed successfully
- Application running on port 5000 (Express + Vite dev server)
- WebSocket initialized for real-time features

## Project Structure

```
.
├── server/
│   ├── index.ts              # Express server entry point
│   ├── routes.ts             # API routes
│   ├── storage.ts            # Storage interface (in-memory by default)
│   └── vite.ts               # Vite server middleware
├── client/
│   ├── src/
│   │   ├── main.tsx          # React entry point
│   │   ├── App.tsx           # Main app component with routing
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── lib/              # Utility functions
│   │   └── hooks/            # Custom React hooks
│   ├── index.html
│   └── vite-env.d.ts
├── shared/
│   └── schema.ts             # Data models & Zod schemas
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript config
├── package.json              # Dependencies
└── drizzle.config.ts         # Drizzle ORM config
```

## Running the Application

The application is already configured in Replit and runs automatically:

```bash
npm run dev
```

This starts:
- Express server on `0.0.0.0:5000`
- Vite dev server on the same port (with HMR support)
- WebSocket server for real-time features

## Environment Setup

### Required Secrets (for production):
- `GITHUB_TOKEN` - For GitHub integration (already configured)

### Environment Variables:
None required for development. The app uses sensible defaults.

## GitHub Synchronization

### Method: Built-in Replit Git Integration

To sync this project with GitHub repository `https://github.com/totaleroom/janjiin`:

1. **Open Git Pane in Replit**
   - Look for the "Source Control" or "Git" icon in the left sidebar
   - Or use: Menu → Version Control

2. **Initialize Git (if not already done)**
   - Click "Initialize Repository" or "Connect to GitHub"

3. **Connect to GitHub**
   - Select "Connect with GitHub"
   - Authorize Replit to access your GitHub account
   - Select the repository: `totaleroom/janjiin`

4. **Commit & Push Changes**
   - Git pane will show all modified files
   - Stage files or click "Stage All"
   - Enter commit message: "Migration: Fix directory structure and setup Replit environment"
   - Click "Commit"
   - Click "Push" to push to your GitHub repository

### Alternative: Command Line (if preferred)
```bash
git remote add origin https://github.com/totaleroom/janjiin.git
git add .
git commit -m "Migration: Fix directory structure and setup Replit environment"
git push -u origin main
```

**Note**: If using command line, you may need to authenticate using your GitHub personal access token.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js 4.x
- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **ORM**: Drizzle ORM (PostgreSQL ready)
- **HTTP Client**: TanStack React Query v5
- **UI Components**: shadcn/ui (Radix UI based)
- **Styling**: Tailwind CSS
- **Form Validation**: React Hook Form + Zod
- **Routing**: Wouter (client-side)

## Development Guidelines

This project follows the `fullstack_js` development pattern from Replit:

### Backend:
- Use storage interface in `server/storage.ts` for all CRUD operations
- Keep routes in `server/routes.ts` as thin as possible
- Always validate request bodies using Zod schemas

### Frontend:
- Use Wouter for client-side routing
- Use TanStack React Query for data fetching
- Always use shadcn components from `client/src/components/ui`
- Add `data-testid` attributes to all interactive elements

### Styling:
- Use Tailwind CSS utility classes
- Use `hover-elevate` and `active-elevate-2` for interactions
- Follow dark mode guidelines with explicit light/dark variants
- Never use emoji in UI - use lucide-react icons instead

## Known Issues

### PostCSS Warning
A non-blocking PostCSS warning appears during startup about missing `from` option. This doesn't affect functionality but can be resolved by updating the PostCSS configuration if needed.

### Browser Console WebSocket Errors
During development, you may see WebSocket connection errors in the browser console. This is expected in the Replit development environment and doesn't affect the application functionality.

## Next Steps

1. **Sync with GitHub** using the Git pane (see above)
2. **Start Development** - Modify code and changes will auto-reload
3. **Add Database** - When ready for persistence, uncomment PostgreSQL setup
4. **Deploy** - Use Replit's publish feature for production deployment

## Support

For questions about the Replit environment, visit: https://replit.com/docs

## Last Updated

- **Date**: December 18, 2025
- **Migration**: From Replit Agent to Replit Environment
- **Status**: ✅ Complete and Ready for Development

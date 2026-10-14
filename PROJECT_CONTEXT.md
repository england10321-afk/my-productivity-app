# Project Context: my-productivity-app

## 1. Project Overview & Status
- **App Name**: my-productivity-app
- **Repository**: `england10321-afk/my-productivity-app` (main branch)
- **Supabase Project ID**: `tcpqhvhagqyaljmyudkt`
- **Deployment Status**: Fully deployed on Vercel with active environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- **Current Feature State**:
  - Real-time DB sync between client (PC/Mobile/Tablet) and Supabase is fully active and verified.
  - Build errors related to invalid Supabase URL and prerender fallback/fallback configuration have been completely resolved.

## 2. Tech Stack & Environment
- **Framework**: Next.js (App Router, Turbopack)
- **Language**: TypeScript
- **Database / Auth**: Supabase (`@supabase/supabase-js`)
- **Styling**: Tailwind CSS
- **Deployment & Hosting**: Vercel

## 3. Architecture & Key Files Map
- `types/index.ts`: Centralized TypeScript interfaces for all productivity items (Todos, Planner Items, Logs, Categories).
- `services/plannerService.ts`: Core Supabase CRUD operations for fetching, creating, updating, and deleting tasks and daily log items.
- `app/planner/page.tsx`: Main Planner dashboard view handling task creation, status updates, and view rendering.
- `app/log/page.tsx`: Daily log view tracking completed activities and history.
- `lib/` or `services/`: Supabase client initialization configured to avoid prerender/build failures.

## 4. Supabase DB Schema & Conventions
- **Tables**:
  - `todos` / `planner_items`: Stores task items linked with timestamps and completion status.
- **Environment Variables**:
  - Configured as `Config` type in Vercel to bypass build-time persistence issues.
  - Active DB queries prevent automatic Supabase pausing (free-tier policy).

## 5. Development Guidelines & Workflow Rules
- **Data Integrity**: Always respect existing type declarations in `types/index.ts` and column naming conventions in `services/plannerService.ts`.
- **State Management**: Changes must update both local client state and trigger Supabase sync asynchronously.
- **Git Routine**: After every feature addition or modification, push commits to `main` branch on GitHub so Gitingest can ingest the complete updated repo state.
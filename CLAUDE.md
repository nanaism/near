# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Run development server with Turbopack
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

### Start production server
```bash
npm run start
```

### Run linting
```bash
npm run lint
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 4
- **UI Components**: shadcn/ui components, Framer Motion for animations
- **3D/VRM**: Three.js with @react-three/fiber and @pixiv/three-vrm for 3D character rendering
- **Backend**: Vercel Serverless Functions, Google Gemini 2.5 Pro API for AI
- **Database**: Supabase (PostgreSQL, Realtime, Auth, Storage)
- **Edge Functions**: Supabase Edge Functions (Deno) for async processing
- **Authentication**: Auth.js (NextAuth v5) with Google OAuth and Credentials providers

### Key Architecture Patterns

#### Authentication Flow
The app supports three authentication methods managed in `src/auth.ts`:
1. **Google OAuth** - Parent users authenticate via Google, stored in `users` table
2. **QR Login** - Children scan QR codes to authenticate, linked to `children` table  
3. **Demo Login** - Credentials-based demo access for testing

User roles (`parent`/`child`) are assigned during authentication and stored in JWT tokens.

#### Async Processing Architecture
Conversations are processed asynchronously to maintain responsive UX:
1. User messages are saved to `conversations` table immediately
2. Database trigger adds analysis task to `analysis_queue`
3. pg_cron runs Edge Function every minute to process queue
4. Edge Function calls `/api/analyze` endpoint 
5. Analysis results stored in `mental_health_scores` table

#### Directory Structure
- `src/app/` - Next.js App Router pages and API routes
  - `(auth)/` - Authentication pages
  - `(main)/` - Child chat interface
  - `(parent)/` - Parent dashboard
  - `api/` - API endpoints for chat, analysis, auth
- `src/entities/` - Domain entities with models and repositories
- `src/features/` - Feature-specific components, hooks, and services
- `src/shared/` - Shared components, config, utilities
- `supabase/` - Edge Functions and database configuration

#### Path Aliases
TypeScript path alias configured: `@/*` maps to `./src/*`

#### Protected Routes
Middleware in `middleware.ts` protects `/admin/*` routes, requiring authentication.

## Key Implementation Details

### Chat Feature
- Main chat interface: `src/features/chat/components/ChatClient.tsx`
- Gemini API integration: `src/features/chat/services/gemini.service.ts`
- 3D VRM character rendering in `src/features/chat/components/vrm/`

### Parent Dashboard
- Dashboard component: `src/features/parent-dashboard/components/ChildrenDashboard.tsx`
- QR code generation for child authentication

### Risk Analysis
- `/api/analyze` endpoint performs mental health risk scoring
- Two-step process: initial filtering then detailed scoring
- Alert threshold set at 0.8 for critical notifications

## Important Notes

- This is a child-focused AI chat app with 3D avatar and parent monitoring features
- The app prioritizes child privacy while providing non-invasive parent oversight
- All conversation analysis happens asynchronously to maintain performance
- The project name "Near (ニア)" means "close to you" in Japanese context
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

### Supabase local development
```bash
# Start local Supabase services (requires Docker)
npx supabase start

# Apply database migrations
npx supabase db push

# Generate TypeScript types from database schema
npx supabase gen types typescript --local > src/types/database.types.ts
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

#### Database Schema
Key tables managed by Supabase:
- `users` - Parent users authenticated via Google OAuth
- `children` - Child accounts linked to parent users
- `conversations` - All chat messages between children and AI
- `mental_health_scores` - Risk analysis results from conversations
- `analysis_queue` - Async task queue for conversation analysis
- `child_summaries` - Aggregated communication summaries for parent dashboard

#### Coding Conventions
- **Components**: Use functional components with TypeScript and React hooks
- **Styling**: Tailwind CSS utility classes, avoid inline styles
- **State Management**: React hooks and context for local state
- **Error Handling**: Try-catch blocks in async functions, user-friendly error messages
- **Type Safety**: Strict TypeScript types, avoid `any` type
- **File Naming**: kebab-case for files, PascalCase for components
- **Imports**: Use path alias `@/` for absolute imports

## Key Implementation Details

### Chat Feature
- Main chat interface: `src/features/chat/components/ChatClient.tsx`
- Gemini API integration: `src/features/chat/services/gemini.service.ts`
- 3D VRM character rendering in `src/features/chat/components/vrm/`

### Parent Dashboard
- Dashboard component: `src/features/parent-dashboard/components/ChildrenDashboard.tsx`
- QR code generation for child authentication
- Communication status shown as "weather" metaphors, not raw metrics

### Risk Analysis
- `/api/analyze` endpoint performs mental health risk scoring
- Two-step process: initial filtering then detailed scoring
- Alert threshold set at 0.8 for critical notifications
- Uses Gemini API for content analysis

### Gemini API Integration
The app uses multiple Google Gemini models for different purposes:
- **Text Generation**: `gemini-2.5-flash-lite-preview-06-17` (fast mode) or `gemini-2.5-flash` (slow mode)
- **Audio Generation**: `gemini-2.5-pro-preview-tts` for text-to-speech
- **Risk Analysis**: `gemini-2.5-pro` for mental health risk assessment
- Structured JSON responses using `responseMimeType: "application/json"`

### Environment Variables
Required environment variables for local development:
```bash
# Authentication
AUTH_URL=http://localhost:3000
AUTH_SECRET=<generated-secret>
AUTH_GOOGLE_ID=<google-oauth-id>
AUTH_GOOGLE_SECRET=<google-oauth-secret>

# Supabase
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SUPABASE_WEBHOOK_SECRET=<webhook-secret>

# Google Gemini API
GOOGLE_API_KEY=<your-gemini-api-key>
```

### Edge Functions Setup
The async processing system uses Supabase Edge Functions:
- Function location: `supabase/functions/process-analysis-queue/`
- Triggered by pg_cron every minute
- Fetches pending tasks from `analysis_queue` table
- Calls Next.js `/api/analyze` endpoint for processing
- Updates queue status after completion

To deploy Edge Functions:
```bash
npx supabase functions deploy process-analysis-queue
```

## Development Tips

### Database Migrations
When modifying database schema:
1. Create migration: `npx supabase migration new <name>`
2. Write SQL in generated file under `supabase/migrations/`
3. Apply locally: `npx supabase db push`
4. Deploy to production: `npx supabase db push --linked`

### Common Issues
- **CORS errors**: Check Edge Function CORS headers in `supabase/functions/_shared/cors.ts`
- **Auth errors**: Verify `AUTH_SECRET` and OAuth credentials are properly configured
- **Gemini API errors**: Check API key and rate limits
- **Async processing not working**: Ensure pg_cron is enabled and Edge Function is deployed

## Important Notes

- This is a child-focused AI chat app with 3D avatar and parent monitoring features
- The app prioritizes child privacy while providing non-invasive parent oversight
- All conversation analysis happens asynchronously to maintain performance
- The project name "Near (ニア)" means "close to you" in Japanese context
- Database triggers and pg_cron handle async task processing
- Edge Functions process the analysis queue every minute
- Use demo login for testing without OAuth setup
# Near (ニア) - Project Overview

## Purpose
Near (ニア) is a child-focused AI chat application with 3D avatar support that allows children to have free conversations with an emotionally expressive character. The project's mission is to:
- Provide children with a safe, private AI companion for emotional expression
- Enable non-invasive parental monitoring without violating children's privacy
- Focus on "見守り" (watching over with care) rather than "監視" (surveillance)

## Key Features

### For Children
- AI-powered chat companion using Google Gemini 2.5 Pro
- 3D animated VRM character that responds in real-time
- Complete privacy with secure authentication via QR codes
- Voice synthesis and emotional expression

### For Parents
- "Communication Weather" dashboard showing emotional state without revealing content
- Only critical alerts for serious mental health concerns
- No access to actual conversation content or specific topics
- QR code generation for child authentication

## Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 4
- **UI Components**: shadcn/ui, Framer Motion for animations
- **3D/VRM**: Three.js with @react-three/fiber and @pixiv/three-vrm
- **AI/Backend**: Google Gemini 2.5 Pro API, Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL, Realtime, Auth, Storage)
- **Edge Functions**: Supabase Edge Functions (Deno) for async processing
- **Authentication**: Auth.js (NextAuth v5) with Google OAuth and Credentials

## Architecture Pattern
The app uses asynchronous processing for conversation analysis:
1. User messages saved immediately to `conversations` table
2. Database trigger adds task to `analysis_queue`
3. pg_cron runs Edge Function every minute
4. Edge Function calls `/api/analyze` endpoint
5. Results stored in `mental_health_scores` table

This ensures responsive UX while performing heavy analysis in the background.

## Security & Privacy
- Children's conversations are completely private
- Parents see only abstract emotional indicators
- Alert threshold set at 0.8 for critical notifications only
- No logs or display of actual conversation content to parents
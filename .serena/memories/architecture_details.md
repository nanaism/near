# Architecture Details

## Authentication System
- **Auth.js (NextAuth v5)** manages authentication
- Three authentication methods:
  1. **Google OAuth**: For parent users (`/login`)
  2. **QR Code**: For children (`/child-login`)
  3. **Demo Credentials**: For testing
- User roles stored in JWT: `parent` or `child`
- Auth configuration in `src/auth.ts`
- Middleware protects `/admin/*` routes

## Database Schema (Supabase)
Key tables:
- `users`: Parent user accounts
- `children`: Child profiles linked to parents
- `conversations`: Chat messages and AI responses
- `mental_health_scores`: Risk analysis results
- `analysis_queue`: Async processing task queue
- `child_summaries`: Aggregated emotional state data

## Async Processing Flow
1. **Immediate Response**: Chat saved to DB, user gets instant AI response
2. **Background Analysis**: 
   - Database trigger adds to `analysis_queue`
   - pg_cron runs every minute
   - Edge Function processes queue items
   - Calls `/api/analyze` for risk scoring
   - Results saved to `mental_health_scores`

## Key API Endpoints
- `/api/chat`: Handles chat messages and AI responses
- `/api/analyze`: Performs mental health risk analysis
- `/api/auth/*`: Authentication endpoints
- `/api/qr/*`: QR code generation and validation
- `/api/speech`: Text-to-speech synthesis

## 3D Character System
- **@pixiv/three-vrm**: Renders VRM models
- **@react-three/fiber**: React wrapper for Three.js
- Character files in `src/features/chat/components/vrm/`
- Real-time lip sync and animations
- Emotional expressions based on conversation

## Environment Variables Required
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Google Gemini AI
GEMINI_API_KEY

# Auth.js
AUTH_SECRET
AUTH_URL

# Google OAuth
AUTH_GOOGLE_ID
AUTH_GOOGLE_SECRET

# Google Cloud TTS (optional)
GOOGLE_APPLICATION_CREDENTIALS
```

## Performance Optimizations
- Turbopack for fast development builds
- Server Components for initial page loads
- Streaming responses for chat
- Debounced state updates
- Lazy loading for 3D models
- Image optimization with Next.js Image

## Security Measures
- Row Level Security (RLS) in Supabase
- API route protection with auth checks
- Environment variables for secrets
- CORS configuration
- Input sanitization
- Rate limiting on API endpoints

## Deployment
- **Frontend**: Vercel (automatic from GitHub)
- **Database**: Supabase Cloud
- **Edge Functions**: Supabase Edge (Deno runtime)
- **File Storage**: Supabase Storage for VRM models
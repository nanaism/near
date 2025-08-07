# Code Style and Conventions

## TypeScript Configuration
- **Strict Mode**: Enabled - all types must be explicitly defined
- **Target**: ES2017
- **Module**: ESNext with bundler resolution
- **Path Alias**: `@/*` maps to `./src/*`

## Project Structure
```
src/
├── app/                # Next.js App Router pages
│   ├── (auth)/        # Authentication pages (login, register)
│   ├── (main)/        # Child chat interface
│   ├── (parent)/      # Parent dashboard
│   └── api/           # API endpoints
├── entities/          # Domain entities with models and repositories
│   └── [entity]/
│       ├── model/     # TypeScript types and interfaces
│       └── services/  # Repository patterns for data access
├── features/          # Feature-specific modules
│   └── [feature]/
│       ├── components/  # React components
│       ├── hooks/       # Custom React hooks
│       └── services/    # Business logic and API calls
└── shared/           # Shared utilities and components
    ├── components/   # Reusable UI components
    ├── config/       # Configuration files
    └── lib/          # Utility functions
```

## Naming Conventions
- **Files**: 
  - Components: PascalCase (e.g., `ChatClient.tsx`)
  - Services/Utilities: camelCase (e.g., `repository.ts`, `gemini.service.ts`)
  - Types: camelCase (e.g., `types.ts`)
- **Components**: PascalCase (e.g., `ChildrenDashboard`)
- **Functions**: camelCase (e.g., `addConversation`, `getConversationsByChildId`)
- **Constants**: UPPER_SNAKE_CASE or camelCase for configuration objects
- **Interfaces/Types**: PascalCase (e.g., `Conversation`, `ChildSummary`)

## React/Next.js Patterns
- Use functional components with hooks
- Server Components by default in App Router
- Client Components marked with `"use client"` directive
- Async Server Components for data fetching
- Use `next/navigation` for routing

## Styling
- Tailwind CSS for styling (v4)
- shadcn/ui components for UI elements
- Framer Motion for animations
- CSS classes use kebab-case

## State Management
- React hooks for local state
- Server state with Supabase Realtime
- Auth state managed by Auth.js

## Import Order
1. External packages
2. Internal absolute imports (using @/ alias)
3. Relative imports
4. Type imports

## Best Practices
- Keep components small and focused
- Separate business logic into services
- Use repository pattern for data access
- Implement proper error handling
- Add loading states for async operations
- Use TypeScript types for all props and returns
- Avoid any type - use proper typing
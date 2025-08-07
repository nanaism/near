# Development Commands

## Primary Development Commands
```bash
npm run dev          # Run development server with Turbopack (recommended)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint for code quality checks
```

## Package Management
```bash
npm install          # Install all dependencies
npm install [package]  # Add new package
npm update          # Update packages
```

## Supabase Commands
```bash
supabase login                                    # Login to Supabase
supabase link --project-ref [PROJECT_ID]         # Link to Supabase project
supabase db push                                  # Apply migrations to database
supabase functions serve                          # Run Edge Functions locally
supabase functions deploy [function-name]         # Deploy Edge Function
```

## Windows System Commands
```bash
dir                  # List files in directory (Windows equivalent of ls)
cd [directory]       # Change directory
type [file]          # Display file contents (Windows equivalent of cat)
findstr "pattern" [file]  # Search in files (Windows equivalent of grep)
where [command]      # Find command location (Windows equivalent of which)
```

## Git Commands
```bash
git status           # Check current status
git add .            # Stage all changes
git commit -m "message"  # Commit changes
git push            # Push to remote
git pull            # Pull from remote
git branch          # List branches
git checkout -b [branch]  # Create and switch to new branch
```

## Testing & Verification
After making changes:
1. Run `npm run lint` to check code quality
2. Run `npm run build` to ensure production build works
3. Test in development with `npm run dev`

## Important Notes
- Always run `npm run lint` after making code changes
- Use `npm run dev` for development (includes Turbopack for fast refresh)
- The project uses TypeScript strict mode - ensure all types are properly defined
- Path alias `@/*` maps to `./src/*` directory
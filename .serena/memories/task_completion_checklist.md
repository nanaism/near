# Task Completion Checklist

## After Making Code Changes

### 1. Code Quality Checks
```bash
npm run lint        # ALWAYS run this after making changes
```
- Fix any ESLint errors or warnings
- Ensure no TypeScript type errors

### 2. Build Verification
```bash
npm run build       # Verify production build works
```
- Ensure build completes without errors
- Check for any build warnings

### 3. Development Testing
```bash
npm run dev         # Test changes in development
```
- Test the feature/fix in the browser
- Check console for any runtime errors
- Verify responsive design on mobile viewport

### 4. Database Changes (if applicable)
- If schema changes were made:
  ```bash
  supabase db push   # Apply migrations
  ```
- Test database operations
- Verify triggers and Edge Functions still work

### 5. Type Safety
- Ensure all new code has proper TypeScript types
- No use of `any` type unless absolutely necessary
- Props interfaces defined for all components

### 6. Performance Considerations
- Check for unnecessary re-renders
- Verify async operations don't block UI
- Ensure proper loading states

### 7. Security Checks
- No hardcoded API keys or secrets
- Proper authentication checks for protected routes
- Input validation for user data
- SQL injection prevention (using parameterized queries)

### 8. Accessibility
- Proper ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance

### 9. Final Verification
- Review the changes one more time
- Test edge cases
- Verify the fix/feature meets requirements

## Before Committing
1. Stage only necessary files (check with `git status`)
2. Write clear, descriptive commit message
3. Follow conventional commit format if applicable

## Important Reminders
- **NEVER** skip `npm run lint` - it catches many issues
- **ALWAYS** test in development before considering task complete
- **VERIFY** build works with `npm run build` for production readiness
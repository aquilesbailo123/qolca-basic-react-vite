# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev              # Start Vite dev server with hot reload

# Building
npm run build            # TypeScript check + production build
tsc -b                   # TypeScript check only
vite build               # Vite build only

# Quality checks
npm run lint             # Run ESLint
npm run preview          # Preview production build locally
```

## Project Architecture

### Tech Stack
- React 19 + TypeScript + Vite
- Zustand for state management
- TanStack Query (React Query) for server state
- React Router DOM v7 for routing
- Axios with interceptors for API calls
- CSS Modules for component styling
- React Hot Toast for notifications

### Key Architectural Patterns

#### 1. Authentication System
The auth system uses JWT tokens with automatic refresh:

- **Token Management**: `useAuthStore` in `stores/useAuthStore.ts` handles all auth state
- **Token Storage**: Access/refresh tokens stored in localStorage
- **Token Refresh**: Automatic refresh when token expires within 10 minutes (see `TOKEN_REFRESH_THRESHOLD_MS`)
- **Axios Interceptors**: `lib/axios.ts` automatically attaches Bearer tokens and handles 401 responses
- **Protected Routes**: Use `ProtectedRoute` component wrapper for authenticated routes

The axios instance intercepts requests to:
1. Add auth tokens to headers (except for routes in `NO_AUTH_REQUIRED_API_ROUTES`)
2. Refresh expired tokens automatically on 401 responses
3. Force logout on specific error codes (see `LOGOUT_ERROR_CODES` in constants)

#### 2. State Management Strategy

**Client State (Zustand)**:
- Location: `stores/`
- One store per domain (e.g., `useAuthStore`, `useModalStore`)
- Pattern: Separate state interface from actions interface
```ts
interface State { isLogged: boolean }
interface Actions { logIn: () => Promise<void> }
type Store = State & Actions
```

**Server State (TanStack Query)**:
- Location: `api/` directory
- Query hooks handle all API data fetching
- Pattern: Use query key factories for cache invalidation
```ts
const KEYS = {
  all: ['users'] as const,
  list: () => [...KEYS.all, 'list'] as const,
  detail: (id: string) => [...KEYS.all, 'detail', id] as const,
}
```

#### 3. React Query Configuration
See `lib/queryClient.ts`:
- No refetch on window focus
- Don't retry on 401/403 (handled by auth interceptor)
- Retry failed requests up to 2 times
- 30-second stale time by default
- No mutation retries

#### 4. Path Aliases
The project uses `@/` path alias configured in both:
- `vite.config.ts`: `alias: { '@': '/src' }`
- `tsconfig.app.json`: `paths: { "@/*": ["src/*"] }`

Always import using path aliases:
```ts
import { Button } from '@/components/ui'
import { useAuthStore } from '@/stores'
```

#### 5. CSS Architecture

**3-Tier Color System** (see `styles/variables.css`):
1. **Primitives**: Raw color values (never use directly in components)
2. **Semantic**: Theme-aware tokens (`--color-bg`, `--color-primary`) - USE THESE
3. **Component**: Only for values repeated 3+ times

**Dark Mode**: Uses `[data-theme='dark']` selector to remap semantic tokens

**CSS Modules**: All components use scoped CSS modules:
```ts
import styles from './Component.module.css'
<div className={styles.button}>...</div>
```

#### 6. Routing Architecture
- **Layout Route**: `Main` component wraps protected content with shared layout
- **Auth Routes**: Standalone routes without Main layout
- **Protected Routes**: Wrapped in `<ProtectedRoute>` component
- **Route Constants**: All routes defined in `constants/routes.tsx`

The routing structure supports:
- Public routes accessible to all
- Protected routes requiring authentication
- Auth pages (login, register) with redirects
- Optional redirect to login with `redirectToLogin` prop

#### 7. Environment Variables
Required in `.env`:
- `VITE_PROJECT_NAME`: Application name
- `VITE_API_URL`: Backend API base URL
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID (optional)

## Code Organization Rules

### Exports
- **Always use named exports** - no default exports
- Create barrel exports (`index.ts`) for:
  - `components/ui/`
  - `components/layout/`
  - `hooks/`
  - `api/`
  - `constants/`

### File Colocation
Each component directory contains:
```
Component/
├── Component.tsx
├── Component.module.css
└── index.ts (optional barrel export)
```

### Hooks vs API
- **Utility hooks** (no API calls): `hooks/` directory
- **Query hooks** (API calls): `api/` directory

### Types Organization
- Store types in `types/` directory
- Organize by domain (e.g., `types/auth.ts`, `types/user.ts`)

### Constants
- Single file for small projects: `constants/index.ts`
- Split into multiple files when > 100 lines
- Export objects with `as const` for type safety

## Security Features

### Content Security Policy (CSP)
Security headers configured in:
- `vercel.json`: Production CSP headers
- `index.html`: Fallback meta tags for CSP

Headers include:
- Content-Security-Policy
- X-Frame-Options (DENY)
- X-Content-Type-Options (nosniff)
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

### Rate Limiting
**Location**: `lib/rateLimiter.ts`

Client-side rate limiting to prevent brute force attacks:
- `authRateLimiter`: 5 attempts per 15 minutes for auth endpoints
- `apiRateLimiter`: 100 requests per minute for general API calls
- Exponential backoff for failed attempts
- Automatic reset on successful auth

Usage:
```ts
const check = authRateLimiter.checkLimit(identifier);
if (!check.isAllowed) {
  // Block request and show retry time
}
authRateLimiter.recordAttempt(identifier);
```

### Environment-Aware Logging
**Location**: `lib/logger.ts`

Production-safe logging that:
- Only logs in development by default
- Sanitizes sensitive data (tokens, passwords, secrets)
- Prevents information leakage in production
- Can integrate with external error tracking services

Usage:
```ts
import { logger } from '@/lib/logger';

logger.error('Token refresh failed', error); // Safe in production
logger.debug('Debug info'); // Only in dev
```

### Input Sanitization
**Location**: `lib/sanitize.ts`

Defense-in-depth against XSS attacks:
- `sanitizeString()`: Remove dangerous characters
- `sanitizeName()`: For usernames, first/last names
- `sanitizeEmail()`: Email validation and sanitization
- `sanitizeUrl()`: Prevent javascript: and data: protocols
- `sanitizeUserProfile()`: Sanitize entire user objects
- `stripHtml()`: Remove HTML tags for plain text

Usage:
```ts
import { sanitizeUserProfile } from '@/lib/sanitize';

const safe = sanitizeUserProfile(userData);
```

**Note**: React escapes strings by default, but sanitization provides additional security for user-generated content.

## Important Implementation Details

### Authentication Flow
1. Login calls `useAuthStore.logIn()`
2. **Rate limit check** performed before API call
3. Tokens stored in localStorage
4. `api` axios instance auto-attaches tokens
5. On 401, interceptor attempts token refresh
6. On refresh failure, auto-logout and clear storage
7. Failed attempts recorded for rate limiting
8. Successful login resets rate limiter

### Form Components
Form components in `components/forms/`:
- All use controlled inputs
- CSS Modules for styling
- Examples: Input, Select, DatePicker, FileUpload, PasswordEyeInput

### Modal System
- Global modal managed by `useModalStore`
- Base component: `components/modals/ModalBase/ModalBase.tsx`
- Toast notifications via react-hot-toast (configured in App.tsx)

### Protected Content
To protect a route:
```tsx
<Route element={<ProtectedRoute />}>
  <Route path="/profile" element={<Profile />} />
</Route>
```

To redirect to login if not authenticated:
```tsx
<Route element={<ProtectedRoute redirectToLogin />}>
  <Route path="/settings" element={<Settings />} />
</Route>
```

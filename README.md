<div align="center">
  <img src="public/logo.svg" alt="Project Logo" width="120" height="120">
</div>

# Qolca Solutions Official React Vite Basic Template

A modern, production-ready React template built with TypeScript, Vite, and a comprehensive component library. This template provides a complete foundation for building scalable web applications with best practices, internationalization, state management, and a beautiful UI system.

## 🚀 Features

- **Modern Stack**: React 19 + TypeScript + Vite for fast development
- **State Management**: Zustand for lightweight, scalable state management
- **Routing**: React Router DOM v7 with type-safe navigation
- **Data Fetching**: TanStack Query for server state management
- **UI Components**: Comprehensive component library with consistent design
- **Styling System**: CSS variables with light/dark theme support
- **Form Handling**: Advanced form components with validation
- **Development Tools**: ESLint, TypeScript, Hot Reload


## 🤖 Working with AI Agents

This project includes an `AGENTS.md` file with detailed coding conventions for AI assistants.

### New Features: Start with a PRD

Before building new features, create a Product Requirements Document:

```markdown
# Feature: [Name]

## Problem
What problem does this solve?

## Solution
Brief description of the feature.

## Requirements
- [ ] Requirement 1
- [ ] Requirement 2

## Technical Approach
- Components needed
- API endpoints
- State management

## Out of Scope
What this feature does NOT include.
```

### Changes & Refactors: Create a Plan

For modifications, outline a step-by-step plan:

```markdown
# Plan: [Task Name]

## Goal
What we're trying to achieve.

## Steps
1. [ ] Step 1 - Description
2. [ ] Step 2 - Description
3. [ ] Step 3 - Description

## Files Affected
- `src/components/...`
- `src/pages/...`
```

### Tips for AI Collaboration

- **Reference `AGENTS.md`** - Point agents to the conventions file
- **Be specific** - Include file paths and component names
- **Review incrementally** - Check changes after each step
- **Test as you go** - Verify functionality before moving on


## 📁 Project Structure

```
src/
├── api/                 # React Query hooks
├── assets/              # Images, fonts, static files
├── components/
│   ├── ui/              # Reusable UI components (Button, Modal, Card)
│   └── layout/          # Layout components (Header, Footer, Sidebar)
├── constants/           # App constants and configuration
├── hooks/               # Utility hooks (no API calls)
├── lib/                 # Third-party library configurations (axios)
├── pages/               # Route entry points
├── stores/              # Zustand stores
├── styles/              # Global CSS and variables
└── types/               # TypeScript type definitions
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/aquilesbailo123/qolca-basic-react-vite.git

# Navigate to the project
cd qolca-basic-react-vite

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

## 📖 Usage Guide

### Imports & Exports

Always use **named exports** and **path aliases**:

```tsx
// ✓ Good
export function Button() { ... }
export const useAuthStore = create(...);

import { Button } from '@/components/ui';
import { useUsers } from '@/api';
import { useAuthStore } from '@/stores';

// ✗ Avoid
export default function Button() { ... }
import Button from '../../../components/ui/Button';
```

### Components

Components use **CSS Modules** for scoped styling:

```
components/
└── ui/
    └── Button/
        ├── Button.tsx
        └── Button.module.css
```

```tsx
// Button.tsx
import styles from './Button.module.css';

export function Button({ children }) {
  return <button className={styles.button}>{children}</button>;
}
```

### Styling

#### CSS Variables

The template uses a **3-tier color system**:

```css
/* styles/variables.css */
:root {
  /* 1. PRIMITIVES - Raw values (never use directly) */
  --gray-100: #f4f4f5;
  --gray-900: #18181b;
  --blue-500: #3b82f6;

  /* 2. SEMANTIC - Use these in components */
  --color-bg: var(--gray-100);
  --color-text: var(--gray-900);
  --color-primary: var(--blue-500);
  --color-error: var(--red-500);

  /* 3. COMPONENT - Only if repeated 3+ times */
  --color-input-border: var(--color-border);
}

/* Dark mode - remap semantic only */
[data-theme='dark'] {
  --color-bg: var(--gray-900);
  --color-text: var(--gray-100);
}
```

#### Usage in Components

```css
/* Button.module.css */
.button {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
}
```

### State Management (Zustand)

Stores are located in `stores/` with one store per domain:

```ts
// stores/useAuthStore.ts
import { create } from 'zustand';

interface AuthState {
  isLogged: boolean;
  isLoading: boolean;
}

interface AuthActions {
  logIn: (credentials: LoginRequest) => Promise<void>;
  logOut: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()((set, get) => ({
  isLogged: false,
  isLoading: false,

  logIn: async (credentials) => { ... },
  logOut: () => { ... },
}));
```

### API Layer

#### Axios Instance

The axios instance is configured in `lib/axios.ts`:

```ts
// lib/axios.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor (auth tokens, etc.)
api.interceptors.request.use(...);

// Response interceptor (error handling, etc.)
api.interceptors.response.use(...);
```

#### React Query Hooks

Query hooks are located in `api/` with key factories:

```ts
// api/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

const KEYS = {
  all: ['users'] as const,
  list: () => [...KEYS.all, 'list'] as const,
  detail: (id: string) => [...KEYS.all, 'detail', id] as const,
};

export function useUsers() {
  return useQuery({
    queryKey: KEYS.list(),
    queryFn: async () => {
      const { data } = await api.get('/users');
      return data;
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post('/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}
```

### Hooks

**Utility hooks** (no API calls) go in `hooks/`:

```ts
// hooks/useScrollToTop.ts
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
}
```

**Query hooks** (API calls) go in `api/`.

### Constants

Single file for small projects, split into folder when > 100 lines:

```ts
// constants/index.ts
export const API_ROUTES = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
} as const;

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
} as const;
```

### Types

Organize by domain in `types/`:

```ts
// types/auth.ts
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
```

## 📋 Quick Reference

| Category          | Location             | Barrel Export |
| ----------------- | -------------------- | ------------- |
| UI Components     | `components/ui/`     | ✓             |
| Layout Components | `components/layout/` | ✓             |
| Pages             | `pages/`             | ✗             |
| Utility Hooks     | `hooks/`             | ✓             |
| Query Hooks       | `api/`               | ✓             |
| Stores            | `stores/`            | Optional      |
| Types             | `types/`             | ✗             |
| Constants         | `constants/`         | ✓             |
| Styles            | `styles/`            | ✗             |
| Lib               | `lib/`               | ✗             |

## 📜 Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run type-check # Run TypeScript compiler check
```

## 🎨 Theming

Toggle between light and dark themes:

```ts
// Set theme
document.documentElement.setAttribute('data-theme', 'dark');

// Toggle theme
const currentTheme = document.documentElement.getAttribute('data-theme');
document.documentElement.setAttribute(
  'data-theme',
  currentTheme === 'dark' ? 'light' : 'dark'
);
```

## 📝 Best Practices

1. **Named exports everywhere** - Consistent imports, better refactoring
2. **CSS Modules for styling** - Scoped styles, no naming conflicts
3. **3-tier color system** - Primitives → Semantic → Component
4. **Separate utility hooks from query hooks** - Clear mental model
5. **One Zustand store per domain** - Maintainable state
6. **Query key factories** - Reliable cache invalidation
7. **Path aliases** - Clean imports with `@/`
8. **Colocate first** - Move to shared folders only when reused

## 📄 License

MIT License - feel free to use this template for any project.
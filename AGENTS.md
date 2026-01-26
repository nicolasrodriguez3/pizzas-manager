# AGENTS.md - Development Guidelines

## 📋 Build & Development Commands

### Core Commands

```bash
# Development
pnpm run dev              # Start development server (Next.js 16)
pnpm run build            # Production build
pnpm start                # Start production server

# Code Quality
pnpm run lint             # Run ESLint (Core Web Vitals + TypeScript rules)
npx tsc --noEmit         # TypeScript type checking (run before commits)

# Database
pnpx prisma generate       # Generate Prisma client
pnpx prisma migrate dev    # Run database migrations in development
pnpx prisma studio         # Open Prisma Studio for database inspection

# Testing (No test framework currently configured)
# TODO: Add Jest/Vitest when tests are implemented
```

## 🏗️ Architecture Principles

### Multi-Tenancy (Non-Negotiable)

- **ALWAYS** filter by `organizationId` in Server Actions
- NEVER assume global context or single tenant
- Every major model (products, ingredients, sales, fixed costs) must be tenant-scoped
- Server Actions must validate `session?.user?.organizationId` before operations

### Server-First Architecture

- **Business logic lives in Server Actions**, not components
- Prisma calls ONLY from Server Actions, never from client
- Components are primarily for presentation
- Use Next.js App Router conventions (Server Components by default)

### Data Flow

```
User Input → React Component → Server Action → Prisma → Database
                                    ↓
User Feedback ← React State ← Validation Result ← Form Data
```

## 🎯 Code Style Guidelines

### Imports & Dependencies

```typescript
// External libraries first (alphabetical)
import { useState, useEffect } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

// Internal imports (grouped by type)
import { auth } from "@/auth"; // App-level
import { createIngredient } from "@/actions"; // Actions
import { UNITS, UNIT_LABELS } from "@/app/config/constants"; // Config
import type { Ingredient } from "@/app/types"; // Types
import { Button } from "@/components/ui/button"; // UI components
import { prisma } from "@/lib/prisma"; // Lib
```

### Component Structure

```typescript
// File: components/ExampleComponent.tsx
"use client"; // Only if using hooks/event handlers

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ExampleComponentProps {
  // Always define explicit props interface
  data: SomeType;
  onAction?: (value: string) => void; // Optional callbacks
}

export function ExampleComponent({ data, onAction }: ExampleComponentProps) {
  // Hooks at the top
  const [state, setState] = useState<string>("");

  // Event handlers
  const handleClick = () => {
    setState("updated");
    onAction?.(state);
  };

  // Render JSX
  return (
    <div className="p-4">
      <Button onClick={handleClick}>Click me</Button>
    </div>
  );
}
```

### Server Actions Pattern

```typescript
// File: actions/example.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import type { ActionState } from "@/app/types";

export async function createExample(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return { message: "Unauthorized" };
  }

  // Extract and validate data
  const name = formData.get("name") as string;
  if (!name?.trim()) {
    return { message: "Name is required" };
  }

  try {
    const result = await prisma.example.create({
      data: {
        name: name.trim(),
        organizationId: session.user.organizationId,
      },
    });

    revalidatePath("/examples");
    return {
      success: true,
      message: "Example created successfully",
      data: result,
    };
  } catch (error) {
    console.error("Failed to create example:", error);
    return { message: "Error creating example" };
  }
}
```

### Types & Interfaces

```typescript
// Centralized in types/index.ts
export type Example = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Form inputs for Server Actions
export type ExampleInput = {
  name: string;
  isActive?: boolean;
};

// API responses
export type ActionState = {
  success?: boolean;
  message?: string;
  data?: unknown;
};
```

### Naming Conventions

- **Components**: PascalCase with descriptive names (`IngredientForm.tsx`)
- **Functions**: camelCase with verbs (`createIngredient`, `calculateCost`)
- **Variables**: camelCase, descriptive (`organizationId`, `isActive`)
- **Constants**: SCREAMING_SNAKE_CASE (`UNITS`, `UNIT_LABELS`)
- **Files**: kebab-case for UI components (`breadcrumb.tsx`), PascalCase for main components

### Error Handling

```typescript
// Server Actions
try {
  const result = await someOperation();
  revalidatePath("/path");
  return { success: true, message: "Success", data: result };
} catch (error) {
  console.error("Operation failed:", error);
  return { message: "Error message" };
}

// Components
const [state, formAction, isPending] = useActionState(
  createExample,
  initialState
);

// Display errors
{state?.message && (
  <div className={`p-3 rounded ${
    state.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
  }`}>
    {state.message}
  </div>
)}
```

## 🎨 UI/UX Guidelines

### Component Library (shadcn/ui)

- Use existing components from `@/components/ui/`
- Follow shadcn/ui patterns for composition
- Consistent spacing: `space-y-4` for form sections
- Consistent colors: `bg-orange-500` for primary actions

### Form Patterns

- Use `useActionState` for form state management
- Loading states: `{isPending ? "Saving..." : "Save"}`
- Validation feedback with colored borders/messages
- Reset form on success for create operations

### Responsive Design

- Mobile-first approach
- Grid layouts: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Consistent padding: `p-4 sm:p-6`
- Responsive text sizing with Tailwind classes

## 🚀 Next.js App Router Specifics

### Server Components (Default)

- Use for data fetching, no client-side JS needed
- Import Server Actions directly
- Better for SEO and performance

### Client Components (Opt-in)

- Add `"use client";` directive
- Only when using hooks, event handlers, browser APIs
- Keep client components small and focused

### File-Based Routing

```
app/
├── (app)/           # Route groups (no effect on URL)
├── api/            # API routes
├── auth/           # Authentication pages
├── actions/        # Server Actions
├── components/     # Shared components
├── lib/            # Utilities
├── types/          # TypeScript types
└── layout.tsx      # Root layout
```

## 🔒 Security Best Practices

- Always validate user authentication in Server Actions
- Use `session?.user?.organizationId` for data isolation
- Validate form data before database operations
- Use revalidatePath() for cache invalidation
- Never expose Prisma models directly to client

## 📦 Package Management

- All UI components from `@/components/ui/`
- Icon libraries: `lucide-react` (primary), `@phosphor-icons/react` (secondary)
- Form handling: `react-hook-form` + `zod`
- Database: `prisma` with `@prisma/client`
- Styling: `tailwindcss` v4 with `clsx` for conditional classes

## 🧪 Testing Guidelines

(TODO: Implement testing framework)

- Use Jest/Vitest for unit tests
- Testing Library for component tests
- Prisma test environment for database tests
- Always test Server Actions with authentication context

---

**Remember**: This is a gastronomic cost management system. Prioritize clarity over features, business value over technical complexity. Every decision should make sense for a small food business owner.

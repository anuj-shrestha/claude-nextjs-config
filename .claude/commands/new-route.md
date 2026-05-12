---
description: Scaffold a Next.js App Router route with page.tsx, loading.tsx, and error.tsx (and optionally layout.tsx).
argument-hint: <route-path>
---

Scaffold an App Router route at **$ARGUMENTS**.

## Steps

1. **Parse the route path.**
   - Accept formats like `dashboard`, `/dashboard`, `dashboard/settings`, or `(group)/marketing/page-name`.
   - Normalize to the folder path under `src/app/`. Example: `dashboard/settings` → `src/app/dashboard/settings/`.
   - If `$ARGUMENTS` is empty or contains characters that aren't valid in a Next.js route segment (besides `/`, `(`, `)`, `[`, `]`), ask the user for a valid path and stop.

2. **Check the target folder.**
   - If `src/app/<path>/page.tsx` already exists, stop and ask whether to overwrite.
   - If the folder doesn't exist, you'll create it (the Write tool creates parent directories).

3. **Create `src/app/<path>/page.tsx`:**

```tsx
export default function Page() {
  return (
    <main>
      <h1>Page title</h1>
      <p>Replace this with the page content.</p>
    </main>
  )
}
```

If the route is clearly data-driven (the name suggests fetching — e.g., `users/[id]`, `posts`, `dashboard`), use the async variant instead:

```tsx
export default async function Page() {
  // const data = await fetchSomething()
  return (
    <main>
      <h1>Page title</h1>
      <p>Replace this with the page content.</p>
    </main>
  )
}
```

For dynamic routes (`[param]`), include the typed `params`:

```tsx
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <main>
      <h1>Item {id}</h1>
    </main>
  )
}
```

Note: in Next.js 15+, `params` is a Promise — always `await` it.

4. **Create `src/app/<path>/loading.tsx`:**

```tsx
export default function Loading() {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading…</span>
      {/* Replace with a skeleton matching the page layout */}
    </div>
  )
}
```

5. **Create `src/app/<path>/error.tsx`:**

```tsx
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main>
      <h1>Something went wrong</h1>
      <p>{error.message}</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </main>
  )
}
```

6. **Ask whether to add `layout.tsx`** — only if the route is a top-level segment (`src/app/<segment>/layout.tsx`) and there's a plausible reason for a shared layout (nav, sidebar, auth check). For nested routes, the parent layout usually applies. If the user says no or the answer is obvious-no, skip.

If yes, create `src/app/<path>/layout.tsx`:

```tsx
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

7. **Report what you created.** List file paths. Call out the three things the user should fill in: page title/content, the loading skeleton shape, and the error UI styling. If the route is dynamic, remind the user to add a `generateStaticParams` if the params are known at build time.

## Hard Rules

- **Don't add `metadata` exports** unless the user asked for them. They're easy to add later and require knowing real values (title, description).
- **Don't add data fetching scaffolding.** A commented `// const data = await fetchSomething()` is the entirety of the data-fetching scaffold. Concrete fetches need real endpoints.
- **Don't import shadcn components** in the templates. Those are user-chosen.
- **Don't add `'use client'` to `page.tsx`, `loading.tsx`, or `layout.tsx`.** Only `error.tsx` requires it (because it needs `reset`).
- **Always include the `<span className="sr-only">Loading…</span>`** in `loading.tsx`. Screen-reader users need the announcement; sighted users don't see it.

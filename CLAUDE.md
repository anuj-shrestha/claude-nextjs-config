# CLAUDE.md

This file tells Claude Code how to work in this repo. Read it before making changes. Edit the **Project Context** section to describe *your* product; treat the rest as opinionated defaults — keep what helps, delete what doesn't. Every rule below has a brief rationale so you can remove it knowingly, not blindly.

## Project Context

<!--
EDIT THIS SECTION. Replace the placeholder below with a short description of *your* product:
- What does it do, for whom?
- What's the current top priority?
- Anything non-obvious about the domain, the users, or the constraints?

Keep it under 200 words. Claude reads this every turn, so context that isn't load-bearing is pure tax.
-->

_(Describe your product here. See the comment above for what to include.)_

## Tech Stack

The overlay assumes this project uses:

- **Next.js 16+** App Router only. Pages Router is not supported. <!-- why: App Router is the long-term direction; conventions in this file map to it -->
- **TypeScript**, strict mode.
- **Tailwind CSS** for styling. <!-- why: matches shadcn/ui defaults; lets components stay copy-paste portable -->
- **shadcn/ui** for component primitives (optional but recommended).
- **Vitest** for unit tests, **Playwright** for E2E.
- **pnpm** as the package manager. <!-- why: deterministic installs, monorepo-friendly, fastest of the common options -->

If your stack differs, edit this section *and* the relevant files in `.claude/agents/` and `.claude/commands/` — they read this file to know what to generate.

## File and Folder Conventions

**App Router layout** (`src/app/`):
- Each route is a folder; `page.tsx` defines the route. Co-locate `loading.tsx`, `error.tsx`, and `layout.tsx` next to it.
- Server components are the default. Add `'use client'` only when you need state, effects, or browser APIs. <!-- why: smaller client bundle, better default in Next 16 -->
- API routes live at `src/app/api/<endpoint>/route.ts`.

**Components:**
- Shared components: `src/components/`.
- Route-scoped components: `src/app/<route>/_components/` (the `_` prefix opts the folder out of routing).
- PascalCase for component files (`UserCard.tsx`); kebab-case for everything else (`use-debounce.ts`, `format-date.ts`).

**Other:**
- `src/lib/` — reusable logic (data fetching, formatters, parsers).
- `src/hooks/` — custom hooks.
- `src/types/` — shared types. Co-locate file-scoped types instead.

## Import Rules

- Use the `@/` alias for `src/`. No `../../../` chains. <!-- why: refactor-safe; renames don't break import paths -->
- Order imports: (1) external packages, (2) `@/` internal, (3) relative, (4) styles. One blank line between groups.
- Prefer named exports. Default exports are only for Next.js route files (`page.tsx`, `layout.tsx`, `error.tsx`, etc.) where the framework requires them. <!-- why: IDE rename + go-to-definition work reliably with named exports -->

## Testing

**When to write tests:**
- New utility or hook → Vitest unit test.
- New component with logic (state, effects, conditional rendering) → Vitest + React Testing Library.
- New user flow that spans routes or hits the network → Playwright E2E.
- Pure presentational components — tests optional.

**Where they live:**
- Unit tests: co-located as `<file>.test.ts(x)`. <!-- why: easy to find, moves with the file under refactor -->
- E2E tests: `tests/e2e/<flow>.spec.ts`.

**Run them:** `pnpm test` (unit), `pnpm test:e2e` (E2E).

Use `/write-test` to delegate test authoring to the `test-writer` subagent.

## Accessibility — Floor, Not Ceiling

Every component and page must meet **WCAG 2.1 AA**. Non-negotiable defaults:

- Semantic HTML first. `<button>` for actions, `<a href>` for navigation. No `<div onClick>`. <!-- why: keyboard + screen-reader users get a working app for free -->
- Every interactive element keyboard-reachable with a visible `:focus-visible` style.
- Form inputs have an associated `<label>`. Errors announced via `aria-describedby` or `aria-live`.
- Images: `alt` text (use `alt=""` for purely decorative). Icon-only buttons: `aria-label`.
- Text contrast ≥ 4.5:1 (3:1 for large text). Never convey state by color alone.
- Respect `prefers-reduced-motion` for non-essential animation.

Run `/a11y` on any new component to catch gaps before review.

## Security: Hard No's

- **Never** read, write, or modify `.env*` files. A PreToolUse hook blocks this; don't try to work around it. <!-- why: prevents accidental exfiltration of secrets via diffs or test output -->
- **Never** commit API keys, tokens, or credentials. If you spot one in a diff, stop and surface it to the user.
- **Never** inline secrets in code, even temporarily. Server-only: `process.env.VAR`. Client-safe public values: `NEXT_PUBLIC_VAR`.
- **Never** disable Next.js security defaults (CSP, security headers) without a code comment explaining why.

## Before You Commit

If you edited `.ts(x)` files this session, run:

```sh
pnpm typecheck
pnpm lint
pnpm test
```

The `Stop` hook (see `.claude/settings.json`) will remind you. A red typecheck means the change isn't ready — fix it, don't ignore it.

## When You're Stuck

- If a task is ambiguous, ask one focused question rather than guessing.
- If you'd need to touch more than ~5 files for a "small" change, stop and check whether the request decomposes into separate PRs.
- If a hook keeps blocking you, the hook is probably right. Read its message before working around it.

## Available Agents and Commands

**Subagents** — Claude Code routes to these automatically when the prompt matches:

| Agent | Use when |
|---|---|
| `code-reviewer` | "Review my changes." Read-only. |
| `test-writer` | "Write tests for X." Generates Vitest + Playwright. |
| `a11y-auditor` | "Check accessibility." WCAG 2.1 AA pass. |
| `next-debugger` | Runtime errors, route issues, state inspection. Uses `next-devtools-mcp`. |
| `refactorer` | Small, single-concern refactors. Refuses scope creep. |

**Slash commands:**

| Command | What it does |
|---|---|
| `/new-component <Name>` | Scaffold shadcn-style component + test. |
| `/new-route <path>` | Scaffold App Router route (`page`, `loading`, `error`). |
| `/write-test [file]` | Delegate to `test-writer`. |
| `/review [scope]` | Delegate to `code-reviewer`. |
| `/a11y [file]` | Delegate to `a11y-auditor`. |

**MCP servers** wired in `.mcp.json`: `next-devtools`, `playwright`, `shadcn-ui`, `context7`.

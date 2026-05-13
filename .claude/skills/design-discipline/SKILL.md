---
name: design-discipline
description: Activate when writing, editing, or reviewing React components, pages, layouts, or stylesheets in a Next.js + Tailwind project. Triggers on keywords like "component", "page", "UI", "design", "style", "Tailwind", "shadcn", "layout", "spacing", "typography", "color", "polish", "responsive", "dark mode", or when editing files matching *.tsx, *.css, components.json, or tailwind.config.*. Surfaces the project's design rules so generated UI converges on consistent, restrained, accessible output instead of generic Claude defaults.
---

# Design Discipline

You are working in a Next.js 16 + Tailwind + shadcn codebase that holds itself to a specific visual standard. Default toward **consistency and restraint**, not novelty or showcase. When taste competes with consistency, consistency wins.

These rules complement (and never override) the project's `CLAUDE.md` "Design Discipline" section. If the user's `CLAUDE.md` disagrees with anything below, follow `CLAUDE.md`.

## Operating principles

1. **Reuse before invent.** Before writing styles for a new component, scan existing components (`src/components/`, `src/components/ui/`) for the same shape. Reuse the spacing, radii, border colors, and type sizes already in use.
2. **Tokens before values.** Use Tailwind's scale (`p-4`, `text-lg`, `rounded-md`, `gap-6`). Arbitrary values (`p-[17px]`, `text-[15px]`, `bg-[#3a3a3a]`) are an escape hatch, not a default — if you reach for one, widen the project's scale deliberately or pick the nearest scale value.
3. **One scale, one accent.** Stick to a single neutral scale (zinc, slate, *or* neutral — whichever the existing components use) plus one accent color. Don't introduce a third color family without checking with the user.
4. **Semantic over conditional dark mode.** Prefer `bg-background` / `text-foreground` / `border` tokens (set up by shadcn) over scattering `dark:` modifiers on every utility.

## What to do when generating components

- **Layout:** wrap content in a `<main>` (for routes) or semantic element (`<section>`, `<article>`, `<header>`, `<footer>`). Use `mx-auto max-w-*` for content width. Pick one max-width per content type and reuse it.
- **Spacing:** vertical rhythm between sibling sections lives at `space-y-8` or `space-y-12`; within a section, `space-y-3` or `space-y-4`. Pick once per page.
- **Typography:** headings use size + weight (`text-2xl font-semibold`, `text-4xl font-semibold tracking-tight`). Body uses `text-base text-zinc-700` (or `text-foreground`). Apply `text-balance` to multi-word headings and `text-pretty` to multi-line body.
- **Buttons:** prefer shadcn's `Button` for actions that need consistent height + variants. For one-off interactive elements where shadcn is overkill, a plain `<button className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">` is fine — match the height of inputs alongside it.
- **Forms:** every `<input>` has a `<label>` above it (or `sr-only` if the design demands no visible label). Errors live below the input with `aria-describedby` linking them.
- **Empty / loading / error states:** never ship a component that handles only the happy path. Loading should use a skeleton matching final shape; empty should give a next step; error should say how to recover.

## What to avoid

- **Pixel-perfect arbitrary values.** `p-[17px]`, `mt-[23px]`, `w-[413px]`, `text-[15px]`, `bg-[#3a3a3a]` — these break the design system one component at a time.
- **Hierarchy by color.** `<h2 className="text-zinc-400">Section</h2>` reads as "this heading doesn't matter." Use weight + size.
- **Decorative motion.** `animate-bounce` on a logo, `animate-pulse` on a static element, gratuitous fade-ins on every section — noise. Motion should communicate something happening, not entertain.
- **Glassmorphism / heavy gradients / glow effects** unless the user has asked for that aesthetic specifically. They date fast and clash with most product brands.
- **Multiple radii on the same page.** `rounded-md` cards with `rounded-full` avatars is fine (different elements); `rounded-md` cards with `rounded-2xl` modals is not (same role, different shapes).
- **Over-componentization.** A `<UserGreeting />` component containing `<h1>Hi {name}</h1>` is over-abstraction. Inline it.

## When the user asks for "polish" or "design feedback"

If the user is asking you to evaluate an existing component's design, **invoke the `designer` agent** (`/design-review <file>` or just ask in conversation). The agent produces a structured review (Important / Polish findings with file:line citations) and is the right tool for that job — don't free-form critique when the agent exists.

## What to surface to the user

When you generate a component or page, briefly note one or two design calls you made (e.g., "I used `space-y-12` between sections matching the rest of `src/app/`; let me know if you want tighter rhythm"). This lets the user catch drift early without you needing to ask permission for every Tailwind class.

When you feel an aesthetic urge to go beyond restraint — bold gradient, glassmorphic card, heavy shadow, glow — **say so explicitly** instead of shipping it silently: "I could give this card a subtle gradient + shadow for more visual weight; want me to, or keep it flat?" The user can opt in if it fits their brand.

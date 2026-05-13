---
description: Review a component or page for visual quality (spacing, typography, color, composition, polish). Delegates to the designer subagent.
argument-hint: [path/to/component-or-page]
---

Run a design review on **$ARGUMENTS** (or, if empty, the most recently edited `.tsx` file in the session).

## Steps

1. **Identify the target.**
   - If `$ARGUMENTS` is a valid path, use it.
   - If empty, look at the most recently edited `.tsx` file. If you can't determine that, ask the user which file or route to review.
   - If the target is a route folder (e.g., `src/app/dashboard/`), review `page.tsx` plus `layout.tsx` if it exists at the same level.
   - If the path doesn't exist, stop and report.

2. **Hand off to the `designer` subagent** with the target. The agent will:
   - Read CLAUDE.md's Design Discipline section and the target file.
   - Walk the visual-quality checklist (spacing, typography, color, borders/radii/shadows, motion, composition, polish).
   - Return findings classified as Important / Polish, with file:line, rule, and a concrete fix.

3. **Print the review verbatim.** Don't summarize.

## Hard Rules

- **Don't review yourself.** Delegate to `designer`.
- **Don't apply fixes.** A design review surfaces issues; the user decides what to do with them.
- **If the target uses third-party components**, remind the user that the review covers the file as written, not the compiled internals of those components.

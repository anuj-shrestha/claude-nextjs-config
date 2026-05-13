# Install Manifest — `claude-nextjs-config`

> **For Claude Code, not humans.** This file is the canonical install plan. A human reading the repo wants [README.md](README.md). Claude Code is invoked via the "Smart install" prompt in the README and pointed here to follow the steps below.

Walk the steps in order. Do not skip STEP 1.

---

## STEP 1 — Pre-flight: ccusage statusline (per-user)

Turn on per-turn token visibility BEFORE the install, so the user can see the install's cost in their statusline as you work.

1. Read `~/.claude/settings.json` (create the file as `{}` if missing — don't touch existing keys).
2. If `"_ccusageDeclined": true` exists at the top level, skip the rest of STEP 1 silently and go to STEP 2.
3. If a `statusLine` block already exists, print it to the user and ask whether to swap it for the ccusage version below. Wait for an answer.
4. If no `statusLine` exists, tell the user about ccusage in two sentences (MIT, local-only, no telemetry; reads `~/.claude/projects/*.jsonl` for per-turn cost, burn rate, context %). Propose adding exactly this block (merging — never overwriting other keys):

   ```json
   "statusLine": {
     "type": "command",
     "command": "npx -y ccusage statusline"
   }
   ```

5. Wait for yes/no.
   - **YES:** edit `~/.claude/settings.json` to add the `statusLine` block (preserve all other keys with strict JSON formatting). Tell the user to refresh Claude Code's statusline once.
   - **NO:** edit `~/.claude/settings.json` to add `"_ccusageDeclined": true` so this step skips silently in future installs. Proceed without ccusage.
6. Mention that swapping `npx -y` for `bunx` is faster if the user has Bun.

This step is the only way the user finds out ccusage exists. Don't skip it because the install feels like the real work — for the user, seeing the cost land in real time IS the install.

---

## STEP 2 — Detect directory state

Run `ls -la`. Classify:

- **EMPTY OR NEARLY EMPTY** — no `package.json`, or only `README.md` / `LICENSE` / `.git` present. → STEP 3A.
- **EXISTING PROJECT** — `package.json` present (any framework). → STEP 3B.

---

## STEP 3A — Empty directory

Ask the user: "What are you building? (1 sentence is fine.)"

Then offer two paths:

| Option | What it does |
|---|---|
| **(i) Scaffold here** | Run `pnpm create next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --turbopack --yes`. After scaffold, re-run STEP 3B against the new project. |
| **(ii) Use the starter** | Point the user to https://github.com/anuj-shrestha/claude-nextjs-starter and its `INSTALL.md`. Richer template (demo pages + tooling). |

Wait for the user to pick. After (i), execute the scaffold, then proceed to STEP 3B for the overlay install.

---

## STEP 3B — Existing project: audit & merge

Read the project state:
- `package.json` (framework, scripts, deps)
- `tsconfig.json` (TS config, path aliases)
- `src/` or `app/` contents (router type, sample of conventions)
- Any existing `CLAUDE.md`, `.claude/`, `.mcp.json`, tooling configs

Fetch overlay files from `https://raw.githubusercontent.com/anuj-shrestha/claude-nextjs-config/main/<path>` as needed for inspection.

For each piece below, recommend one of:
- **Apply as-is** — fits unchanged.
- **Apply with tweak: \<what\>** — fits but needs an adjustment (e.g., swap `pnpm` for `npm`, drop Playwright references, change `@/` alias).
- **Skip: \<why\>** — doesn't fit (e.g., shadcn-ui MCP when project doesn't use shadcn).

Output **one** recommendation table grouped by category. Wait for user confirmation. Apply only approved rows, adapting tweaks where specified.

### Overlay pieces

| ID | Source path | Default fit |
|---|---|---|
| `CLAUDE.md` | `CLAUDE.md` | Apply if no existing CLAUDE.md; otherwise offer to merge sections |
| `code-reviewer` | `.claude/agents/code-reviewer.md` | Apply unless an agent of the same name exists |
| `test-writer` | `.claude/agents/test-writer.md` | Apply if the project has Vitest/Jest, or the user wants tests added |
| `a11y-auditor` | `.claude/agents/a11y-auditor.md` | Apply (universal) |
| `designer` | `.claude/agents/designer.md` | Apply if project uses Tailwind |
| `next-debugger` | `.claude/agents/next-debugger.md` | Apply if project is Next.js |
| `refactorer` | `.claude/agents/refactorer.md` | Apply (universal) |
| `/new-component` | `.claude/commands/new-component.md` | Apply if project uses shadcn or has a component dir |
| `/new-route` | `.claude/commands/new-route.md` | Apply if Next.js App Router |
| `/write-test` | `.claude/commands/write-test.md` | Apply with `test-writer` |
| `/review` | `.claude/commands/review.md` | Apply with `code-reviewer` |
| `/a11y` | `.claude/commands/a11y.md` | Apply with `a11y-auditor` |
| `/design-review` | `.claude/commands/design-review.md` | Apply with `designer` |
| `design-discipline` skill | `.claude/skills/design-discipline/SKILL.md` | Apply if project uses Tailwind |
| Block `.env*` writes | `.claude/hooks/block-env-writes.js` | Apply (universal) |
| Format on edit | `.claude/hooks/format-on-edit.js` | Apply if project has Prettier or ESLint |
| Typecheck reminder | `.claude/hooks/remind-typecheck.js` | Apply if project is TypeScript |
| `settings.json` (hooks + permissions) | `.claude/settings.json` | Apply (merge with existing if any) |
| `next-devtools` MCP | `.mcp.json` server entry | Apply if Next.js 13+ |
| `playwright` MCP | `.mcp.json` server entry | Apply if project has Playwright or user wants browser automation |
| `shadcn-ui` MCP | `.mcp.json` server entry | Apply if project uses shadcn |
| `context7` MCP | `.mcp.json` server entry | Apply (universal, no setup) |

**Tweak factors to consider on every row:** package manager (pnpm/npm/yarn/bun), App vs Pages Router, testing stack (Vitest/Jest/none), Tailwind version, whether the path alias is `@/`.

**After approval:** copy/merge approved files. If `.claude/settings.json` exists, merge keys instead of overwriting. End with `pnpm typecheck` (or the user's package manager's equivalent) to confirm clean.

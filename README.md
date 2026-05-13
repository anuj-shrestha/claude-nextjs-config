# claude-nextjs-config

**Drop-in Claude Code overlay for Next.js + TypeScript.** Opinionated agents, slash commands, safety hooks, and MCP servers — applied to any repo in under a minute.

> Works on new projects *and* existing ones. You bring the Next.js app; this brings the Claude Code that knows how to work on it.

---

## What you get

| File | What it does |
|---|---|
| `CLAUDE.md` | Project conventions Claude follows: file layout, imports, testing, **design discipline**, a11y floor, security rules |
| `.claude/agents/` | Six specialized subagents — `code-reviewer`, `test-writer`, `a11y-auditor`, `designer`, `next-debugger`, `refactorer` |
| `.claude/commands/` | Six slash commands — `/new-component`, `/new-route`, `/write-test`, `/review`, `/a11y`, `/design-review` |
| `.claude/skills/` | One auto-invoked skill — `design-discipline` (activates on UI/component/style work) |
| `.claude/settings.json` | Hooks that auto-format on save, block `.env*` writes, and nudge you to typecheck before commit |
| `.mcp.json` | Pre-wired MCP servers — `next-devtools`, `playwright`, `shadcn-ui`, `context7` |

Every file is human-readable and easy to edit. Keep what helps, delete what doesn't.

---

## Smart install (recommended)

Don't want to copy files you might not need? Open your project in **Claude Code** and paste this prompt. Claude will read your repo, fetch the overlay's files from GitHub, and tell you which pieces fit your stack — then apply only what you approve.

```
Fetch https://raw.githubusercontent.com/anuj-shrestha/claude-nextjs-config/main/INSTALL.md
and follow the steps in it for my current directory. Do them in order,
do not skip STEP 1, and wait for my confirmation before applying any
changes.
```

**What Claude will do:**

1. **STEP 1 — Pre-flight:** propose `ccusage` for per-turn token visibility so you can watch the install's cost land in real time. (Skipped silently if you previously declined.)
2. **STEP 2 — Detect directory state** (empty vs. existing project).
3. **STEP 3A — Empty:** ask one question, scaffold a Next.js app *or* redirect you to the starter.
4. **STEP 3B — Existing:** read your stack, fetch overlay pieces from GitHub, show a per-piece **apply / tweak / skip** table grouped by category, wait for confirmation, then copy only what you approved.

The full install logic lives in [`INSTALL.md`](INSTALL.md). Edit it there if the defaults don't fit your install path.

If you'd rather just grab everything, the one-liner below is faster.

## 60-second quickstart

```bash
# In the root of your Next.js + TypeScript repo:
npx degit anuj-shrestha/claude-nextjs-config .
```

Open the repo in Claude Code. You should immediately see:

- Six subagents listed when you run `/agents`
- Six slash commands when you type `/`
- `design-discipline` skill listed under `/skills`
- Auto-format firing the next time you edit a `.tsx` file
- `.env.local` writes blocked with a hint
- MCP servers connecting on startup (`/mcp`)

That's it. No build step, no install script, no framework version coupling.

### Prefer to inspect first?

`degit` copies files without history. If you want to read everything before it touches your repo:

```bash
# Clone to a temp folder, review, then copy what you want:
git clone --depth=1 https://github.com/anuj-shrestha/claude-nextjs-config.git /tmp/claude-nextjs-config
cd /tmp/claude-nextjs-config
ls -la                              # see what's inside
cat CLAUDE.md                       # read the conventions
cat .claude/settings.json           # read the hooks + permissions

# When you're ready, copy into your project:
cp -r CLAUDE.md .claude .mcp.json /path/to/your/project/
```

### Already have a `CLAUDE.md` or `.claude/` directory?

`degit` will refuse to copy into a non-empty directory by default. Either:

- Add `--force` to overwrite (you lose your existing files — make sure they're committed first).
- Or use the manual path above and merge by hand.

A safer `install.sh` that diffs and prompts on each conflict is on the v2 roadmap; for now, `git status` after install is your safety net.

### Updating later

The overlay is opinionated defaults, not a framework. Once it's in your repo, it's yours — edit freely, don't expect updates to merge cleanly. To pull selective improvements after a future release, copy the specific files you want from the latest commit:

```bash
# Example: pull the latest CLAUDE.md only
curl -O https://raw.githubusercontent.com/anuj-shrestha/claude-nextjs-config/main/CLAUDE.md
```

A proper Claude Code plugin distribution (with `/plugin install`) is the v2 mechanic. v1 deliberately keeps the install path as "copy and own it."

---

## What's inside, in detail

### `CLAUDE.md`

A short, opinionated set of conventions Claude reads before doing anything in your repo:

- App Router file/folder layout
- Import ordering and path aliases
- When to write tests and where they live
- WCAG 2.1 AA accessibility floor
- Hard rules: never touch `.env*`, never commit keys, never inline secrets

Edit the **Project Context** section at the top to describe your app. Leave the rest verbatim unless you have a reason to change it — each rule has a comment explaining *why*, so you can confidently remove what doesn't fit.

### Subagents

| Agent | Use when | Tools |
|---|---|---|
| `code-reviewer` | "Review my recent changes." Read-only, runs git diff under the hood. | Read, Grep, Glob, Bash (git only) |
| `test-writer` | "Write tests for this file." Generates Vitest unit + Playwright E2E. | Read, Edit, Write, Bash |
| `a11y-auditor` | "Audit this component for accessibility." WCAG 2.1 AA pass. | Read, Grep, Glob |
| `designer` | "Review the design." Spacing, typography, color, composition, polish. | Read, Grep, Glob |
| `next-debugger` | "Why is this route 500ing?" Inspects via `next-devtools-mcp`. | Read, MCP tools |
| `refactorer` | Small, single-concern refactors. Refuses scope creep. | Read, Edit, Grep |

Claude Code routes to these automatically based on the prompt — you usually won't need to invoke them by name.

### Slash commands

| Command | What it does |
|---|---|
| `/new-component <Name>` | Scaffolds a shadcn-style component with a test file (and Storybook stub if Storybook is installed). |
| `/new-route <path>` | Scaffolds an App Router route: `page.tsx`, `loading.tsx`, `error.tsx`, optionally `layout.tsx`. |
| `/write-test [file]` | Hands off to `test-writer` for the current or specified file. |
| `/review [scope]` | Hands off to `code-reviewer` for the recent diff or a specific scope. |
| `/a11y [file]` | Hands off to `a11y-auditor` for a component or page. |
| `/design-review [file]` | Hands off to `designer` for a visual-quality review of a component or page. |

### Skills

One skill ships in `.claude/skills/` and auto-activates by keyword:

- **`design-discipline`** — triggers on design / UI / component / Tailwind / style work. Surfaces the project's design rules (spacing scale, type hierarchy, color system, motion, composition) so generated UI converges on the project's standards instead of generic Claude defaults. Complements the `designer` agent: the skill nudges generation; the agent audits the result.

Why this skill is bundled (and others aren't): it pairs 1:1 with the project's `CLAUDE.md` Design Discipline section and is written in-house. Third-party community skills are listed under [Recommended community skills](#recommended-community-skills) — install those globally or per-project as you see fit.

### Hooks

Configured in `.claude/settings.json`:

- **PostToolUse on Edit/Write** of `*.{ts,tsx,css}` → `prettier --write` + `eslint --fix` on the changed file only (file-scoped, not whole repo, so it stays fast).
- **PreToolUse on Write/Edit** → denies any path matching `.env*` with an explanation message.
- **Stop hook** → if any `.ts(x)` files were edited this session, reminds you to run `pnpm typecheck` before committing.
- **Permissions** → tiered allowlist. Read-only git, scoped `pnpm` scripts, and `ls`/`cat`/`grep`/`rg` are allowed; package installs, commits, and `git push` require confirmation; `rm -rf`, `sudo`, `curl`, `wget`, and any read/write of `.env*` are denied.

> Already have pre-commit hooks doing some of this? Delete the matching block in `.claude/settings.json`. Hook scripts live in `.claude/hooks/` — each one has a comment at the top explaining what it does and why.

### MCP servers

Pre-wired in [`.mcp.json`](.mcp.json):

| Server | Package | What it does | Setup |
|---|---|---|---|
| `next-devtools` | [`next-devtools-mcp`](https://github.com/vercel/next-devtools-mcp) (Vercel official) | Inspect runtime errors, route info, component state on a running dev server. | Run `pnpm dev`; MCP auto-discovers it. |
| `playwright` | [`@playwright/mcp`](https://github.com/microsoft/playwright-mcp) (Microsoft official) | Drive a browser to author and run E2E tests. | First run downloads browsers. |
| `shadcn-ui` | [`@jpisnice/shadcn-ui-mcp-server`](https://github.com/Jpisnice/shadcn-ui-mcp-server) | Fast lookup of shadcn component APIs and source. | Works anonymously; see below for higher rate limits. |
| `context7` | [Context7 remote](https://context7.com) (Upstash) | Up-to-date docs for React, Next, Tailwind, and 10k+ libraries. | Works anonymously; see below for higher rate limits. |

**Optional auth for higher rate limits.** Both `shadcn-ui` and `context7` work without keys, but get rate-limited. To lift the caps, add an entry to `.claude/settings.local.json` (gitignored) with environment variables, then update `.mcp.json` to pass them. Two examples:

- **shadcn-ui** — a GitHub PAT raises the limit from 60 to 5000 req/hr. Edit `.mcp.json` to add `--github-api-key <YOUR_PAT>` to the `args` array.
- **context7** — get a free key at [context7.com/dashboard](https://context7.com/dashboard), then edit `.mcp.json` to add `"headers": { "CONTEXT7_API_KEY": "<YOUR_KEY>" }` to the `context7` block.

**Adding `github`.** Not enabled by default. To turn it on, paste this into the `mcpServers` object of `.mcp.json`:

```json
"github": {
  "type": "http",
  "url": "https://api.githubcopilot.com/mcp/"
}
```

Claude Code will prompt for OAuth on first use. The old `@modelcontextprotocol/server-github` npm package is deprecated — don't use it.

---

## Customizing

Everything in `.claude/` is yours to edit. Common adjustments:

- **Different package manager?** Find/replace `pnpm` in `.claude/commands/` and the `Stop` hook in `settings.json`.
- **No Playwright?** Delete the Playwright bits from `test-writer.md` and the `.mcp.json` entry.
- **Don't want auto-format?** Remove the `PostToolUse` block in `settings.json`.
- **Want your own agent?** Drop a new markdown file in `.claude/agents/` — Claude Code picks it up automatically.

For machine-local overrides (paths, secrets, personal preferences), use `.claude/settings.local.json` — it's gitignored.

---

## Tips & companions

### See your token spend per session

Claude Code's `/cost` gives session totals. For richer per-turn visibility — burn rate, current 5-hour block, context %, today's cost — add this to **your** `~/.claude/settings.json` (per-user, not part of this overlay):

```json
{
  "statusLine": {
    "type": "command",
    "command": "npx -y ccusage statusline"
  }
}
```

[`ccusage`](https://github.com/ryoppippi/ccusage) is MIT, local-only (no telemetry), and reads `~/.claude/projects/*.jsonl` to compute usage. Requires Node ≥20 or Bun ≥1.2. For faster refresh, swap `npx -y` for `bunx`.

> Why per-user, not in the overlay's `settings.json`? Statusline is a personal preference, not a project convention — and `npx -y` spawn on every refresh would tax everyone who installs the overlay. Opt in if you want it.

---

## Stack assumptions

This overlay assumes your project uses:

- Next.js **16+** with the App Router (Pages Router not supported)
- TypeScript
- Tailwind CSS
- shadcn/ui (optional, but some commands light up when present)
- Vitest + Playwright (the test-writer's defaults; swap by editing the agent)
- pnpm (commands reference `pnpm`; swap to `npm`/`yarn`/`bun` by find/replace)

If you're on an older Next.js version, most of this still works — but `/new-route` and `next-debugger` assume App Router specifics.

---

## Recommended community skills

This overlay ships **one in-house skill** (`design-discipline` — see [Skills](#skills) above). Everything else is referenced, not vendored. Skills work better when you choose them deliberately, and most good ones are personal workflow (better installed globally) rather than project-specific. A few we like:

### Install globally — they should follow you across every project

Drop these in `~/.claude/skills/` so they're available everywhere, not just in repos with this overlay.

| Skill | What it does | Source |
|---|---|---|
| `no-slop` | Lints AI-generated prose (PR descriptions, READMEs, blog posts). Bans participle chains, promotional tone, filler vocabulary. | [Byk3y/no-slop](https://github.com/Byk3y/no-slop) |
| `context-engineering` | Teaches Claude to manage its own context budget: write, select, compress, isolate. Pays off on long sessions. | [rohitg00/pro-workflow](https://github.com/rohitg00/pro-workflow/tree/main/skills/context-engineering) |

### Install per-project — only when the project actually uses them

Drop these in the consuming project's `.claude/skills/` if they fit.

| Skill | When | Source |
|---|---|---|
| `ui-ux-pro-max` | Whenever you want deeper a11y, touch-target, and responsive-layout enforcement than the overlay's `CLAUDE.md` provides. | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |
| `remotion` | Only if your project uses [Remotion](https://www.remotion.dev) (programmatic video in React). | [coleam00/second-brain-skills](https://github.com/coleam00/second-brain-skills/tree/main/.claude/skills/remotion) |

> Heads up: we don't maintain these. Read the source before installing — especially repos with surprising star counts.

---

## See it in action

[**claude-nextjs-starter**](https://github.com/anuj-shrestha/claude-nextjs-starter) — a deployed Next.js 16 app with this overlay applied. Source code, live demo, and example agent/command output. Best way to evaluate before adopting.

---

## Contributing

Found a sharp edge? Open an issue. PRs welcome, especially:

- Better prompts for existing agents (the descriptions are the trigger logic — improvements compound)
- Bug fixes for hooks across shells/OSes
- New slash commands that solve a real, frequent Next.js workflow

Out of scope: personal-preference rules, framework-agnostic abstractions, things that only make sense in one team's codebase.

---

## License

MIT

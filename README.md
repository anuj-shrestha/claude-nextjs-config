# claude-nextjs-config

**Drop-in Claude Code overlay for Next.js + TypeScript.** Opinionated agents, slash commands, safety hooks, and MCP servers — applied to any repo in under a minute.

> Works on new projects *and* existing ones. You bring the Next.js app; this brings the Claude Code that knows how to work on it.

---

## What you get

| File | What it does |
|---|---|
| `CLAUDE.md` | Project conventions Claude follows: file layout, imports, testing, a11y floor, security rules |
| `.claude/agents/` | Five specialized subagents — `code-reviewer`, `test-writer`, `a11y-auditor`, `next-debugger`, `refactorer` |
| `.claude/commands/` | Five slash commands — `/new-component`, `/new-route`, `/write-test`, `/review`, `/a11y` |
| `.claude/settings.json` | Hooks that auto-format on save, block `.env*` writes, and nudge you to typecheck before commit |
| `.mcp.json` | Pre-wired MCP servers — `next-devtools`, `playwright`, `shadcn-ui`, `context7` |

Every file is human-readable and easy to edit. Keep what helps, delete what doesn't.

---

## 60-second quickstart

```bash
# In the root of your Next.js + TypeScript repo:
npx degit anuj-shrestha/claude-nextjs-config .
```

Open the repo in Claude Code. You should immediately see:

- Five subagents listed when you run `/agents`
- Five slash commands when you type `/`
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

This overlay deliberately does **not** bundle skills. Skills work better when you choose them yourself, and most good ones are personal workflow (better installed globally) rather than project-specific. A few we like:

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

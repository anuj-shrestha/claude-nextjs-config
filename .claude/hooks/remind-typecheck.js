#!/usr/bin/env node
// Stop hook.
// If there are uncommitted .ts/.tsx changes, remind the user to run pnpm typecheck before committing.
// Why: catches type regressions before they ship. Stateless — uses `git status`, not session history.

const { spawnSync } = require('node:child_process')

const git = spawnSync('git', ['status', '--porcelain'], { encoding: 'utf-8', timeout: 3_000 })

// Not a git repo, or git isn't available — silently skip.
if (git.status !== 0) {
  process.exit(0)
}

const lines = git.stdout.split('\n').filter(Boolean)
const tsChanges = lines.filter((line) => /\.tsx?$/.test(line))

if (tsChanges.length === 0) {
  process.exit(0)
}

const fileWord = tsChanges.length === 1 ? 'file' : 'files'

process.stderr.write(
  `\n${tsChanges.length} uncommitted .ts/.tsx ${fileWord}. Before committing:\n` +
    `  pnpm typecheck\n` +
    `  pnpm lint\n` +
    `  pnpm test\n`,
)

process.exit(0)

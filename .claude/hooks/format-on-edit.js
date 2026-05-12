#!/usr/bin/env node
// PostToolUse hook for Write/Edit.
// Runs prettier --write and eslint --fix on the single edited file, if applicable.
// Why: keeps files formatted and lint-clean without a separate save step. File-scoped so it stays fast.

const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const input = JSON.parse(fs.readFileSync(0, 'utf-8'))
const filePath = input?.tool_input?.file_path

if (!filePath || !fs.existsSync(filePath)) {
  process.exit(0)
}

// Skip non-source files and files in dirs we should never touch.
const ext = path.extname(filePath).toLowerCase()
const isTargetExt = ['.ts', '.tsx', '.js', '.jsx', '.css', '.mjs', '.cjs'].includes(ext)
const isIgnoredDir = /\/(node_modules|\.next|\.turbo|\.vercel|dist|build|out|coverage)\//.test(filePath)

if (!isTargetExt || isIgnoredDir) {
  process.exit(0)
}

const messages = []

// Run prettier if it's available locally.
const prettier = spawnSync('pnpm', ['exec', 'prettier', '--write', '--log-level', 'silent', filePath], {
  cwd: process.cwd(),
  encoding: 'utf-8',
  timeout: 10_000,
})
if (prettier.status !== 0 && prettier.status !== null) {
  // Non-zero status, but pnpm exec may also fail simply because prettier isn't installed.
  // Don't fail the hook — surface a quiet note.
  if (prettier.stderr && !/command not found|not found/i.test(prettier.stderr)) {
    messages.push(`prettier: ${prettier.stderr.trim().split('\n')[0]}`)
  }
}

// Run eslint --fix only for JS/TS files (not CSS).
if (['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'].includes(ext)) {
  const eslint = spawnSync(
    'pnpm',
    ['exec', 'eslint', '--fix', '--no-warn-ignored', '--no-error-on-unmatched-pattern', filePath],
    { cwd: process.cwd(), encoding: 'utf-8', timeout: 15_000 },
  )
  if (eslint.status !== 0 && eslint.status !== null) {
    // eslint --fix returns non-zero when there are unfixable errors.
    // That's information, not a hook failure — surface a quiet line.
    if (eslint.stdout && eslint.stdout.trim()) {
      const firstError = eslint.stdout.trim().split('\n').slice(0, 5).join('\n')
      messages.push(`eslint: unfixable issues remain in ${path.basename(filePath)}:\n${firstError}`)
    }
  }
}

if (messages.length) {
  process.stderr.write(messages.join('\n') + '\n')
}

process.exit(0)

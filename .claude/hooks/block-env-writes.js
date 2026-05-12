#!/usr/bin/env node
// PreToolUse hook for Write/Edit.
// Blocks any tool call whose file_path matches an .env* pattern.
// Why: prevents accidental modification or exfiltration of secrets via Claude tool output.

const fs = require('node:fs')
const path = require('node:path')

const input = JSON.parse(fs.readFileSync(0, 'utf-8'))
const filePath = input?.tool_input?.file_path

if (!filePath) {
  process.exit(0)
}

const basename = path.basename(filePath)
const isEnvFile = /^\.env($|\.)/.test(basename)

if (isEnvFile) {
  process.stderr.write(
    `Blocked: ${filePath}\n` +
      `\n` +
      `This repo's CLAUDE.md forbids reading or writing .env files. ` +
      `If you need to add an environment variable:\n` +
      `  1. Tell the user which variable, what it's for, and what scope (server / NEXT_PUBLIC_).\n` +
      `  2. Let the user add it themselves.\n` +
      `\n` +
      `If you genuinely need to bypass this hook, edit .claude/settings.json — but read the rationale first.\n`,
  )
  process.exit(2)
}

process.exit(0)

---
description: Generate Vitest unit and/or Playwright E2E tests for a file. Delegates to the test-writer subagent.
argument-hint: [path/to/file]
---

Write tests for **$ARGUMENTS** (or, if empty, the most recently edited file in the session).

## Steps

1. **Identify the target file.**
   - If `$ARGUMENTS` is a valid path, use it.
   - If empty, look at the most recently edited file this session. If you can't determine that, ask the user which file to test.
   - If the path doesn't exist, stop and report the missing path.

2. **Skim the file** to confirm it's a candidate worth testing:
   - Utility, hook, component with logic, route handler → proceed.
   - Pure presentational component with no logic → tell the user it likely doesn't need a test, and ask whether to proceed anyway.
   - Type-only file (`.d.ts`, type definitions) → stop, no runtime test possible.

3. **Hand off to the `test-writer` subagent** with the target file path. The agent will:
   - Read the target and existing test patterns in the repo.
   - Decide unit / E2E / both.
   - Generate tests at the right location.
   - Run them to confirm they pass.

4. **Report** the files created and the test results.

## Hard Rules

- **Don't write tests yourself in this command.** Delegate to `test-writer` — the subagent has the full test-writing context. This command is just a router.
- **Don't generate tests for files that don't need them.** Trivial components, type aliases, re-exports.

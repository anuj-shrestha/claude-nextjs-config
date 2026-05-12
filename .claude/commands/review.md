---
description: Review uncommitted changes or a specified scope. Delegates to the code-reviewer subagent.
argument-hint: [scope or file path]
---

Review changes for **$ARGUMENTS** (or, if empty, all uncommitted work — staged and unstaged).

## Steps

1. **Determine scope.**
   - If `$ARGUMENTS` is empty: review staged + unstaged changes (`git diff` and `git diff --cached`).
   - If `$ARGUMENTS` is a file path: review just that file's current state vs `HEAD`.
   - If `$ARGUMENTS` is a commit range (e.g., `main..HEAD`, `HEAD~3..HEAD`): review that range.
   - If `$ARGUMENTS` is a PR number and `gh` is available: fetch the PR diff (`gh pr diff $ARGUMENTS`) and review.
   - If the scope is empty (no diff, no staged changes), tell the user and stop.

2. **Hand off to the `code-reviewer` subagent** with the scope. The agent will:
   - Read the changed files in full.
   - Apply the correctness / type-safety / security / Next.js / performance / a11y / tests / conventions checklist.
   - Return a structured review (Critical / Important / Nits / What's good).

3. **Print the review verbatim.** Don't summarize it, don't soften it, don't filter findings.

## Hard Rules

- **Don't review yourself.** Delegate to `code-reviewer`. This command sets up scope and prints output.
- **Don't apply suggested fixes.** A review surfaces issues; the user decides what to do with them.

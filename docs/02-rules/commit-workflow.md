---
alwaysApply: true
---

# Commit Workflow

**[← Back to Main Documentation](../../README.md)**

This page defines the step-by-step workflow Claude must follow before creating a commit.

The goal is to keep the user in control of what gets committed and when. Claude should never commit autonomously without explicit user approval at each gate.

## Table of Contents

- [The Workflow](#the-workflow)
  - [Step 0: Run the Lint Check](#step-0-run-the-lint-check)
  - [Step 1: Present Changes for Review](#step-1-present-changes-for-review)
  - [Step 2: Wait for User Approval](#step-2-wait-for-user-approval)
  - [Step 3: Draft the Commit Message](#step-3-draft-the-commit-message)
  - [Step 4: Ask for the Jira Ticket](#step-4-ask-for-the-jira-ticket)
  - [Step 5: Group Large Changes Into Related Commits](#step-5-group-large-changes-into-related-commits)
  - [Step 6: Commit](#step-6-commit)
- [Rules](#rules)
- [Practical Outcome](#practical-outcome)

## The Workflow

### Step 0: Run the Lint Check

Before presenting any changes to the user, run `npm run lint:check`.

- If the check passes, proceed to Step 1.
- If errors are found that were introduced by the current change, fix them first and re-run.
- If errors exist in unrelated modules or classes, do **not** fix them. Proceed to Step 1 and include a note:

  > "All requested changes passed the lint check. The remaining issues are pre-existing in `<ClassName>` / `<module>` and were not introduced by this change."

### Step 1: Present Changes for Review

After completing a code change, summarize what was changed and why before doing anything else.

Do not commit. Do not stage. Do not write a commit message yet.

Present the summary clearly so the user can read and assess the changes.

### Step 2: Wait for User Approval

Ask the user explicitly whether the changes look correct and whether they approve.

Do not proceed to the next step until the user confirms approval.

If the user requests corrections, apply them and return to Step 1.

### Step 3: Draft the Commit Message

Once the user approves the changes, draft a commit message that follows the format in [commit-messages.md](./commit-messages.md).

The body must be 1–3 lines maximum. Write only the main reason the change was made. Do not list every file or change touched.

If the user asks Claude to write a commit message directly without a prior review, do not write it immediately. First ask:

> "Do you approve the changes? Reply with Y or N."

Only draft the commit message after receiving Y.

Show the draft to the user before committing.

### Step 4: Ask for the Jira Ticket

Ask the user for the Jira ticket number in the format `PRODUCT-xxxx`.

If the user confirms they do not have a ticket number, proceed without it.

Do not guess or invent a ticket number.

### Step 5: Group Large Changes Into Related Commits

If the change set is too big to belong in a single commit, do not stage everything at once. Split it into smaller, logically related groups and commit each group on its own.

For each group:

1. Identify changes that belong together (same feature, fix, or concern).
2. Stage only those files together (`git add <related files>`).
3. Draft a commit message for that group following [commit-messages.md](./commit-messages.md).
4. Commit that group.
5. Repeat with the next related group until **all** changes are committed.

Guidelines:

- each commit should represent one coherent, self-contained change
- never mix unrelated concerns (e.g. a bug fix and a refactor) in the same commit
- do not leave changes uncommitted after the process — continue until the working tree is clean
- if the grouping is not obvious, present your proposed grouping to the user and confirm before staging

If the change is small enough to be a single coherent commit, skip this step.

### Step 6: Commit

Only after Steps 2, 3, and 4 are complete, create the commit (one per group when Step 5 applies).

## Rules

- Always run `npm run lint:check` after every change, before presenting results to the user.
- Never commit immediately after making changes, even if the change is small or obvious.
- Never skip the review step because the change looks straightforward.
- Never stage and commit in the same action without presenting a summary first.
- Always show the commit message draft to the user before committing.
- Always ask for the Jira ticket after approval, not before.
- If the user says "commit it" without having reviewed, still show the summary and ask for confirmation.
- If the user asks for a commit message directly, ask "Do you approve the changes? Reply with Y or N." before writing anything.
- If the change set is too big for one commit, split it into related groups, stage and commit each group separately, and repeat until all changes are committed.
- Never stage unrelated changes together just to commit them in one action.

## Practical Outcome

Following this workflow ensures:

- the user is never surprised by what gets committed
- commit messages are reviewed before they enter git history
- every commit is traceable to a Jira ticket wherever one exists
- Claude does not act autonomously on changes that belong to the user

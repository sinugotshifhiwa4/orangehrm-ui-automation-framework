---
alwaysApply: true
---

# Always-Apply Rules

Binding behavioral rules for every task, regardless of size or scope. Not optional.

## Branching

The user creates the feature branch. The agent must **never** create a branch. If none exists when a task starts, stop and ask the user to create one.

## Commit Workflow

Follow `docs/02-rules/commit-workflow.md`. Required gates, in order:

1. Present a summary of all changes — do not commit yet.
2. Wait for explicit user approval.
3. Draft the message per `docs/02-rules/commit-messages.md` and show it.
4. Ask for the Jira ticket (`PRODUCT-xxxx`) or confirm there is none.
5. Only then commit.

Body: 1–3 lines max, exact format per `docs/02-rules/commit-messages.md`, state only the main reason, do not list files, include the `test:` line only when a spec was directly affected.

## Co-Authored-By Attribution

Never add a `Co-Authored-By` trailer or agent attribution of any kind. `includeCoAuthoredBy` must always be `false`.

## Documentation

Do not write or update docs after changes. First ask the user whether docs should be added and where; only write after explicit approval. Follow `docs/documentation-prompt-guide.md`.

## JSDoc Comments

Every method created or modified — including private ones — needs a JSDoc comment:

```ts
/**
 * One-sentence description.
 * @param paramName - Description.
 * @returns A promise that resolves when <outcome>.
 */
```

One `@param` per parameter (omit if none). Always `@returns` for async methods; omit only for synchronous `void` methods. Full rules: `docs/02-rules/code-quality.md` (**Documentation Rules**).

## Answer Before Acting

When the user asks a question, do not modify code or files first. Answer fully, explain relevant context and options, then ask "Do you want me to make these changes?" Proceed only after explicit confirmation.

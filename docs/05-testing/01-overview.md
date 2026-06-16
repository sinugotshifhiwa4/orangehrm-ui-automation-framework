# Testing

**[← Back to Main Documentation](../../README.md)**

This page is the entry point for everything about writing and running tests in the framework.

It explains where tests live, how a test is shaped, how tags control execution, and where to go for the related rules and commands.

## Table of Contents

- [Current Scope](#current-scope)
- [Where Tests Live](#where-tests-live)
- [The Test Lifecycle](#the-test-lifecycle)
- [Related Pages](#related-pages)
- [Practical Outcome](#practical-outcome)

## Current Scope

The active execution path is **UI** only.

The `tests/` tree reserves `api` and `db` layers, but UI is the layer in real use today. The pages in this section describe the UI testing flow.

## Where Tests Live

All tests sit under `tests/`, grouped by layer:

```text
tests/layers/ui/      UI tests (active)
tests/layers/api/     API tests (reserved)
tests/layers/db/      DB tests (reserved)
```

UI tests are organized by module and feature. A login spec, for example, lives at:

```text
tests/layers/ui/login/ValidLogin.spec.ts
```

For the full structure and naming detail, see [Test Structure](./02-test-structure.md).

## The Test Lifecycle

A typical UI test moves through these stages:

1. **Structure** — place the file under the correct layer, module, and feature path.
2. **Author** — request page objects through fixtures and keep the test focused on intent.
3. **Tag** — add suite and feature tags so the test can be filtered.
4. **Run** — execute the layer, optionally filtered by environment and tag.
5. **Clean up** — add cleanup coverage when the test mutates data.

Each stage has a dedicated reference:

- structure and naming → [Test Structure](./02-test-structure.md)
- tags → [Test Tags](./03-test-tags.md)
- authoring steps → [Use In Tests](../07-workflows/04-use-in-tests.md)
- running tests → [Execution Commands](../01-setup/execution-commands.md)

## Related Pages

- [Test Structure](./02-test-structure.md) — folder layout and the anatomy of a spec.
- [Test Tags](./03-test-tags.md) — the tag system and how tags drive filtering.
- [Test Conventions](../02-rules/test-conventions.md) — the canonical naming and structure rules.
- [Use In Tests](../07-workflows/04-use-in-tests.md) — the contributor workflow for using a class in a test.
- [Test Tags Workflow](../07-workflows/05-test-tags-workflow.md) — the contributor workflow for adding a new tag.
- [Execution Commands](../01-setup/execution-commands.md) — the full command and runtime-flag reference.

## Practical Outcome

This section gives contributors one place to understand the UI testing flow, then points to the exact rule or command page for each step instead of repeating that detail here.

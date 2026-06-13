---
alwaysApply: true
---

# Test Conventions

**[← Back to Main Documentation](../../README.md)**

This page defines the naming and structural conventions for all test files in the framework.

## Table of Contents

- [Standard Test Specs](#standard-test-specs)
- [Authentication Setup Specs](#authentication-setup-specs)
- [Test Folder Structure](#test-folder-structure)
- [AI Prompt Pattern](#ai-prompt-pattern)

## Standard Test Specs

- Test spec files must use PascalCase with the `.spec.ts` suffix.
- Use this format:

```text
FeatureName.spec.ts
```

- Example:

```text
tests/layers/ui/supplyChain/approvals/ClothingApprovals.spec.ts
```

## Authentication Setup Specs

- Authentication setup files must use Authentication.setup.ts.
- Use this format:

```text
Authentication.setup.ts
```

- Examples:

```text
tests/layers/ui/authentication/Authentication.setup.ts
```

- These setup files are linked to user role setup projects in the Playwright config.

## Test Folder Structure

- UI tests should follow the layer, module, and feature structure:

```text
tests/layers/ui/<module>/<feature>/<FeatureName>.spec.ts
```

- Cleanup tests should mirror the related feature path under `cleanup`:

```text
tests/layers/ui/cleanup/<module>/<feature>/<FeatureName>.data-cleanup.spec.ts
```

## AI Prompt Pattern

When asking Claude to review or write tests against these conventions, always attach this file and the file being worked on before asking:

```text
<filepath>docs/framework/02-rules/test-conventions.md</filepath> does this test file follow the naming and folder structure rules? <filepath>tests/layers/ui/moduleName/Name.spec.ts</filepath>
```

Attaching this file guarantees Claude reads the actual framework conventions before responding instead of using general assumptions.

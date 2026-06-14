# Environment Resolution

**[← Back to Main Documentation](../../README.md)**

This page explains how the framework resolves environment values at runtime — specifically how it detects the execution context (CI or local) and how it retrieves URLs and credentials from the correct source for each context.

The resolution layer sits on top of the environment configuration layer. It does not define environment stages or read `.env` files directly — it delegates those concerns to the files described in [Environment Configuration](./environment-overview.md).

## Table of Contents

- [Where the Code Lives](#where-the-code-lives)
- [Files and Responsibilities](#files-and-responsibilities)
  - [environmentDetector.ts](#environmentdetectorts)
  - [environmentResolver.ts](#environmentresolverts)
  - [environmentResolver.helpers.ts](#environmentresolverhelpersts)
- [How CI and Local Resolution Differ](#how-ci-and-local-resolution-differ)
- [How the Files Connect](#how-the-files-connect)
- [Practical Outcome](#practical-outcome)

## Where the Code Lives

All resolution files live under:

```text
src/configuration/resolution/
```

The three files are:

```text
src/configuration/resolution/detector/environmentDetector.ts
src/configuration/resolution/resolver/environmentResolver.ts
src/configuration/resolution/resolver/internal/environmentResolver.helpers.ts
```

## Files and Responsibilities

### environmentDetector.ts

```text
src/configuration/resolution/detector/environmentDetector.ts
```

This file detects facts about the current execution environment. It is a static utility class with no side effects.

It provides:

- `isCI()` — returns `true` if any known CI environment variable is set (`CI`, `GITHUB_ACTIONS`, `GITLAB_CI`, `TRAVIS`, `CIRCLECI`, `JENKINS_URL`, `BITBUCKET_BUILD_NUMBER`)
- `getCurrentEnvironmentStage()` — reads `ENV` or `NODE_ENV`, validates it against the known stages, and defaults to `"qa"` if neither is set or the value is unrecognised
- `isQA()`, `isUAT()`, `isPreprod()` — convenience wrappers around `getCurrentEnvironmentStage()`

`EnvironmentDetector` is the single place in the framework that reads CI signals and determines the active stage. Nothing else in the framework inspects those environment variables directly.

---

### environmentResolver.ts

```text
src/configuration/resolution/resolver/environmentResolver.ts
```

This is the public API that tests and fixtures use to retrieve environment-specific values at runtime.

It provides:

- `getPortalBaseUrl()` — resolves the portal base URL
- `getPortalCredentials()` — resolves and validates the portal username and password, returning a `Credentials` object

Each method delegates to `EnvironmentResolverHelpers.isCI()` to choose the resolution path:

- in CI, values are read from `process.env` using a `CI_` prefixed key
- locally, values are read from the `.env` file for the active stage via `EnvironmentVariables`

All methods throw on failure so that misconfigured environments surface immediately rather than mid-test.

---

### environmentResolver.helpers.ts

```text
src/configuration/resolution/resolver/internal/environmentResolver.helpers.ts
```

This is an internal helper class used only by `EnvironmentResolver`. It should not be called directly from tests or fixtures.

It provides:

- `isCI()` — delegates to `EnvironmentDetector.isCI()`
- `getRequiredEnv(key)` — reads a `process.env` variable and throws if it is missing or empty
- `getCIEnv(key)` — prefixes the key with `CI_` and calls `getRequiredEnv`
- `resolveLocalVariable(getValue, description)` — reads a value from the local `.env` file via `EnvironmentConfigManager`
- `resolveCICredentials(usernameKey, passwordKey)` — reads CI credential variables and validates them via `EnvironmentConfigManager.verifyCredentials`
- `resolveLocalCredentials(...)` — reads local credential variables and validates them the same way
- `toKey(description)` — converts a human-readable label to a compact lowercase key
- `toMethod(description)` — converts a human-readable label to a `get`-prefixed PascalCase method name

The `CI_` prefix convention means that every local env key has a matching CI key. For example, `PORTAL_BASE_URL` is read locally from `.env`, and `CI_PORTAL_BASE_URL` is injected by the pipeline.

## How CI and Local Resolution Differ

The same `EnvironmentResolver` method behaves differently depending on where the tests run:

| Context     | Source                       | Key format                 |
| ----------- | ---------------------------- | -------------------------- |
| CI pipeline | `process.env`                | `CI_PORTAL_BASE_URL`, etc. |
| Local run   | `.env` file for active stage | `PORTAL_BASE_URL`, etc.    |

The detection happens inside each resolver method via `EnvironmentResolverHelpers.isCI()`, which calls `EnvironmentDetector.isCI()`. No caller needs to know which context it is in.

## How the Files Connect

The resolution layer connects to the rest of the framework like this:

1. `EnvironmentDetector.isCI()` checks known CI environment variables and returns a boolean
2. `EnvironmentDetector.getCurrentEnvironmentStage()` reads `ENV` or `NODE_ENV` and validates it against `ENVIRONMENT_STAGES` from [environment-overview.md](./environment-overview.md)
3. `EnvironmentResolverHelpers.isCI()` delegates to `EnvironmentDetector.isCI()`
4. Each `EnvironmentResolver` method calls `isCI()` to pick the resolution path, then delegates to the appropriate helper
5. In CI, helpers read from `process.env` with a `CI_` prefix; locally, they read through `EnvironmentConfigManager` which loads from the active `.env` file
6. Fixtures and page objects call `EnvironmentResolver` methods to retrieve URLs and credentials — they never inspect environment variables directly

## Practical Outcome

The resolution layer means that tests and fixtures always call the same method regardless of where they run.

- `getPortalBaseUrl()` returns the correct URL in CI and locally without any conditional logic in the caller
- Misconfigured pipelines or missing `.env` entries fail immediately with a clear error at resolution time, not mid-test
- Adding a new resolvable value requires one new method in `EnvironmentResolver` and one new helper call — the CI vs local branching pattern is already in place

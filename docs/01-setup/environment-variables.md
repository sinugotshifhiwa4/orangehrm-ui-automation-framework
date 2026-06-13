# Environment Variables

**[← Back to Main Documentation](../../README.md)**

This page explains how environment variables are structured and accessed in the framework.

It covers the four files that make up the variables group — the public entry point, the URL and credentials accessors, and the key constants used for CI resolution.

## Table of Contents

- [Where the Code Lives](#where-the-code-lives)
- [Files and Responsibilities](#files-and-responsibilities)
  - [environmentVariables.ts](#environmentvariablests)
  - [environment.urls.ts](#environmenturlsts)
  - [environment.credentials.ts](#environmentcredentialsts)
  - [environment.keys.ts](#environmentkeysts)
- [How to Add a New Variable](#how-to-add-a-new-variable)
  - [Step 1 — Add to the internal accessor file](#step-1--add-to-the-internal-accessor-file)
  - [Step 2 — Add to environment.keys.ts](#step-2--add-to-environmentkeysts)
  - [Step 3 — Add a resolver method](#step-3--add-a-resolver-method)
  - [Step 4 — Add the CI variable to the pipeline](#step-4--add-the-ci-variable-to-the-pipeline)
- [How the Files Connect](#how-the-files-connect)
- [Practical Outcome](#practical-outcome)

## Where the Code Lives

All variables files live under:

```text
src/configuration/environment/variables/
```

The four files are:

```text
src/configuration/environment/variables/environmentVariables.ts
src/configuration/environment/variables/internal/environment.urls.ts
src/configuration/environment/variables/internal/environment.credentials.ts
src/configuration/environment/variables/keys/environment.keys.ts
```

## Files and Responsibilities

### environmentVariables.ts

```text
src/configuration/environment/variables/environmentVariables.ts
```

This is the public entry point for reading environment variable values in a local run.

It composes the two internal classes as static properties:

```ts
export default class EnvironmentVariables {
  public static readonly urls = EnvironmentUrls;
  public static readonly credentials = EnvironmentCredentials;
}
```

Framework code accesses local environment values through `EnvironmentVariables.urls` and `EnvironmentVariables.credentials`. Nothing reads `EnvironmentUrls` or `EnvironmentCredentials` directly from outside this file.

---

### environment.urls.ts

```text
src/configuration/environment/variables/internal/environment.urls.ts
```

This file reads URL values from `process.env` at import time for local runs.

It exposes:

- `PORTAL_BASE_URL` — the portal base URL

These values come from the `.env` file for the active stage, which is loaded into `process.env` before the test run starts.

---

### environment.credentials.ts

```text
src/configuration/environment/variables/internal/environment.credentials.ts
```

This file reads credential values from `process.env` at import time for local runs.

It exposes:

- `PORTAL_USERNAME` — read from `PORTAL_USERNAME`
- `PORTAL_PASSWORD` — read from `PORTAL_PASSWORD`

Like the URL file, these values come from the `.env` file for the active stage.

---

### environment.keys.ts

```text
src/configuration/environment/variables/keys/environment.keys.ts
```

This file defines the `ENV_KEYS` constant — the canonical string names for environment variables used in CI resolution.

```ts
export const ENV_KEYS = {
  PORTAL: {
    PORTAL_BASE_URL: "PORTAL_BASE_URL",
    USERNAME: "PORTAL_USERNAME",
    PASSWORD: "PORTAL_PASSWORD",
  },
} as const;
```

`ENV_KEYS` is used by `EnvironmentResolver` when running in CI. The resolver prefixes each key with `CI_` to produce the CI variable name (for example, `PORTAL_BASE_URL` becomes `CI_PORTAL_BASE_URL`). This ensures CI key names are derived consistently from a single source rather than hardcoded as strings in each resolver method.

This file is not used in local runs. It exists solely to give the CI resolution path type-safe, consistent key names.

## How to Add a New Variable

Follow all four steps in order. Skipping any step means the variable will be missing in either local runs, CI runs, or both.

### Step 1 — Add to the internal accessor file

If the variable is a **URL**, add it to `environment.urls.ts`:

```ts
export const EnvironmentUrls = {
  PORTAL_BASE_URL: process.env.PORTAL_BASE_URL!,
  YOUR_NEW_URL: process.env.YOUR_NEW_URL!, // add here
} as const;
```

If the variable is a **credential**, add it to `environment.credentials.ts`:

```ts
export const EnvironmentCredentials = {
  PORTAL_USERNAME: process.env.PORTAL_USERNAME!,
  PORTAL_PASSWORD: process.env.PORTAL_PASSWORD!,
  YOUR_NEW_SECRET: process.env.YOUR_NEW_SECRET!, // add here
} as const;
```

Also add the variable to all active `.env` files under `envs/` (for example `envs/.env.qa`, `envs/.env.uat`, `envs/.env.preprod`) and to `envs/.env.example` so other contributors know the key exists.

### Step 2 — Add to environment.keys.ts

Add a key entry under the appropriate group so the CI resolver can reference it by constant rather than a hardcoded string:

```ts
export const ENV_KEYS = {
  PORTAL: {
    PORTAL_BASE_URL: "PORTAL_BASE_URL",
    USERNAME: "PORTAL_USERNAME",
    PASSWORD: "PORTAL_PASSWORD",
    YOUR_NEW_URL: "YOUR_NEW_URL", // add here if URL belongs to PORTAL group
  },
} as const;
```

Add a new group if the variable does not belong to an existing one.

### Step 3 — Add a resolver method

Add a new public method to `environmentResolver.ts` following the existing pattern:

```ts
public getYourNewUrl(): string {
  try {
    return EnvironmentResolverHelpers.isCI()
      ? EnvironmentResolverHelpers.getCIEnv(ENV_KEYS.PORTAL.YOUR_NEW_URL)
      : EnvironmentResolverHelpers.resolveLocalVariable(
          () => EnvironmentVariables.urls.YOUR_NEW_URL,
          "Your New URL",
        );
  } catch (error) {
    ErrorHandler.captureError(error, "getYourNewUrl", "Failed to get your new URL");
    throw error;
  }
}
```

- The CI path calls `getCIEnv` with the key from `ENV_KEYS` — this automatically prefixes `CI_` to produce `CI_YOUR_NEW_URL`
- The local path calls `resolveLocalVariable` with a getter for the new accessor property

For credentials, use `resolveCICredentials` and `resolveLocalCredentials` instead, following the pattern in `getPortalCredentials()`.

### Step 4 — Add the CI variable to the pipeline

In your CI pipeline configuration, add the `CI_`-prefixed variable so it is injected into `process.env` during pipeline runs.

For example, if the local key is `YOUR_NEW_URL`, the CI variable must be named `CI_YOUR_NEW_URL`.

Without this step, the resolver will throw on CI because `getCIEnv` calls `getRequiredEnv`, which throws if the variable is missing or empty. This is intentional — it surfaces misconfigured pipelines immediately rather than mid-test.

## How the Files Connect

The variables group connects to the rest of the framework like this:

1. On a local run, the active `.env` file is loaded into `process.env` before tests start
2. `environment.urls.ts` and `environment.credentials.ts` read from `process.env` at import time
3. `EnvironmentVariables` exposes both as static properties
4. `EnvironmentResolverHelpers.resolveLocalVariable` calls through `EnvironmentConfigManager` to read from `EnvironmentVariables` — see [Environment Resolution](./environment-resolution.md)
5. On a CI run, `EnvironmentResolver` skips `EnvironmentVariables` entirely and reads directly from `process.env` using the `CI_`-prefixed keys defined in `ENV_KEYS`
6. `ENV_KEYS` is also used by `EnvironmentResolver` to keep CI key names consistent with their local counterparts

The variables files are local-run concerns. In CI, `ENV_KEYS` provides the bridge between the local key names and their CI equivalents.

## Practical Outcome

Keeping URL and credential values in dedicated internal files means:

- adding a new variable follows a consistent four-step pattern — accessor file, key constant, resolver method, CI pipeline variable
- framework code never hardcodes variable name strings outside `ENV_KEYS`
- the public surface is narrow — everything goes through `EnvironmentVariables`, not the internal files directly
- misconfigured pipelines fail immediately at resolution time with a clear error, not mid-test

# Environment Configuration

**[← Back to Main Documentation](../../README.md)**

This page explains how environment configuration works in the framework and what to update when adding, removing, or changing an environment stage.

## Table of Contents

- [Main Files](#main-files)
- [Environment Constants](#environment-constants)
  - [The Rule](#the-rule)
  - [What To Update](#what-to-update)
- [Environment Variables](#environment-variables)
- [Environment Config Manager](#environment-config-manager)
- [Stages File Manager](#stages-file-manager)
- [How It Connects To Other Setup Pages](#how-it-connects-to-other-setup-pages)
- [Practical Outcome](#practical-outcome)

## Main Files

- `src/configuration/environment/constants/environment.const.ts`
- `src/configuration/environment/variables/environmentVariables.ts`
- `src/configuration/environment/variables/internal/environment.urls.ts`
- `src/configuration/environment/variables/internal/environment.credentials.ts`
- `src/configuration/environment/variables/keys/environment.keys.ts`
- `src/configuration/environment/manager/environmentConfigManager.ts`
- `src/configuration/environment/manager/stagesFileManager.ts`

## Environment Constants

`src/configuration/environment/constants/environment.const.ts` is the single source of truth for supported environment stages in the framework.

It defines:

- `ENVIRONMENT_CONSTANTS` — the root directory name and base file name for environment files
- `ENVIRONMENT_STAGES` — the list of supported environment stage names
- `EnvironmentStage` — the type derived from `ENVIRONMENT_STAGES`, used throughout the framework
- `EnvironmentFile` — the supported environment file type

### The Rule

**If you need to add, remove, or rename an environment stage, this is the only file you need to update.**

All other framework code derives the supported stages from `ENVIRONMENT_STAGES` and `EnvironmentStage`. Nothing else in the framework hardcodes stage names independently.

### What To Update

To add a new stage, add its name to the `ENVIRONMENT_STAGES` array:

```ts
export const ENVIRONMENT_STAGES = ["qa", "uat", "preprod", "staging"] as const;
```

To remove a stage, remove it from the array.

The `EnvironmentStage` type updates automatically because it is derived from the array:

```ts
export type EnvironmentStage = (typeof ENVIRONMENT_STAGES)[number];
```

After updating, TypeScript will catch any downstream usage that no longer aligns with the new stage list.

## Environment Variables

`src/configuration/environment/variables/environmentVariables.ts` is the entry point for reading environment variable values on a local run. It composes `EnvironmentUrls` and `EnvironmentCredentials` as static properties.

The full breakdown of all four variable files — including how `ENV_KEYS` connects the local and CI resolution paths — is covered in [Environment Variables](./environment-variables.md).

## Environment Config Manager

`src/configuration/environment/manager/environmentConfigManager.ts` provides shared utilities for environment variable retrieval and validation.

It handles:

- retrieving a typed environment variable safely
- validating that a variable is not empty or unset
- verifying credential completeness
- resolving the current environment stage file path

All environment variable reads go through `getEnvironmentVariable`, which validates the value and sanitizes it when running in CI.

## Stages File Manager

`src/configuration/environment/manager/stagesFileManager.ts` provides file-level utilities for reading and writing environment stage files.

It handles:

- reading an environment file as an array of lines
- writing updated lines back to the environment file
- parsing key-value pairs from file content
- updating one or more environment variables in a file
- finding environment variables by key, value, or pattern

This is used when framework operations need to inspect or modify the `.env` file for the current stage directly.

## How It Connects To Other Setup Pages

- [file-manager.md](./file-manager.md)
  The file manager handles the low-level filesystem work that `StagesFileManager` relies on for reading and writing environment files.

- [environment-variables.md](./environment-variables.md)
  The full detail on how `EnvironmentVariables`, `EnvironmentUrls`, `EnvironmentCredentials`, and `ENV_KEYS` are structured and used.

- [environment-resolution.md](./environment-resolution.md)
  The resolution layer sits on top of this layer. It uses `EnvironmentVariables` and `EnvironmentConfigManager` from here to retrieve URLs and credentials at runtime, and delegates CI vs local detection to `EnvironmentDetector`.

## Practical Outcome

Keeping environment stage definitions in `environment.const.ts` means:

- one change covers the entire framework when a stage is added or removed
- TypeScript enforces correct stage usage everywhere automatically
- no stage names are scattered across multiple files

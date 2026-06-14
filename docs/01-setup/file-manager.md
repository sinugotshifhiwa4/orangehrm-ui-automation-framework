# File Manager

**[← Back to Main Documentation](../../README.md)**

This page explains the framework file manager utilities and why they are part of the setup foundation.

## Table of Contents

- [Why It Falls Under Setup](#why-it-falls-under-setup)
- [Main Files](#main-files)
- [File Manager Structure](#file-manager-structure)
  - [`baseFileManager.ts`](#basefilemanagerts)
  - [`asyncFileManager.ts`](#asyncfilemanagerts)
  - [`syncFileManager.ts`](#syncfilemanagerts)
- [Shared Framework Patterns](#shared-framework-patterns)
  - [Error Handling](#error-handling)
  - [Logging](#logging)
- [How It Connects To Setup](#how-it-connects-to-setup)
- [How It Connects To Other Setup Pages](#how-it-connects-to-other-setup-pages)
- [Practical Outcome](#practical-outcome)

## Why It Falls Under Setup

`src/utils/fileManager/` supports the filesystem work needed by framework setup and runtime preparation.

It is part of setup because the framework relies on file and directory operations for things such as:

- authentication state file initialization
- environment file existence checks
- runtime file creation
- artifact and path preparation
- safe path validation before file operations

## Main Files

- `src/utils/fileManager/asyncFileManager.ts`
- `src/utils/fileManager/syncFileManager.ts`
- `src/utils/fileManager/internal/baseFileManager.ts`
- `src/utils/fileManager/internal/file-encoding.enum.ts`
- `src/utils/fileManager/types/File-manager.types.ts`

## File Manager Structure

### `baseFileManager.ts`

This is the shared base layer for file manager behavior.

It provides:

- path normalization
- path validation
- path joining
- file name and extension helpers
- access mode descriptions

This means both async and sync file managers reuse one consistent set of path and validation rules.

### `asyncFileManager.ts`

This provides async filesystem operations.

It includes operations such as:

- checking whether paths exist
- checking whether files or directories exist
- creating directories
- creating files
- reading files
- reading file buffers
- writing files
- deleting files
- deleting directories
- checking access

This is useful when setup or runtime flow needs non-blocking filesystem work.

### `syncFileManager.ts`

This provides synchronous filesystem operations.

It includes operations such as:

- checking whether files or directories exist
- creating directories
- creating files
- reading files
- writing files
- deleting files
- checking access

This is useful where synchronous file operations are more appropriate or simpler for the calling code.

## Shared Framework Patterns

The file manager follows the shared framework rules and does not operate in isolation.

### Error Handling

File manager failures go through `ErrorHandler`.

This keeps filesystem failures aligned with the framework's structured error-handling pattern.

### Logging

File manager diagnostics go through the centralized logger.

This allows file operations to emit debug or warning information without using ad-hoc console logging.

## How It Connects To Setup

The file manager supports setup-related flows indirectly through other framework modules.

Examples include:

- authentication storage helpers creating or resetting auth state files
- environment setup checking whether files exist before loading them
- logger or runtime helpers ensuring directories or files are available

The file manager also works closely with the path resolver utilities:

- `src/utils/pathResolver/envPathResolver.ts`
  Builds the local environment file paths under the environment root directory.
- `src/utils/pathResolver/authPathResolver.ts`
  Builds the local and CI authentication state file paths under `.auth/`.

In other words, the path resolvers decide where a framework file should live, and the file manager utilities handle the safe filesystem work on top of those resolved paths.

## How It Connects To Other Setup Pages

- [environment-overview.md](./environment-overview.md)
  Connects through environment file existence checks and stage-file loading.

## Practical Outcome

Keeping file management centralized in `src/utils/fileManager/` gives the framework:

- consistent path handling
- reusable file operation logic
- shared validation rules
- shared error handling
- shared logging behavior

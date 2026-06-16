# Orange HRM Automation Framework

A Playwright and TypeScript end-to-end automation framework for the Orange HRM application.

Built around reusable page objects, layered fixtures, stage-based environment resolution, and CI-ready execution so tests stay maintainable and consistent across local and pipeline runs.

The current active execution path is **UI** only.

---

## Tech Stack

| Tool                | Purpose                                       |
| ------------------- | --------------------------------------------- |
| Playwright          | Browser automation and test execution         |
| TypeScript          | Type-safe framework and test authoring        |
| ESLint              | Static analysis and code quality enforcement  |
| Prettier            | Consistent code formatting                    |
| Husky + lint-staged | Pre-commit quality gates                      |
| Winston             | Structured runtime logging                    |
| Luxon               | Date and time utilities                       |
| Faker               | Test data generation                          |
| dotenv              | Environment variable loading                  |
| cross-env           | Cross-platform environment variable injection |

---

## Project Structure

```text
src/          Framework implementation — configuration, layers, utilities
fixtures/     Test fixtures — base, UI layer, API layer
tests/        Test suites — organized by layer (ui, api, db)
scripts/      Execution scripts — test runner and executor
docs/         Framework documentation
envs/         Environment files — not committed to source control
```

---

## Prerequisites

- Node.js >= 18
- npm >= 9
- Playwright browser dependencies

---

## Getting Started

### 1. Install dependencies

```powershell
npm install
```

### 2. Install Playwright browsers

```powershell
npx playwright install
```

### 3. Set up your environment file

See [Environment Setup](#environment-setup) below.

---

## Environment Setup

Environment files are never committed to the repository. Each developer must create their own local environment file from the provided example.

### Step 1 — Copy the example file

```powershell
Copy-Item envs/.env.example envs/.env.<env>
```

Example:

```powershell
Copy-Item envs/.env.example envs/.env.qa
```

Supported values for `<env>`: `qa` | `uat` | `preprod`

### Step 2 — Fill in the values

Open the copied file and replace the placeholders with real values:

```dotenv
PORTAL_BASE_URL=https://your-portal-url

PORTAL_USERNAME=your-username
PORTAL_PASSWORD=your-password

```

If a variable is not applicable for a stage, leave the placeholder value in place.

> All `.env.<env>` files are excluded from source control via `.gitignore`. Only `.env.example` is committed.

### Step 3 — Run authentication setup

```powershell
cross-env ENV=<env> TEST_TAGS=@authenticate npm run test:ui
```

---

## Running Tests

For the full command reference including tag filtering, worker control, and runtime flags, see [Execution Commands](docs/01-setup/execution-commands.md).

Parameters:

- `<env>`: `qa` | `uat` | `preprod` (defaults to `qa` when omitted)
- `<tag>`: see [Test Tags](docs/02-rules/test-tags.md) for tag usage and available framework tag patterns
- `<percentage>`: `10` | `25` | `50` | `75` | `100` (defaults to `10` when omitted)

Optional runtime flags:

- `HEADED=true|false` (defaults to `false` when omitted)
- `TEST_TAGS=@tag-name`
- `WORKER_PERCENTAGE=10|25|50|75|100` (defaults to `10` when omitted)
- `SKIP_BROWSER_INIT=true|false` (defaults to `false` when omitted, but runtime layer conditions may override it)

## Commands Reference

### Quality checks

| Command              | Purpose                                                                   |
| -------------------- | ------------------------------------------------------------------------- |
| `npm run check`      | Verify formatting and lint rules without making any changes               |
| `npm run fix`        | Auto-fix all formatting and lint violations                               |
| `npm run lint:check` | Run type checking and lint rules together — read-only, no changes applied |
| `npm run lint:fix`   | Auto-fix lint violations only (skips type checking)                       |
| `npm run type-check` | Run TypeScript type checking only                                         |

### Test execution

| Command                                                  | Purpose                                        |
| -------------------------------------------------------- | ---------------------------------------------- |
| `cross-env ENV= TEST_TAGS=@authenticate npm run test:ui` | Run authentication setup                       |
| `cross-env ENV= npm run test:ui`                         | Execute UI tests                               |
| `cross-env ENV= TEST_TAGS=@ npm run test:ui`             | Execute UI tests with tag filtering            |
| `cross-env ENV= WORKER_PERCENTAGE= npm run test:ui`      | Execute UI tests with custom worker allocation |

### Tooling

| Command           | Purpose                                                  |
| ----------------- | -------------------------------------------------------- |
| `npm run ui`      | Open Playwright UI mode for interactive test exploration |
| `npm run debug`   | Run tests in debug mode with the Playwright inspector    |
| `npm run report`  | Open the last HTML test report in the browser            |
| `npm run codegen` | Generate a test with Playwright Codegen                  |

---

## Documentation in a table

## Documentation

All docs live under `docs/`.

| Section                                                          | Description                                 | Key Docs                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Documentation Prompt Guide](docs/documentation-prompt-guide.md) | How to write framework docs                 | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **00 — Skills**                                                  | Binding rules for all tasks                 | [Always-Apply Rules](docs/00-skills/always-apply.md)                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **01 — Setup**                                                   | Environment, fixtures, execution, timeouts  | [Environment Overview](docs/01-setup/environment-overview.md) · [Environment Variables](docs/01-setup/environment-variables.md) · [Environment Resolution](docs/01-setup/environment-resolution.md) · [Fixtures](docs/01-setup/fixtures.md) · [Browser Init](docs/01-setup/browser-init.md) · [Timeouts](docs/01-setup/timeouts.md) · [File Manager](docs/01-setup/file-manager.md) · [Reports](docs/01-setup/reports.md) · [Execution Commands](docs/01-setup/execution-commands.md) |
| **02 — Rules**                                                   | Code quality, error handling, commits, tags | [Code Quality](docs/02-rules/code-quality.md) · [Error Handling](docs/02-rules/error-handling.md) · [Winston Logger](docs/02-rules/winston-logger.md) · [Commit Messages](docs/02-rules/commit-messages.md) · [Commit Workflow](docs/02-rules/commit-workflow.md) · [Test Conventions](docs/02-rules/test-conventions.md) · [Test Tags](docs/02-rules/test-tags.md) · [Branching Strategy](docs/02-rules/branching-strategy.md)                                                       |
| **03 — Layer UI**                                                | Base page, context layer, auth, pages       | [Base Page](docs/03-layer-ui/01-base/base-page.md) · [Context Layer](docs/03-layer-ui/02-context/context-layer.md) · [Authentication Setup](docs/03-layer-ui/03-authentication/authentication-setup.md) · [Login Orchestration](docs/03-layer-ui/03-authentication/login-orchestration.md) · [Pages Structure](docs/03-layer-ui/04-pages/pages-structure.md)                                                                                                                          |
| **04 — Utils**                                                   | Shared utilities                            | [Shared Utilities](docs/04-utils/shared-utilities.md)                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **05 — Testing**                                                 | Test overview, structure, tags              | [Testing Overview](docs/05-testing/01-overview.md) · [Test Structure](docs/05-testing/02-test-structure.md) · [Test Tags](docs/05-testing/03-test-tags.md)                                                                                                                                                                                                                                                                                                                            |
| **06 — CI**                                                      | Pipeline, environment resolution, sharding  | [CI Overview](docs/06-ci/01-overview.md) · [Manual Runs and Variables](docs/06-ci/02-manual-runs-and-variables.md) · [Environment Resolution](docs/06-ci/03-environment-resolution.md) · [Execution and Sharding](docs/06-ci/04-execution-and-sharding.md) · [Pipeline Stages and Reporting](docs/06-ci/05-pipeline-stages-and-reporting.md) · [Scheduled Execution](docs/06-ci/06-scheduled-execution.md)                                                                            |
| **07 — Workflows**                                               | Add class, register, use in tests, examples | [Workflows Overview](docs/07-workflows/01-overview.md) · [Add a Class](docs/07-workflows/02-add-a-class.md) · [Register in Fixtures](docs/07-workflows/03-register-in-fixtures.md) · [Use in Tests](docs/07-workflows/04-use-in-tests.md) · [Test Tags Workflow](docs/07-workflows/05-test-tags-workflow.md) · [End-to-End Example](docs/07-workflows/07-end-to-end-example.md)                                                                                                       |
| **08 — Test Data**                                               | Test data organisation, builders, fixtures  | [Test Data Structure](docs/08-test-data/structure.md)                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **09 — Dashboard**                                               | External analytics dashboard for CI results | [Dashboard Overview](docs/09-dashboard/01-overview.md)                                                                                                                                                                                                                                                                                                                                                                                                                                |

---

## Contributing

Contributions are welcome. Before starting any work, please read the branching and commit guidelines.

- [Branching Strategy](docs/02-rules/branching-strategy.md)
- [Commit Messages](docs/02-rules/commit-messages.md)
- [Commit Workflow](docs/02-rules/commit-workflow.md)

---

## Dashboard

Live test results are visualised in an external analytics dashboard. See the [Dashboard Overview](docs/09-dashboard/01-overview.md) for details.

- [Live Test Results Dashboard](https://orangehrm-test-pulse.sinugotshifhiwa4.workers.dev/)

---

## Support

For questions or support, reach out in the **Automation General** channel on Microsoft Teams.

---

## External Resources

### Playwright

- [Getting Started](https://playwright.dev/docs/intro)
- [Configuration](https://playwright.dev/docs/test-configuration)
- [Locators](https://playwright.dev/docs/locators)
- [Auto-waiting](https://playwright.dev/docs/actionability)
- [Fixtures](https://playwright.dev/docs/test-fixtures)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Test Tags](https://playwright.dev/docs/test-annotations#tag-tests)
- [Assertions](https://playwright.dev/docs/test-assertions)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Sharding](https://playwright.dev/docs/test-sharding)
- [Continuous Integration](https://playwright.dev/docs/ci)

### TypeScript

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [tsconfig Reference](https://www.typescriptlang.org/tsconfig)
- [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

### GitLab

- [GitLab CI/CD](https://docs.gitlab.com/ee/ci/)
- [GitLab CI YAML Reference](https://docs.gitlab.com/ee/ci/yaml/)
- [GitLab CI Variables](https://docs.gitlab.com/ee/ci/variables/)
- [GitLab Pipeline Schedules](https://docs.gitlab.com/ee/ci/pipelines/schedules.html)

### Logging

- [Winston](https://github.com/winstonjs/winston)

### Date and Time

- [Luxon](https://moment.github.io/luxon/#/)

### Test Data

- [Faker.js](https://fakerjs.dev/guide/)

### Code Quality

- [ESLint](https://eslint.org/docs/latest/)
- [eslint-plugin-playwright](https://github.com/playwright-community/eslint-plugin-playwright)
- [Prettier](https://prettier.io/docs/en/)

### Git Hooks

- [Husky](https://typicode.github.io/husky/get-started.html)
- [lint-staged](https://github.com/lint-staged/lint-staged)

---

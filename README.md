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
fixtures/     Test fixtures — base, UI layer
tests/        Test suites — organized by layer (ui)
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

---

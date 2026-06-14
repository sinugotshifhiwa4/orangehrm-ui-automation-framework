import { defineConfig } from "@playwright/test";
import { GLOBAL_TIMEOUTS } from "./src/configuration/timeouts/global.timeouts.js";
import WorkerAllocator from "./src/configuration/runtime/workers/workerAllocator.js";
import EnvironmentDetector from "./src/configuration/resolution/detector/environmentDetector.js";
import {
  resolvedViewport,
  setupProjects,
  browserProjects,
} from "./src/configuration/playwright/projects/projects.config.js";
import { reportConfig } from "./src/configuration/reports/ortoniReport.config.js";

// check if running in CI
const isCI = EnvironmentDetector.isCI();

// Determine if running in headed mode
const isHeaded = process.env.HEADED === "true";

// Determine the local worker allocation percentage
const workerPercentage = WorkerAllocator.resolveWorkerPercentage(
  process.env.WORKER_PERCENTAGE,
  10,
);

// Determine shard index for parallel execution in CI
const shardIndex = process.env.SHARD_INDEX || "0";

// Set by the CI merge job: regenerate the human-readable reports (HTML + Ortoni)
// from the combined blob reports instead of running tests.
const isReportMerge = process.env.REPORTER_MERGE === "true";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  timeout: GLOBAL_TIMEOUTS.test,
  expect: {
    timeout: GLOBAL_TIMEOUTS.expect,
  },
  globalSetup: "src/configuration/runtime/globalSetup.ts",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: WorkerAllocator.getOptimalWorkerCount(workerPercentage),

  reporter: isReportMerge
    ? [["html"], ["junit"], ["json"], ["ortoni-report", reportConfig]]
    : isCI
      ? [["blob", { outputDir: `blob-report-${shardIndex}`, alwaysReport: true }]]
      : [["html"], ["line"], ["ortoni-report", reportConfig]],

  /**
   * The `grep` option enables running tests by tag or keyword.
   * You can set the `TEST_TAGS` environment variable (e.g., `@regression`, `@sanity`) to filter which tests run.
   */
  grep:
    typeof process.env.TEST_TAGS === "string"
      ? new RegExp(`(^|\\s)${process.env.TEST_TAGS}(\\s|$)`)
      : process.env.TEST_TAGS || /.*/,
  use: {
    trace: "retain-on-failure",
    video: {
      mode: "retain-on-failure",
      size: resolvedViewport,
    },
    screenshot: isCI ? "only-on-failure" : "on",
    headless: !isHeaded,

    viewport: resolvedViewport,

    launchOptions: {
      args: [
        "--window-size=1366,768",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        "--disable-extensions",
        "--no-first-run",
        "--disable-default-apps",
        "--disable-translate",
        ...(isCI ? ["--no-sandbox", "--disable-dev-shm-usage"] : []),
      ],
    },
  },

  /* Configure projects for major browsers */
  projects: [
    ...setupProjects,
    {
      name: "api",
      testMatch: /tests\/layers\/api\/.*/,
    },
    {
      name: "db",
      testMatch: /tests\/layers\/db\/.*/,
    },
    ...browserProjects,
  ],
});

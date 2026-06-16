import { devices } from "@playwright/test";
import { shouldSkipBrowserInit } from "../flags/browser.flags.js";

// Determine if browser initialization should be skipped (e.g., for API-only test runs)
const skipBrowserInit = shouldSkipBrowserInit();

// Shared viewport applied to all browser projects and the global use block
export const resolvedViewport = { width: 1366, height: 768 };

// Chromium-only launch flags. These are Chromium CLI switches and must NOT be
// applied globally — Firefox/WebKit reject unknown options and fail to launch.
const chromiumLaunchOptions = {
  args: [
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
    "--disable-extensions",
    "--no-first-run",
    "--disable-default-apps",
    "--disable-translate",
    ...(process.env.CI ? ["--no-sandbox", "--disable-dev-shm-usage"] : []),
  ],
};

// Common configuration for all projects (including setup and browser projects)
const setupDeps = skipBrowserInit ? [] : ["setup-auth-state"];

// Conditionally include the auth setup project — skipped when browser init is disabled (e.g. API-only runs)
export const setupProjects = skipBrowserInit
  ? []
  : [
      {
        name: "setup-auth-state",
        use: {
          ...devices["Desktop Chrome"],
          launchOptions: chromiumLaunchOptions,
        },
        testMatch: /.*\.setup\.ts/,
      },
    ];

// Browser projects are excluded when browser init is disabled (e.g. API-only runs)
export const browserProjects = skipBrowserInit
  ? []
  : [
      {
        name: "chromium",
        use: {
          ...devices["Desktop Chrome"],
          viewport: resolvedViewport,
          launchOptions: chromiumLaunchOptions,
        },
        dependencies: setupDeps,
      },
      {
        name: "firefox",
        use: { ...devices["Desktop Firefox"], viewport: resolvedViewport },
        dependencies: setupDeps,
      },
      {
        name: "webkit",
        use: { ...devices["Desktop Safari"], viewport: resolvedViewport },
        dependencies: setupDeps,
      },
    ];

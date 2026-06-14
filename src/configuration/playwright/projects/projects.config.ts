import { devices } from "@playwright/test";
import { shouldSkipBrowserInit } from "../flags/browser.flags.js";

// Determine if browser initialization should be skipped (e.g., for API-only test runs)
const skipBrowserInit = shouldSkipBrowserInit();

// Shared viewport applied to all browser projects and the global use block
export const resolvedViewport = { width: 1366, height: 768 };

// Common configuration for all projects (including setup and browser projects)
const setupDeps = skipBrowserInit ? [] : ["setup-auth-state"];

// Conditionally include the auth setup project — skipped when browser init is disabled (e.g. API-only runs)
export const setupProjects = skipBrowserInit
  ? []
  : [
      {
        name: "setup-auth-state",
        use: { ...devices["Desktop Chrome"] },
        testMatch: /.*\.setup\.ts/,
      },
    ];

// Browser projects are excluded when browser init is disabled (e.g. API-only runs)
export const browserProjects = skipBrowserInit
  ? []
  : [
      {
        name: "chromium",
        use: { ...devices["Desktop Chrome"], viewport: resolvedViewport },
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

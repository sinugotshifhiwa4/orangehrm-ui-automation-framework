import EnvironmentDetector from "../resolution/detector/environmentDetector.js";
import EnvironmentFileManager from "./environmentManager/EnvironmentFileManager.js";
import AuthenticationFileManager from "../playwright/authentication/storage/authenticationFileManager.js";
import ErrorHandler from "../../utils/errorHandling/errorHandler.js";

/**
 * Loads all environment files so that environment variables are available before any test runs.
 * Skipped in CI where variables are injected by the pipeline.
 * @throws Error if any environment file fails to load.
 */
async function initializeEnvironmentConfig(): Promise<void> {
  try {
    await EnvironmentFileManager.getInstance().initialize();
  } catch (error) {
    ErrorHandler.captureError(
      error,
      "initializeEnvironmentConfig",
      "Failed to initialize environment config",
    );
    throw error;
  }
}

/**
 * Writes an empty authentication state file so Playwright has a valid storage path before login runs.
 * @throws Error if the file cannot be written.
 */
async function initializeEmptyAuthenticationState(): Promise<void> {
  try {
    await AuthenticationFileManager.initialize();
  } catch (error) {
    ErrorHandler.captureError(
      error,
      "initializeEmptyAuthenticationState",
      "Failed to reset authentication state",
    );
    throw error;
  }
}

/**
 * Entry point for Playwright's globalSetup hook.
 * Always initializes the auth state file. In non-CI environments also loads local environment files.
 * @throws Error if any setup step fails.
 */
async function globalSetup(): Promise<void> {
  try {
    const tasks: Promise<void>[] = [initializeEmptyAuthenticationState()];

    if (!EnvironmentDetector.isCI()) {
      tasks.push(initializeEnvironmentConfig());
    }

    await Promise.all(tasks);
  } catch (error) {
    ErrorHandler.captureError(error, "globalSetup", "Failed to perform global setup");
    throw error;
  }
}

export default globalSetup;

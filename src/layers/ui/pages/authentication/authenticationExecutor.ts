import type { LoginOrchestrator } from "./loginOrchestrator.js";
import type { LoginPage } from "../orangeHrm/login/loginPage.js";
import type { Credentials } from "../../../../configuration/playwright/authentication/types/credentials.types.js";
import ErrorHandler from "../../../../utils/errorHandling/errorHandler.js";
import logger from "../../../../configuration/logger/loggerManager.js";

/**
 * Drives login and ensures an authenticated session, re-authenticating when stale.
 */
export class AuthenticationExecutor {
  private loginOrchestrator: LoginOrchestrator;

  private loginPage: LoginPage;

  /**
   * Creates an authentication executor with the required page objects and orchestrator.
   * @param loginOrchestrator - Orchestrator that manages the login flow and auth-state persistence.
   * @param loginPage - Page object for the login form page.
   */
  constructor(loginOrchestrator: LoginOrchestrator, loginPage: LoginPage) {
    this.loginOrchestrator = loginOrchestrator;
    this.loginPage = loginPage;
  }

  /**
   * Navigates to the portal, performs login with the given credentials, and validates success.
   * @param credentials - The username and password to use for login.
   * @returns A promise that resolves when the login attempt has been validated, or throws an error if it fails.
   */
  public async run(credentials: Credentials): Promise<void> {
    try {
      await this.loginOrchestrator.loginWithValidCredentials(
        async () => {
          await this.loginPage.login(credentials, { allowEmpty: false });
        },
        async () => {
          await this.loginPage.verifyInvalidCredentialsAlertIsHidden();
        },
      );

      logger.info("Authentication session state created successfully");
    } catch (error) {
      ErrorHandler.captureError(error, "run", "Failed to log into portal");
      throw error;
    }
  }

  /**
   * Guarantees the test starts authenticated, re-logging in and refreshing the saved
   * storage state when the injected session has gone stale.
   * @param credentials - The username and password to use if re-authentication is required.
   * @returns A promise that resolves once an authenticated session is confirmed, or throws if re-authentication fails.
   */
  public async ensureAuthenticated(credentials: Credentials): Promise<void> {
    try {
      if (await this.loginOrchestrator.isAuthenticatedSessionActive()) {
        logger.info("Existing authentication session is still valid");
        return;
      }

      logger.warn("Authentication session is stale; re-authenticating");
      await this.run(credentials);
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "ensureAuthenticated",
        "Failed to ensure an authenticated session",
      );
      throw error;
    }
  }
}

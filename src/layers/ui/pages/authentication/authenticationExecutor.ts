import type { LoginOrchestrator } from "./loginOrchestrator.js";
import type { LoginPage } from "../orangeHrm/login/loginPage.js";
import type { Credentials } from "../../../../configuration/playwright/authentication/types/credentials.types.js";
import ErrorHandler from "../../../../utils/errorHandling/errorHandler.js";
import logger from "../../../../configuration/logger/loggerManager.js";

export class AuthenticationExecutor {
  private loginOrchestrator: LoginOrchestrator;

  private loginPage: LoginPage;

  /**
   * Creates an authentication executor with the required page objects and orchestrator.
   * @param loginOrchestrator - Orchestrator that manages the login flow and auth-state persistence.
   * @param heroPage - Page object for the Orange HRM hero/header page.
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
}

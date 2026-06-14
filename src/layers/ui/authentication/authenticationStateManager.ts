import type { Page } from "@playwright/test";
import { BasePage } from "../base/basePage.js";
import AuthenticationFileManager from "../../../configuration/playwright/authentication/storage/authenticationFileManager.js";
import ErrorHandler from "../../../utils/errorHandling/errorHandler.js";
import logger from "../../../configuration/logger/loggerManager.js";

export class AuthenticationStateManager extends BasePage {
  /**
   * Creates a persister bound to the current Playwright page context.
   * @param page - Active page used to capture storage state.
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Saves the current authentication state to the shared auth file.
   * @returns A promise that resolves to true on success, or throws on failure.
   */
  public async saveAuthenticationState(): Promise<boolean> {
    try {
      const storagePath = AuthenticationFileManager.getFilePath();
      await this.page.context().storageState({ path: storagePath });
      logger.debug(`Authentication state saved successfully`);
      return true;
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "saveAuthenticationState",
        "Failed to save authentication state",
      );
      throw error;
    }
  }
}

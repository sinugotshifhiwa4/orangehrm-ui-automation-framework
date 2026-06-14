import type { Page } from "@playwright/test";
import ErrorHandler from "../../../../../utils/errorHandling/errorHandler.js";
import logger from "../../../../../configuration/logger/loggerManager.js";

/**
 * Base class for action helpers, providing shared error-handled action execution.
 */
export class ActionBase {
  protected readonly page: Page;

  /**
   * Creates a shared action wrapper bound to a Playwright page.
   * @param page - Active page instance used by action helpers.
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Executes an action and handles any errors that may occur.
   * @param action - The action to execute.
   * @param callerMethodName - The name of the method that called the action.
   * @param successMessage - Optional message to log if the action succeeds.
   * @param errorMessage - Optional message to log if the action fails.
   * @returns A promise that resolves with the result of the action, or rejects with the error if it fails.
   */
  public async performAction<T>(
    action: () => Promise<T>,
    callerMethodName: string,
    successMessage?: string,
    errorMessage?: string,
  ): Promise<T> {
    try {
      const result = await action();
      if (successMessage) logger.info(successMessage);
      return result;
    } catch (error) {
      ErrorHandler.captureError(
        error,
        callerMethodName,
        errorMessage || `Failed to execute ${callerMethodName}`,
      );
      throw error;
    }
  }
}

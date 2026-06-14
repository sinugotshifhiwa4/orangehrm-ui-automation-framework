import { type Locator, type Page } from "@playwright/test";
import { BasePage } from "../../../base/basePage.js";
import type { Username } from "../../../../../configuration/playwright/authentication/types/credentials.types.js";
import ErrorHandler from "../../../../../utils/errorHandling/errorHandler.js";

/**
 * Page object for the OrangeHRM forgot/reset password page.
 */
export class ForgotPasswordPage extends BasePage {
  private readonly resetPasswordHeader: Locator;

  private readonly usernameInput: Locator;

  private readonly resetPasswordButton: Locator;

  private readonly cancelButton: Locator;

  private readonly resetPasswordSuccessHeader: Locator;

  private readonly resetPasswordSentMessage: Locator;

  /**
   * Creates the forgot password page object and resolves its form locators.
   * @param page - Active Playwright page instance.
   */
  constructor(page: Page) {
    super(page);

    this.resetPasswordHeader = page.getByRole("heading", {
      name: "Reset Password",
    });
    this.usernameInput = page.getByRole("textbox", { name: "Username" });
    this.resetPasswordButton = page.getByRole("button", {
      name: "Reset Password",
    });
    this.cancelButton = page.getByRole("button", { name: "Cancel" });
    this.resetPasswordSuccessHeader = page.getByRole("heading", {
      name: "Reset Password link sent successfully",
    });
    this.resetPasswordSentMessage = page.getByText(
      "A reset password link has been sent to you via email.",
    );
  }

  /**
   * Submits a password reset request for the given username.
   * @param option - The username to request a reset link for.
   * @returns A promise that resolves once the reset request has been submitted.
   */
  public async requestPasswordReset(option: Username): Promise<void> {
    try {
      await this.verifyResetPasswordHeaderIsVisible();
      await this.fillUsernameInput(option.username);
      await this.clickResetPasswordButton();
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "ForgotPasswordPage.requestPasswordReset",
        "Failed to request password reset",
      );
      throw error;
    }
  }

  /**
   * Verifies that the Reset Password header is visible.
   * @returns A promise that resolves when the visibility check passes.
   */
  public async verifyResetPasswordHeaderIsVisible(): Promise<void> {
    await this.elementAssertions.verifyElementState(
      this.resetPasswordHeader,
      "verifyResetPasswordHeaderIsVisible",
      "visible",
      "Reset Password Header",
    );
  }

  /**
   * Verifies the reset-password success page: success header and sent message.
   * @returns A promise that resolves when both visibility checks pass.
   */
  public async verifyResetPasswordSuccessPageIsVisible(): Promise<void> {
    await Promise.all([
      this.verifyResetPasswordSuccessHeaderIsVisible(),
      this.verifyResetPasswordSentMessageIsVisible(),
    ]);
  }

  /**
   * Verifies that the reset-password success header is visible.
   * @returns A promise that resolves when the visibility check passes.
   */
  private async verifyResetPasswordSuccessHeaderIsVisible(): Promise<void> {
    await this.elementAssertions.verifyElementState(
      this.resetPasswordSuccessHeader,
      "verifyResetPasswordSuccessHeaderIsVisible",
      "visible",
      "Reset Password Success Header",
    );
  }

  /**
   * Verifies that the "reset link sent" confirmation message is visible.
   * @returns A promise that resolves when the visibility check passes.
   */
  private async verifyResetPasswordSentMessageIsVisible(): Promise<void> {
    await this.elementAssertions.verifyElementState(
      this.resetPasswordSentMessage,
      "verifyResetPasswordSentMessageIsVisible",
      "visible",
      "Reset Password Sent Message",
    );
  }

  /**
   * Fills the username field on the Reset Password form.
   * @param username - The username to enter.
   * @returns A promise that resolves when the field has been filled.
   */
  public async fillUsernameInput(username: string): Promise<void> {
    if (!username) {
      ErrorHandler.logAndThrow(
        "ForgotPasswordPage.fillUsernameInput",
        "Username input is required.",
      );
    }

    await this.elementActions.fillElement(
      this.usernameInput,
      "fillUsernameInput",
      username,
      "Username Input",
    );
  }

  /**
   * Clicks the Reset Password button to submit the request.
   * @returns A promise that resolves when the button has been clicked.
   */
  private async clickResetPasswordButton(): Promise<void> {
    await this.elementActions.clickElement(
      this.resetPasswordButton,
      "clickResetPasswordButton",
      "Reset Password Button",
    );
  }

  /**
   * Clicks the Cancel button to return to the login page.
   * @returns A promise that resolves when the button has been clicked.
   */
  public async clickCancelButton(): Promise<void> {
    await this.elementActions.clickElement(
      this.cancelButton,
      "clickCancelButton",
      "Cancel Button",
    );
  }
}

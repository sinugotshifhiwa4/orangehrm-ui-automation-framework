import { type Locator, type Page, expect } from "@playwright/test";
import { BasePage } from "../../../base/basePage.js";
import CredentialValidator from "../../../../../utils/shared/credentialValidator.js";
import DateFormatter from "../../../../../utils/shared/dateFormatter.js";
import type { Credentials } from "../../../../../configuration/playwright/authentication/types/credentials.types.js";
import type { PageTitleOptions } from "./types/login.types.js";
import ErrorHandler from "../../../../../utils/errorHandling/errorHandler.js";
import logger from "../../../../../configuration/logger/loggerManager.js";

export class LoginPage extends BasePage {
  private readonly orangeHrmLogo: Locator;

  private readonly loginHeader: Locator;

  private readonly usernameInput: Locator;

  private readonly passwordInput: Locator;

  private readonly loginButton: Locator;

  private readonly forgotPasswordLink: Locator;

  private readonly invalidCredentialsAlert: Locator;

  private readonly usernameRequiredError: Locator;

  private readonly passwordRequiredError: Locator;

  private readonly footerVersionText: Locator;

  private readonly footerCopyrightYear: Locator;

  private readonly footerCopyrightOwnerLink: Locator;

  private readonly footerRightsText: Locator;

  private readonly footerSocialMediaIcons: Locator;

  private readonly footerLinkedInIcon: Locator;

  private readonly footerFacebookIcon: Locator;

  private readonly footerTwitterIcon: Locator;

  private readonly footerYoutubeIcon: Locator;

  constructor(page: Page) {
    super(page);

    this.orangeHrmLogo = page.getByRole("img", { name: "company-branding" });
    this.loginHeader = page.getByRole("heading", { name: "Login" });
    this.usernameInput = page.getByRole("textbox", { name: "Username" });
    this.passwordInput = page.getByRole("textbox", { name: "Password" });
    this.loginButton = page.getByRole("button", { name: "Login" });
    this.forgotPasswordLink = page.locator(".orangehrm-login-forgot");
    this.invalidCredentialsAlert = page
      .getByRole("alert")
      .filter({ hasText: "Invalid credentials" });

    this.usernameRequiredError = page.locator(
      '.oxd-input-group:has(input[name="username"]) .oxd-input-field-error-message',
    );

    this.passwordRequiredError = page.locator(
      '.oxd-input-group:has(input[name="password"]) .oxd-input-field-error-message',
    );

    const footer = page.locator(".orangehrm-copyright-wrapper");
    const socialFooter = page.locator(".orangehrm-login-footer-sm");
    this.footerVersionText = footer.getByText(/OrangeHRM OS \d+(\.\d+)*/);
    this.footerCopyrightYear = footer.getByText(
      `© 2005 - ${DateFormatter.getCurrentYear()}`,
    );
    this.footerCopyrightOwnerLink = footer.getByRole("link", {
      name: "OrangeHRM, Inc",
    });
    this.footerRightsText = footer.getByText("All rights reserved.");
    this.footerSocialMediaIcons = socialFooter.locator("a");
    this.footerLinkedInIcon = socialFooter.locator('a[href*="linkedin.com"]');
    this.footerFacebookIcon = socialFooter.locator('a[href*="facebook.com"]');
    this.footerTwitterIcon = socialFooter.locator('a[href*="twitter.com"]');
    this.footerYoutubeIcon = socialFooter.locator('a[href*="youtube.com"]');
  }

  /**
   * Verifies that the browser page title matches the expected login-page title.
   * @param options - Options containing the expected page title.
   * @returns A promise that resolves when the title assertion passes.
   */
  public async verifyPageTitleIsDisplayedCorrectly(
    options: PageTitleOptions,
  ): Promise<void> {
    const actualPageTitle = await this.navigation.getPageTitle(
      "verifyPageTitleIsDisplayedCorrectly",
    );

    expect(actualPageTitle).toBe(options.title);

    logger.info(
      `Verified: Page title '${actualPageTitle}' matches expected '${options.title}'`,
    );
  }

  public async login(options: Credentials, fillOptions?: { allowEmpty?: boolean }) {
    try {
      await this.verifyOrangeHrmLogoIsVisible();
      await this.verifyLoginHeaderIsVisible();
      await this.fillUsernameInput(options.username, fillOptions);
      await this.fillPasswordInput(options.password, fillOptions);
      await this.clickLoginButton();
    } catch (error) {
      ErrorHandler.captureError(error, "LoginPage.login", "Failed to login");
      throw error;
    }
  }

  public async verifyOrangeHrmLogoIsVisible(): Promise<void> {
    await this.elementAssertions.verifyElementState(
      this.orangeHrmLogo,
      "verifyOrangeHrmLogoIsVisible",
      "visible",
      "OrangeHRM Logo",
    );
  }

  public async verifyLoginHeaderIsVisible(): Promise<void> {
    await this.elementAssertions.verifyElementState(
      this.loginHeader,
      "verifyLoginHeaderIsVisible",
      "visible",
      "Login Header",
    );
  }

  /**
   * Validates and fills the email input field, skipping validation when allowEmpty is set.
   * @param email - The email address to enter.
   * @param fillOptions - Optional fill configuration; set allowEmpty to bypass required and placeholder checks.
   * @returns A promise that resolves when the field has been filled.
   */
  private async fillUsernameInput(
    username: string,
    fillOptions?: { allowEmpty?: boolean },
  ): Promise<void> {
    if (!username && !fillOptions?.allowEmpty) {
      ErrorHandler.logAndThrow(
        "LoginPage.fillUsernameInput",
        "Username input is required.",
      );
    }

    // Skip filling if empty and allowEmpty is true
    if (!username && fillOptions?.allowEmpty) {
      return;
    }

    if (!fillOptions?.allowEmpty) {
      CredentialValidator.validateNotPlaceholder(
        "LoginPage.fillUsernameInput",
        "username",
        username,
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
   * Validates and fills the password input field, skipping validation when allowEmpty is set.
   * @param password - The password to enter.
   * @param fillOptions - Optional fill configuration; set allowEmpty to bypass required and placeholder checks.
   * @returns A promise that resolves when the field has been filled.
   */
  private async fillPasswordInput(
    password: string,
    fillOptions?: { allowEmpty?: boolean },
  ): Promise<void> {
    if (!password && !fillOptions?.allowEmpty) {
      ErrorHandler.logAndThrow(
        "LoginPage.fillPasswordInput",
        "Password input is required.",
      );
    }

    // Skip filling if empty and allowEmpty is true
    if (!password && fillOptions?.allowEmpty) {
      return;
    }

    if (!fillOptions?.allowEmpty) {
      CredentialValidator.validateNotPlaceholder(
        "LoginPage.fillUsernameInput",
        "password",
        password,
      );
    }

    await this.elementActions.fillElement(
      this.passwordInput,
      "fillPasswordInput",
      password,
      "Password Input",
    );
  }

  /**
   * Clicks the Login button to submit the login form.
   * @returns A promise that resolves when the button has been clicked.
   */
  private async clickLoginButton(): Promise<void> {
    await this.elementActions.clickElement(
      this.loginButton,
      "clickLoginButton",
      "Login Button",
    );
  }

  public async verifyInvalidCredentialsAlertIsVisible(): Promise<void> {
    await this.elementAssertions.verifyElementState(
      this.invalidCredentialsAlert,
      "verifyInvalidCredentialsAlertIsVisible",
      "visible",
      "Invalid Credentials Alert",
    );
  }

  public async verifyInvalidCredentialsAlertIsHidden(): Promise<void> {
    await this.elementAssertions.verifyElementState(
      this.invalidCredentialsAlert,
      "verifyInvalidCredentialsAlertIsHidden",
      "hidden",
      "Invalid Credentials Alert",
    );
  }

  /**
   * Verifies that both required-field validation messages are visible.
   * @returns A promise that resolves when both field-error checks pass.
   */
  public async verifyRequiredFieldErrorsAreVisible(): Promise<void> {
    await Promise.all([
      this.verifyUsernameRequiredErrorIsVisible(),
      this.verifyPasswordRequiredErrorIsVisible(),
    ]);
  }

  /**
   * Verifies that the username required-field message is visible.
   * @returns A promise that resolves when the username error is visible.
   */
  private async verifyUsernameRequiredErrorIsVisible(): Promise<void> {
    await this.elementAssertions.verifyElementState(
      this.usernameRequiredError,
      "verifyUsernameRequiredErrorIsVisible",
      "visible",
      "username required error",
    );
  }

  /**
   * Verifies that the password required-field message is visible.
   * @returns A promise that resolves when the password error is visible.
   */
  private async verifyPasswordRequiredErrorIsVisible(): Promise<void> {
    await this.elementAssertions.verifyElementState(
      this.passwordRequiredError,
      "verifyPasswordRequiredErrorIsVisible",
      "visible",
      "password required error",
    );
  }

  public async clickforgotPasswordLink(): Promise<void> {
    await this.elementActions.clickElement(
      this.forgotPasswordLink,
      "clickforgotPasswordLink",
      "forgotPasswordLink",
    );
  }

  /**
   * Verifies the entire login footer: version, copyright, and social media icons.
   * @returns A promise that resolves once all footer elements are verified.
   */
  public async verifyFooter(): Promise<void> {
    try {
      await this.verifyFooterVersionTextIsVisible();
      await this.verifyFooterCopyrightYearIsVisible();
      await this.verifyFooterCopyrightOwnerLinkIsVisible();
      await this.verifyFooterRightsTextIsVisible();
      await this.verifyFooterSocialMediaIconsAreVisible();
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "LoginPage.verifyFooter",
        "Failed to verify login footer",
      );
      throw error;
    }
  }

  public async verifyFooterVersionTextIsVisible(): Promise<void> {
    await this.elementAssertions.verifyElementState(
      this.footerVersionText,
      "verifyFooterVersionTextIsVisible",
      "visible",
      "Footer Version Text",
    );
  }

  public async verifyFooterCopyrightYearIsVisible(): Promise<void> {
    await this.elementAssertions.verifyElementState(
      this.footerCopyrightYear,
      "verifyFooterCopyrightYearIsVisible",
      "visible",
      "Footer Copyright Year",
    );
  }

  public async verifyFooterCopyrightOwnerLinkIsVisible(): Promise<void> {
    await this.elementAssertions.verifyElementState(
      this.footerCopyrightOwnerLink,
      "verifyFooterCopyrightOwnerLinkIsVisible",
      "visible",
      "Footer Copyright Owner Link",
    );
  }

  public async verifyFooterRightsTextIsVisible(): Promise<void> {
    await this.elementAssertions.verifyElementState(
      this.footerRightsText,
      "verifyFooterRightsTextIsVisible",
      "visible",
      "Footer Rights Text",
    );
  }

  public async verifyFooterSocialMediaIconsAreVisible(): Promise<void> {
    await this.elementAssertions.verifyElementCount(
      this.footerSocialMediaIcons,
      "verifyFooterSocialMediaIconsAreVisible",
      4,
      "Footer Social Media Icons",
    );

    await Promise.all([
      this.elementAssertions.verifyElementState(
        this.footerLinkedInIcon,
        "verifyFooterSocialMediaIconsAreVisible",
        "visible",
        "Footer LinkedIn Icon",
      ),
      this.elementAssertions.verifyElementState(
        this.footerFacebookIcon,
        "verifyFooterSocialMediaIconsAreVisible",
        "visible",
        "Footer Facebook Icon",
      ),
      this.elementAssertions.verifyElementState(
        this.footerTwitterIcon,
        "verifyFooterSocialMediaIconsAreVisible",
        "visible",
        "Footer Twitter Icon",
      ),
      this.elementAssertions.verifyElementState(
        this.footerYoutubeIcon,
        "verifyFooterSocialMediaIconsAreVisible",
        "visible",
        "Footer YouTube Icon",
      ),
    ]);
  }
}

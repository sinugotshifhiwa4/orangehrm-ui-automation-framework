import type { Page } from "@playwright/test";
import { BasePage } from "../../base/basePage.js";
import type { EnvironmentResolver } from "../../../../configuration/resolution/resolver/environmentResolver.js";
import type { AuthenticationStateManager } from "../../authentication/authenticationStateManager.js";
import ErrorHandler from "../../../../utils/errorHandling/errorHandler.js";

/**
 * Coordinates portal navigation, login execution, and authentication-state persistence.
 */
export class LoginOrchestrator extends BasePage {
  private environmentResolver: EnvironmentResolver;

  private authenticationStateManager: AuthenticationStateManager;

  /**
   * Creates a login orchestrator for navigation, login execution, and auth-state persistence.
   * @param page - Active Playwright page instance.
   * @param environmentResolver - Resolver used to fetch environment-specific portal settings.
   * @param authenticationStateManager - Manager used to save authenticated browser state.
   */
  constructor(
    page: Page,
    environmentResolver: EnvironmentResolver,
    authenticationStateManager: AuthenticationStateManager,
  ) {
    super(page);
    this.environmentResolver = environmentResolver;
    this.authenticationStateManager = authenticationStateManager;
  }

  /**
   * Navigates to the portal base URL.
   * @returns A promise that resolves when navigation is complete.
   */
  public async navigateToPortal(): Promise<void> {
    const portalUrl = this.environmentResolver.getPortalBaseUrl();
    await this.navigation.navigateToUrl(portalUrl, "navigateToPortal");
  }

  /**
   * Navigates to the portal and reports whether the injected session is still authenticated.
   * An unauthenticated session is redirected by the portal to the login page.
   * @returns A promise that resolves to true if the portal did not redirect to the login page.
   */
  public async isAuthenticatedSessionActive(): Promise<boolean> {
    await this.navigateToPortal();
    const redirectedToLogin = await this.navigation.urlContains(
      "/auth/login",
      "isAuthenticatedSessionActive",
    );
    return !redirectedToLogin;
  }

  /**
   * Navigates to the portal, performs login, validates success, and saves authentication state.
   * @param loginFn - A function that performs the login action.
   * @param validateLoginFn - A function that validates the success of the login attempt.
   * @returns A promise that resolves when the login attempt has been validated.
   * @throws Error if the login attempt fails.
   */
  public async loginWithValidCredentials(
    loginFn: () => Promise<void>,
    validateLoginFn: () => Promise<void>,
  ): Promise<void> {
    await this.executeLoginFlow(
      loginFn,
      validateLoginFn,
      "loginWithValidCredentials",
      "Failed to log into portal",
      () => this.authenticationStateManager.saveAuthenticationState(),
    );
  }

  /**
   * Navigates to the portal, calls loginFn, calls validateFn, and optionally runs afterFn.
   * @param loginFn - A function that performs the login action.
   * @param validateFn - A function that validates the outcome of the login attempt.
   * @param source - The calling method name, used for error context.
   * @param context - A high-level description of the failure, used for error context.
   * @param afterFn - An optional callback to run after successful validation (e.g. save auth state).
   * @returns A promise that resolves when the full login flow has completed.
   */
  private async executeLoginFlow(
    loginFn: () => Promise<void>,
    validateFn: () => Promise<void>,
    source: string,
    context: string,
    afterFn?: () => Promise<unknown>,
  ): Promise<void> {
    try {
      await this.navigateToPortal();
      await loginFn();
      await validateFn();
      if (afterFn) await afterFn();
    } catch (error) {
      ErrorHandler.captureError(error, source, context);
      throw error;
    }
  }
}

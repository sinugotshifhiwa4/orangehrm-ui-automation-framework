import { test as configTest, expect } from "./config.fixtures.js";

// Configuration
import AuthenticationSkipEvaluator from "../src/configuration/playwright/authentication/evaluators/authSkipEvaluator.js";
import AuthenticationFileManager from "../src/configuration/playwright/authentication/storage/authenticationFileManager.js";

// Context
import { TestContext } from "../src/layers/ui/context/testContext.js";
import { BrowserContextManager } from "../src/layers/ui/context/browserContextManager.js";

// Authentication
import { AuthenticationStateManager } from "../src/layers/ui/authentication/authenticationStateManager.js";
import { LoginOrchestrator } from "../src/layers/ui/pages/authentication/loginOrchestrator.js";
import { AuthenticationExecutor } from "../src/layers/ui/pages/authentication/authenticationExecutor.js";

// Pages
import { LoginPage } from "../src/layers/ui/pages/orangeHrm/login/loginPage.js";
import { ForgotPasswordPage } from "../src/layers/ui/pages/orangeHrm/login/forgotPasswordPage.js";
import { DashboardPage } from "../src/layers/ui/pages/orangeHrm/menuItems/dashboardPage.js";
import { TopBar } from "../src/layers/ui/pages/orangeHrm/navigationBars/topbar.js";
import { SideBar } from "../src/layers/ui/pages/orangeHrm/navigationBars/sidebar.js";

type TestFixtures = {
  // Context
  testContext: TestContext;
  browserContextManager: BrowserContextManager;

  // Authentication
  authenticationStateManager: AuthenticationStateManager;
  loginOrchestrator: LoginOrchestrator;
  authenticationExecutor: AuthenticationExecutor;

  // Pages
  loginPage: LoginPage;
  forgotPasswordPage: ForgotPasswordPage;
  dashboardPage: DashboardPage;
  topBar: TopBar;
  sideBar: SideBar;
};

export const test = configTest.extend<TestFixtures>({
  // Context

  testContext: async ({}, use) => {
    await use(new TestContext());
  },

  browserContextManager: async ({ browser }, use) => {
    await use(new BrowserContextManager(browser));
  },

  // Authentication

  authenticationStateManager: async ({ page }, use) => {
    await use(new AuthenticationStateManager(page));
  },

  loginOrchestrator: async (
    { page, environmentResolver, authenticationStateManager },
    use,
  ) => {
    await use(
      new LoginOrchestrator(page, environmentResolver, authenticationStateManager),
    );
  },

  // Pages

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  forgotPasswordPage: async ({ page }, use) => {
    await use(new ForgotPasswordPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  topBar: async ({ page, dashboardPage }, use) => {
    await use(new TopBar(page, dashboardPage));
  },

  sideBar: async ({ page }, use) => {
    await use(new SideBar(page));
  },

  authenticationExecutor: async ({ loginOrchestrator, loginPage }, use) => {
    await use(new AuthenticationExecutor(loginOrchestrator, loginPage));
  },

  /**
   * Resolves the storage state file path for the current test.
   * Returns undefined if the test is tagged with @skip-auth, otherwise returns the shared auth file path.
   */
  storageState: async ({}, use, testInfo) => {
    const shouldSkipAuth =
      AuthenticationSkipEvaluator.shouldSkipAuthenticationIfNeeded(testInfo);

    if (shouldSkipAuth) {
      await use(undefined);
      return;
    }

    await use(AuthenticationFileManager.getFilePath());
  },
});

export { expect };

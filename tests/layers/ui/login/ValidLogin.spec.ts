import { test } from "../../../../fixtures/test.ui.fixtures";
import logger from "../../../../src/configuration/logger/loggerManager.js";

test.describe(
  "Login | Valid Credentials",
  { tag: ["@regression", "@sanity", "@dashboard", "@login"] },
  () => {
    test.beforeEach(async ({ loginOrchestrator }) => {
      await loginOrchestrator.navigateToPortal();
    });

    test("Should navigate to Dashboard on successful login", async ({ loginPage, sideBar }) => {
      await loginPage.verifyInvalidCredentialsAlertIsHidden();
      await sideBar.verifyDashboardMenuLinkIsVisible();
      logger.info("Assertion Passed: User successfully logged in and Dashboard is Visible");
    });
  },
);

test.describe("Login | Page Title", { tag: ["@regression", "@sanity", "@skip-auth"] }, () => {
  test.beforeEach(async ({ loginOrchestrator }) => {
    await loginOrchestrator.navigateToPortal();
  });

  test("Should display page title correctly", async ({ loginPage }) => {
    const expectedTitle = "OrangeHRM";

    await loginPage.verifyPageTitleIsDisplayedCorrectly({
      title: expectedTitle,
    });

    logger.info(`Assertion Passed: Page title is correctly displayed as "${expectedTitle}"`);
  });
});

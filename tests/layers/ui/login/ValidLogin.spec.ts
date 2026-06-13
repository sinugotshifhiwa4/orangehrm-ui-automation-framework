import { test } from "../../../../fixtures/test.ui.fixtures";
import logger from "../../../../src/configuration/logger/loggerManager.js";

test.describe(
  "Login | Valid Credentials",
  { tag: ["@regression", "@sanity", "@dashboard"] },
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

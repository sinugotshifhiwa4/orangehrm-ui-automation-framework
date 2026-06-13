import { test } from "../../../../fixtures/test.ui.fixtures";
import logger from "../../../../src/configuration/logger/loggerManager.js";

test.describe(
  "Dashboard | Default Landing Page",
  { tag: ["@regression", "@sanity", "@dashboard"] },
  () => {
    test.beforeEach(async ({ loginOrchestrator }) => {
      await loginOrchestrator.navigateToPortal();
    });

    test("Should load the Dashboard as the default page after successful login", async ({
      dashboardPage,
    }) => {
      await dashboardPage.verifyDashboardIsDefaultPage({
        expectedUrl: /dashboard\/index/,
        classAttribute: "active",
      });

      logger.info(
        "Assertion Passed: Dashboard is loaded as the default page with the correct URL and active menu state",
      );
    });
  },
);

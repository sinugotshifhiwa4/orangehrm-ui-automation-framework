import { test } from "../../../../fixtures/test.ui.fixtures";
import logger from "../../../../src/configuration/logger/loggerManager.js";

test.describe("Login | Footer", { tag: ["@regression", "@skip-auth", "@login"] }, () => {
  test.beforeEach(async ({ loginOrchestrator }) => {
    await loginOrchestrator.navigateToPortal();
  });

  test(
    "Should display complete footer with all elements",
    { tag: "@sanity" },
    async ({ loginPage }) => {
      await loginPage.verifyFooter();
      logger.info("Assertion Passed: Complete footer with all elements is displayed");
    },
  );

  test("Should display footer version text", async ({ loginPage }) => {
    await loginPage.verifyFooterVersionTextIsVisible();
    logger.info("Assertion Passed: Footer version text is displayed");
  });

  test("Should display footer copyright year", async ({ loginPage }) => {
    await loginPage.verifyFooterCopyrightYearIsVisible();
    logger.info("Assertion Passed: Footer copyright year is displayed");
  });

  test("Should display footer copyright owner link", async ({ loginPage }) => {
    await loginPage.verifyFooterCopyrightOwnerLinkIsVisible();
    logger.info("Assertion Passed: Footer copyright owner link is displayed");
  });

  test("Should display footer rights text", async ({ loginPage }) => {
    await loginPage.verifyFooterRightsTextIsVisible();
    logger.info("Assertion Passed: Footer rights text is displayed");
  });

  test("Should display footer social media icons", async ({ loginPage }) => {
    await loginPage.verifyFooterSocialMediaIconsAreVisible();
    logger.info("Assertion Passed: Footer social media icons are displayed");
  });
});

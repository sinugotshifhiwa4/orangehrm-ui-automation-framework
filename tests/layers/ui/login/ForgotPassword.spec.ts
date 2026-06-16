import { test } from "../../../../fixtures/test.ui.fixtures";
import logger from "../../../../src/configuration/logger/loggerManager.js";

test.describe("Login | Forgot Password", { tag: ["@regression", "@skip-auth", "@login"] }, () => {
  test.beforeEach(async ({ loginOrchestrator, loginPage }) => {
    await loginOrchestrator.navigateToPortal();
    await loginPage.verifyOrangeHrmLogoIsVisible();
  });

  test(
    "Should display reset password success page after requesting password reset",
    { tag: "@sanity" },
    async ({ environmentResolver, loginPage, forgotPasswordPage }) => {
      const { username } = environmentResolver.getPortalCredentials();
      await loginPage.clickforgotPasswordLink();
      await forgotPasswordPage.requestPasswordReset({ username: username });
      await forgotPasswordPage.verifyResetPasswordSuccessPageIsVisible();
      logger.info(
        "Assertion Passed: Password reset success page is displayed after requesting reset",
      );
    },
  );

  test("Should navigate back to login page when cancel button is clicked", async ({
    loginPage,
    forgotPasswordPage,
  }) => {
    await loginPage.clickforgotPasswordLink();
    await forgotPasswordPage.clickCancelButton();
    await loginPage.verifyLoginHeaderIsVisible();
    logger.info("Assertion Passed: User navigated back to login page after clicking cancel button");
  });
});

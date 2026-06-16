import { test } from "../../../../fixtures/test.ui.fixtures";
import logger from "../../../../src/configuration/logger/loggerManager.js";

test.describe(
  "Login | Invalid Credentials",
  { tag: ["@regression", "@skip-auth", "@login"] },
  () => {
    test.beforeEach(async ({ loginOrchestrator, loginPage }) => {
      await loginOrchestrator.navigateToPortal();
      await loginPage.verifyOrangeHrmLogoIsVisible();
    });

    test("Should display required field errors when credentials are empty", async ({
      loginPage,
    }) => {
      await loginPage.login({ username: "", password: "" }, { allowEmpty: true });
      await loginPage.verifyRequiredFieldErrorsAreVisible();
      logger.info(
        "Assertion Passed: Required field errors are displayed when credentials are empty",
      );
    });

    test("Should display invalid credentials alert with invalid username and password", async ({
      loginPage,
    }) => {
      const invalidUsername = "invalidAdminUser";
      const invalidPassword = "invalidAdminPass";

      await loginPage.login({ username: invalidUsername, password: invalidPassword });
      await loginPage.verifyInvalidCredentialsAlertIsVisible();
      logger.info(
        "Assertion Passed: Invalid credentials alert is displayed with invalid username and password",
      );
    });

    test("Should display invalid credentials alert with invalid username and valid password", async ({
      environmentResolver,
      loginPage,
    }) => {
      const invalidUsername = "invalidAdminUser";
      const { password } = environmentResolver.getPortalCredentials();

      await loginPage.login({ username: invalidUsername, password: password });
      await loginPage.verifyInvalidCredentialsAlertIsVisible();
      logger.info(
        "Assertion Passed: Invalid credentials alert is displayed with invalid username and valid password",
      );
    });

    test("Should display invalid credentials alert with valid username and invalid password", async ({
      environmentResolver,
      loginPage,
    }) => {
      const { username } = environmentResolver.getPortalCredentials();
      const invalidPassword = "invalidAdminPass";

      await loginPage.login({ username: username, password: invalidPassword });
      await loginPage.verifyInvalidCredentialsAlertIsVisible();
      logger.info(
        "Assertion Passed: Invalid credentials alert is displayed with valid username and invalid password",
      );
    });
  },
);

import { test as authentication } from "../../../../fixtures/test.ui.fixtures.js";

authentication(
  "Authenticates the user with valid credentials",
  {
    tag: ["@authenticate", "@sanity", "@regression", "@dashboard"],
  },
  async ({ authenticationExecutor, environmentResolver, topBar }) => {
    const credentials = environmentResolver.getPortalCredentials();
    await authenticationExecutor.run(credentials);
    await topBar.verifyTopBarMenusAreVisible();
  },
);

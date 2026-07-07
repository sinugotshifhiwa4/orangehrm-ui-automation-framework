import { test as authentication } from "../../../../fixtures/test.ui.fixtures.js";

authentication(
  "Authenticates the user with valid credentials",
  {
    tag: ["@authenticate", "@sanity", "@regression", "@login", "@dashboard", "@pim"],
  },
  async ({ authenticationExecutor, environmentResolver, topBar }) => {
    const credentials = environmentResolver.getPortalCredentials();
    await authenticationExecutor.run(credentials);
    await topBar.verifyTopBarMenusAreVisible();
  },
);

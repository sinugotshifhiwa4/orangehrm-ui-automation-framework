import EnvironmentVariables from "../../environment/variables/environmentVariables.js";
import { ENV_KEYS } from "../../environment/variables/keys/environment.keys.js";
import type { Credentials } from "../../playwright/authentication/types/credentials.types.js";
import ErrorHandler from "../../../utils/errorHandling/errorHandler.js";
import { EnvironmentResolverHelpers } from "./internal/environmentResolver.helpers.js";

export class EnvironmentResolver {
  /**
   * Resolves the portal base URL from the correct source for the current environment.
   * CI pipelines inject it as a process environment variable; local runs load it from
   * .env files, so the source is selected at runtime to avoid missing values.
   */
  public getPortalBaseUrl(): string {
    try {
      return EnvironmentResolverHelpers.isCI()
        ? EnvironmentResolverHelpers.getCIEnv(ENV_KEYS.PORTAL.PORTAL_BASE_URL)
        : EnvironmentResolverHelpers.resolveLocalVariable(
            () => EnvironmentVariables.urls.PORTAL_BASE_URL,
            "Portal Base URL",
          );
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "getPortalBaseUrl",
        "Failed to get portal base URL",
      );
      throw error;
    }
  }

  /**
   * Resolves and validates portal credentials from the correct source for the current
   * environment. Validation happens in both CI and local paths to surface misconfigured
   * pipelines and missing .env entries at resolution time rather than mid-test.
   */
  public getPortalCredentials(): Credentials {
    try {
      return EnvironmentResolverHelpers.isCI()
        ? EnvironmentResolverHelpers.resolveCICredentials(
            ENV_KEYS.PORTAL.USERNAME,
            ENV_KEYS.PORTAL.PASSWORD,
          )
        : EnvironmentResolverHelpers.resolveLocalCredentials(
            () => EnvironmentVariables.credentials.PORTAL_USERNAME,
            "Portal Username",
            () => EnvironmentVariables.credentials.PORTAL_PASSWORD,
            "Portal Password",
          );
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "getPortalCredentials",
        "Failed to get portal credentials",
      );
      throw error;
    }
  }
}

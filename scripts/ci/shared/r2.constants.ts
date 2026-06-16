/**
 * r2.constants.ts  (scripts/ci/shared/r2.constants.ts)
 * Single source of truth for the Cloudflare R2 bucket the CI pipeline reads from
 * and writes to (the rolling test-results history and per-run build reports).
 * Shared by the r2 CLI and the update-test-history pipeline, so the endpoint,
 * bucket, and key layout are defined exactly once rather than per consumer.
 */

/** R2 S3-compatible endpoint (Cloudflare account host). */
export const R2_ENDPOINT =
  "https://af1b78df22a3bdfaf204c4eca619e23d.r2.cloudflarestorage.com";

/** Bucket holding the automation CI artifacts. Objects live at the bucket root. */
export const R2_BUCKET = "orangehrm-ui-automation-framework";

/**
 * Public HTTPS base URL for browsing bucket objects (no trailing slash).
 * The S3 API endpoint (`R2_ENDPOINT`) requires signed requests and is NOT
 * publicly browsable, so report links use the bucket's public r2.dev domain.
 */
export const R2_PUBLIC_BASE_URL = "https://pub-07f5cb69bc504f5f8ba2b3074690f23c.r2.dev";

/** Object name of the rolling test-results history file. */
export const TEST_HISTORY_FILE = "test-history.json";

/**
 * Builds the object key (relative to the bucket) for a run's build reports.
 * Single source of truth for the layout so the S3 URI and the public URL
 * always resolve to the same prefix.
 * @param runNumber - The GitHub Actions run number.
 * @param env - The environment slug (qa | uat | preprod).
 * @param testType - The test type for the run (e.g. regression | sanity).
 * @returns The bucket-relative key prefix (no leading or trailing slash).
 */
function buildReportsKey(runNumber: string, env: string, testType: string): string {
  return `build-reports/build-${runNumber}-${env}-${testType}`;
}

/**
 * Builds the S3 URI of the test-results history file.
 * @returns The fully-qualified s3:// URI.
 */
export function r2HistoryUri(): string {
  return `s3://${R2_BUCKET}/${TEST_HISTORY_FILE}`;
}

/**
 * Builds the S3 URI base for a run's build reports.
 * @param runNumber - The GitHub Actions run number.
 * @param env - The environment slug (qa | uat | preprod).
 * @param testType - The test type for the run (e.g. regression | sanity).
 * @returns The fully-qualified s3:// URI prefix for the run.
 */
export function r2BuildReportsBase(
  runNumber: string,
  env: string,
  testType: string,
): string {
  return `s3://${R2_BUCKET}/${buildReportsKey(runNumber, env, testType)}`;
}

/**
 * Builds the public HTTPS base URL for a run's build reports — the same prefix
 * as `r2BuildReportsBase` but reachable in a browser.
 * @param runNumber - The GitHub Actions run number.
 * @param env - The environment slug (qa | uat | preprod).
 * @param testType - The test type for the run (e.g. regression | sanity).
 * @returns The public HTTPS URL prefix for the run (no trailing slash).
 */
export function r2PublicReportsBase(
  runNumber: string,
  env: string,
  testType: string,
): string {
  return `${R2_PUBLIC_BASE_URL}/${buildReportsKey(runNumber, env, testType)}`;
}

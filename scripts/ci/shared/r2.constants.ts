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

/** Object name of the rolling test-results history file. */
export const TEST_HISTORY_FILE = "test-history.json";

/**
 * Builds the public HTTPS base URL for objects in the bucket (endpoint + bucket).
 * Used to compose report links stored in the test-results history.
 * @returns The bucket's base URL without a trailing slash.
 */
export function r2PublicBase(): string {
  return `${R2_ENDPOINT}/${R2_BUCKET}`;
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
  return `s3://${R2_BUCKET}/build-reports/run-${runNumber}-${env}-${testType}`;
}

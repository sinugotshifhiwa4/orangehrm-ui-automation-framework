/**
 * r2.ts
 * CLI wrapper for the CI pipeline's Cloudflare R2 operations. Each subcommand
 * replaces an inline `aws s3` block in the workflow, pulling the endpoint, bucket,
 * and key layout from shared/r2.constants.ts so nothing is hardcoded in the YAML.
 *
 * Usage: tsx scripts/ci/r2/r2.ts <download-history | upload-history | upload-reports | report-urls>
 * Credentials are read by the aws CLI from AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY.
 */

import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { logger } from "../../logger/logger.js";
import {
  R2_ENDPOINT,
  TEST_HISTORY_FILE,
  r2HistoryUri,
  r2BuildReportsBase,
  r2PublicReportsBase,
} from "../shared/r2.constants.js";

const LOCAL_HISTORY_PATH = `./${TEST_HISTORY_FILE}`;

/** Reports uploaded per run, mapped to their key suffix under the run prefix. */
const BUILD_REPORTS = [
  { dir: "playwright-report", keySuffix: "playwright" },
  { dir: "ortoni-report", keySuffix: "ortoni" },
];

/**
 * Runs an `aws` CLI command with the R2 endpoint appended.
 * @param args - Arguments passed to the aws CLI (without the endpoint flag).
 * @returns True when the command exits successfully, false otherwise.
 */
function runAws(args: string[]): boolean {
  const result = spawnSync("aws", [...args, "--endpoint-url", R2_ENDPOINT], {
    stdio: "inherit",
    shell: true,
  });
  return result.status === 0;
}

/**
 * Downloads the test-results history file from R2. A missing remote file is not
 * an error — the pipeline simply creates a fresh history on the next step.
 */
function downloadHistory(): void {
  logger.info(`Downloading test history from ${r2HistoryUri()}`);
  if (!runAws(["s3", "cp", r2HistoryUri(), LOCAL_HISTORY_PATH])) {
    logger.warn("No existing history file in R2 — a fresh one will be created.");
  }
}

/**
 * Uploads the local test-results history file back to R2.
 */
function uploadHistory(): void {
  if (!existsSync(LOCAL_HISTORY_PATH)) {
    logger.error(`History file ${LOCAL_HISTORY_PATH} not found — nothing to upload.`);
    process.exit(1);
  }
  logger.info(`Uploading test history to ${r2HistoryUri()}`);
  if (!runAws(["s3", "cp", LOCAL_HISTORY_PATH, r2HistoryUri()])) {
    process.exit(1);
  }
}

/**
 * Reads the per-run identifiers from the environment, exiting if any are absent.
 * @returns The GitHub run number, environment slug, and test type.
 */
function runContext(): { runNumber: string; env: string; testType: string } {
  const runNumber = process.env.GITHUB_RUN_NUMBER;
  const env = process.env.ENV;
  const testType = process.env.TEST_TYPE;
  if (!runNumber || !env || !testType) {
    logger.error("GITHUB_RUN_NUMBER, ENV and TEST_TYPE must be set.");
    process.exit(1);
  }
  return { runNumber, env, testType };
}

/**
 * Uploads the merged Playwright and Ortoni reports for the current run to R2.
 * Each report directory is skipped if it was not produced by the run.
 */
function uploadReports(): void {
  const { runNumber, env, testType } = runContext();

  const base = r2BuildReportsBase(runNumber, env, testType);

  for (const { dir, keySuffix } of BUILD_REPORTS) {
    if (!existsSync(dir)) {
      logger.warn(`No ${dir} found — skipping ${keySuffix} upload.`);
      continue;
    }
    logger.info(`Uploading ${dir} to ${base}/${keySuffix}/`);
    if (!runAws(["s3", "cp", `./${dir}/`, `${base}/${keySuffix}/`, "--recursive"])) {
      process.exit(1);
    }
  }

  logger.info(`Build reports uploaded to: ${base}`);
}

/**
 * Prints the public Playwright and Ortoni report URLs for the current run as a
 * single Markdown links line on stdout, for embedding in the job summary.
 */
function reportUrls(): void {
  const { runNumber, env, testType } = runContext();
  const base = r2PublicReportsBase(runNumber, env, testType);
  // Plain stdout (not the logger) so the workflow can append it to the summary.
  process.stdout.write(
    `[Playwright report](${base}/playwright/index.html) · [Ortoni report](${base}/ortoni/index.html)\n`,
  );
}

/**
 * Dispatches the requested R2 subcommand.
 */
function main(): void {
  const command = process.argv[2];
  switch (command) {
    case "download-history":
      downloadHistory();
      break;
    case "upload-history":
      uploadHistory();
      break;
    case "upload-reports":
      uploadReports();
      break;
    case "report-urls":
      reportUrls();
      break;
    default:
      logger.error(
        `Unknown command "${command ?? ""}". Expected: download-history | upload-history | upload-reports | report-urls.`,
      );
      process.exit(1);
  }
}

main();

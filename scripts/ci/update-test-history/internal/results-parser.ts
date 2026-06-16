/**
 * results-parser.ts
 * Reads and parses the merged Playwright `results.json` report.
 *
 *   new ResultsParser(jsonPath).parse() → ParseResult
 */

import fs from "fs";

import {
  MAX_FAILED_TESTS_STORED,
  MAX_FAILURE_MESSAGE_LENGTH,
  MAX_FLAKY_TESTS_STORED,
} from "./constants.js";
import { logger } from "../../../logger/logger.js";
import { stripAnsi, truncate } from "./helpers.js";
import type {
  FailedTest,
  ParseResult,
  PlaywrightJsonReport,
  PlaywrightJsonSuite,
  PlaywrightJsonTest,
} from "../types/types.js";

export class ResultsParser {
  constructor(private readonly jsonPath: string) {}

  /**
   * Parses the Playwright JSON report and returns normalised stats.
   * @returns The normalised parse result (counts, duration, failed/flaky specs).
   * @throws If the file cannot be read or parsed.
   */
  parse(): ParseResult {
    logger.info(`[update-test-history] Parsing Playwright JSON report: ${this.jsonPath}`);

    const raw = fs.readFileSync(this.jsonPath, "utf-8");
    const report = JSON.parse(raw) as PlaywrightJsonReport;
    const { stats, suites } = report;

    logger.info(
      `[update-test-history] Stats — expected=${stats.expected} unexpected=${stats.unexpected} skipped=${stats.skipped} flaky=${stats.flaky} duration=${stats.duration}ms`,
    );

    const failedTests: FailedTest[] = [];
    const flakyTests: FailedTest[] = [];
    this.collectSpecs(suites, failedTests, flakyTests);

    logger.info(
      `[update-test-history] Specs captured — failed=${failedTests.length} flaky=${flakyTests.length}`,
    );

    return {
      passed: stats.expected,
      failed: stats.unexpected,
      skipped: stats.skipped,
      flaky: stats.flaky,
      durationMs: stats.duration,
      failedTests,
      flakyTests,
    };
  }

  /**
   * Recursively walks the suite tree to collect failed and flaky specs.
   * Playwright nests suites as: file suite → describe suite → specs. A flaky
   * spec passes overall (`spec.ok === true`) but has a test that ran again and
   * was marked "flaky", so it must be detected separately from failures.
   * @param suites - The suite nodes to walk.
   * @param failedTests - Accumulator for failed spec entries (mutated in place).
   * @param flakyTests - Accumulator for flaky spec entries (mutated in place).
   * @returns Nothing; both accumulators are populated by reference.
   */
  private collectSpecs(
    suites: PlaywrightJsonSuite[],
    failedTests: FailedTest[],
    flakyTests: FailedTest[],
  ): void {
    for (const suite of suites) {
      // Recurse into nested describe blocks first
      if (suite.suites && suite.suites.length > 0) {
        this.collectSpecs(suite.suites, failedTests, flakyTests);
      }

      for (const spec of suite.specs) {
        const isFlaky = spec.tests.some((t) => t.status === "flaky");
        const isFailed = !spec.ok;
        if (!isFailed && !isFlaky) continue;

        // Setup-project failures can report tests with an undefined `duration`,
        // which would propagate NaN here and become `null` in JSON. Coerce to 0.
        const totalMs = spec.tests.reduce(
          (sum, t) => sum + (Number.isFinite(t.duration) ? t.duration : 0),
          0,
        );
        const base = {
          name: truncate(spec.title, 200),
          classname: truncate(spec.file, 200),
          durationSec: Math.round(totalMs) / 1000,
          failureMessage: this.extractFailureMessage(spec.tests),
        };

        if (isFailed) {
          if (failedTests.length >= MAX_FAILED_TESTS_STORED) continue;
          // Determine kind from the first non-passing test result.
          const failingTest = spec.tests.find((t) => t.status === "unexpected");
          failedTests.push({ ...base, kind: failingTest ? "failure" : "error" });
        } else if (flakyTests.length < MAX_FLAKY_TESTS_STORED) {
          flakyTests.push({ ...base, kind: "flaky" });
        }
      }
    }
  }

  /**
   * Extracts the first error message across a spec's test attempts. Reads
   * `result.error.message` first, falling back to the first populated
   * `result.errors[]` entry. The message is ANSI-stripped and truncated so the
   * dashboard can classify failure type without bloating the history file.
   * @param tests - The test results belonging to a single spec.
   * @returns The cleaned failure message, or undefined when none is present.
   */
  private extractFailureMessage(tests: PlaywrightJsonTest[]): string | undefined {
    for (const test of tests) {
      for (const result of test.results ?? []) {
        const message =
          result.error?.message ?? result.errors?.find((e) => e.message)?.message;
        if (message) return truncate(stripAnsi(message), MAX_FAILURE_MESSAGE_LENGTH);
      }
    }
    return undefined;
  }
}

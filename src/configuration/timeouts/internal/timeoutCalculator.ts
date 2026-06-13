import type { TimeoutCalculatorOptions } from "../types/TimeoutCalculator.type.js";

/**
 * Computes an effective timeout value for the current runtime environment.
 *
 * In CI, the base timeout is multiplied to absorb slower execution.
 */
export function calculateTimeout({
  baseMs,
  isCI = false,
  multiplier = 2,
}: TimeoutCalculatorOptions): number {
  return isCI ? baseMs * multiplier : baseMs;
}

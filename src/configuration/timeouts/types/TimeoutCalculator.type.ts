/** Configuration options used to derive runtime timeout values. */
export type TimeoutCalculatorOptions = {
  baseMs: number;
  isCI?: boolean;
  multiplier?: number;
};

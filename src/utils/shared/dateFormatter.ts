/**
 * Provides consistent date and identifier formatting helpers for logs and test data.
 */
export default class DateFormatter {
  /**
   * Returns a compact string representing the current local time in the format `YYYYMMDDHHMMSS`
   * (no separators), suitable for timestamp-based identifiers.
   *
   * @example
   * const currentTime = DateFormatter.formatLocalTime();
   * logger.info(currentTime); // '20220722143000'
   * @returns {string} A compact string representing the current local time.
   */
  public static formatLocalTime(): string {
    const now = new Date();
    return [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
      String(now.getHours()).padStart(2, "0"),
      String(now.getMinutes()).padStart(2, "0"),
      String(now.getSeconds()).padStart(2, "0"),
    ].join("");
  }

  /**
   * Formats a given date into a compact string in the format `YYYYMMDDHHMMSS` (no separators).
   * @param {Date} date - The date to be formatted.
   * @returns {string} - The compact formatted date string, e.g. '20220722143000'.
   */
  public static formatDate(date: Date): string {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
      String(date.getHours()).padStart(2, "0"),
      String(date.getMinutes()).padStart(2, "0"),
      String(date.getSeconds()).padStart(2, "0"),
    ].join("");
  }

  /**
   * Returns the current month and year, e.g. 'Jun, 2026'.
   * @param {Date} [date=new Date()] - Optional date to format; defaults to now.
   * @returns {string} - The month abbreviation and full year, comma-separated.
   */
  public static formatMonthYear(date: Date = new Date()): string {
    const month = date.toLocaleString("en-US", { month: "short" });
    return `${month}, ${date.getFullYear()}`;
  }

  /**
   * Returns the current full year, e.g. 2026.
   * @param {Date} [date=new Date()] - Optional date to read the year from; defaults to now.
   * @returns {number} - The four-digit current year.
   */
  public static getCurrentYear(date: Date = new Date()): number {
    return date.getFullYear();
  }

  /**
   * Generates a unique identifier based on the current timestamp.
   * @param {string} [prefix='IT'] - Optional prefix to be appended to the generated ID.
   * @returns {string} - The generated ID in the format of `<prefix>-<timestamp>`.
   */
  public static generateId(prefix: string = "IT"): string {
    return `${prefix}-${this.formatLocalTime()}`;
  }
}

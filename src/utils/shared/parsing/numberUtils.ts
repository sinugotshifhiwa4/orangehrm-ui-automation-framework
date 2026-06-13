import ErrorHandler from "../../errorHandling/errorHandler.js";
import {
  baseNumericValue,
  normaliseStringValue,
  stripCommas,
} from "./internal/parsingHelpers.js";

export default class NumberUtils {
  /**
   * Parses a string to a number by removing non-breaking spaces and commas.
   * @param {string} value - The string to parse.
   * @returns {number} Parsed numeric value.
   */
  public static parseNumber(this: void, value: string): number {
    return Number(baseNumericValue(value));
  }

  /**
   * Parses a string to a number by extracting the leading numeric value.
   * If no match is found, returns 0.
   * @param {string} value - The string to parse.
   * @returns {number} Parsed number, or 0 if no match is found.
   */
  public static parseLeadingNumber(this: void, value: string): number {
    const match = normaliseStringValue(value).match(/[\d,]+/);
    return match ? Number(stripCommas(match[0])) : 0;
  }

  /**
   * Parses a string percentage value to a number.
   * @param {string} value - The string percentage value to parse.
   * @returns {number} Parsed numeric value.
   */
  public static parsePercentage(this: void, value: string): number {
    return Number(baseNumericValue(value).replace("%", "").trim());
  }

  /**
   * Parses a string CBM value to a number.
   * If the value is empty, returns 0.
   * @param {string} value - The string CBM value to parse.
   * @returns {number} Parsed CBM value.
   */
  public static parseCbm(this: void, value: string): number {
    if (!value) return 0;
    const match = baseNumericValue(value).match(/^(\d+(?:\.\d+)?)/);
    return match ? Number(match[1]) : 0;
  }

  /**
   * Parses an array of string numbers to an array of numbers.
   * @param {string[]} values - The array of string numbers to parse.
   * @returns {number[]} Parsed numeric values.
   */
  public static parseToNumbers(this: void, values: string[]): number[] {
    return values.map(NumberUtils.parseNumber);
  }

  /**
   * Sums an array of numbers.
   * @param {number[]} values - The array of numbers to sum.
   * @returns {number} The sum of the numbers.
   */
  public static sumNumbers(this: void, values: number[]): number {
    return values.reduce((sum, n) => sum + n, 0);
  }

  /**
   * Calculates the sum of an array of cell values representing CBM values.
   * @param {string[]} cellValues - The cell values as strings.
   * @returns {number} Rounded CBM total.
   */
  public static calculateCbmSum(this: void, cellValues: string[]): number {
    return Number(
      NumberUtils.sumNumbers(cellValues.map(NumberUtils.parseCbm)).toFixed(3),
    );
  }

  /**
   * Rounds a given number to two decimal places.
   * @param {number} value - The number to round.
   * @returns {number} Rounded number.
   */
  public static roundToTwoDecimals(this: void, value: number): number {
    return Number(value.toFixed(2));
  }

  /**
   * Asserts that the given value is a valid number.
   * @param {unknown} value - The value to validate.
   * @param {string} fieldName - The field being validated.
   * @param {string} context - The validation context.
   */
  public static assertValidNumber(
    this: void,
    value: unknown,
    fieldName: string,
    context: string,
  ): asserts value is number {
    if (typeof value !== "number" || Number.isNaN(value)) {
      ErrorHandler.logAndThrow(
        "assertValidNumber",
        `${fieldName} must be a valid number for "${context}".`,
      );
    }
  }
}

import { baseNumericValue } from "./internal/parsingHelpers.js";

export default class CurrencyUtils {
  /**
   * Parses a string currency value to a number.
   * The function removes all non-numeric characters except decimal points and minus signs.
   * @param {string} value - The string currency value to parse.
   * @returns {number} Parsed numeric value.
   */
  public static parseCurrency(this: void, value: string): number {
    return Number(baseNumericValue(value).replace(/[^\d.-]/g, ""));
  }

  /**
   * Parses an array of string currency values to an array of numbers.
   * @param {string[]} values - The array of string currency values to parse.
   * @returns {number[]} Parsed numeric values.
   */
  public static parseCurrencyArray(this: void, values: string[]): number[] {
    return values.map(CurrencyUtils.parseCurrency);
  }
}

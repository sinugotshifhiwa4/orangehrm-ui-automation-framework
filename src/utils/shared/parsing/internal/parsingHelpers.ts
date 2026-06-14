/**
 * Replaces non-breaking spaces with regular spaces, collapses repeated whitespace, and trims the result.
 * @param {string} value - Raw string value.
 * @returns {string} Normalised string.
 */
export const normaliseStringValue = (value: string): string =>
  value
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Removes commas from a string value.
 * @param {string} value - Raw string value.
 * @returns {string} String without commas.
 */
export const stripCommas = (value: string): string => value.replace(/,/g, "");

/**
 * Normalises a numeric string so it can be parsed consistently.
 * @param {string} value - Raw numeric string.
 * @returns {string} Normalised numeric string.
 */
export const baseNumericValue = (value: string): string =>
  stripCommas(normaliseStringValue(value));

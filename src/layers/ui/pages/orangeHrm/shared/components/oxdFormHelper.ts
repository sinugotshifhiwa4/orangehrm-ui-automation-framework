import { type Locator, type Page, expect } from "@playwright/test";
import { BasePage } from "../../../../base/basePage.js";

/**
 * Reusable component object for OrangeHRM's "oxd" form widgets (text, date, dropdown,
 * and autocomplete fields), all addressed by their visible field label.
 *
 * The oxd inputs have no stable name attributes, so each control is resolved by scoping to
 * the `.oxd-input-group` that contains a label whose text matches exactly. This keeps the
 * helper usable across every PIM tab without re-declaring selectors per page.
 */
export class OxdFormHelper extends BasePage {
  /**
   * Creates the oxd form helper bound to the active page.
   * @param page - Active Playwright page instance.
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Resolves the input-group container for a field by its exact label text.
   * @param label - The visible label of the field.
   * @returns The locator for the field's input-group container.
   */
  private groupByLabel(label: string): Locator {
    return this.page.locator(`.oxd-input-group:has(label:text-is("${label}"))`);
  }

  /**
   * Fills a text or textarea field identified by its label.
   * @param label - The visible label of the field.
   * @param value - The value to enter.
   * @param fillOptions - Optional fill configuration; set allowEmpty to permit an empty value.
   * @returns A promise that resolves when the field has been filled.
   */
  public async fillFieldByLabel(
    label: string,
    value: string,
    fillOptions?: { allowEmpty?: boolean },
  ): Promise<void> {
    await this.elementActions.fillElement(
      this.groupByLabel(label).getByRole("textbox"),
      "fillFieldByLabel",
      value,
      `${label} field`,
      fillOptions,
    );
  }

  /**
   * Fills a date field identified by its label and closes the calendar popup afterward.
   * @param label - The visible label of the date field.
   * @param value - The date value to enter (yyyy-dd-mm).
   * @returns A promise that resolves when the date has been entered and the calendar closed.
   */
  public async fillDateByLabel(label: string, value: string): Promise<void> {
    const dateInput = this.groupByLabel(label).getByRole("textbox");

    await this.elementActions.fillElement(
      dateInput,
      "fillDateByLabel",
      value,
      `${label} date`,
    );
    await dateInput.press("Escape");
  }

  /**
   * Selects an option in an oxd dropdown identified by its label.
   * @param label - The visible label of the dropdown.
   * @param optionText - The exact option text to select.
   * @returns A promise that resolves when the option has been selected.
   */
  public async selectDropdownByLabel(label: string, optionText: string): Promise<void> {
    await this.elementActions.clickElement(
      this.groupByLabel(label).locator(".oxd-select-text"),
      "selectDropdownByLabel",
      `${label} dropdown`,
    );
    await this.elementActions.clickElement(
      this.page.getByRole("option", { name: optionText, exact: true }),
      "selectDropdownByLabel",
      `${optionText} option`,
    );
  }

  /**
   * Opens an oxd dropdown and selects its first real option (skipping the placeholder),
   * returning the chosen option's text so the caller can assert on it later.
   * @param label - The visible label of the dropdown.
   * @returns A promise that resolves with the text of the selected option.
   */
  public async selectFirstDropdownOptionByLabel(label: string): Promise<string> {
    await this.elementActions.clickElement(
      this.groupByLabel(label).locator(".oxd-select-text"),
      "selectFirstDropdownOptionByLabel",
      `${label} dropdown`,
    );

    const firstRealOption = this.page.getByRole("option").nth(1);
    const optionText = (await firstRealOption.textContent())?.trim() ?? "";

    await this.elementActions.clickElement(
      firstRealOption,
      "selectFirstDropdownOptionByLabel",
      `first ${label} option`,
    );

    return optionText;
  }

  /**
   * Reads the currently selected value text of an oxd dropdown by its label.
   * @param label - The visible label of the dropdown.
   * @returns A promise that resolves with the selected option's text.
   */
  public async getDropdownValueByLabel(label: string): Promise<string> {
    return this.elementAssertions.getElementProperty(
      this.groupByLabel(label).locator(".oxd-select-text-input"),
      "getDropdownValueByLabel",
      "textContent",
      `${label} dropdown`,
    ) as Promise<string>;
  }

  /**
   * Reads the current value of a text field by its label.
   * @param label - The visible label of the field.
   * @returns A promise that resolves with the field's input value.
   */
  public async getFieldValueByLabel(label: string): Promise<string> {
    return this.elementAssertions.getElementProperty(
      this.groupByLabel(label).getByRole("textbox"),
      "getFieldValueByLabel",
      "inputValue",
      `${label} field`,
    );
  }

  /**
   * Types into an autocomplete field and selects a matching suggestion.
   * @param label - The visible label of the autocomplete field.
   * @param typeText - The text to type to trigger suggestions.
   * @param optionText - The exact suggestion text to select.
   * @returns A promise that resolves when the suggestion has been selected.
   */
  public async selectAutocompleteOptionByLabel(
    label: string,
    typeText: string,
    optionText: string,
  ): Promise<void> {
    await this.elementActions.fillElement(
      this.groupByLabel(label).getByRole("textbox"),
      "selectAutocompleteOptionByLabel",
      typeText,
      `${label} autocomplete`,
    );
    await this.elementActions.clickElement(
      this.page.getByRole("option", { name: optionText }),
      "selectAutocompleteOptionByLabel",
      `${optionText} suggestion`,
    );
  }

  /**
   * Selects a radio option by its visible label text.
   * @param optionText - The exact label text of the radio option.
   * @returns A promise that resolves when the radio option has been selected.
   */
  public async checkRadioByLabel(optionText: string): Promise<void> {
    await this.elementActions.clickElement(
      this.page
        .locator(".oxd-radio-wrapper")
        .filter({ has: this.page.getByText(optionText, { exact: true }) }),
      "checkRadioByLabel",
      `${optionText} radio`,
    );
  }

  /**
   * Verifies that a radio option is selected.
   * @param optionText - The exact label text of the radio option.
   * @returns A promise that resolves when the checked-state assertion passes.
   */
  public async verifyRadioIsChecked(optionText: string): Promise<void> {
    await expect(
      this.page
        .locator(".oxd-radio-wrapper")
        .filter({ has: this.page.getByText(optionText, { exact: true }) })
        .getByRole("radio"),
    ).toBeChecked();
  }

  /**
   * Verifies that a text field holds the expected value.
   * @param label - The visible label of the field.
   * @param expectedValue - The value the field should contain.
   * @returns A promise that resolves when the field-value assertion passes.
   */
  public async verifyFieldValueByLabel(
    label: string,
    expectedValue: string,
  ): Promise<void> {
    await expect(this.groupByLabel(label).getByRole("textbox")).toHaveValue(
      expectedValue,
    );
  }

  /**
   * Verifies that an oxd dropdown shows the expected selected value.
   * @param label - The visible label of the dropdown.
   * @param expectedValue - The value the dropdown should display as selected.
   * @returns A promise that resolves when the dropdown-value assertion passes.
   */
  public async verifyDropdownValueByLabel(
    label: string,
    expectedValue: string,
  ): Promise<void> {
    await expect(this.groupByLabel(label).locator(".oxd-select-text-input")).toHaveText(
      expectedValue,
    );
  }
}

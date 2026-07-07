import type { Page } from "@playwright/test";
import { BasePage } from "../../../../base/basePage.js";
import type { OxdFormHelper } from "../../shared/components/oxdFormHelper.js";

/**
 * Base class for the employee profile tab pages (Contact Details, Job, Salary, etc.).
 *
 * Centralises the behaviour every profile tab shares: navigating to the tab via its left-hand
 * link, clicking Save, opening a section's Add form, and verifying a saved record appears in a
 * table. Concrete tab pages extend this and add their tab-specific fields and assertions.
 */
export class EmployeeProfileTabBase extends BasePage {
  protected readonly form: OxdFormHelper;

  /**
   * Creates a profile tab base bound to the page and the shared oxd form helper.
   * @param page - Active Playwright page instance.
   * @param form - Shared oxd form widget helper used to drive labelled fields.
   */
  constructor(page: Page, form: OxdFormHelper) {
    super(page);
    this.form = form;
  }

  /**
   * Opens a profile tab by clicking its navigation link and waiting for the tab URL.
   * @param tabName - The exact tab link text.
   * @param urlPattern - The URL pattern that confirms the tab has loaded.
   * @returns A promise that resolves once the tab URL is reached.
   */
  protected async openTab(tabName: string, urlPattern: RegExp): Promise<void> {
    await this.elementActions.clickElement(
      this.page.getByRole("link", { name: tabName, exact: true }),
      "openTab",
      `${tabName} tab`,
    );
    await this.navigation.waitForURL(urlPattern, "openTab");
  }

  /**
   * Clicks the Save button on the active form.
   * @returns A promise that resolves when the button has been clicked.
   */
  public async clickSave(): Promise<void> {
    await this.elementActions.clickElement(
      this.page.getByRole("button", { name: "Save" }),
      "clickSave",
      "Save button",
    );
  }

  /**
   * Opens an Add form. When a section heading is supplied the Add button is scoped to that
   * section (used on Qualifications, which has several sections); otherwise the first Add
   * button on the page is used.
   * @param sectionHeading - Optional section heading to scope the Add button to.
   * @returns A promise that resolves when the Add button has been clicked.
   */
  protected async clickAdd(sectionHeading?: string): Promise<void> {
    const addButton = sectionHeading
      ? this.page
          .locator(`.orangehrm-action-header:has(h6:text-is("${sectionHeading}"))`)
          .getByRole("button")
      : this.page.getByRole("button", { name: "Add" }).first();

    await this.elementActions.clickElement(addButton, "clickAdd", "Add button");
  }

  /**
   * Verifies that a success notification toast is displayed after a save.
   * @returns A promise that resolves when the success toast is visible.
   */
  public async verifySaveSuccessToast(): Promise<void> {
    await this.elementAssertions.verifyElementState(
      this.page.locator(".oxd-toast").filter({ hasText: "Success" }),
      "verifySaveSuccessToast",
      "visible",
      "success notification toast",
    );
  }

  /**
   * Verifies that a saved record appears in a results table by matching its unique cell text.
   * @param value - The unique text expected in the record's row.
   * @returns A promise that resolves when a row containing the value is visible.
   */
  public async verifyRecordInTable(value: string): Promise<void> {
    await this.elementAssertions.verifyElementState(
      this.page.getByRole("row").filter({ hasText: value }).first(),
      "verifyRecordInTable",
      "visible",
      `table row containing "${value}"`,
    );
  }
}

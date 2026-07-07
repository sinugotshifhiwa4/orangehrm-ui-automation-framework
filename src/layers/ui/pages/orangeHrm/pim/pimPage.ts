import { type Locator, type Page, expect } from "@playwright/test";
import { BasePage } from "../../../base/basePage.js";
import logger from "../../../../../configuration/logger/loggerManager.js";

/**
 * Page object for the PIM Employee Information screen: the employee search form and results table.
 */
export class PimPage extends BasePage {
  private readonly employeeInformationHeading: Locator;

  private readonly employeeNameInput: Locator;

  private readonly employeeIdInput: Locator;

  private readonly searchButton: Locator;

  private readonly resetButton: Locator;

  private readonly addEmployeeLink: Locator;

  private readonly noRecordsFoundText: Locator;

  private readonly tableRows: Locator;

  /**
   * Creates the PIM Employee Information page object and resolves its search and results locators.
   * @param page - Active Playwright page instance.
   */
  constructor(page: Page) {
    super(page);

    this.employeeInformationHeading = page.getByRole("heading", {
      name: "Employee Information",
    });
    this.employeeNameInput = page
      .locator(".oxd-input-group")
      .filter({ hasText: "Employee Name" })
      .getByRole("textbox");
    this.employeeIdInput = page
      .locator(".oxd-input-group")
      .filter({ hasText: "Employee Id" })
      .getByRole("textbox");
    this.searchButton = page.getByRole("button", { name: "Search" });
    this.resetButton = page.getByRole("button", { name: "Reset" });
    this.addEmployeeLink = page.getByRole("link", { name: "Add Employee" });
    this.noRecordsFoundText = page
      .locator("span.oxd-text--span")
      .filter({ hasText: "No Records Found" });
    this.tableRows = page.locator(".oxd-table-body").getByRole("row");
  }

  /**
   * Verifies that the Employee Information page heading is visible.
   * @returns A promise that resolves when the visibility check passes.
   */
  public async verifyEmployeeInformationPageIsLoaded(): Promise<void> {
    await this.elementAssertions.verifyElementState(
      this.employeeInformationHeading,
      "verifyEmployeeInformationPageIsLoaded",
      "visible",
      "Employee Information heading",
    );
  }

  /**
   * Fills the Employee Name search field.
   * @param employeeName - The employee name to search for.
   * @param fillOptions - Optional fill configuration; set allowEmpty to permit an empty value.
   * @returns A promise that resolves when the field has been filled.
   */
  public async fillEmployeeName(
    employeeName: string,
    fillOptions?: { allowEmpty?: boolean },
  ): Promise<void> {
    await this.elementActions.fillElement(
      this.employeeNameInput,
      "fillEmployeeName",
      employeeName,
      "Employee Name input",
      fillOptions,
    );
  }

  /**
   * Fills the Employee Id search field.
   * @param employeeId - The employee id to search for.
   * @param fillOptions - Optional fill configuration; set allowEmpty to permit an empty value.
   * @returns A promise that resolves when the field has been filled.
   */
  public async fillEmployeeId(
    employeeId: string,
    fillOptions?: { allowEmpty?: boolean },
  ): Promise<void> {
    await this.elementActions.fillElement(
      this.employeeIdInput,
      "fillEmployeeId",
      employeeId,
      "Employee Id input",
      fillOptions,
    );
  }

  /**
   * Clicks the Search button to execute the employee search.
   * @returns A promise that resolves when the button has been clicked.
   */
  public async clickSearch(): Promise<void> {
    await this.elementActions.clickElement(
      this.searchButton,
      "clickSearch",
      "Search button",
    );
  }

  /**
   * Clicks the Reset button to clear all search filters.
   * @returns A promise that resolves when the button has been clicked.
   */
  public async clickReset(): Promise<void> {
    await this.elementActions.clickElement(
      this.resetButton,
      "clickReset",
      "Reset button",
    );
  }

  /**
   * Searches for an employee by name and submits the search.
   * @param employeeName - The employee name to search for.
   * @returns A promise that resolves when the search has been submitted.
   */
  public async searchByEmployeeName(employeeName: string): Promise<void> {
    await this.fillEmployeeName(employeeName);
    await this.clickSearch();
  }

  /**
   * Searches for an employee by id and submits the search.
   * @param employeeId - The employee id to search for.
   * @returns A promise that resolves when the search has been submitted.
   */
  public async searchByEmployeeId(employeeId: string): Promise<void> {
    await this.fillEmployeeId(employeeId);
    await this.clickSearch();
  }

  /**
   * Navigates to the Add Employee form via the PIM top navigation link.
   * @returns A promise that resolves once the Add Employee page has loaded.
   */
  public async clickAddEmployee(): Promise<void> {
    await this.elementActions.clickElement(
      this.addEmployeeLink,
      "clickAddEmployee",
      "Add Employee link",
    );
    await this.navigation.waitForURL(/\/pim\/addEmployee/, "clickAddEmployee");
  }

  /**
   * Verifies that at least one matching employee record row is displayed in the results table.
   * @returns A promise that resolves when the first result row is visible.
   */
  public async verifyRecordsAreDisplayed(): Promise<void> {
    await this.elementAssertions.verifyElementState(
      this.tableRows.first(),
      "verifyRecordsAreDisplayed",
      "visible",
      "First employee result row",
    );
  }

  /**
   * Verifies that a specific employee appears in the results table by matching row text.
   * @param expectedText - The unique text (name or id) expected in a result row.
   * @returns A promise that resolves when exactly the matching row is visible.
   */
  public async verifyEmployeeIsInResults(expectedText: string): Promise<void> {
    const matchingRow = this.tableRows.filter({ hasText: expectedText });

    await this.elementAssertions.verifyElementState(
      matchingRow,
      "verifyEmployeeIsInResults",
      "visible",
      `Employee result row for "${expectedText}"`,
    );

    logger.info(`Verified: Employee "${expectedText}" is present in the search results`);
  }

  /**
   * Verifies that the "No Records Found" message is displayed when a search has no matches.
   * @returns A promise that resolves when the no-records message is visible.
   */
  public async verifyNoRecordsFound(): Promise<void> {
    await this.elementAssertions.verifyElementState(
      this.noRecordsFoundText,
      "verifyNoRecordsFound",
      "visible",
      "No Records Found message",
    );
  }

  /**
   * Verifies that the Employee Name and Employee Id search filters have been cleared.
   * @returns A promise that resolves when both fields are confirmed empty.
   */
  public async verifySearchFiltersAreCleared(): Promise<void> {
    await expect(this.employeeNameInput).toHaveValue("");
    await expect(this.employeeIdInput).toHaveValue("");

    logger.info("Verified: PIM search filters were cleared after reset");
  }
}

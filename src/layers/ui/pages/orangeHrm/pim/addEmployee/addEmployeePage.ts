import type { Locator, Page } from "@playwright/test";
import { BasePage } from "../../../../base/basePage.js";
import type { EmployeeData } from "../types/employee.types.js";
import logger from "../../../../../../configuration/logger/loggerManager.js";

/**
 * Page object for the PIM Add Employee form, including its mandatory-field validation.
 */
export class AddEmployeePage extends BasePage {
  private readonly addEmployeeHeading: Locator;

  private readonly firstNameInput: Locator;

  private readonly middleNameInput: Locator;

  private readonly lastNameInput: Locator;

  private readonly employeeIdInput: Locator;

  private readonly saveButton: Locator;

  private readonly requiredValidationMessages: Locator;

  /**
   * Creates the Add Employee page object and resolves its form and validation locators.
   * @param page - Active Playwright page instance.
   */
  constructor(page: Page) {
    super(page);

    this.addEmployeeHeading = page.getByRole("heading", { name: "Add Employee" });
    this.firstNameInput = page.getByRole("textbox", { name: "First Name" });
    this.middleNameInput = page.getByRole("textbox", { name: "Middle Name" });
    this.lastNameInput = page.getByRole("textbox", { name: "Last Name" });
    this.employeeIdInput = page
      .locator(".oxd-input-group")
      .filter({ hasText: "Employee Id" })
      .getByRole("textbox");
    this.saveButton = page.getByRole("button", { name: "Save" });
    this.requiredValidationMessages = page
      .locator(".oxd-input-field-error-message")
      .filter({ hasText: "Required" });
  }

  /**
   * Verifies that the Add Employee form heading is visible.
   * @returns A promise that resolves when the visibility check passes.
   */
  public async verifyAddEmployeePageIsLoaded(): Promise<void> {
    await this.elementAssertions.verifyElementState(
      this.addEmployeeHeading,
      "verifyAddEmployeePageIsLoaded",
      "visible",
      "Add Employee heading",
    );
  }

  /**
   * Fills the First Name field.
   * @param firstName - The first name to enter.
   * @param fillOptions - Optional fill configuration; set allowEmpty to permit an empty value.
   * @returns A promise that resolves when the field has been filled.
   */
  public async fillFirstName(
    firstName: string,
    fillOptions?: { allowEmpty?: boolean },
  ): Promise<void> {
    await this.elementActions.fillElement(
      this.firstNameInput,
      "fillFirstName",
      firstName,
      "First Name input",
      fillOptions,
    );
  }

  /**
   * Fills the Middle Name field.
   * @param middleName - The middle name to enter.
   * @param fillOptions - Optional fill configuration; set allowEmpty to permit an empty value.
   * @returns A promise that resolves when the field has been filled.
   */
  public async fillMiddleName(
    middleName: string,
    fillOptions?: { allowEmpty?: boolean },
  ): Promise<void> {
    await this.elementActions.fillElement(
      this.middleNameInput,
      "fillMiddleName",
      middleName,
      "Middle Name input",
      fillOptions,
    );
  }

  /**
   * Fills the Last Name field.
   * @param lastName - The last name to enter.
   * @param fillOptions - Optional fill configuration; set allowEmpty to permit an empty value.
   * @returns A promise that resolves when the field has been filled.
   */
  public async fillLastName(
    lastName: string,
    fillOptions?: { allowEmpty?: boolean },
  ): Promise<void> {
    await this.elementActions.fillElement(
      this.lastNameInput,
      "fillLastName",
      lastName,
      "Last Name input",
      fillOptions,
    );
  }

  /**
   * Fills the Employee Id field, replacing the auto-generated default value.
   * @param employeeId - The employee id to enter.
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
   * Clicks the Save button to submit the Add Employee form.
   * @returns A promise that resolves when the button has been clicked.
   */
  public async clickSave(): Promise<void> {
    await this.elementActions.clickElement(this.saveButton, "clickSave", "Save button");
  }

  /**
   * Fills the employee form with the provided data and saves the new employee.
   * Middle name and employee id are only filled when present in the data.
   * @param employee - The employee data to enter into the form.
   * @returns A promise that resolves once the form has been submitted.
   */
  public async addEmployee(employee: EmployeeData): Promise<void> {
    await this.verifyAddEmployeePageIsLoaded();
    await this.fillFirstName(employee.firstName);

    if (employee.middleName) {
      await this.fillMiddleName(employee.middleName);
    }

    await this.fillLastName(employee.lastName);

    if (employee.employeeId) {
      await this.fillEmployeeId(employee.employeeId);
    }

    await this.clickSave();
  }

  /**
   * Verifies that the mandatory-field "Required" validation messages are displayed.
   * @returns A promise that resolves when both required messages are confirmed visible.
   */
  public async verifyRequiredValidationMessagesAreVisible(): Promise<void> {
    await this.elementAssertions.verifyElementCount(
      this.requiredValidationMessages,
      "verifyRequiredValidationMessagesAreVisible",
      2,
      "Required validation messages",
    );

    logger.info(
      "Verified: Required validation messages are displayed for mandatory fields",
    );
  }

  /**
   * Verifies that the page remains on the Add Employee form, confirming creation was prevented.
   * @returns A promise that resolves when the Add Employee URL assertion passes.
   */
  public async verifyEmployeeCreationIsPrevented(): Promise<void> {
    await this.navigation.verifyPageUrl(
      /\/pim\/addEmployee/,
      "verifyEmployeeCreationIsPrevented",
    );

    logger.info("Verified: Employee creation was prevented; still on Add Employee page");
  }
}

import { type Locator, type Page, expect } from "@playwright/test";
import { BasePage } from "../../../../base/basePage.js";
import type { OxdFormHelper } from "../../shared/components/oxdFormHelper.js";
import type { EmployeeData } from "../types/employee.types.js";
import type { PersonalDetailsUpdateData } from "../employeeProfile/types/profile.types.js";
import logger from "../../../../../../configuration/logger/loggerManager.js";

/**
 * Captured Personal Details dropdown selections, kept so persistence can be verified after a reload.
 */
interface PersonalDetailsSelections {
  nationality: string;
  maritalStatus: string;
}

/**
 * Page object for the PIM Personal Details screen shown after an employee is created.
 */
export class PersonalDetailsPage extends BasePage {
  private readonly form: OxdFormHelper;

  private readonly personalDetailsHeading: Locator;

  private readonly firstNameInput: Locator;

  private readonly middleNameInput: Locator;

  private readonly lastNameInput: Locator;

  private readonly employeeIdInput: Locator;

  private readonly personalDetailsSaveButton: Locator;

  private readonly successToast: Locator;

  /**
   * Creates the Personal Details page object and resolves its heading and field locators.
   * @param page - Active Playwright page instance.
   * @param form - Shared oxd form widget helper used to drive labelled fields.
   */
  constructor(page: Page, form: OxdFormHelper) {
    super(page);

    this.form = form;
    this.personalDetailsHeading = page.getByRole("heading", { name: "Personal Details" });
    this.firstNameInput = page.getByRole("textbox", { name: "First Name" });
    this.middleNameInput = page.getByRole("textbox", { name: "Middle Name" });
    this.lastNameInput = page.getByRole("textbox", { name: "Last Name" });
    this.employeeIdInput = page
      .locator(".oxd-input-group")
      .filter({ hasText: "Employee Id" })
      .getByRole("textbox");
    this.personalDetailsSaveButton = page
      .locator("form")
      .filter({ has: page.getByText("Marital Status") })
      .getByRole("button", { name: "Save" });
    this.successToast = page.locator(".oxd-toast").filter({ hasText: "Success" });
  }

  /**
   * Verifies that the Personal Details page is displayed by checking the URL and heading.
   * @returns A promise that resolves when the URL and heading assertions pass.
   */
  public async verifyPersonalDetailsPageIsDisplayed(): Promise<void> {
    await this.navigation.waitForURL(
      /\/pim\/viewPersonalDetails\/empNumber\/\d+/,
      "verifyPersonalDetailsPageIsDisplayed",
    );

    await this.elementAssertions.verifyElementState(
      this.personalDetailsHeading,
      "verifyPersonalDetailsPageIsDisplayed",
      "visible",
      "Personal Details heading",
    );

    logger.info("Verified: Personal Details page is displayed after employee creation");
  }

  /**
   * Verifies that the saved employee details match the data that was entered.
   * The employee id is only verified when it was provided during creation.
   * @param employee - The employee data originally entered into the form.
   * @returns A promise that resolves when the field-value assertions pass.
   */
  public async verifySavedDetailsMatch(employee: EmployeeData): Promise<void> {
    await expect(this.firstNameInput).toHaveValue(employee.firstName);
    await expect(this.lastNameInput).toHaveValue(employee.lastName);

    if (employee.middleName) {
      await expect(this.middleNameInput).toHaveValue(employee.middleName);
    }

    if (employee.employeeId) {
      await expect(this.employeeIdInput).toHaveValue(employee.employeeId);
    }

    logger.info("Verified: Saved personal details match the entered employee data");
  }

  /**
   * Reads the persisted Employee Id value from the Personal Details form, waiting for the
   * field to be populated since it loads asynchronously after the page heading renders.
   * @returns A promise that resolves with the employee id shown on the page.
   */
  public async getEmployeeId(): Promise<string> {
    await expect(this.employeeIdInput).not.toHaveValue("");

    return this.elementAssertions.getElementProperty(
      this.employeeIdInput,
      "getEmployeeId",
      "inputValue",
      "Employee Id input",
    );
  }

  /**
   * Updates the editable Personal Details fields (ids, driver's licence, dates, nationality,
   * marital status, and gender) and saves the Personal Details form.
   * @param data - The personal details values to enter.
   * @returns A promise that resolves with the selected nationality and marital status values.
   */
  public async updatePersonalDetails(
    data: PersonalDetailsUpdateData,
  ): Promise<PersonalDetailsSelections> {
    await this.form.fillFieldByLabel("Other Id", data.otherId);
    await this.form.fillFieldByLabel("Driver's License Number", data.licenseNumber);
    await this.form.fillDateByLabel("License Expiry Date", data.licenseExpiryDate);
    await this.form.fillDateByLabel("Date of Birth", data.dateOfBirth);

    const selections: PersonalDetailsSelections = {
      nationality: await this.form.selectFirstDropdownOptionByLabel("Nationality"),
      maritalStatus: await this.form.selectFirstDropdownOptionByLabel("Marital Status"),
    };

    await this.form.checkRadioByLabel("Male");

    await this.elementActions.clickElement(
      this.personalDetailsSaveButton,
      "updatePersonalDetails",
      "Personal Details Save button",
    );

    return selections;
  }

  /**
   * Verifies that a success notification toast is displayed after saving.
   * @returns A promise that resolves when the success toast is visible.
   */
  public async verifySaveSuccessToast(): Promise<void> {
    await this.elementAssertions.verifyElementState(
      this.successToast,
      "verifySaveSuccessToast",
      "visible",
      "success notification toast",
    );

    logger.info("Verified: Successful save notification is displayed");
  }

  /**
   * Verifies the Personal Details persisted by reloading and checking field and dropdown values.
   * @param data - The personal details values that were saved.
   * @param selections - The nationality and marital status values that were selected.
   * @returns A promise that resolves once the persisted values are verified.
   */
  public async verifyPersonalDetailsPersist(
    data: PersonalDetailsUpdateData,
    selections: PersonalDetailsSelections,
  ): Promise<void> {
    await this.navigation.reloadPage("verifyPersonalDetailsPersist");

    await this.form.verifyFieldValueByLabel("Other Id", data.otherId);
    await this.form.verifyFieldValueByLabel(
      "Driver's License Number",
      data.licenseNumber,
    );
    await this.form.verifyDropdownValueByLabel("Nationality", selections.nationality);
    await this.form.verifyDropdownValueByLabel(
      "Marital Status",
      selections.maritalStatus,
    );
    await this.form.verifyRadioIsChecked("Male");

    logger.info("Verified: Personal details persisted after page refresh");
  }
}

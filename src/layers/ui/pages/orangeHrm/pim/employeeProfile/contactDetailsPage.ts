import { EmployeeProfileTabBase } from "./employeeProfileTabBase.js";
import type { ContactDetailsData } from "./types/profile.types.js";
import logger from "../../../../../../configuration/logger/loggerManager.js";

/**
 * Page object for the PIM Contact Details tab.
 */
export class ContactDetailsPage extends EmployeeProfileTabBase {
  /**
   * Navigates to the Contact Details tab.
   * @returns A promise that resolves once the Contact Details tab has loaded.
   */
  public async navigateToContactDetails(): Promise<void> {
    await this.openTab("Contact Details", /\/pim\/contactDetails\/empNumber\/\d+/);
  }

  /**
   * Populates all Contact Details fields and saves the form.
   * @param data - The contact details to enter.
   * @returns A promise that resolves once the form has been saved.
   */
  public async updateContactDetails(data: ContactDetailsData): Promise<void> {
    await this.form.fillFieldByLabel("Street 1", data.street1);
    await this.form.fillFieldByLabel("Street 2", data.street2);
    await this.form.fillFieldByLabel("City", data.city);
    await this.form.fillFieldByLabel("State/Province", data.state);
    await this.form.fillFieldByLabel("Zip/Postal Code", data.zip);
    await this.form.selectFirstDropdownOptionByLabel("Country");
    await this.form.fillFieldByLabel("Home", data.home);
    await this.form.fillFieldByLabel("Mobile", data.mobile);
    await this.form.fillFieldByLabel("Work", data.work);
    await this.form.fillFieldByLabel("Work Email", data.workEmail);
    await this.form.fillFieldByLabel("Other Email", data.otherEmail);
    await this.clickSave();
  }

  /**
   * Verifies that the contact details persisted by reloading the page and checking field values.
   * @param data - The contact details that were saved.
   * @returns A promise that resolves once the persisted values are verified.
   */
  public async verifyContactDetailsPersist(data: ContactDetailsData): Promise<void> {
    await this.navigation.reloadPage("verifyContactDetailsPersist");

    await this.form.verifyFieldValueByLabel("Street 1", data.street1);
    await this.form.verifyFieldValueByLabel("City", data.city);
    await this.form.verifyFieldValueByLabel("Mobile", data.mobile);
    await this.form.verifyFieldValueByLabel("Work Email", data.workEmail);

    logger.info("Verified: Contact details persisted after page refresh");
  }
}

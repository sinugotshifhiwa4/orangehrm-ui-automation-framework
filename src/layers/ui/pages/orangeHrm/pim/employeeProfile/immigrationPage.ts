import { EmployeeProfileTabBase } from "./employeeProfileTabBase.js";
import type { ImmigrationData } from "./types/profile.types.js";

/**
 * Page object for the PIM Immigration tab.
 */
export class ImmigrationPage extends EmployeeProfileTabBase {
  /**
   * Navigates to the Immigration tab.
   * @returns A promise that resolves once the Immigration tab has loaded.
   */
  public async navigateToImmigration(): Promise<void> {
    await this.openTab("Immigration", /\/pim\/viewImmigration\/empNumber\/\d+/);
  }

  /**
   * Adds a new passport immigration record and saves it.
   * @param data - The immigration record details to enter.
   * @returns A promise that resolves once the record has been saved.
   */
  public async addPassportRecord(data: ImmigrationData): Promise<void> {
    await this.clickAdd();
    await this.form.checkRadioByLabel("Passport");
    await this.form.fillFieldByLabel("Number", data.number);
    await this.form.fillDateByLabel("Issued Date", data.issuedDate);
    await this.form.fillDateByLabel("Expiry Date", data.expiryDate);
    await this.clickSave();
  }
}

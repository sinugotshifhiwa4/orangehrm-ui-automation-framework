import { EmployeeProfileTabBase } from "./employeeProfileTabBase.js";
import type { EmergencyContactData } from "./types/profile.types.js";

/**
 * Page object for the PIM Emergency Contacts tab.
 */
export class EmergencyContactsPage extends EmployeeProfileTabBase {
  /**
   * Navigates to the Emergency Contacts tab.
   * @returns A promise that resolves once the Emergency Contacts tab has loaded.
   */
  public async navigateToEmergencyContacts(): Promise<void> {
    await this.openTab(
      "Emergency Contacts",
      /\/pim\/viewEmergencyContacts\/empNumber\/\d+/,
    );
  }

  /**
   * Adds a new emergency contact and saves it.
   * @param data - The emergency contact details to enter.
   * @returns A promise that resolves once the contact has been saved.
   */
  public async addEmergencyContact(data: EmergencyContactData): Promise<void> {
    await this.clickAdd();
    await this.form.fillFieldByLabel("Name", data.name);
    await this.form.fillFieldByLabel("Relationship", data.relationship);
    await this.form.fillFieldByLabel("Mobile", data.mobile);
    await this.clickSave();
  }
}

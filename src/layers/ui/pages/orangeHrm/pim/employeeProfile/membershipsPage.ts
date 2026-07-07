import { EmployeeProfileTabBase } from "./employeeProfileTabBase.js";
import type { MembershipData } from "./types/profile.types.js";

/**
 * Page object for the PIM Memberships tab.
 */
export class MembershipsPage extends EmployeeProfileTabBase {
  /**
   * Navigates to the Memberships tab.
   * @returns A promise that resolves once the Memberships tab has loaded.
   */
  public async navigateToMemberships(): Promise<void> {
    await this.openTab("Memberships", /\/pim\/viewMemberships\/empNumber\/\d+/);
  }

  /**
   * Adds a membership record and saves it.
   * @param data - The membership details to enter.
   * @returns A promise that resolves with the selected membership name used to identify the record.
   */
  public async addMembership(data: MembershipData): Promise<string> {
    await this.clickAdd();
    const membership = await this.form.selectFirstDropdownOptionByLabel("Membership");
    await this.form.fillFieldByLabel("Subscription Amount", data.amount);
    await this.form.selectFirstDropdownOptionByLabel("Currency");
    await this.clickSave();

    return membership;
  }
}

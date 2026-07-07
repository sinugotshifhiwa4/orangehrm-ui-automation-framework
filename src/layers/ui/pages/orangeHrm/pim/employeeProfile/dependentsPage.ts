import { EmployeeProfileTabBase } from "./employeeProfileTabBase.js";
import type { DependentData } from "./types/profile.types.js";

/**
 * Page object for the PIM Dependents tab.
 */
export class DependentsPage extends EmployeeProfileTabBase {
  /**
   * Navigates to the Dependents tab.
   * @returns A promise that resolves once the Dependents tab has loaded.
   */
  public async navigateToDependents(): Promise<void> {
    await this.openTab("Dependents", /\/pim\/viewDependents\/empNumber\/\d+/);
  }

  /**
   * Adds a new dependent and saves it.
   * @param data - The dependent details to enter.
   * @returns A promise that resolves once the dependent has been saved.
   */
  public async addDependent(data: DependentData): Promise<void> {
    await this.clickAdd();
    await this.form.fillFieldByLabel("Name", data.name);
    await this.form.selectFirstDropdownOptionByLabel("Relationship");
    await this.form.fillDateByLabel("Date of Birth", data.dateOfBirth);
    await this.clickSave();
  }
}

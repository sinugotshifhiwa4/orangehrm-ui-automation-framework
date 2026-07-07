import { EmployeeProfileTabBase } from "./employeeProfileTabBase.js";
import type { SalaryData } from "./types/profile.types.js";

/**
 * Page object for the PIM Salary tab.
 */
export class SalaryPage extends EmployeeProfileTabBase {
  /**
   * Navigates to the Salary tab.
   * @returns A promise that resolves once the Salary tab has loaded.
   */
  public async navigateToSalary(): Promise<void> {
    await this.openTab("Salary", /\/pim\/viewSalaryList\/empNumber\/\d+/);
  }

  /**
   * Adds a new salary component and saves it.
   * @param data - The salary component details to enter.
   * @returns A promise that resolves once the component has been saved.
   */
  public async addSalaryComponent(data: SalaryData): Promise<void> {
    await this.clickAdd();
    await this.form.fillFieldByLabel("Salary Component", data.component);
    await this.form.selectFirstDropdownOptionByLabel("Currency");
    await this.form.fillFieldByLabel("Amount", data.amount);
    await this.clickSave();
  }
}

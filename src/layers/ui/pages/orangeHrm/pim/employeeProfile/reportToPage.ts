import { EmployeeProfileTabBase } from "./employeeProfileTabBase.js";

/**
 * Page object for the PIM Report-to tab.
 */
export class ReportToPage extends EmployeeProfileTabBase {
  /**
   * Navigates to the Report-to tab.
   * @returns A promise that resolves once the Report-to tab has loaded.
   */
  public async navigateToReportTo(): Promise<void> {
    await this.openTab("Report-to", /\/pim\/viewReportToDetails\/empNumber\/\d+/);
  }

  /**
   * Adds a supervisor by selecting an existing employee from the autocomplete and saves it.
   * @param supervisorName - The full name of the existing employee to add as supervisor.
   * @returns A promise that resolves once the supervisor has been saved.
   */
  public async addSupervisor(supervisorName: string): Promise<void> {
    await this.clickAdd();
    await this.form.selectAutocompleteOptionByLabel(
      "Name",
      supervisorName,
      supervisorName,
    );
    await this.form.selectFirstDropdownOptionByLabel("Reporting Method");
    await this.clickSave();
  }
}

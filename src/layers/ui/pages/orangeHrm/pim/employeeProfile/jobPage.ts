import { EmployeeProfileTabBase } from "./employeeProfileTabBase.js";
import logger from "../../../../../../configuration/logger/loggerManager.js";

/**
 * Captured Job tab selections, kept so persistence can be verified after a reload.
 */
interface JobSelections {
  jobTitle: string;
  jobCategory: string;
  subUnit: string;
  location: string;
  employmentStatus: string;
}

/**
 * Page object for the PIM Job tab.
 */
export class JobPage extends EmployeeProfileTabBase {
  /**
   * Navigates to the Job tab.
   * @returns A promise that resolves once the Job tab has loaded.
   */
  public async navigateToJob(): Promise<void> {
    await this.openTab("Job", /\/pim\/viewJobDetails\/empNumber\/\d+/);
  }

  /**
   * Sets the joined date and selects the first available option for every Job dropdown,
   * then saves the form.
   * @param joinedDate - The joined date to set (yyyy-dd-mm).
   * @returns A promise that resolves with the selected dropdown values for later verification.
   */
  public async updateJobDetails(joinedDate: string): Promise<JobSelections> {
    await this.form.fillDateByLabel("Joined Date", joinedDate);

    const selections: JobSelections = {
      jobTitle: await this.form.selectFirstDropdownOptionByLabel("Job Title"),
      jobCategory: await this.form.selectFirstDropdownOptionByLabel("Job Category"),
      subUnit: await this.form.selectFirstDropdownOptionByLabel("Sub Unit"),
      location: await this.form.selectFirstDropdownOptionByLabel("Location"),
      employmentStatus:
        await this.form.selectFirstDropdownOptionByLabel("Employment Status"),
    };

    await this.clickSave();

    return selections;
  }

  /**
   * Verifies the Job details persisted by reloading and checking each dropdown value.
   * @param selections - The dropdown values that were saved.
   * @returns A promise that resolves once the persisted values are verified.
   */
  public async verifyJobDetailsPersist(selections: JobSelections): Promise<void> {
    await this.navigation.reloadPage("verifyJobDetailsPersist");

    await this.form.verifyDropdownValueByLabel("Job Title", selections.jobTitle);
    await this.form.verifyDropdownValueByLabel("Job Category", selections.jobCategory);
    await this.form.verifyDropdownValueByLabel("Sub Unit", selections.subUnit);
    await this.form.verifyDropdownValueByLabel("Location", selections.location);
    await this.form.verifyDropdownValueByLabel(
      "Employment Status",
      selections.employmentStatus,
    );

    logger.info("Verified: Job details persisted after page refresh");
  }
}

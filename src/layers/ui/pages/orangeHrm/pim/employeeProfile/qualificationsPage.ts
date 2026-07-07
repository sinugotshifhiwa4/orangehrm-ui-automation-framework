import { EmployeeProfileTabBase } from "./employeeProfileTabBase.js";
import type {
  EducationData,
  LicenseData,
  WorkExperienceData,
} from "./types/profile.types.js";

/**
 * Page object for the PIM Qualifications tab, which hosts the Work Experience, Education,
 * Skills, Languages, and License sections.
 */
export class QualificationsPage extends EmployeeProfileTabBase {
  /**
   * Navigates to the Qualifications tab.
   * @returns A promise that resolves once the Qualifications tab has loaded.
   */
  public async navigateToQualifications(): Promise<void> {
    await this.openTab("Qualifications", /\/pim\/viewQualifications\/empNumber\/\d+/);
  }

  /**
   * Adds a work experience record and saves it.
   * @param data - The work experience details to enter.
   * @returns A promise that resolves with the company name used to identify the record.
   */
  public async addWorkExperience(data: WorkExperienceData): Promise<string> {
    await this.clickAdd("Work Experience");
    await this.form.fillFieldByLabel("Company", data.company);
    await this.form.fillFieldByLabel("Job Title", data.jobTitle);
    await this.form.fillDateByLabel("From", data.fromDate);
    await this.form.fillDateByLabel("To", data.toDate);
    await this.clickSave();

    return data.company;
  }

  /**
   * Adds an education record and saves it.
   * @param data - The education details to enter.
   * @returns A promise that resolves with the institute name used to identify the record.
   */
  public async addEducation(data: EducationData): Promise<string> {
    await this.clickAdd("Education");
    await this.form.selectFirstDropdownOptionByLabel("Level");
    await this.form.fillFieldByLabel("Institute", data.institute);
    await this.form.fillFieldByLabel("Major/Specialization", data.major);
    await this.form.fillFieldByLabel("Year", data.year);
    await this.clickSave();

    return data.institute;
  }

  /**
   * Adds a skill record and saves it.
   * @param yearsOfExperience - The years of experience to enter.
   * @returns A promise that resolves with the selected skill name used to identify the record.
   */
  public async addSkill(yearsOfExperience: string): Promise<string> {
    await this.clickAdd("Skills");
    const skill = await this.form.selectFirstDropdownOptionByLabel("Skill");
    await this.form.fillFieldByLabel("Years of Experience", yearsOfExperience);
    await this.clickSave();

    return skill;
  }

  /**
   * Adds a language record and saves it.
   * @returns A promise that resolves with the selected language name used to identify the record.
   */
  public async addLanguage(): Promise<string> {
    await this.clickAdd("Languages");
    const language = await this.form.selectFirstDropdownOptionByLabel("Language");
    await this.form.selectFirstDropdownOptionByLabel("Fluency");
    await this.form.selectFirstDropdownOptionByLabel("Competency");
    await this.clickSave();

    return language;
  }

  /**
   * Adds a license record and saves it.
   * @param data - The license details to enter.
   * @returns A promise that resolves with the license number used to identify the record.
   */
  public async addLicense(data: LicenseData): Promise<string> {
    await this.clickAdd("License");
    await this.form.selectFirstDropdownOptionByLabel("License Type");
    await this.form.fillFieldByLabel("License Number", data.number);
    await this.form.fillDateByLabel("Issued Date", data.issuedDate);
    await this.form.fillDateByLabel("Expiry Date", data.expiryDate);
    await this.clickSave();

    return data.number;
  }
}

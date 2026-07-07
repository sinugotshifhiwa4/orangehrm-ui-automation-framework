import { test } from "../../../../fixtures/test.ui.fixtures";
import EmployeeBuilder from "../../../../src/layers/ui/test-data/orangeHrm/pim/builders/employeeBuilder.js";
import ProfileDataBuilder from "../../../../src/layers/ui/test-data/orangeHrm/pim/builders/profileDataBuilder.js";
import logger from "../../../../src/configuration/logger/loggerManager.js";

test.describe("PIM | Employee Profile", { tag: ["@regression", "@pim"] }, () => {
  test.beforeEach(
    async ({ loginOrchestrator, sideBar, pimPage, addEmployeePage, personalDetailsPage }) => {
      await loginOrchestrator.navigateToPortal();
      await sideBar.navigateToPimModule();
      await pimPage.clickAddEmployee();
      await addEmployeePage.addEmployee(EmployeeBuilder.build());
      await personalDetailsPage.verifyPersonalDetailsPageIsDisplayed();
    },
  );

  test("Should update and persist all editable Personal Details fields", async ({
    personalDetailsPage,
  }) => {
    const data = ProfileDataBuilder.buildPersonalDetailsUpdate();

    const selections = await personalDetailsPage.updatePersonalDetails(data);
    await personalDetailsPage.verifySaveSuccessToast();
    await personalDetailsPage.verifyPersonalDetailsPersist(data, selections);

    logger.info("Assertion Passed: Personal Details were updated and persisted after refresh");
  });

  test("Should update and persist Contact Details", async ({ contactDetailsPage }) => {
    const data = ProfileDataBuilder.buildContactDetails();

    await contactDetailsPage.navigateToContactDetails();
    await contactDetailsPage.updateContactDetails(data);
    await contactDetailsPage.verifySaveSuccessToast();
    await contactDetailsPage.verifyContactDetailsPersist(data);

    logger.info("Assertion Passed: Contact Details were saved and persisted after refresh");
  });

  test("Should add an emergency contact and show it in the table", async ({
    emergencyContactsPage,
  }) => {
    const data = ProfileDataBuilder.buildEmergencyContact();

    await emergencyContactsPage.navigateToEmergencyContacts();
    await emergencyContactsPage.addEmergencyContact(data);
    await emergencyContactsPage.verifyRecordInTable(data.name);

    logger.info("Assertion Passed: Emergency contact was added and appears in the table");
  });

  test("Should add a dependent and show it in the table", async ({ dependentsPage }) => {
    const data = ProfileDataBuilder.buildDependent();

    await dependentsPage.navigateToDependents();
    await dependentsPage.addDependent(data);
    await dependentsPage.verifyRecordInTable(data.name);

    logger.info("Assertion Passed: Dependent was added and appears in the table");
  });

  test("Should add an immigration record and show it in the table", async ({ immigrationPage }) => {
    const data = ProfileDataBuilder.buildImmigration();

    await immigrationPage.navigateToImmigration();
    await immigrationPage.addPassportRecord(data);
    await immigrationPage.verifyRecordInTable(data.number);

    logger.info("Assertion Passed: Immigration record was added and appears in the table");
  });

  test("Should update and persist Job details", async ({ jobPage }) => {
    await jobPage.navigateToJob();
    const selections = await jobPage.updateJobDetails("2020-06-06");
    await jobPage.verifySaveSuccessToast();
    await jobPage.verifyJobDetailsPersist(selections);

    logger.info("Assertion Passed: Job details were saved and persisted after refresh");
  });

  test("Should add a salary component and show it in the table", async ({ salaryPage }) => {
    const data = ProfileDataBuilder.buildSalary();

    await salaryPage.navigateToSalary();
    await salaryPage.addSalaryComponent(data);
    await salaryPage.verifyRecordInTable(data.component);

    logger.info("Assertion Passed: Salary component was added and appears in the table");
  });

  test("Should add a supervisor on the Report-to tab", async ({
    page,
    pimPage,
    addEmployeePage,
    personalDetailsPage,
    reportToPage,
  }) => {
    const subjectUrl = page.url();
    const supervisor = EmployeeBuilder.build();
    const supervisorName = `${supervisor.firstName} ${supervisor.lastName}`;

    await pimPage.clickAddEmployee();
    await addEmployeePage.addEmployee(supervisor);
    await personalDetailsPage.verifyPersonalDetailsPageIsDisplayed();

    await page.goto(subjectUrl);
    await reportToPage.navigateToReportTo();
    await reportToPage.addSupervisor(supervisorName);
    await reportToPage.verifyRecordInTable(supervisor.lastName);

    logger.info("Assertion Passed: Supervisor was added and appears in the Report-to table");
  });

  test("Should add a work experience record and show it in the table", async ({
    qualificationsPage,
  }) => {
    const data = ProfileDataBuilder.buildWorkExperience();

    await qualificationsPage.navigateToQualifications();
    const company = await qualificationsPage.addWorkExperience(data);
    await qualificationsPage.verifyRecordInTable(company);

    logger.info("Assertion Passed: Work experience was added and appears in the table");
  });

  test("Should add an education record and show it in the table", async ({
    qualificationsPage,
  }) => {
    const data = ProfileDataBuilder.buildEducation();

    await qualificationsPage.navigateToQualifications();
    const institute = await qualificationsPage.addEducation(data);
    await qualificationsPage.verifyRecordInTable(institute);

    logger.info("Assertion Passed: Education record was added and appears in the table");
  });

  test("Should add a skill and show it in the table", async ({ qualificationsPage }) => {
    await qualificationsPage.navigateToQualifications();
    const skill = await qualificationsPage.addSkill("5");
    await qualificationsPage.verifyRecordInTable(skill);

    logger.info("Assertion Passed: Skill was added and appears in the table");
  });

  test("Should add a language and show it in the table", async ({ qualificationsPage }) => {
    await qualificationsPage.navigateToQualifications();
    const language = await qualificationsPage.addLanguage();
    await qualificationsPage.verifyRecordInTable(language);

    logger.info("Assertion Passed: Language was added and appears in the table");
  });

  test("Should add a license and show it in the table", async ({ qualificationsPage }) => {
    const data = ProfileDataBuilder.buildLicense();

    await qualificationsPage.navigateToQualifications();
    const licenseNumber = await qualificationsPage.addLicense(data);
    await qualificationsPage.verifyRecordInTable(licenseNumber);

    logger.info("Assertion Passed: License was added and appears in the table");
  });

  test("Should add a membership and show it in the table", async ({ membershipsPage }) => {
    const data = ProfileDataBuilder.buildMembership();

    await membershipsPage.navigateToMemberships();
    const membership = await membershipsPage.addMembership(data);
    await membershipsPage.verifyRecordInTable(membership);

    logger.info("Assertion Passed: Membership was added and appears in the table");
  });
});

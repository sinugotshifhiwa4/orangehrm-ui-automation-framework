import { test } from "../../../../fixtures/test.ui.fixtures";
import EmployeeBuilder from "../../../../src/layers/ui/test-data/orangeHrm/pim/builders/employeeBuilder.js";
import type { PimPage } from "../../../../src/layers/ui/pages/orangeHrm/pim/pimPage.js";
import type { AddEmployeePage } from "../../../../src/layers/ui/pages/orangeHrm/pim/addEmployee/addEmployeePage.js";
import type { PersonalDetailsPage } from "../../../../src/layers/ui/pages/orangeHrm/pim/personalDetails/personalDetailsPage.js";
import type { EmployeeData } from "../../../../src/layers/ui/pages/orangeHrm/pim/types/employee.types.js";
import logger from "../../../../src/configuration/logger/loggerManager.js";

/**
 * Creates an employee through the Add Employee form and confirms the Personal Details page loads.
 * Shared across tests that need a pre-existing employee to search for.
 * @param pimPage - The PIM Employee Information page object.
 * @param addEmployeePage - The Add Employee page object.
 * @param personalDetailsPage - The Personal Details page object.
 * @param employee - The employee data to create.
 * @returns A promise that resolves once the employee has been created and Personal Details is shown.
 */
async function createEmployee(
  pimPage: PimPage,
  addEmployeePage: AddEmployeePage,
  personalDetailsPage: PersonalDetailsPage,
  employee: EmployeeData,
): Promise<void> {
  await pimPage.clickAddEmployee();
  await addEmployeePage.addEmployee(employee);
  await personalDetailsPage.verifyPersonalDetailsPageIsDisplayed();
}

test.describe("PIM | Employee Information", { tag: ["@regression", "@pim"] }, () => {
  test.beforeEach(async ({ loginOrchestrator, sideBar }) => {
    await loginOrchestrator.navigateToPortal();
    await sideBar.navigateToPimModule();
  });

  test("Should return the matching record when searching by employee name", async ({
    pimPage,
    addEmployeePage,
    personalDetailsPage,
    sideBar,
  }) => {
    const employee = EmployeeBuilder.build();

    await createEmployee(pimPage, addEmployeePage, personalDetailsPage, employee);
    await sideBar.navigateToPimModule();

    await pimPage.searchByEmployeeName(`${employee.firstName} ${employee.lastName}`);
    await pimPage.verifyRecordsAreDisplayed();
    await pimPage.verifyEmployeeIsInResults(employee.lastName);

    logger.info(
      "Assertion Passed: Employee Information search by employee name returns the expected record",
    );
  });

  test("Should return the correct record when searching by Employee Id", async ({
    pimPage,
    addEmployeePage,
    personalDetailsPage,
    sideBar,
  }) => {
    const employee = EmployeeBuilder.build();

    await createEmployee(pimPage, addEmployeePage, personalDetailsPage, employee);
    await sideBar.navigateToPimModule();

    await pimPage.searchByEmployeeId(employee.employeeId!);
    await pimPage.verifyRecordsAreDisplayed();
    await pimPage.verifyEmployeeIsInResults(employee.employeeId!);

    logger.info(
      "Assertion Passed: Employee Information search by Employee Id returns the correct record",
    );
  });

  test("Should display No Records Found when searching with non-existing data", async ({
    pimPage,
  }) => {
    const nonExistingEmployeeId = "ZZ9999999";

    await pimPage.searchByEmployeeId(nonExistingEmployeeId);
    await pimPage.verifyNoRecordsFound();

    logger.info(
      "Assertion Passed: Searching with non-existing data displays the No Records Found message",
    );
  });

  test("Should clear all search filters when Reset is clicked", async ({ pimPage }) => {
    await pimPage.fillEmployeeName("Filter Probe");
    await pimPage.fillEmployeeId("123456789");
    await pimPage.clickSearch();

    await pimPage.clickReset();
    await pimPage.verifySearchFiltersAreCleared();

    logger.info(
      "Assertion Passed: Reset clears all PIM search filters and restores default values",
    );
  });

  test("Should create an employee when only mandatory fields are provided", async ({
    pimPage,
    addEmployeePage,
    personalDetailsPage,
  }) => {
    const employee = EmployeeBuilder.buildMandatory();

    await pimPage.clickAddEmployee();
    await addEmployeePage.addEmployee(employee);

    await personalDetailsPage.verifyPersonalDetailsPageIsDisplayed();
    await personalDetailsPage.verifySavedDetailsMatch(employee);

    logger.info(
      "Assertion Passed: Employee created with mandatory fields and saved details match the entered data",
    );
  });

  test("Should find the newly created employee when searching by the captured Employee Id", async ({
    pimPage,
    addEmployeePage,
    personalDetailsPage,
    sideBar,
  }) => {
    const employee = EmployeeBuilder.build();

    await createEmployee(pimPage, addEmployeePage, personalDetailsPage, employee);
    const capturedEmployeeId = await personalDetailsPage.getEmployeeId();

    await sideBar.navigateToPimModule();
    await pimPage.searchByEmployeeId(capturedEmployeeId);
    await pimPage.verifyRecordsAreDisplayed();
    await pimPage.verifyEmployeeIsInResults(capturedEmployeeId);

    logger.info(
      "Assertion Passed: Newly created employee is returned when searching by the captured Employee Id",
    );
  });

  test("Should display validation messages and prevent creation when mandatory fields are empty", async ({
    pimPage,
    addEmployeePage,
  }) => {
    await pimPage.clickAddEmployee();
    await addEmployeePage.verifyAddEmployeePageIsLoaded();
    await addEmployeePage.clickSave();

    await addEmployeePage.verifyRequiredValidationMessagesAreVisible();
    await addEmployeePage.verifyEmployeeCreationIsPrevented();

    logger.info(
      "Assertion Passed: Validation messages are shown and employee creation is prevented without mandatory fields",
    );
  });

  test("Should find the employee in search results after creation", async ({
    pimPage,
    addEmployeePage,
    personalDetailsPage,
    sideBar,
  }) => {
    const employee = EmployeeBuilder.build();

    await createEmployee(pimPage, addEmployeePage, personalDetailsPage, employee);

    await sideBar.navigateToPimModule();
    await pimPage.verifyEmployeeInformationPageIsLoaded();
    await pimPage.searchByEmployeeName(`${employee.firstName} ${employee.lastName}`);
    await pimPage.verifyEmployeeIsInResults(employee.lastName);

    logger.info("Assertion Passed: Employee can be searched and found in results after creation");
  });
});

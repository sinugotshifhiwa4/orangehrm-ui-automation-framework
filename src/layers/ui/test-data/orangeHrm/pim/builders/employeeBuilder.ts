import { faker } from "@faker-js/faker";
import type { EmployeeData } from "../../../../pages/orangeHrm/pim/types/employee.types.js";

/**
 * Generates unique employee test data for the PIM module using Faker.
 *
 * A shared random alphabetic suffix is appended to the first and last name so the
 * full-name pair is unique across the shared demo data, keeping searches deterministic.
 */
export default class EmployeeBuilder {
  /**
   * Builds a full employee record with first name, middle name, last name, and a unique employee id.
   * @param overrides - Optional field values that replace the generated defaults.
   * @returns An employee data object populated with unique, Faker-generated values.
   */
  public static build(overrides: Partial<EmployeeData> = {}): EmployeeData {
    const uniqueSuffix = faker.string.alpha({ length: 6, casing: "mixed" });

    return {
      firstName: `${faker.person.firstName()}${uniqueSuffix}`,
      middleName: faker.person.middleName(),
      lastName: `${faker.person.lastName()}${uniqueSuffix}`,
      employeeId: EmployeeBuilder.generateEmployeeId(),
      ...overrides,
    };
  }

  /**
   * Builds an employee record with the mandatory first and last name fields plus a unique
   * employee id, so each created employee avoids the "Employee Id already exists" collision.
   * @param overrides - Optional field values that replace the generated defaults.
   * @returns An employee data object with the mandatory fields and a unique employee id.
   */
  public static buildMandatory(overrides: Partial<EmployeeData> = {}): EmployeeData {
    const uniqueSuffix = faker.string.alpha({ length: 6, casing: "mixed" });

    return {
      firstName: `${faker.person.firstName()}${uniqueSuffix}`,
      lastName: `${faker.person.lastName()}${uniqueSuffix}`,
      employeeId: EmployeeBuilder.generateEmployeeId(),
      ...overrides,
    };
  }

  /**
   * Generates a unique nine-digit employee id derived from the current timestamp and a random digit.
   * @returns A nine-character numeric employee id string.
   */
  private static generateEmployeeId(): string {
    const timestampPart = String(Date.now()).slice(-8);
    const randomDigit = faker.string.numeric(1);

    return `${timestampPart}${randomDigit}`;
  }
}

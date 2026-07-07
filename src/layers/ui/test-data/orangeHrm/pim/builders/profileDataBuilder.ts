import { faker } from "@faker-js/faker";
import type {
  ContactDetailsData,
  DependentData,
  EducationData,
  EmergencyContactData,
  ImmigrationData,
  LicenseData,
  MembershipData,
  PersonalDetailsUpdateData,
  SalaryData,
  WorkExperienceData,
} from "../../../../pages/orangeHrm/pim/employeeProfile/types/profile.types.js";

/**
 * Generates test data for the employee profile tabs (Personal Details updates, Contact Details,
 * and the various add-record forms) using Faker.
 *
 * OrangeHRM date inputs use a yyyy-dd-mm mask, so all generated dates use an identical day and
 * month component to stay unambiguous regardless of how the mask is interpreted.
 */
export default class ProfileDataBuilder {
  /**
   * Builds a date string whose day and month components are identical to avoid mask ambiguity.
   * @param year - The four-digit year to use.
   * @param dayMonth - The value (1-12) used for both the day and month components.
   * @returns A date string in yyyy-dd-mm form with matching day and month.
   */
  private static safeDate(year: number, dayMonth: number): string {
    const padded = String(dayMonth).padStart(2, "0");
    return `${year}-${padded}-${padded}`;
  }

  /**
   * Builds editable Personal Details update values.
   * @returns A personal details update data object.
   */
  public static buildPersonalDetailsUpdate(): PersonalDetailsUpdateData {
    return {
      otherId: faker.string.numeric(6),
      licenseNumber: faker.string.alphanumeric(8).toUpperCase(),
      licenseExpiryDate: ProfileDataBuilder.safeDate(2030, 6),
      dateOfBirth: ProfileDataBuilder.safeDate(1990, 5),
    };
  }

  /**
   * Builds Contact Details values.
   * @returns A contact details data object.
   */
  public static buildContactDetails(): ContactDetailsData {
    return {
      street1: faker.location.streetAddress(),
      street2: faker.location.secondaryAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zip: faker.string.numeric(5),
      home: faker.string.numeric(10),
      mobile: faker.string.numeric(10),
      work: faker.string.numeric(10),
      workEmail: faker.internet.email().toLowerCase(),
      otherEmail: faker.internet.email().toLowerCase(),
    };
  }

  /**
   * Builds an emergency contact record.
   * @returns An emergency contact data object.
   */
  public static buildEmergencyContact(): EmergencyContactData {
    return {
      name: `${faker.person.firstName()} ${faker.person.lastName()}`,
      relationship: faker.person.jobType(),
      mobile: faker.string.numeric(10),
    };
  }

  /**
   * Builds a dependent record.
   * @returns A dependent data object.
   */
  public static buildDependent(): DependentData {
    return {
      name: `${faker.person.firstName()} ${faker.person.lastName()}`,
      dateOfBirth: ProfileDataBuilder.safeDate(2015, 4),
    };
  }

  /**
   * Builds an immigration (passport) record.
   * @returns An immigration data object.
   */
  public static buildImmigration(): ImmigrationData {
    return {
      number: `P${faker.string.numeric(8)}`,
      issuedDate: ProfileDataBuilder.safeDate(2020, 3),
      expiryDate: ProfileDataBuilder.safeDate(2031, 3),
    };
  }

  /**
   * Builds a salary component record.
   * @returns A salary data object.
   */
  public static buildSalary(): SalaryData {
    return {
      component: `Component ${faker.string.alpha(5)}`,
      amount: faker.string.numeric(5),
    };
  }

  /**
   * Builds a work experience record.
   * @returns A work experience data object.
   */
  public static buildWorkExperience(): WorkExperienceData {
    return {
      company: `${faker.company.name()} ${faker.string.alpha(4)}`,
      jobTitle: faker.person.jobTitle(),
      fromDate: ProfileDataBuilder.safeDate(2015, 1),
      toDate: ProfileDataBuilder.safeDate(2018, 12),
    };
  }

  /**
   * Builds an education record.
   * @returns An education data object.
   */
  public static buildEducation(): EducationData {
    return {
      institute: `${faker.company.name()} Institute ${faker.string.alpha(4)}`,
      major: faker.person.jobArea(),
      year: String(faker.number.int({ min: 2000, max: 2020 })),
    };
  }

  /**
   * Builds a license record.
   * @returns A license data object.
   */
  public static buildLicense(): LicenseData {
    return {
      number: `LIC-${faker.string.alphanumeric(6).toUpperCase()}`,
      issuedDate: ProfileDataBuilder.safeDate(2019, 2),
      expiryDate: ProfileDataBuilder.safeDate(2032, 2),
    };
  }

  /**
   * Builds a membership record.
   * @returns A membership data object.
   */
  public static buildMembership(): MembershipData {
    return {
      amount: faker.string.numeric(4),
    };
  }
}

/**
 * Editable subset of Personal Details fields updated by the profile tests.
 */
export interface PersonalDetailsUpdateData {
  otherId: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  dateOfBirth: string;
}

/**
 * Contact Details fields.
 */
export interface ContactDetailsData {
  street1: string;
  street2: string;
  city: string;
  state: string;
  zip: string;
  home: string;
  mobile: string;
  work: string;
  workEmail: string;
  otherEmail: string;
}

/**
 * Emergency contact record fields.
 */
export interface EmergencyContactData {
  name: string;
  relationship: string;
  mobile: string;
}

/**
 * Dependent record text fields (the relationship dropdown is selected at runtime).
 */
export interface DependentData {
  name: string;
  dateOfBirth: string;
}

/**
 * Immigration record fields for a passport entry.
 */
export interface ImmigrationData {
  number: string;
  issuedDate: string;
  expiryDate: string;
}

/**
 * Salary component record fields (currency dropdown is selected at runtime).
 */
export interface SalaryData {
  component: string;
  amount: string;
}

/**
 * Work experience record fields.
 */
export interface WorkExperienceData {
  company: string;
  jobTitle: string;
  fromDate: string;
  toDate: string;
}

/**
 * Education record text fields (the level dropdown is selected at runtime).
 */
export interface EducationData {
  institute: string;
  major: string;
  year: string;
}

/**
 * License record fields (the license type dropdown is selected at runtime).
 */
export interface LicenseData {
  number: string;
  issuedDate: string;
  expiryDate: string;
}

/**
 * Membership record fields (membership and currency dropdowns are selected at runtime).
 */
export interface MembershipData {
  amount: string;
}

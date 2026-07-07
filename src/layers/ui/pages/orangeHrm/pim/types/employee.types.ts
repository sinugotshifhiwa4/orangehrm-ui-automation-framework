/**
 * Represents the data used to create and verify a PIM employee record.
 * First and last name are mandatory; middle name and employee id are optional.
 */
export interface EmployeeData {
  firstName: string;
  lastName: string;
  middleName?: string;
  employeeId?: string;
}

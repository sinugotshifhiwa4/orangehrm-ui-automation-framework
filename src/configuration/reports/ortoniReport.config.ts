import type { OrtoniReportConfig } from "ortoni-report";
import * as os from "os";
import DateFormatter from "../../utils/shared/dateFormatter.js";

export const reportConfig: OrtoniReportConfig = {
  open: process.env.CI ? "never" : "always",
  folderPath: "ortoni-report",
  filename: "index.html",
  title: "Orange HRM Automation Report",
  projectName: "OrangeHRM",
  testType: process.env.TEST_TAGS ?? "Functional",
  authorName: os.userInfo().username,
  base64Image: false,
  stdIO: false,
  meta: {
    "Test Cycle": DateFormatter.formatMonthYear(),
    version: "1.0.0",
    platform: os.type(),
  },
};

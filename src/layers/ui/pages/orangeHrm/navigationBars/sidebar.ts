import type { Page, Locator } from "@playwright/test";
import { BasePage } from "../../../base/basePage.js";

/**
 * Page object for the OrangeHRM left-hand sidebar navigation menu.
 */
export class SideBar extends BasePage {
  private readonly dashboardMenuItemLink: Locator;

  private readonly pimMenuItemLink: Locator;

  /**
   * Creates the sidebar page object.
   * @param page - Active Playwright page instance.
   */
  constructor(page: Page) {
    super(page);

    this.dashboardMenuItemLink = page.getByRole("link", { name: "Dashboard" });
    this.pimMenuItemLink = page.getByRole("link", { name: "PIM" });
  }

  /**
   * Verifies that the Dashboard menu item link is visible in the sidebar.
   * @returns A promise that resolves when the visibility check passes.
   */
  public async verifyDashboardMenuLinkIsVisible(): Promise<void> {
    await this.elementAssertions.verifyElementState(
      this.dashboardMenuItemLink,
      "verifyDashboardMenuLinkIsVisible",
      "visible",
      "Dashboard menu item",
    );
  }

  /**
   * Navigates to the PIM module by clicking its sidebar menu link and waiting for the
   * Employee Information (Employee List) page to load.
   * @returns A promise that resolves once the Employee List page URL is reached.
   */
  public async navigateToPimModule(): Promise<void> {
    await this.elementActions.clickElement(
      this.pimMenuItemLink,
      "navigateToPimModule",
      "PIM menu item",
    );
    await this.navigation.waitForURL(/\/pim\/viewEmployeeList/, "navigateToPimModule");
  }
}

import type { Page, Locator } from "@playwright/test";
import { BasePage } from "../../../base/basePage.js";

/**
 * Page object for the OrangeHRM left-hand sidebar navigation menu.
 */
export class SideBar extends BasePage {
  private readonly dashboardMenuItemLink: Locator;

  /**
   * Creates the sidebar page object.
   * @param page - Active Playwright page instance.
   */
  constructor(page: Page) {
    super(page);

    this.dashboardMenuItemLink = page.getByRole("link", { name: "Dashboard" });
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
}

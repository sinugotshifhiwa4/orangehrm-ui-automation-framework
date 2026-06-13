import type { Page, Locator } from "@playwright/test";
import { BasePage } from "../../../base/basePage.js";

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

  public async verifyDashboardMenuLinkIsVisible(): Promise<void> {
    await this.elementAssertions.verifyElementState(
      this.dashboardMenuItemLink,
      "verifyDashboardMenuLinkIsVisible",
      "visible",
      "Dashboard menu item",
    );
  }
}

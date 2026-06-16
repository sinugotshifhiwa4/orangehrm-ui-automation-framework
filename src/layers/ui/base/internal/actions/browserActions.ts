import type { Page, Locator, Cookie, TestInfo, Response } from "@playwright/test";
import { ActionBase } from "./actionBase.js";
import ErrorHandler from "../../../../../utils/errorHandling/errorHandler.js";
import logger from "../../../../../configuration/logger/loggerManager.js";

/**
 * Browser- and context-level actions: tabs, dialogs, cookies, scrolling, and screenshots.
 */
export class BrowserActions extends ActionBase {
  /**
   * Creates browser-level action helpers for the active page context.
   * @param page - Active Playwright page instance.
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Reloads the current page.
   * @param callerMethodName - The name of the method that called this function.
   * @returns A promise that resolves with the navigation response, or null.
   */
  public refreshPage(callerMethodName: string): Promise<Response | null> {
    return this.performAction(
      () => this.page.reload(),
      callerMethodName,
      "Page refreshed successfully",
      "Failed to refresh page",
    );
  }

  /**
   * Switches focus to the tab at the specified index.
   * @param index - The index of the tab to switch to.
   * @param callerMethodName - The name of the method that called this function.
   * @returns A promise that resolves when the tab is brought to front, or throws if the index does not exist.
   */
  public async switchTab(index: number, callerMethodName: string): Promise<void> {
    await this.performAction(
      async () => {
        const pages = this.page.context().pages();
        if (index >= pages.length) {
          throw new Error(
            `Tab index ${index} does not exist. Total tabs: ${pages.length}`,
          );
        }
        await pages[index]?.bringToFront();
      },
      callerMethodName,
      `Switched to tab index ${index}`,
      `Failed to switch to tab index ${index}`,
    );
  }

  /**
   * Closes the current tab.
   * @param callerMethodName - The name of the method that called this function.
   * @returns A promise that resolves when the tab has been closed.
   */
  public async closeTab(callerMethodName: string): Promise<void> {
    await this.performAction(
      () => this.page.close(),
      callerMethodName,
      "Current tab closed",
      "Failed to close current tab",
    );
  }

  /**
   * Handles the next JavaScript alert/confirm/prompt dialog raised by the page.
   * @param callerMethodName - The name of the method that called this function.
   * @param action - Action to take: "accept" or "dismiss".
   * @param promptText - Text to enter for prompt dialogs (only used for prompt type).
   * @returns A promise that resolves once the dialog has been handled.
   */
  public handleDialog(
    callerMethodName: string,
    action: "accept" | "dismiss",
    promptText?: string,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.page.once("dialog", async (dialog) => {
        try {
          if (action === "accept") {
            if (dialog.type() === "prompt" && promptText !== undefined) {
              await dialog.accept(promptText);
            } else {
              await dialog.accept();
            }
          } else {
            await dialog.dismiss();
          }
          logger.info(
            `Dialog ${action}ed: ${dialog.type()}${promptText ? ` with text: "${promptText}"` : ""}`,
          );
          resolve();
        } catch (error) {
          ErrorHandler.captureError(error, callerMethodName, `Failed to handle dialog`);
          reject(error instanceof Error ? error : new Error("Failed to handle dialog"));
        }
      });
    });
  }

  /**
   * Gets all cookies from the current browser context.
   * @param callerMethodName - The name of the method that called this function.
   * @returns A promise that resolves with the array of cookies.
   */
  public async getCookies(callerMethodName: string): Promise<Cookie[]> {
    return this.performAction(
      () => this.page.context().cookies(),
      callerMethodName,
      `Retrieved all cookies`,
      `Failed to get cookies`,
    );
  }

  /**
   * Adds a cookie to the current browser context.
   * @param callerMethodName - The name of the method that called this function.
   * @param cookie - The cookie object to add.
   * @returns A promise that resolves when the cookie has been added.
   */
  public async addCookie(callerMethodName: string, cookie: Cookie): Promise<void> {
    await this.performAction(
      () => this.page.context().addCookies([cookie]),
      callerMethodName,
      `Cookie added: ${cookie.name}`,
      `Failed to add cookie: ${cookie.name}`,
    );
  }

  /**
   * Clears all cookies from the current browser context.
   * @param callerMethodName - The name of the method that called this function.
   * @returns A promise that resolves when all cookies have been cleared.
   */
  public async clearCookies(callerMethodName: string): Promise<void> {
    await this.performAction(
      () => this.page.context().clearCookies(),
      callerMethodName,
      `All cookies cleared`,
      `Failed to clear cookies`,
    );
  }

  /**
   * Scrolls an element into view if it is not already visible.
   * @param element - The element locator to scroll into view.
   * @param callerMethodName - The name of the method that called this function.
   * @param elementName - The name of the element being scrolled into view.
   * @returns A promise that resolves with the result of the scroll action if it succeeds, or rejects with the error if it fails.
   */
  public async scrollElementIntoView(
    element: Locator,
    callerMethodName: string,
    elementName: string,
  ): Promise<void> {
    await this.performAction(
      () => element.scrollIntoViewIfNeeded(),
      callerMethodName,
      `${elementName} scrolled into view`,
      `Failed to scroll ${elementName} into view`,
    );
  }

  /**
   * Scrolls the page to specific coordinates.
   * @param callerMethodName - The name of the method that called this function.
   * @param x - The X coordinate to scroll to.
   * @param y - The Y coordinate to scroll to.
   * @returns A promise that resolves when the page has scrolled.
   */
  public async scrollTo(callerMethodName: string, x: number, y: number): Promise<void> {
    await this.performAction(
      () => this.page.evaluate(({ x, y }) => window.scrollTo(x, y), { x, y }),
      callerMethodName,
      `Scrolled to coordinates (${x}, ${y})`,
      `Failed to scroll to coordinates (${x}, ${y})`,
    );
  }

  /**
   * Attaches a screenshot to the test report (Playwright HTML report).
   * @param fileName - The name to show in the report.
   * @param testInfo - The Playwright testInfo object.
   * @param page - Optional page to capture (defaults to `this.page`).
   * @returns A promise that resolves once the screenshot is attached.
   */
  public async attachScreenshotToReport(
    fileName: string,
    testInfo: TestInfo,
    page: Page = this.page,
  ): Promise<void> {
    await testInfo.attach(fileName, {
      body: await page.screenshot(),
      contentType: "image/png",
    });
  }
}

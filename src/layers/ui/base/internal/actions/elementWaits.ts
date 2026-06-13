import { type Page, type Locator, expect } from "@playwright/test";
import { ActionBase } from "./actionBase.js";
import type { WaitForElementState } from "../types/actions.type.js";
import {
  UI_DEFAULT_TIMEOUT,
  UI_POLL_INTERVAL_TIMEOUT,
  UI_SHORT_TIMEOUT,
} from "../../../../../configuration/timeouts/ui.timeouts.js";
import ErrorHandler from "../../../../../utils/errorHandling/errorHandler.js";

export class ElementWaits extends ActionBase {
  /**
   * Creates element wait helpers for the active page.
   * @param page - Active Playwright page instance.
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Waits for an element to be in a specified state.
   * @param element The Locator of the element to wait for.
   * @param callerMethodName The name of the method that called the action.
   * @param state The desired state: "attached", "detached", "visible", or "hidden".
   * @param elementName The name of the element.
   * @param options Optional: timeout for the wait action.
   * @returns A promise that resolves when the element reaches the state, or rejects if it fails.
   */
  public async waitForElementState(
    element: Locator,
    callerMethodName: string,
    state: WaitForElementState,
    elementName: string,
    options?: { timeout?: number },
  ): Promise<void> {
    await this.performAction(
      async () => {
        await element.waitFor({
          state,
          ...(options?.timeout !== undefined && { timeout: options.timeout }),
        });
      },
      callerMethodName,
      `${elementName} is ${state}`,
      `Failed waiting for element ${elementName} to be ${state}`,
    );
  }

  /**
   * Checks if an element reaches a specified state within the timeout period.
   * @param element The Locator of the element to wait for.
   * @param callerMethodName The name of the method that called the action.
   * @param state The desired state: "attached", "detached", "visible", or "hidden".
   * @param elementName The name of the element.
   * @param options Optional: timeout for the wait action.
   * @returns A promise that resolves with true if the state is reached, or false if it times out.
   */
  public async isElementStateReached(
    element: Locator,
    callerMethodName: string,
    state: WaitForElementState,
    elementName: string,
    options?: { timeout?: number },
  ): Promise<boolean> {
    try {
      await this.performAction(
        async () => {
          await element.waitFor({
            state,
            ...(options?.timeout !== undefined && { timeout: options.timeout }),
          });
        },
        callerMethodName,
        `${elementName} is ${state}`,
        `Failed waiting for element ${elementName} to be ${state}`,
      );

      return true;
    } catch (error) {
      ErrorHandler.captureError(
        error,
        callerMethodName,
        `waitForElementState failed for ${elementName}`,
      );
      return false;
    }
  }

  /**
   * Waits for an element to stabilize with a specific keyword.
   * Uses expect-poll to continuously check the input value until it matches
   * the keyword four times in a row. Useful for dynamically updated fields.
   * @param element The Locator of the element to wait for.
   * @param callerMethodName The name of the method that called this function.
   * @param keyword The keyword to wait for.
   * @param elementName The name of the element.
   * @returns A promise that resolves when the element stabilizes, or rejects if it fails.
   */
  public async waitForUIToStabilize(
    element: Locator,
    callerMethodName: string,
    keyword: string,
    elementName: string,
  ): Promise<void> {
    await this.performAction(
      async () => {
        let stableCount = 0;

        await expect
          .poll(
            async () => {
              const value = await element.inputValue();

              if (value === keyword) {
                stableCount++;
              } else {
                stableCount = 0;
              }

              return stableCount;
            },
            {
              timeout: UI_DEFAULT_TIMEOUT,
              intervals: [300, 500, UI_POLL_INTERVAL_TIMEOUT],
            },
          )
          .toBeGreaterThanOrEqual(4);
      },
      callerMethodName,
      `${elementName} stabilized with keyword '${keyword}'`,
      `Failed to stabilize ${elementName} with keyword '${keyword}'`,
    );
  }

  /**
   * Waits for the first visible locator from a list of locator-result pairs.
   * Returns the result corresponding to whichever locator becomes visible first.
   * Throws if no locator becomes visible within the timeout.
   * @param locatorResultPairs An array of objects containing a locator and its corresponding result.
   * @param timeout The timeout in milliseconds.
   * @param methodName The name of the method that called this function.
   * @param errorMessage The error message to throw on timeout.
   * @returns A promise that resolves with the result of the first visible locator.
   *
   * @example
   * const result = await this.waitForFirstVisibleLocator(
   *   [
   *     { locator: this.flagCreatedPopupNotification(options), result: "created" as const },
   *     { locator: this.flagAlreadyExistPopupNotification(options), result: "alreadyExist" as const },
   *   ],
   *   5000,
   *   "waitForFlagCreatedOrAlreadyExistNotification",
   *   "Failed to wait for flag created or already exist notification",
   * );
   */
  public async waitForFirstVisibleLocator<T extends string>(
    locatorResultPairs: Array<{ locator: Locator; result: T }>,
    timeout: number,
    methodName: string,
    errorMessage: string,
  ): Promise<T> {
    try {
      const locators = locatorResultPairs.map((pair) => pair.locator);
      const combinedLocator = locators.reduce((acc, locator) => acc.or(locator));

      await expect(combinedLocator).toBeVisible({ timeout });

      for (const { locator, result } of locatorResultPairs) {
        if (await locator.isVisible()) {
          return result;
        }
      }

      throw new Error("No locator became visible");
    } catch (error) {
      ErrorHandler.captureError(error, methodName, errorMessage);
      throw error;
    }
  }

  /**
   * Polls until a locator's attribute equals the expected value, or timeout is reached.
   * @param element The element locator.
   * @param callerMethodName The name of the method that called this function.
   * @param attr The attribute name to watch.
   * @param value The expected attribute value.
   * @param timeout Maximum wait time in milliseconds (default: UI_SHORT_TIMEOUT).
   */
  public async waitForAttributeValue(
    element: Locator,
    callerMethodName: string,
    attr: string,
    value: string,
    timeout = UI_SHORT_TIMEOUT,
  ): Promise<void> {
    await this.performAction(
      async () => {
        await element.waitFor({ state: "attached" });
        await element
          .page()
          .waitForFunction(
            ({
              el,
              a,
              v,
            }: {
              el: SVGElement | HTMLElement | null;
              a: string;
              v: string;
            }) => el !== null && el.getAttribute(a) === v,
            { el: await element.elementHandle(), a: attr, v: value },
            { timeout },
          );
      },
      callerMethodName,
      `Attribute "${attr}" reached value "${value}" on element`,
      `Timed out waiting for attribute "${attr}" to equal "${value}" on element`,
    );
  }

  /**
   * Polls until a locator has a specific CSS class, or timeout is reached.
   * @param element The element locator.
   * @param callerMethodName The name of the method that called this function.
   * @param className The CSS class to wait for.
   * @param timeout Maximum wait time in milliseconds (default: UI_SHORT_TIMEOUT).
   */
  public async waitForClass(
    element: Locator,
    callerMethodName: string,
    className: string,
    timeout = UI_SHORT_TIMEOUT,
  ): Promise<void> {
    await this.performAction(
      async () => {
        await element.waitFor({ state: "attached" });
        await element
          .page()
          .waitForFunction(
            ({ el, cls }: { el: SVGElement | HTMLElement | null; cls: string }) =>
              el !== null && el.classList.contains(cls),
            { el: await element.elementHandle(), cls: className },
            { timeout },
          );
      },
      callerMethodName,
      `Class "${className}" appeared on element`,
      `Timed out waiting for class "${className}" on element`,
    );
  }
}

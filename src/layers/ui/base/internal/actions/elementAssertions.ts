import { type Page, type Locator, expect } from "@playwright/test";
import { ActionBase } from "./actionBase.js";
import type { AssertionElementState, ElementPropertyMap } from "../types/actions.type.js";

/**
 * Element assertions and property readers: visibility, state, count, attributes, and classes.
 */
export class ElementAssertions extends ActionBase {
  /**
   * Creates element assertion helpers for the active page.
   * @param page - Active Playwright page instance.
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Retrieves an element property.
   * @param element - The element locator.
   * @param callerMethodName - The name of the method that called the action.
   * @param propertyType - The type of property to retrieve.
   * @param elementName - The name of the element.
   * @param options - Optional: options for retrieving the property.
   * @returns The retrieved property value.
   */
  public async getElementProperty<K extends keyof ElementPropertyMap>(
    element: Locator,
    callerMethodName: string,
    propertyType: K,
    elementName: string,
    options?: { attributeName?: string },
  ): Promise<ElementPropertyMap[K]> {
    return this.performAction(
      async (): Promise<ElementPropertyMap[K]> => {
        switch (propertyType) {
          case "attribute": {
            if (!options?.attributeName) {
              throw new Error("attributeName is required for 'attribute'");
            }
            return (await element.getAttribute(
              options.attributeName,
            )) as ElementPropertyMap[K];
          }

          case "dimensions": {
            const boundingBox = await element.boundingBox();
            if (!boundingBox) {
              throw new Error("Failed to get element bounding box");
            }
            return {
              width: boundingBox.width,
              height: boundingBox.height,
            } as ElementPropertyMap[K];
          }

          case "visibleText":
            return (await element.innerText()) as ElementPropertyMap[K];

          case "textContent":
            return (await element.textContent()) as ElementPropertyMap[K];

          case "inputValue":
            return (await element.inputValue()) as ElementPropertyMap[K];

          default: {
            const _exhaustiveCheck: never = propertyType;
            throw new Error(`Unsupported property type: ${String(_exhaustiveCheck)}`);
          }
        }
      },
      callerMethodName,
      `Retrieved ${String(propertyType)} from ${elementName}`,
      `Failed to get ${String(propertyType)} from ${elementName}`,
    );
  }

  /**
   * Retrieves all text content from multiple elements.
   * @param elements - The Locator of elements to retrieve text content from.
   * @param callerMethodName - The name of the method that called the action.
   * @param elementName - The name of the elements.
   * @returns An array of text content from all matching elements.
   */
  public async getAllTextContents(
    elements: Locator,
    callerMethodName: string,
    elementName: string,
  ): Promise<string[]> {
    return this.performAction(
      async () => {
        return elements.allTextContents();
      },
      callerMethodName,
      `Retrieved all text contents from ${elementName}`,
      `Failed to get all text contents from ${elementName}`,
    );
  }

  /**
   * Checks if an element is visible.
   * @param element - The Locator of the element to check.
   * @param callerMethodName - The name of the method that called the action.
   * @param elementName - The name of the element.
   * @returns A promise that resolves with true if the element is visible, or false otherwise.
   */
  public async isElementVisible(
    element: Locator,
    callerMethodName: string,
    elementName: string,
  ): Promise<boolean> {
    return this.performAction(
      () => element.isVisible(),
      callerMethodName,
      `Verified: ${elementName} is visible`,
      `Failed to check visibility of ${elementName}`,
    );
  }

  /**
   * Retrieves the count of matching elements.
   * @param element - The Locator of elements to retrieve the count from.
   * @param callerMethodName - The name of the method that called the action.
   * @param elementName - The name of the elements.
   * @returns A promise that resolves with the count of matching elements.
   */
  public async getElementCount(
    element: Locator,
    callerMethodName: string,
    elementName: string,
  ): Promise<number> {
    return this.performAction(
      () => element.count(),
      callerMethodName,
      `Retrieved count for ${elementName}`,
      `Failed to get count for ${elementName}`,
    );
  }

  /**
   * Verifies that a locator resolves to an exact number of matching elements.
   * Uses Playwright's auto-retrying assertion so it waits for elements to render.
   * @param element - The Locator of elements to count.
   * @param callerMethodName - The name of the method that called the action.
   * @param expectedCount - The exact number of elements expected.
   * @param elementName - The name of the elements.
   * @returns A promise that resolves once the expected count is matched.
   */
  public async verifyElementCount(
    element: Locator,
    callerMethodName: string,
    expectedCount: number,
    elementName: string,
  ): Promise<void> {
    await this.performAction(
      async () => {
        await expect(element).toHaveCount(expectedCount);
      },
      callerMethodName,
      `${elementName} count is ${expectedCount}`,
      `Failed to verify ${elementName} count is ${expectedCount}`,
    );
  }

  /**
   * Retrieves the bounding box of an element.
   * @param element - The Locator of the element to retrieve the bounding box from.
   * @param callerMethodName - The name of the method that called the action.
   * @param elementName - The name of the element.
   * @returns A promise that resolves with the bounding box, or null if unavailable.
   */
  public async getBoundingBox(
    element: Locator,
    callerMethodName: string,
    elementName: string,
  ): Promise<{ x: number; y: number; width: number; height: number } | null> {
    return this.performAction(
      () => element.boundingBox(),
      callerMethodName,
      `Retrieved bounding box for ${elementName}`,
      `Failed to get bounding box for ${elementName}`,
    );
  }

  /**
   * Verifies that an element is in a specified state.
   * @param element - The Locator of the element to verify.
   * @param callerMethodName - The name of the method that called the action.
   * @param state - The desired state: "enabled", "disabled", "visible", or "hidden".
   * @param elementName - The name of the element.
   * @returns A promise that resolves when the element state assertion passes.
   */
  public async verifyElementState(
    element: Locator,
    callerMethodName: string,
    state: AssertionElementState,
    elementName: string,
  ): Promise<void> {
    await this.performAction(
      async () => {
        switch (state) {
          case "enabled":
            await expect(element).toBeEnabled();
            break;
          case "disabled":
            await expect(element).toBeDisabled();
            break;
          case "visible":
            await expect(element).toBeVisible();
            break;
          case "hidden":
            await expect(element).not.toBeVisible();
            break;
        }
      },
      callerMethodName,
      `${elementName} state is ${state}`,
      `Failed to verify element ${elementName} is ${state}`,
    );
  }

  /**
   * Checks if an element is editable.
   * @param element - The Locator of the element to check.
   * @param callerMethodName - The name of the method that called the action.
   * @param elementName - The name of the element.
   * @returns A promise that resolves with true if the element is editable, or false otherwise.
   */
  public async isElementEditable(
    element: Locator,
    callerMethodName: string,
    elementName: string,
  ): Promise<boolean> {
    return this.performAction(
      () => element.isEditable(),
      callerMethodName,
      `${elementName} is editable`,
      `Failed to check if ${elementName} is editable`,
    );
  }

  /**
   * Checks if an element is checked.
   * @param element - The Locator of the element to check.
   * @param callerMethodName - The name of the method that called the action.
   * @param elementName - The name of the element.
   * @returns A promise that resolves with true if the element is checked, or false otherwise.
   */
  public async isElementChecked(
    element: Locator,
    callerMethodName: string,
    elementName: string,
  ): Promise<boolean> {
    return this.performAction(
      () => element.isChecked(),
      callerMethodName,
      `${elementName} is checked`,
      `Failed to check if ${elementName} is checked`,
    );
  }

  /**
   * Checks if an element is disabled.
   * @param element - The Locator of the element to check.
   * @param callerMethodName - The name of the method that called the action.
   * @param elementName - The name of the element.
   * @returns A promise that resolves with true if the element is disabled, or false otherwise.
   */
  public async isElementDisabled(
    element: Locator,
    callerMethodName: string,
    elementName: string,
  ): Promise<boolean> {
    return this.performAction(
      () => element.isDisabled(),
      callerMethodName,
      `${elementName} disabled state checked`,
      `Failed to check disabled state for ${elementName}`,
    );
  }

  /**
   * Verifies the state of a checkbox.
   * @param element - The Locator of the element to verify.
   * @param callerMethodName - The name of the method that called the action.
   * @param isChecked - Whether the checkbox should be checked or not.
   * @param elementName - The name of the element.
   * @returns A promise that resolves if the verification succeeds, or rejects with an error if it fails.
   */
  public async verifyCheckboxState(
    element: Locator,
    callerMethodName: string,
    isChecked: boolean,
    elementName: string,
  ): Promise<void> {
    await this.performAction(
      async () => {
        if (isChecked) {
          await expect(element).toBeChecked();
        } else {
          await expect(element).not.toBeChecked();
        }
      },
      callerMethodName,
      `${elementName} is ${isChecked ? "checked" : "unchecked"}`,
      `Failed to verify ${elementName} is ${isChecked ? "checked" : "unchecked"}`,
    );
  }

  /**
   * Check whether a locator has a given attribute (regardless of its value).
   * @param element - The element locator.
   * @param callerMethodName - The name of the method that called this function.
   * @param attr - The attribute name to check.
   * @returns A promise that resolves with true if the attribute is present, false otherwise.
   */
  public async hasAttribute(
    element: Locator,
    callerMethodName: string,
    attr: string,
  ): Promise<boolean> {
    return this.performAction(
      async () => (await element.getAttribute(attr)) !== null,
      callerMethodName,
      `Attribute "${attr}" found on element`,
      `Failed to check attribute "${attr}" on element`,
    );
  }

  /**
   * Returns the value of an attribute, or null if it is absent.
   * @param element - The element locator.
   * @param callerMethodName - The name of the method that called this function.
   * @param attr - The attribute name to retrieve.
   * @returns A promise that resolves with the attribute value, or null if absent.
   */
  public async getAttributeValue(
    element: Locator,
    callerMethodName: string,
    attr: string,
  ): Promise<string | null> {
    return this.performAction(
      () => element.getAttribute(attr),
      callerMethodName,
      `Retrieved value for attribute "${attr}"`,
      `Failed to get value for attribute "${attr}"`,
    );
  }

  /**
   * Check whether a locator contains a specific CSS class.
   * Uses a word-boundary regex to avoid partial matches (e.g. "btn" inside "btn-primary").
   * @param element - The element locator.
   * @param callerMethodName - The name of the method that called this function.
   * @param className - The CSS class name to look for.
   * @returns A promise that resolves with true if the class is present, false otherwise.
   */
  public async hasClass(
    element: Locator,
    callerMethodName: string,
    className: string,
  ): Promise<boolean> {
    return this.performAction(
      async () => {
        const classes = await element.getAttribute("class");
        if (!classes) return false;
        return new RegExp(`(?:^|\\s)${className}(?:\\s|$)`).test(classes);
      },
      callerMethodName,
      `Class "${className}" found on element`,
      `Failed to check class "${className}" on element`,
    );
  }
}

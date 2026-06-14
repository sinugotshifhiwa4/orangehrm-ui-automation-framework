import type { Page } from "@playwright/test";
import { NavigationActions } from "./actions/navigationActions.js";
import { ElementActions } from "./actions/elementActions.js";
import { ElementAssertions } from "./actions/elementAssertions.js";
import { ElementWaits } from "./actions/elementWaits.js";
import { BrowserActions } from "./actions/browserActions.js";
import { FrameActions } from "./actions/frameActions.js";
import { FileActions } from "./actions/fileActions.js";
import type { IPageActions } from "./types/pageActions.js";

export class PageActionsContainer implements IPageActions {
  public readonly page: Page;

  // Frequently used actions
  public readonly navigation: NavigationActions;

  public readonly elementActions: ElementActions;

  public readonly elementAssertions: ElementAssertions;

  public readonly elementWaits: ElementWaits;

  // Lazily instantiated actions
  private _browser?: BrowserActions;

  private _frame?: FrameActions;

  private _file?: FileActions;

  /**
   * Creates an action container bound to a single Playwright page.
   * Frequently used actions are initialized eagerly, while less common ones are lazy-loaded.
   * @param page - Active page instance used by all action helpers.
   */
  constructor(page: Page) {
    this.page = page;

    // instantiate commonly used actions
    this.navigation = new NavigationActions(page);
    this.elementActions = new ElementActions(page);
    this.elementAssertions = new ElementAssertions(page);
    this.elementWaits = new ElementWaits(page);
  }

  // Lazy getters for rarely used actions

  /**
   * Returns the BrowserActions object.
   *
   * @returns {BrowserActions} The BrowserActions object.
   */
  get browser(): BrowserActions {
    if (!this._browser) {
      this._browser = new BrowserActions(this.page);
    }
    return this._browser;
  }

  /**
   * Returns the FrameActions object.
   * @returns {FrameActions} The FrameActions object.
   */
  get frame(): FrameActions {
    if (!this._frame) {
      this._frame = new FrameActions(
        this.page,
        this.elementActions,
        this.elementAssertions,
        this.elementWaits,
      );
    }
    return this._frame;
  }

  /**
   * Returns the FileActions object.
   * @returns {FileActions} The FileActions object.
   */
  get file(): FileActions {
    if (!this._file) {
      this._file = new FileActions(this.page, this.elementActions);
    }
    return this._file;
  }
}

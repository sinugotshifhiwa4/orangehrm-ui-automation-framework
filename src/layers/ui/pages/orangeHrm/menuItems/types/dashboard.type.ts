/**
 * Options for verifying the dashboard is the default landing page.
 */
export interface DefaultPageOptions {
  expectedUrl: string | RegExp;
  classAttribute: string;
}

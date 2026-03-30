export const config = {
  /** Base URL for the Spring Boot API (used server-side only). */
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api",

  /**
   * Next.js basePath — must match next.config.ts `basePath`.
   * Used by client-side fetch() and EventSource() calls that target
   * Next.js Route Handlers, since Next.js does NOT auto-prepend basePath
   * to manual fetch/EventSource URLs the way it does for <Link> and router.push().
   *
   * Set NEXT_PUBLIC_BASE_PATH in your .env if basePath ever changes.
   * Defaults to "/online-medication" to match next.config.ts.
   */
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "/online-medication",

  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
};

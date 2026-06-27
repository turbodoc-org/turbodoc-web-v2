export const safeInternalRedirect = (
  requestedRedirect: string | undefined,
  fallback = "/bookmarks",
) =>
  requestedRedirect?.startsWith("/") && !requestedRedirect.startsWith("//")
    ? requestedRedirect
    : fallback;

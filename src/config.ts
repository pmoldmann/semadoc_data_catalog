/**
 * Site-wide feature flags.
 * Set to `true` to enable a feature, `false` to hide it from navigation and sitemap.
 */
export const features = {
  /** Show the "SemaDoc Viewer" tab (client-side markdown upload & render). */
  viewer: true,
} as const;

/**
 * Shared utilities for generating safe URL slugs and extracting metadata
 * from markdown documentation files.
 */

/** German transliteration map for common special characters */
const TRANSLITERATION: Record<string, string> = {
  'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss',
  'Ä': 'ae', 'Ö': 'oe', 'Ü': 'ue',
  'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
  'á': 'a', 'à': 'a', 'â': 'a',
  'í': 'i', 'ì': 'i', 'î': 'i',
  'ó': 'o', 'ò': 'o', 'ô': 'o',
  'ú': 'u', 'ù': 'u', 'û': 'u',
  'ñ': 'n', 'ç': 'c',
};

/**
 * Convert any string to a safe, URL-friendly kebab-case slug.
 *
 * Examples:
 *   "Adventure Wörks DW 2020"  → "adventure-woerks-dw-2020"
 *   "finanzen_verein_reporting" → "finanzen-verein-reporting"
 *   "monitoring_powerbi_gold"  → "monitoring-powerbi-gold"
 *   "Sales & Marketing (2024)" → "sales-marketing-2024"
 */
export function toUrlSlug(name: string): string {
  return name
    // Transliterate known characters
    .replace(/[^\x00-\x7F]/g, ch => TRANSLITERATION[ch] ?? '')
    // Lowercase
    .toLowerCase()
    // Replace underscores and spaces with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove everything that isn't alphanumeric or hyphen
    .replace(/[^a-z0-9-]/g, '')
    // Collapse consecutive hyphens
    .replace(/-+/g, '-')
    // Trim leading/trailing hyphens
    .replace(/^-|-$/g, '')
    // Fallback for empty result
    || 'unnamed';
}

/** Extract the model title from the first heading of model_documentation.md */
export function extractModelTitle(md: string, fallback: string): string {
  const m = md.match(/^#\s+(.+?)(?:\s*—\s*Model Documentation)?$/m);
  return m ? m[1].trim() : fallback.replace(/_/g, ' ');
}

/** Extract the workspace name from model_documentation.md metadata */
export function extractWorkspace(md: string): string {
  const m = md.match(/\*\*Workspace:\*\*\s*(.+)/);
  return m ? m[1].trim() : '';
}

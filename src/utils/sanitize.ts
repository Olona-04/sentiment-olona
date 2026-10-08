/**
 * String sanitization and text escaping utilities
 * Prevents HTML/XSS injection while preserving readable plain text.
 */

export function escapeHtml(unsafeText: string): string {
  if (!unsafeText) return '';
  return unsafeText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Truncate clean string with ellipsis for excerpts
 */
export function truncateText(text: string, maxLength: number = 90): string {
  if (!text) return '';
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.substring(0, maxLength) + '...';
}

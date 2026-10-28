/* ============================================================
   utils.js — Helper Functions
   Shared utilities used across all other JS modules.
   ============================================================ */

/**
 * Shorthand for document.querySelector.
 * Usage: $( '#my-element' )
 */
const $ = s => document.querySelector(s);

/**
 * Sanitise a URL string — only allows http:, https:, and mailto: protocols.
 * Returns an empty string for anything unsafe (javascript:, data:, etc.).
 */
const safeURL = value => {
  try {
    const u = new URL(value, location.href);
    return ['https:', 'http:', 'mailto:'].includes(u.protocol) ? u.href : '';
  } catch {
    return '';
  }
};

/**
 * Escape HTML special characters to prevent XSS when inserting user content.
 * Converts & < > " ' into their HTML entity equivalents.
 */
const escapeHTML = value =>
  String(value ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );

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

/* ============================================================
   navigation.js — Mobile Menu & Nav Behavior
   Handles the hamburger menu toggle, close-on-navigate,
   close-on-outside-click, close-on-Escape, and resize reset.
   ============================================================ */

const menu = $('.menu-toggle');
const nav = $('#main-nav');

/**
 * Close the mobile nav and reset the toggle button state.
 */
function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open navigation');
  nav.classList.remove('open');
}

/* Toggle menu open/closed on hamburger click */
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  nav.classList.toggle('open', open);
});

/* Close menu when a nav link is clicked (smooth-scrolls to section) */
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

/* Close menu on Escape key and return focus to the toggle button */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && nav.classList.contains('open')) {
    closeMenu();
    menu.focus();
  }
});

/* Close menu when clicking outside the header area */
document.addEventListener('click', e => {
  if (!e.target.closest('.site-header')) closeMenu();
});

/* Auto-close menu if the viewport resizes past the mobile breakpoint */
window.matchMedia('(min-width:761px)').addEventListener('change', closeMenu);

/* Auto-set the copyright year */
$('#year').textContent = new Date().getFullYear();

/* ============================================================
   dialogs.js — Modal Dialogs & Image Lightbox
   Contact dialog, image preview dialog, and shared dialog logic.
   ============================================================ */

/* ---- Shared dialog setup ---- */
/* Wire up close button and click-outside-to-close for every <dialog> */
document.querySelectorAll('dialog').forEach(dialog => {
  // Close button (×)
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());

  // Click outside the dialog box to close (click on the backdrop area)
  dialog.addEventListener('click', e => {
    if (e.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right ||
          e.clientY < r.top  || e.clientY > r.bottom) {
        dialog.close();
      }
    }
  });

  // Remove scroll lock when dialog closes
  dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
});

/**
 * Open a <dialog> as a modal and lock body scroll.
 */
function openDialog(dialog) {
  dialog.showModal();
  document.body.classList.add('modal-open');
}

/**
 * Open the image lightbox with a given image source and title.
 */
function openImage(src, title) {
  $('#full-image').src = src;
  $('#full-image').alt = title;
  $('#image-caption').textContent = title;
  openDialog($('#image-dialog'));
}

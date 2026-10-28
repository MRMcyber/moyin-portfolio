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

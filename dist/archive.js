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

/* Decorative resource logo; the adjacent title supplies the accessible name. */
function brandMark(item, className = 'brand-mark') {
  if (!item?.logo) return '';
  const logo = safeURL(item.logo);
  if (!/^https?:/.test(logo)) return '';
  return `<span class="${className}" aria-hidden="true"><img src="${escapeHTML(logo)}" alt="" width="40" height="40" loading="lazy"></span>`;
}

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

/* Isolated glass + motion experiment; baseline files are saved externally. */
(() => {
  if (!document.body.classList.contains('glass-experiment')) return;
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const homepageToggle = document.querySelector('#motion-toggle');
  const toggle = homepageToggle || document.querySelector('#glass-motion-toggle');
  let paused = reduced.matches;

  const atmosphere = document.createElement('div');
  atmosphere.className = 'glass-atmosphere';
  atmosphere.setAttribute('aria-hidden', 'true');
  atmosphere.innerHTML = '<div class="glass-orb glass-orb-one"></div><div class="glass-orb glass-orb-two"></div><div class="glass-orb glass-orb-three"></div><div class="glass-grid"></div>';
  document.body.prepend(atmosphere);
  const syncVisibility = () => root.classList.toggle('glass-background-paused', document.hidden);
  document.addEventListener('visibilitychange', syncVisibility);
  syncVisibility();

  function syncMotion() {
    paused = toggle ? toggle.getAttribute('aria-pressed') === 'true' : reduced.matches;
    root.classList.toggle('glass-motion-paused', paused || reduced.matches);
  }
  if (homepageToggle) {
    new MutationObserver(syncMotion).observe(toggle, { attributes: true, attributeFilter: ['aria-pressed'] });
  } else if (toggle) {
    function updateToggle(value) {
      toggle.setAttribute('aria-pressed', String(value));
      toggle.innerHTML = value ? 'Resume motion <span aria-hidden="true">&#9655;</span>' : 'Pause motion <span aria-hidden="true">&#8545;</span>';
      syncMotion();
    }
    toggle.addEventListener('click', () => updateToggle(!paused));
    reduced.addEventListener('change', () => updateToggle(reduced.matches));
    updateToggle(reduced.matches);
  }
  reduced.addEventListener('change', syncMotion);
  syncMotion();

  // Progressive enhancement: content stays visible until an observer is ready.
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: .08, rootMargin: '0px 0px -24px 0px' });
  const revealSelector = '.section-label, .section-intro, .about-grid, .notes-grid, .certificate-gallery, .project-showcase, .editorial-list, .contact-inner, .archive-heading, .archive-collection, .archive-explore';
  document.querySelectorAll(revealSelector).forEach((element, index) => {
    element.classList.add('glass-reveal');
    element.style.setProperty('--reveal-delay', `${index % 3 * 70}ms`);
    revealObserver.observe(element);
  });

  const tiltSelector = '.archive-preview, .archive-entry, .archive-certificate, .project-showcase, .about-copy';
  function attachTilt(card) {
    if (card.classList.contains('glass-tilt')) return;
    card.classList.add('glass-tilt');
    let frame = 0;
    let pointer = null;
    card.addEventListener('pointermove', event => {
      if (paused || reduced.matches || !fine.matches) return;
      pointer = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const bounds = card.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (pointer.x - bounds.left) / bounds.width));
        const y = Math.max(0, Math.min(1, (pointer.y - bounds.top) / bounds.height));
        card.style.setProperty('--tilt-x', `${(y - .5) * -6}deg`);
        card.style.setProperty('--tilt-y', `${(x - .5) * 6}deg`);
        card.style.setProperty('--shine-x', `${x * 100}%`);
        card.style.setProperty('--shine-y', `${y * 100}%`);
      });
    });
    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame);
      frame = 0;
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  }
  document.querySelectorAll(tiltSelector).forEach(attachTilt);
  // Content cards arrive after content.json; observe additions only.
  new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
    if (!(node instanceof Element)) return;
    if (node.matches(tiltSelector)) attachTilt(node);
    node.querySelectorAll(tiltSelector).forEach(attachTilt);
  }))).observe(document.querySelector('main'), { childList: true, subtree: true });

  document.querySelectorAll('.button').forEach(button => {
    button.addEventListener('pointermove', event => {
      if (paused || reduced.matches || !fine.matches) return;
      const bounds = button.getBoundingClientRect();
      button.style.setProperty('--magnet-x', `${((event.clientX - bounds.left) / bounds.width - .5) * 10}px`);
      button.style.setProperty('--magnet-y', `${((event.clientY - bounds.top) / bounds.height - .5) * 8 - 3}px`);
    });
    button.addEventListener('pointerleave', () => {
      button.style.removeProperty('--magnet-x');
      button.style.removeProperty('--magnet-y');
    });
  });

  // Fade between local pages, preserving anchors, new tabs, and external links.
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download') || paused || reduced.matches) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname || !/\.html$/.test(url.pathname)) return;
    event.preventDefault();
    document.body.classList.add('glass-leaving');
    setTimeout(() => location.assign(url.href), 180);
  });
  window.addEventListener('pageshow', () => document.body.classList.remove('glass-leaving'));
})();

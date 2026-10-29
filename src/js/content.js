/* ============================================================
   content.js — Data Loading & Section Rendering
   Fetches content.json and renders certifications, projects,
   writeups, notes, and the contact dialog content.
   ============================================================ */

/**
 * Master content object — populated from content.json via fetch().
 * Each key maps to a section of the site.
 */
let content = {
  contact: '',            // Email or URL for the contact dialog
  certifications: [],     // Array of { title, image }
  projects: [],           // Array of { title, image, description }
  writeups: [],           // Array of { title, url, description }
  notes: []               // Array of { title, url, description }
};

/* ---- Contact dialog trigger ---- */
document.querySelectorAll('.contact-trigger').forEach(button =>
  button.addEventListener('click', () => {
    closeMenu();

    const raw = content.contact.trim();

    // Auto-prefix mailto: for bare email addresses
    const target = safeURL(
      raw.includes('@') && !raw.includes('://') && !raw.startsWith('mailto:')
        ? 'mailto:' + raw
        : raw
    );

    const body = $('#contact-body');
    body.replaceChildren();

    if (raw && target) {
      // Valid contact info — show link
      const p = document.createElement('p');
      p.textContent = 'For a conversation about security, research, or working together.';

      const a = document.createElement('a');
      a.className = 'button primary';
      a.href = target;
      a.textContent = target.startsWith('mailto:')
        ? raw.replace(/^mailto:/, '')
        : 'Get in touch ↗';

      if (!target.startsWith('mailto:')) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }

      body.append(p, a);
    } else {
      // No contact info yet — placeholder
      const p = document.createElement('p');
      p.textContent = 'Contact details are being updated. Please check back soon.';
      body.append(p);
    }

    openDialog($('#contact-dialog'));
  })
);

/* ============================================================
   RENDER FUNCTIONS
   Each function builds the DOM for one section of the page.
   ============================================================ */

/**
 * Render the certifications gallery.
 * Shows a grid of clickable cert cards, or an empty placeholder.
 */
function renderCertifications() {
  const gallery = $('#certificate-gallery');
  const preview = document.createElement('a');
  preview.href = 'certifications.html';
  preview.className = 'empty-credentials archive-preview';
  preview.setAttribute('aria-label', 'Browse all certifications');
  const count = content.certifications.length;
  const summary = count
    ? content.certifications.map(item => item.title).slice(0, 3).join(' / ')
    : 'Explore the credential archive.';
  preview.innerHTML = '<div class="certificate-outline" aria-hidden="true"><i></i></div>'
    + '<div><span class="empty-label">THE CREDENTIAL ARCHIVE</span>'
    + '<h3>Milestones, collected.</h3><p>' + escapeHTML(summary) + '</p>'
    + '<span class="preview-cta">VIEW ALL CERTIFICATIONS'
    + (count ? ' / ' + String(count).padStart(2, '0') : '') + '</span></div>'
    + '<span class="preview-arrow" aria-hidden="true">&#8599;</span>';
  gallery.replaceChildren(preview);
}

/**
 * Track which project tab is currently selected.
 */
let activeProject = 0;

/**
 * Render the projects showcase — tabs on the left, preview on the right.
 * @param {number} index  Which project to select (default 0)
 * @param {boolean} focus  Whether to focus the selected tab (keyboard nav)
 */
function renderProject(index = 0, focus = false) {
  activeProject = index;
  const tabs = $('#project-tabs');
  const panel = $('#project-preview');
  tabs.replaceChildren();
  panel.replaceChildren();

  if (!content.projects.length) {
    // Empty state — fake terminal card
    tabs.innerHTML = '<div class="project-tab" role="tab" id="project-tab-empty" '
      + 'aria-controls="project-preview" aria-selected="true" tabindex="0">'
      + '<span>01</span><div><strong>The project archive</strong>'
      + '<small>A closer look at the work.</small></div></div>';

    panel.setAttribute('aria-labelledby', 'project-tab-empty');
    panel.innerHTML = '<div class="project-empty">'
      + '<div class="window-bar"><i></i><i></i><i></i><span>OxShaD / projects</span></div>'
      + '<div class="empty-project-content">'
      + '<span class="terminal-symbol" aria-hidden="true">~/</span>'
      + '<h3>Every project starts<br>with a question.</h3>'
      + '<p>Selected projects and their stories will appear here.</p>'
      + '</div>'
      + '<div class="archive-state"><span>PROJECT ARCHIVE</span><span>COMING SOON</span></div>'
      + '</div>';
    return;
  }

  // Build a tab button for each project
  content.projects.forEach((item, i) => {
    const button = document.createElement('button');
    button.className = 'project-tab';
    button.id = 'project-tab-' + i;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', 'project-preview');
    button.setAttribute('aria-selected', String(i === index));
    button.tabIndex = i === index ? 0 : -1;
    button.innerHTML = `<span>${String(i + 1).padStart(2, '0')}</span>`
      + `<div><strong>${escapeHTML(item.title)}</strong>`
      + `<small>${escapeHTML(item.description || 'View project images')}</small></div>`;

    // Click to select this project
    button.addEventListener('click', () => renderProject(i, true));

    // Arrow key navigation between tabs
    button.addEventListener('keydown', e => {
      if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
        e.preventDefault();
        let next = e.key === 'Home' ? 0
          : e.key === 'End' ? content.projects.length - 1
          : (i + (['ArrowRight', 'ArrowDown'].includes(e.key) ? 1 : -1) + content.projects.length) % content.projects.length;
        renderProject(next, true);
      }
    });

    tabs.append(button);
  });

  // Show the selected project's image in the preview panel
  const item = content.projects[index];
  panel.setAttribute('aria-labelledby', 'project-tab-' + index);

  const b = document.createElement('button');
  b.className = 'project-image-button';
  b.setAttribute('aria-label', 'Enlarge ' + item.title);

  const img = document.createElement('img');
  img.src = item.image;
  img.alt = item.title;
  img.width = 900;
  img.height = 600;
  b.append(img);
  b.addEventListener('click', () => openImage(item.image, item.title));
  panel.append(b);

  // Focus the tab if triggered by keyboard
  if (focus) $('#project-tab-' + index).focus();
}

/**
 * Render a list section (writeups or notes).
 * @param {string} type        Content key ('writeups' or 'notes')
 * @param {string} selector    CSS selector for the list container
 * @param {string} title       Empty-state heading
 * @param {string} description Empty-state description
 */
function renderEntries(type, selector, title, description) {
  const list = $(selector);
  list.replaceChildren();

  if (!content[type].length) {
    // Empty state
    list.innerHTML = `<div class="empty-block">`
      + `<span class="index">[ — ]</span>`
      + `<div><h3>${title}</h3><p>${description}</p></div>`
      + `<span class="empty-arrow" aria-hidden="true">↗</span></div>`;
    return;
  }

  // Render each entry as a link
  content[type].slice(0, 3).forEach((item, index) => {
    const a = document.createElement('a');
    a.className = 'entry-link';
    a.href = type + '.html#' + encodeURIComponent(item.id || type + '-' + (index + 1));
    a.innerHTML = `<div><h3>${escapeHTML(item.title)}</h3>`
      + `<p>${escapeHTML(item.description || '')}</p></div>`
      + `<span aria-hidden="true">↗</span>`;

    if (a.origin !== location.origin) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }

    list.append(a);
  });
}

/**
 * Master render — calls all section renderers.
 */
function render() {
  renderCertifications();
  renderProject();
  renderEntries('writeups', '#writeup-list',
    'The research is only half the story.',
    'Writeups and walkthroughs are on the way.');
  renderEntries('notes', '#note-list',
    'A notebook worth keeping.',
    'Observations, ideas, and lessons. Coming soon.');
}

/* ---- Initial render + fetch content data ---- */
render();

fetch('content.json')
  .then(r => {
    if (!r.ok) throw Error('Content unavailable');
    return r.json();
  })
  .then(data => {
    content = { ...content, ...data };
    render();
  })
  .catch(() => { /* Silently fall back to empty states */ });

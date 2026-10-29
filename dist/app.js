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
  contact: 'secfortress40@gmail.com', // Email or URL for the contact dialog
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
      const a = document.createElement('a');
      a.className = 'button secondary contact-email';
      a.href = target;
      a.textContent = target.startsWith('mailto:')
        ? raw.replace(/^mailto:/, '')
        : 'Get in touch ↗';

      if (target.startsWith('mailto:')) {
        const icon = document.createElement('img');
        icon.src = 'assets/gmail.svg';
        icon.alt = 'Gmail';
        icon.className = 'gmail-icon';
        icon.width = 24;
        icon.height = 24;
        a.prepend(icon);
      }

      if (!target.startsWith('mailto:')) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }

      body.append(a);
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

/* ============================================================
   globe.js — Interactive Globe Canvas Animation
   Draws a rotating dot-matrix globe with continent outlines,
   network nodes, and arc connections. Purely decorative.
   ============================================================ */

const canvas = $('#globe');
const ctx = canvas.getContext('2d');

/* Check if user prefers reduced motion */
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduced.matches;
let visible = true;
let angle = 0.35;       // Current rotation angle (radians)
let last = 0;           // Last animation timestamp
let frame = 0;          // Current requestAnimationFrame ID

/* ============================================================
   CONTINENT DATA
   Each sub-array is a polygon of [longitude, latitude] points
   that approximate a continent's outline for the dot map.
   ============================================================ */
const continents = [
  // North America
  [[-168,65],[-140,70],[-125,58],[-112,53],[-95,50],[-83,25],[-100,18],[-113,29],[-125,40],[-135,56]],
  // South America
  [[-81,12],[-62,9],[-46,-5],[-35,-10],[-45,-28],[-63,-55],[-74,-34],[-79,-5]],
  // Africa
  [[-17,35],[7,37],[27,31],[37,17],[49,10],[40,-14],[27,-34],[15,-35],[9,-20],[-5,5],[-17,15]],
  // Europe
  [[-11,36],[-7,55],[8,70],[30,71],[45,53],[30,40],[14,37]],
  // Asia
  [[30,40],[45,63],[80,75],[130,60],[170,60],[150,43],[124,25],[106,4],[91,22],[76,9],[66,26],[42,14]],
  // Australia
  [[112,-12],[132,-10],[153,-25],[145,-39],[116,-33]],
  // Greenland
  [[-52,59],[-25,68],[-35,82],[-57,79],[-65,65]],
  // Madagascar
  [[47,-13],[51,-16],[48,-25],[44,-23]],
  // Japan
  [[130,31],[145,44],[143,33]]
];

/**
 * Point-in-polygon test (ray casting algorithm).
 * Used to determine if a dot falls on "land" or "ocean".
 */
function inPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

/* ---- Pre-compute all dots on the globe ---- */
const dots = [];
for (let lat = -70; lat < 82; lat += 2.5) {
  // Adjust dot spacing by latitude so they don't bunch at the poles
  const step = 2.7 / Math.max(0.3, Math.cos(lat * Math.PI / 180));
  for (let lon = -180; lon < 180; lon += step) {
    const land = continents.some(p => inPoly(lon, lat, p));
    dots.push({
      lat: lat * Math.PI / 180,
      lon: lon * Math.PI / 180,
      land
    });
  }
}

/* Network node positions — major city coordinates [lon, lat] */
const nodes = [[-74,41],[3,7],[13,53],[32,30],[77,23],[103,1],[-46,-23]];

/**
 * Project a lat/lon point onto the 2D canvas.
 * Returns { x, y, z } where z is depth (front = positive).
 */
function project(lon, lat, r, cx, cy) {
  const x = Math.cos(lat) * Math.sin(lon + angle);
  const z = Math.cos(lat) * Math.cos(lon + angle);
  const y = -Math.sin(lat);
  return {
    x: cx + x * r,
    y: cy + (y * 0.95 + z * 0.15) * r,   // Slight tilt
    z
  };
}

/**
 * Main draw loop — renders the globe each frame.
 */
function draw(time = 0) {
  frame = 0;
  if (!visible || document.hidden) return;

  const bounds = canvas.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio, 1.5);
  const w = bounds.width;
  const h = bounds.height;

  // Resize canvas if needed (retina-aware)
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  // Rotate the globe slowly when not paused
  if (!paused && last) angle += Math.min(time - last, 60) * 0.000025;
  last = time;

  const r  = Math.min(w, h) * 0.43;    // Globe radius
  const cx = w * 0.53;                  // Center X
  const cy = h * 0.53;                  // Center Y

  // Subtle radial glow behind the globe
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.35);
  glow.addColorStop(0,   '#08271335');
  glow.addColorStop(0.7, '#051d0b12');
  glow.addColorStop(1,   '#00000000');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Draw dot matrix — land dots are brighter than ocean dots
  for (const d of dots) {
    const p = project(d.lon, d.lat, r, cx, cy);
    if (p.z < -0.1) continue;   // Skip dots on the far side

    const alpha = (0.15 + 0.7 * Math.max(0, p.z)) * (d.land ? 1 : 0.18);
    ctx.fillStyle = `rgba(${d.land ? '71,128,85' : '54,91,65'},${alpha})`;
    const size = d.land ? 1.05 : 0.65;
    ctx.fillRect(p.x, p.y, size, size);
  }

  // Draw decorative orbit ellipses
  ctx.strokeStyle = '#30533a44';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 1.15, r * 0.33, -0.4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 1.05, r * 0.45, 0.7, 0, Math.PI * 2);
  ctx.stroke();

  // Draw network nodes and connecting arcs
  const points = nodes.map(([lon, lat]) =>
    project(lon * Math.PI / 180, lat * Math.PI / 180, r, cx, cy)
  );

  points.forEach((p, i) => {
    if (p.z < 0) return;   // Skip nodes on the back side

    // Draw arc to the next node
    const next = points[(i + 1) % points.length];
    if (next.z > 0) {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.quadraticCurveTo((p.x + next.x) / 2, (p.y + next.y) / 2 - 85, next.x, next.y);
      ctx.strokeStyle = '#39805277';
      ctx.stroke();
    }

    // Draw the node dot
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#6eb786';
    ctx.fill();

    // Inner ring
    ctx.strokeStyle = '#3a975e';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
    ctx.stroke();

    // Outer ring (faded)
    ctx.strokeStyle = '#3a975e40';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Continue animating if not paused
  if (!paused) frame = requestAnimationFrame(draw);
}

/**
 * Restart animation if it's not already running.
 */
function restart() {
  if (!frame) {
    last = 0;
    frame = requestAnimationFrame(draw);
  }
}

/* ---- Motion toggle button ---- */
const motion = $('#motion-toggle');

function updateMotion() {
  motion.setAttribute('aria-pressed', String(paused));
  document.querySelector('.discipline-strip').classList.toggle('motion-paused', paused);
  motion.innerHTML = paused
    ? 'Resume motion <span aria-hidden="true">▷</span>'
    : 'Pause motion <span aria-hidden="true">Ⅱ</span>';
  restart();
}

motion.addEventListener('click', () => {
  paused = !paused;
  updateMotion();
});

/* Respect system reduced-motion preference */
reduced.addEventListener('change', () => {
  paused = reduced.matches;
  updateMotion();
});

/* ---- Performance: only animate when the globe is visible ---- */
new IntersectionObserver(entries => {
  visible = entries[0].isIntersecting;
  if (visible) {
    restart();
  } else if (frame) {
    cancelAnimationFrame(frame);
    frame = 0;
  }
}, { threshold: 0 }).observe(canvas);

/* Resume animation when the tab becomes visible again */
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) restart();
});

/* Redraw on resize */
window.addEventListener('resize', restart);

/* Initial draw */
updateMotion();

/* Animate the supplied artwork with a continuous depth warp. No altered asset
   or duplicated portrait is needed, and the original image is the fallback. */
(() => {
  const scene = document.querySelector('.hero-portrait');
  const source = document.querySelector('#portrait-source');
  const surface = document.querySelector('#portrait-canvas');
  const toggle = document.querySelector('#motion-toggle');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const gl = surface.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false });
  if (!gl) return;

  const vertex = `
    attribute vec2 position;
    varying vec2 uv;
    void main() {
      uv = vec2(position.x * .5 + .5, .5 - position.y * .5);
      gl_Position = vec4(position, 0., 1.);
    }
  `;
  const fragment = `
    precision mediump float;
    uniform sampler2D artwork;
    uniform sampler2D depthMask;
    uniform vec2 drift;
    varying vec2 uv;
    void main() {
      float portrait = texture2D(depthMask, uv).r;
      // Buildings and portrait move in opposite directions. The lettering
      // stays anchored, with a soft transition so there are no cutout seams.
      float lettering = 1. - smoothstep(.55, .80, uv.y);
      float edge = smoothstep(0., .045, uv.x) * (1. - smoothstep(.955, 1., uv.x));
      edge *= smoothstep(0., .04, uv.y) * (1. - smoothstep(.95, 1., uv.y));
      vec2 offset = drift * mix(.8, -1., portrait) * lettering * edge;
      gl_FragColor = texture2D(artwork, uv - offset);
    }
  `;

  function compile(type, code) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, code);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vs = compile(gl.VERTEX_SHADER, vertex);
  const fs = compile(gl.FRAGMENT_SHADER, fragment);
  if (!vs || !fs) return;
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const drift = gl.getUniformLocation(program, 'drift');

  // A soft depth mask follows the hat, hair, and shoulders in Hero.png.
  // This is a runtime effect map; the supplied artwork is never rewritten.
  const depth = document.createElement('canvas');
  depth.width = 842;
  depth.height = 470;
  const context = depth.getContext('2d');
  context.fillStyle = 'black';
  context.fillRect(0, 0, depth.width, depth.height);
  context.scale(.5, .5);
  context.filter = 'blur(12px)';
  context.fillStyle = 'white';
  context.beginPath();
  context.moveTo(578, 556);
  context.bezierCurveTo(588, 510, 624, 476, 659, 468);
  context.bezierCurveTo(577, 464, 596, 390, 628, 337);
  context.bezierCurveTo(616, 249, 640, 151, 740, 110);
  context.bezierCurveTo(833, 56, 965, 91, 997, 191);
  context.bezierCurveTo(1068, 219, 1078, 263, 1025, 280);
  context.bezierCurveTo(1047, 321, 1066, 394, 1031, 441);
  context.lineTo(997, 470);
  context.bezierCurveTo(1080, 487, 1093, 546, 1133, 650);
  context.lineTo(577, 650);
  context.closePath();
  context.fill();

  function texture(image, unit, name) {
    gl.activeTexture(gl.TEXTURE0 + unit);
    const item = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, item);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(gl.getUniformLocation(program, name), unit);
  }

  let ready = false;
  let visible = true;
  let lost = false;
  let frame = 0;
  let last = 0;
  let elapsed = 0;
  let pointerX = 0, pointerY = 0, targetX = 0, targetY = 0;
  const isPaused = () => toggle.getAttribute('aria-pressed') === 'true';

  function render(time) {
    frame = 0;
    if (!ready || lost) return;
    const stopped = isPaused();
    const delta = last ? Math.min((time - last) / 1000, .05) : 0;
    last = time;
    if (!stopped) {
      elapsed += delta;
      const easing = 1 - Math.exp(-delta * 5);
      pointerX += (targetX - pointerX) * easing;
      pointerY += (targetY - pointerY) * easing;
    }
    const still = preference.matches && stopped;
    const x = still ? 0 : Math.sin(elapsed * Math.PI / 6) * .010 + pointerX * .007;
    const y = still ? 0 : Math.sin(elapsed * Math.PI / 8) * .006 + pointerY * .004;
    gl.uniform2f(drift, x, y);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    scene.classList.add('portrait-ready');
    if (!stopped && visible && !document.hidden) frame = requestAnimationFrame(render);
  }

  function sync() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    scene.classList.toggle('portrait-paused', isPaused());
    if (ready && !lost && visible && !document.hidden) frame = requestAnimationFrame(render);
  }

  function resize() {
    const rect = surface.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio || 1, 2);
    surface.width = Math.max(1, Math.round(rect.width * ratio));
    surface.height = Math.max(1, Math.round(rect.height * ratio));
    gl.viewport(0, 0, surface.width, surface.height);
    sync();
  }

  function initialize() {
    if (ready || !source.naturalWidth) return;
    texture(source, 0, 'artwork');
    texture(depth, 1, 'depthMask');
    ready = true;
    resize();
  }

  scene.addEventListener('pointermove', event => {
    if (!finePointer.matches || isPaused()) return;
    const rect = scene.getBoundingClientRect();
    targetX = ((event.clientX - rect.left) / rect.width - .5) * 2;
    targetY = ((event.clientY - rect.top) / rect.height - .5) * 2;
  });
  scene.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; });
  new MutationObserver(sync).observe(toggle, { attributes: true, attributeFilter: ['aria-pressed'] });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(scene);
  new ResizeObserver(resize).observe(scene);
  document.addEventListener('visibilitychange', sync);
  surface.addEventListener('webglcontextlost', () => {
    lost = true;
    if (frame) cancelAnimationFrame(frame);
    scene.classList.remove('portrait-ready');
  });
  source.addEventListener('load', initialize, { once: true });
  if (source.complete) initialize();
})();

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

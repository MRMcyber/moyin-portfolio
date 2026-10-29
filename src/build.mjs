/**
 * build.mjs — Combine src/ files → dist/
 *
 * Usage:   node src/build.mjs
 *
 * Concatenates CSS and JS source files in the correct order,
 * copies the HTML and content.json into dist/.
 */

import { readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));         // src/
const project = resolve(root, '..');                          // moyin-portfolio/
const dist = resolve(project, 'dist');

/* ---- File order (matters for CSS cascade & JS execution) ---- */

const cssFiles = [
  'css/variables.css',
  'css/typography.css',
  'css/buttons.css',
  'css/navigation.css',
  'css/hero.css',
  'css/sections.css',
  'css/about.css',
  'css/certifications.css',
  'css/projects.css',
  'css/content.css',
  'css/contact.css',
  'css/footer.css',
  'css/archives.css',
  'css/responsive.css',
  'css/cursor.css',
  'css/glass-experiment.css',
];

const jsFiles = [
  'js/utils.js',
  'js/navigation.js',
  'js/dialogs.js',
  'js/content.js',
  'js/globe.js',
  'js/hero-portrait.js',
  'js/glass-experiment.js',
];

/* ---- Build ---- */

mkdirSync(dist, { recursive: true });
mkdirSync(resolve(dist, 'assets'), { recursive: true });
for (const asset of ['logo.png', 'Hero.png', 'ccep-certificate.jpg', 'gmail.svg', 'x.svg', 'htb.svg', 'notion.svg', 'hacktricks.svg', 'ccep-badge.webp', 'cursor-crosshair.svg', 'cursor-target.svg']) {
  copyFileSync(resolve(project, 'images', asset), resolve(dist, 'assets', asset));
}

// Concatenate CSS
const css = cssFiles
  .map(f => readFileSync(resolve(root, f), 'utf8'))
  .join('\n');
writeFileSync(resolve(dist, 'styles.css'), css);
console.log(`  ✓ styles.css  (${cssFiles.length} files)`);

// Concatenate JS
const js = jsFiles
  .map(f => readFileSync(resolve(root, f), 'utf8'))
  .join('\n');
writeFileSync(resolve(dist, 'app.js'), js);
console.log(`  ✓ app.js      (${jsFiles.length} files)`);

// Copy HTML
copyFileSync(resolve(root, 'html/index.html'), resolve(dist, 'index.html'));
console.log('  ✓ index.html');

// Copy content data
copyFileSync(resolve(root, 'data/content.json'), resolve(dist, 'content.json'));
console.log('  ✓ content.json');

// Archive pages share navigation but do not load homepage-only animations.
writeFileSync(resolve(dist, 'archive.js'), ['js/utils.js', 'js/navigation.js', 'js/dialogs.js', 'js/glass-experiment.js']
  .map(f => readFileSync(resolve(root, f), 'utf8')).join('\n'));
await import('../scripts/sync-assets.mjs');
await import('../scripts/build-archives.mjs');

console.log('\n  Build complete → dist/\n');

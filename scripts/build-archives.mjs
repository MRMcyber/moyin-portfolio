import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(resolve(project, 'dist/content.json'), 'utf8'));
const template = readFileSync(resolve(project, 'src/html/archive.html'), 'utf8');
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));
const safeLink = value => {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? escape(url.href) : ''; }
  catch { return ''; }
};
const imageLink = value => {
  if (typeof value !== 'string' || !value.trim()) return '';
  if (/^assets\/[a-zA-Z0-9_./-]+$/.test(value) && !value.includes('..')) return escape(value);
  return safeLink(value);
};
const pages = {
  certifications: { title: 'Certifications', eyebrow: 'THE CREDENTIAL ARCHIVE', description: 'Milestones behind the mindset. Explore my certifications and their original credential records.', unit: 'credential' },
  writeups: { title: 'Writeups', eyebrow: 'RESEARCH / SHARED', description: 'The findings, the process, and the lessons along the way.', unit: 'writeup' },
  notes: { title: 'All my notes', eyebrow: 'THE WORKING NOTEBOOK', description: 'My lab notes and the references I return to. A collection that keeps growing.', unit: 'resource' }
};

for (const [key, page] of Object.entries(pages)) {
  const items = Array.isArray(data[key]) ? data[key] : [];
  const cards = items.map((item, index) => {
    const id = escape(item.id || `${key}-${index + 1}`);
    const url = safeLink(item.url);
    const image = imageLink(item.image);
    const logo = imageLink(item.logo);
    const mark = logo ? `<span class="brand-mark" aria-hidden="true"><img src="${logo}" alt="" width="40" height="40" loading="lazy"></span>` : '';
    const external = url ? `href="${url}" target="_blank" rel="noopener noreferrer"` : '';
    const number = String(index + 1).padStart(2, '0');
    if (key === 'certifications') {
      return `<article class="archive-certificate" id="${id}">
        <div class="cert-meta"><span>CREDENTIAL / ${number}</span><span>${escape(item.issuer || 'CERTIFICATION')}</span></div>
        ${image ? `<a class="certificate-image-link" href="${image}" target="_blank" rel="noopener noreferrer" aria-label="Enlarge ${escape(item.title)} certificate (opens in a new tab)"><img src="${image}" alt="${escape(item.description || item.title)} certificate" width="1100" height="850" loading="lazy"><span>Enlarge certificate <span aria-hidden="true">↗</span></span></a>` : '<div class="certificate-outline" aria-hidden="true"><i></i></div>'}
        <div class="archive-card-copy"><div class="credential-heading">${mark}<h2>${escape(item.title)}</h2></div><p>${escape(item.description)}</p>
        ${item.date ? `<p class="credential-date">Issued ${escape(item.date)}</p>` : ''}
        ${url ? `<a class="text-link" ${external} aria-label="View ${escape(item.title)} credential (opens in a new tab)">View credential <span aria-hidden="true">↗</span></a>` : ''}</div>
      </article>`;
    }
    return `<article class="archive-entry" id="${id}">
      <div class="archive-entry-meta"><div class="resource-brand">${mark}<span>${number} / ${escape(item.source || key.toUpperCase())}</span></div><span aria-hidden="true">↗</span></div>
      <h2>${escape(item.title)}</h2><p>${escape(item.description)}</p>
      ${url ? `<a class="text-link archive-entry-link" ${external} aria-label="${key === 'writeups' ? 'Read' : 'Open'} ${escape(item.title)} (opens in a new tab)">${key === 'writeups' ? 'Read writeup' : 'Open resource'} <span aria-hidden="true">↗</span></a>` : ''}
    </article>`;
  }).join('\n');
  const values = {
    ...page, key,
    title: escape(page.title), description: escape(page.description),
    count: `${String(items.length).padStart(2, '0')} ${page.unit}${items.length === 1 ? '' : 's'}`,
    collectionClass: key === 'certifications' ? 'archive-certificates' : 'archive-entries',
    cards: cards || '<p class="archive-description">New additions will appear here soon.</p>',
    navigation: Object.entries(pages).map(([other, meta]) => `<a href="${other}.html"${other === key ? ' aria-current="page"' : ''}>${other === 'notes' ? 'Notes' : meta.title}</a>`).join(''),
    related: Object.entries(pages).filter(([other]) => other !== key).map(([other, meta]) => `<a class="button secondary" href="${other}.html">${meta.title} <span aria-hidden="true">↗</span></a>`).join('')
  };
  writeFileSync(resolve(project, 'dist', `${key}.html`), template.replace(/\{\{(\w+)\}\}/g, (_, name) => values[name] ?? ''));
}
console.log('  ✓ certifications.html, writeups.html, notes.html');

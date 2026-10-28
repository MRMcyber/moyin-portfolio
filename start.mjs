// Starts the dev server on port 3000 without modifying existing files.
// Usage: node start.mjs

import { createServer } from 'node:http';
import { readFile } from 'node:fs';
import { resolve, dirname, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), 'dist');

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'text/javascript',
  '.json': 'application/json',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif':  'image/gif',
  '.ico':  'image/x-icon',
};

const PORT = 3000;

createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400);
    return res.end();
  }

  const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));

  // Prevent directory traversal
  if (!file.startsWith(root + sep)) {
    res.writeHead(403);
    return res.end();
  }

  readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    res.writeHead(200, {
      'Content-Type': MIME[extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log(`\n  🚀  Portfolio running at:\n`);
  console.log(`      Local:  http://localhost:${PORT}\n`);
});

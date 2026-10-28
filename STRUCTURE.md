# Project Structure — moyin-portfolio

## Quick Start

```bash
node start.mjs            # → http://localhost:3000
```

## How to Edit

1. Edit files in `src/`
2. Run: `node src/build.mjs`
3. Refresh your browser

## Directory Map

```
moyin-portfolio/
│
├── dist/                        ← PRODUCTION (auto-built, don't edit directly)
│   ├── index.html                  Page served to the browser
│   ├── styles.css                  All CSS combined
│   ├── app.js                      All JS combined
│   ├── content.json                Site data (contact, projects, etc.)
│   └── assets/
│       ├── favicon.svg             Browser tab icon
│       └── uploads/                Certificate & project images
│
├── src/                         ← SOURCE (edit these!)
│   ├── html/
│   │   └── index.html              Page structure & layout
│   │
│   ├── css/                        Styles, one file per section
│   │   ├── variables.css            Colors, fonts, base resets
│   │   ├── typography.css           Text styles & highlights
│   │   ├── buttons.css              Button components
│   │   ├── navigation.css           Header & mobile nav
│   │   ├── hero.css                 Hero section & globe
│   │   ├── sections.css             Shared section layout
│   │   ├── about.css                About section
│   │   ├── certifications.css       Certificate gallery
│   │   ├── projects.css             Project showcase
│   │   ├── content.css              Writeups & notes lists
│   │   ├── contact.css              Contact CTA & dialogs
│   │   ├── footer.css               Footer styles
│   │   └── responsive.css           Mobile & reduced motion
│   │
│   ├── js/                         Behavior, one file per feature
│   │   ├── utils.js                 Helper functions
│   │   ├── navigation.js            Menu behavior
│   │   ├── dialogs.js               Modal dialogs & lightbox
│   │   ├── content.js               Data loading & rendering
│   │   └── globe.js                 Globe canvas animation
│   │
│   ├── data/
│   │   ├── content.json             Site content — edit to add your work!
│   │   └── README.md                Content schema documentation
│   │
│   ├── build.mjs                   Combines src → dist
│   └── README.md                   Source editing guide
│
├── scripts/                     ← TOOLING (you probably won't touch these)
│   ├── serve.mjs                   Dev server (port 4173)
│   ├── sync-assets.mjs             Auto-import images from ../Images
│   └── check-site.cjs              QA tests (Playwright)
│
├── qa/                          ← QA screenshots (auto-generated)
│
├── start.mjs                   ← Dev server → localhost:3000
├── STRUCTURE.md                ← YOU ARE HERE
├── package.json
└── README.md
```

## What goes where

| I want to...                    | Edit this file                   |
|---------------------------------|----------------------------------|
| Change site colors              | `src/css/variables.css`          |
| Edit headline or section text   | `src/html/index.html`           |
| Add a project or certification  | `src/data/content.json`         |
| Fix mobile layout               | `src/css/responsive.css`        |
| Change the globe animation      | `src/js/globe.js`               |
| Update contact info             | `src/data/content.json`         |
| Style the footer                | `src/css/footer.css`            |

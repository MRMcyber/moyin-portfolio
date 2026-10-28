# Source Files (`src/`)

This is where you edit the site. Each file is a small, focused piece of the portfolio.

## How to edit & build

1. **Edit** any file in `src/`
2. **Build** → run `node src/build.mjs` from the project root
3. **Refresh** your browser at http://localhost:3000

The build script concatenates the source files into `dist/` (the folder the server serves).

## Folder structure

```
src/
├── html/
│   └── index.html          ← Page structure (sections, nav, footer)
│
├── css/                    ← Styles, split by section
│   ├── variables.css       ← Colors, fonts, resets
│   ├── typography.css      ← Headings, text utilities
│   ├── buttons.css         ← .button, .primary, .secondary
│   ├── navigation.css      ← Header bar & nav links
│   ├── hero.css            ← Hero section & globe canvas
│   ├── sections.css        ← Shared section layout
│   ├── about.css           ← About section grid
│   ├── certifications.css  ← Certificate gallery
│   ├── projects.css        ← Project showcase tabs
│   ├── content.css         ← Writeups & notes lists
│   ├── contact.css         ← Contact CTA & modal dialogs
│   ├── footer.css          ← Footer styles
│   └── responsive.css      ← Mobile breakpoints & reduced motion
│
├── js/                     ← Behavior, split by feature
│   ├── utils.js            ← $(), safeURL(), escapeHTML()
│   ├── navigation.js       ← Hamburger menu logic
│   ├── dialogs.js          ← Modal open/close & lightbox
│   ├── content.js          ← Fetch data & render sections
│   └── globe.js            ← Rotating globe animation
│
├── data/
│   ├── content.json        ← YOUR CONTENT — edit this to add work!
│   └── README.md           ← Content schema docs
│
└── build.mjs               ← Concatenates everything → dist/
```

## Tips

- **To change colors** → edit `src/css/variables.css` (the `:root` block)
- **To add projects/certs** → edit `src/data/content.json`
- **To change text** → edit `src/html/index.html`
- **To tweak mobile layout** → edit `src/css/responsive.css`

# Glassmorphism experiment

The user explicitly requested a reversible glassmorphism and motion experiment.
If they say **revert**, restore the pre-experiment site, including the current
hero eye tracking, subdued red with hover glow, and native green cursor.

Verified baseline: `0ca7be2e73f20f4b11cdda0f138a2a4ac076e79f`.

The exact file snapshot and SHA-256 manifest are at:

`C:\Users\MOYIN\Desktop\Moyins life\.moyin-portfolio-checkpoints\before-glass-2026-10-29T22-57-05-059Z`

A second copy of the manifest is in `qa/glass-experiment-checkpoint.json`.
All 69 baseline files were copied and verified before changes were made.

Experiment changes:

The user subsequently requested the original black color theme and the hero
artwork in front of its glass panel. The experiment now uses neutral black
glass with the original green accents; the original restore point is unchanged.
The latest refinement keeps the page background `#000`, slightly lifts only
the glass panels, and restores a very subtle neutral white haze and grid.
No green or teal wash is applied to the surfaces or ambient background.
The hero headline area has no glass panel; the other glass surfaces remain.

- `src/css/glass-experiment.css` and `src/js/glass-experiment.js` are new.
- `src/html/index.html` and `src/html/archive.html` enable the theme.
- `src/build.mjs` bundles the experiment for the homepage and archive pages.
- `dist/` contains rebuilt HTML, CSS, and JavaScript.

To revert, restore the changed pre-existing files from the snapshot, remove
the two experiment source files and this document, and restore the generated
files from the snapshot. Verify against the manifest. Do not reset unrelated
files or remove user additions made after the snapshot without checking them.

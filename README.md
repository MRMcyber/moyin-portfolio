# MOYIN / OxShaD

Ultra-dark static portfolio based on the Pxxl design research in the parent folder. No build dependencies.

Run `npm run dev` for the local preview at http://127.0.0.1:4173.

## Content

Edit `dist/content.json` to add a contact email or HTTPS profile URL, certification images, projects, writeups, and notes. No credentials or project achievements have been invented. Empty collections display clear coming-soon states.

Place supplied images under `../Images/certifications/` and `../Images/projects/`, then run `npm run build`. This copies assets and adds entries without overwriting edited titles. Ambiguous image names are reported for classification. The original files stay intact. Review titles after importing.

Entry formats:

```json
{"title":"Your certification title","image":"assets/uploads/certification.png"}
{"title":"Your project title","description":"Short description","image":"assets/uploads/project.png"}
{"title":"Your writeup or note title","description":"Short description","url":"https://your-article-url"}
```

The canvas globe is original decorative artwork. It does not represent live traffic, attack activity, or verified geographic measurements. Motion can be paused and respects reduced-motion preferences. Galleries support keyboard navigation and native dialog image previews.

Hosting configuration is stored in `.openai/hosting.json`. Sites visibility is private unless explicitly changed.

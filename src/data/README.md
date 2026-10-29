# Content Data (content.json)

This file drives all the dynamic content on the site.

## Schema

| Field            | Type     | Description |
|-----------------|----------|-------------|
| `contact`       | string   | Email or URL shown in the contact dialog |
| `certifications`| array    | List of certification cards |
| `projects`      | array    | List of project showcase entries |
| `writeups`      | array    | List of writeup/article links |
| `notes`         | array    | List of field note links |

### Certification object
- `title` (string) — Name of the certification
- `image` (string) — Path to the certificate image (relative to dist/)
- `id` (string) — Stable anchor on the certifications page
- `url` (string) — Original credential / verification link
- `description` (string) — Full certification name
- `issuer` (string) — Issuing organization
- `date` (string) — Display date, if available

### Project object
- `title` (string) — Project name
- `image` (string) — Path to project screenshot
- `description` (string) — Short description shown in the tab

### Writeup / Note object
- `title` (string) — Entry title
- `description` (string) — Short summary
- `url` (string) — Link to the full writeup/note
- `id` (string) — Stable anchor on the collection page
- `source` (string) — Source label; distinguish your own notes from external references

Run `npm run build` after changes. It updates the homepage data and generates
`certifications.html`, `writeups.html`, and `notes.html` from this collection.
Homepage previews open these pages; collection entries link to their original sources.

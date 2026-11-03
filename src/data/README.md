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
- `logo` (string) — Optional local badge or logo path, relative to dist/
- `date` (string) — Display date, if available

### Project object
- `title` (string) — Project name
- `image` (string) — Optional screenshot for image-only entries
- `summary` (string) — Short subtitle shown in the project tab
- `description` (string) — Full description shown in the preview panel
- `category` (string) — Project type and language label
- `features` (array of strings) — Key capabilities
- `url` (string) — Repository link; enables the project details panel
- `demo` (string) — Optional live-site link

### Writeup / Note object
- Writeups may also include `severity`, `bugClass`, `remediation`, and `remediationNote`. Attribute severity to the source; do not infer a CVSS score or a fix status.
- `findings` is an optional array of `{ title, description, impact }` objects for a local case summary. `disclosure` is an array of published timeline steps. These render inside a collapsed "Expand details" section on the writeups page, along with `overview` and the severity/status fields. The short `description` remains visible on the homepage and archive card.
- `title` (string) — Entry title
- `description` (string) — Short summary
- `url` (string) — Link to the full writeup/note
- `id` (string) — Stable anchor on the collection page
- `source` (string) — Source label; distinguish your own notes from external references
- `logo` (string) — Optional local resource logo shown on the homepage and collection cards

Run `npm run build` after changes. It updates the homepage data and generates
`certifications.html`, `writeups.html`, and `notes.html` from this collection.
Homepage previews open these pages; collection entries link to their original sources.

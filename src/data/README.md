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

### Project object
- `title` (string) — Project name
- `image` (string) — Path to project screenshot
- `description` (string) — Short description shown in the tab

### Writeup / Note object
- `title` (string) — Entry title
- `description` (string) — Short summary
- `url` (string) — Link to the full writeup/note

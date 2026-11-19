# pureooze.github.io
Source for https://pureooze.github.io

## Resume

Edit **`resume.md`**. It is the single source for both the website resume and the PDF; do not edit generated JSON.

```sh
npm ci
npm test
npm run build        # Full website, including resume.html and resume.pdf
npm run resume:pdf   # Generate just _site/resume.pdf when needed
npm run resume:html  # Generate just _site/resume.html
npm start           # Serve locally; resume edits rebuild both formats
```

The existing themes are unchanged: `jsonresume-theme-pureooze` for HTML and `jsonresume-theme-pureooze-simple` for PDF. The build converts Markdown into JSON Resume data in ignored `.cache/resume.json`, then passes it to the existing exporters. No second resume needs to be maintained. PDF generation uses resume-cli's browser-based renderer and requires Chromium/system dependencies. On macOS, installed Google Chrome is used automatically. Elsewhere (or to override it), set `PUPPETEER_EXECUTABLE_PATH` to a compatible Chrome/Chromium executable. Export failures fail the build instead of silently leaving an old PDF.

### Markdown format

The file is structured Markdown, not arbitrary prose. Follow the existing examples:

- `# Your Name` sets the resume name.
- `## Metadata`, `## Contact`, and `## Location` contain labeled fields.
- `## Profiles`, `## Work`, `## Education`, `## Skills`, and `## Projects` contain entries headed by `### Entry name`.
- Fields use `- **Label:** value`. Supported labels: Version, Email, Website, City, Region, Username, URL, Position, Start date, End date, Area, Study type, Description, Type, Entity.
- `#### Highlights` and `#### Keywords` introduce ordinary bullet lists.
- Keep each field or bullet on one line. Blank lines are optional. Dates remain strings, so year-only dates work; omit End date for a current role.

Example:

```markdown
## Work

### Company

- **Position:** Software Engineer
- **Website:** https://example.com
- **Start date:** 2025

#### Highlights

- Built a useful thing.
```

The converter preserves text literally for the existing themes (inline Markdown formatting is not rendered separately). Unsupported lines and duplicate fields fail with a line number rather than silently discarding content. To inspect the intermediate data, run `npm run resume:json`.

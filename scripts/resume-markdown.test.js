import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseResume, convertResume } from './resume-markdown.js';
import { formatYearMonthDate } from './resume-dates.js';

const sample = `# Example Person
## Metadata
- **Version:** v1.0.0
## Contact
- **Email:** person@example.com
## Location
- **City:** Toronto
## Profiles
### Github
- **Username:** example
- **URL:** https://github.com/example
### LinkedIn
- **Username:** example-person
## Work
### Example Inc.
- **Position:** Engineer
- **Start date:** 2025
- **End date:** 2024
#### Highlights
- Improved latency by 90%: measured with tracing.
- Built C# tools & APIs.
## Education
### University
- **Study type:** Bachelor
## Skills
### Languages
#### Keywords
- C#
- JavaScript
## Projects
### Example
- **Description:** A tool: useful for developers.
- **URL:** https://example.com
`;

test('converts Markdown sections, metadata, repeated entries and lists', () => {
  assert.deepEqual(parseResume(sample), {
    meta: { version: 'v1.0.0' },
    basics: { name: 'Example Person', email: 'person@example.com', location: { city: 'Toronto' }, profiles: [
      { network: 'Github', username: 'example', url: 'https://github.com/example' },
      { network: 'LinkedIn', username: 'example-person' },
    ] },
    work: [{ name: 'Example Inc.', position: 'Engineer', startDate: '2025', endDate: '2024', highlights: ['Improved latency by 90%: measured with tracing.', 'Built C# tools & APIs.'] }],
    education: [{ institution: 'University', studyType: 'Bachelor' }],
    skills: [{ name: 'Languages', keywords: ['C#', 'JavaScript'] }],
    projects: [{ name: 'Example', description: 'A tool: useful for developers.', url: 'https://example.com' }],
  });
  assert.deepEqual(parseResume(sample.replaceAll('\n', '\r\n')), parseResume(sample));
});

test('formats year-only and month-year dates without injecting date components', () => {
  assert.equal(formatYearMonthDate('2025'), '2025');
  assert.equal(formatYearMonthDate('2025-06-01'), 'Jun 2025');
  assert.equal(formatYearMonthDate('2019-09'), 'Sep 2019');
  const resume = { work: [{ startDate: '2025', endDate: '2025-06' }] };
  assert.deepEqual(resume.work[0], { startDate: '2025', endDate: '2025-06' });
});

test('rejects unsupported content and duplicate fields instead of silently dropping data', () => {
  for (const text of ['# Name\n## Unknown', '# Name\nSome prose', '# Name\n- orphan', '# Name\n### orphan', '# Name\n## Contact\n- **Emali:** typo', '# Name\n## Contact\n- **Email:** a\n- **Email:** b', '# Name\n## Work\n## Work', '## Contact']) {
    assert.throws(() => parseResume(text));
  }
});

test('converts the real source repeatedly into a generated directory', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'resume-test-'));
  try {
    const output = join(directory, 'nested', 'resume.json');
    const expected = parseResume(await readFile('resume.md', 'utf8'));
    await convertResume('resume.md', output);
    await convertResume('resume.md', output);
    assert.deepEqual(JSON.parse(await readFile(output, 'utf8')), expected);
    assert.ok(expected.basics.name);
    assert.ok(expected.work.length);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

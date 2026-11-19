import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sections = {
  Metadata: ['meta'], Contact: ['basics'], Location: ['location'],
  Profiles: ['profiles', 'network'], Work: ['work', 'name'],
  Education: ['education', 'institution'], Skills: ['skills', 'name'],
  Projects: ['projects', 'name'],
};
const fields = {
  Version: 'version', Email: 'email', Website: 'website', City: 'city',
  Region: 'region', Username: 'username', URL: 'url', Position: 'position',
  'Start date': 'startDate', 'End date': 'endDate', Area: 'area',
  'Study type': 'studyType', Description: 'description', Type: 'type', Entity: 'entity',
};
const lists = { Highlights: 'highlights', Keywords: 'keywords' };

/** Parse the documented resume Markdown format; reject unsupported text instead of losing it. */
export function parseResume(markdown) {
  const resume = { basics: {} };
  let section, entry, list;
  const seen = new Set();
  for (const [index, raw] of markdown.split(/\r?\n/).entries()) {
    const line = raw.trim();
    if (!line) continue;
    const fail = (message) => { throw new Error(`resume.md:${index + 1}: ${message}`); };
    let match;
    if ((match = /^# (.+)$/.exec(line))) {
      if (resume.basics.name) fail('Duplicate name');
      resume.basics.name = match[1];
    } else if ((match = /^## (.+)$/.exec(line))) {
      section = sections[match[1]];
      if (!section) fail(`Unknown section: ${match[1]}`);
      if (seen.has(match[1])) fail('Duplicate section');
      seen.add(match[1]);
      const [key, title] = section;
      if (title) {
        if (key === 'profiles') resume.basics.profiles = [];
        else resume[key] = [];
        entry = undefined;
      }
      else if (key === 'location') { entry = resume.basics.location = {}; }
      else { entry = resume[key] ??= {}; }
      list = undefined;
    } else if ((match = /^### (.+)$/.exec(line))) {
      if (!section?.[1]) fail('Entry outside a repeatable section');
      entry = { [section[1]]: match[1] };
      if (section[0] === 'profiles') {
        resume.basics.profiles.push(entry);
      } else resume[section[0]].push(entry);
      list = undefined;
    } else if ((match = /^#### (.+)$/.exec(line))) {
      const key = lists[match[1]];
      if (!entry || !key) fail('Unknown list or list outside an entry');
      if (key in entry) fail('Duplicate list');
      list = entry[key] = [];
    } else if ((match = /^- \*\*([^*]+):\*\* (.+)$/.exec(line))) {
      const key = fields[match[1]];
      if (!entry || !key) fail('Unknown field or field outside an entry');
      if (key in entry) fail(`Duplicate field: ${match[1]}`);
      entry[key] = match[2];
      list = undefined;
    } else if ((match = /^- (.+)$/.exec(line))) {
      if (!list) fail('Bullet outside Highlights or Keywords');
      list.push(match[1]);
    } else fail('Unsupported Markdown; see README.md for the resume format');
  }
  if (!resume.basics.name) throw new Error('Resume must have a # Name heading');
  return resume;
}

export async function convertResume(input = 'resume.md', output = '.cache/resume.json') {
  const resume = parseResume(await readFile(input, 'utf8'));
  await mkdir(resolve(output, '..'), { recursive: true });
  await writeFile(output, JSON.stringify(resume, null, 2) + '\n');
  return resume;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await convertResume(process.argv[2], process.argv[3]);
}

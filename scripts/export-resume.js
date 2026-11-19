import { existsSync } from 'node:fs';
import { mkdir, rm, stat, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { convertResume } from './resume-markdown.js';

const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer');

const format = process.argv[2];
if (!['html', 'pdf'].includes(format)) throw new Error('Expected html or pdf');
const resume = await convertResume();
await mkdir('.cache', { recursive: true });
await writeFile('.cache/resume.json', JSON.stringify(resume, null, 2) + '\n');
await mkdir('_site', { recursive: true });
const output = `_site/resume.${format}`;
await rm(output, { force: true });
const env = { ...process.env, RESUME_THEME_FORMAT: format };
const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (process.platform === 'darwin' && !env.PUPPETEER_EXECUTABLE_PATH && existsSync(macChrome)) {
  env.PUPPETEER_EXECUTABLE_PATH = macChrome;
}
const themeFile = format === 'html'
  ? './scripts/year-date-theme.cjs'
  : './scripts/year-date-simple-theme.cjs';
const theme = require(path.resolve(themeFile));
const simpleTheme = require(path.resolve('./themes/pureooze-simple/index.cjs'));
const html = await theme.render(resume);

if (format === 'html') {
  await writeFile(output, html);
} else {
  const browserOptions = {};
  if (env.PUPPETEER_EXECUTABLE_PATH) browserOptions.executablePath = env.PUPPETEER_EXECUTABLE_PATH;
  else browserOptions.executablePath = require('puppeteer').executablePath();
  if (env.RESUME_PUPPETEER_NO_SANDBOX) browserOptions.args = ['--no-sandbox'];
  const browser = await puppeteer.launch(browserOptions);
  try {
    const page = await browser.newPage();
    await page.emulateMediaType(simpleTheme.pdfRenderOptions?.mediaType || 'screen');
    await page.goto(`data:text/html;base64,${Buffer.from(html).toString('base64')}`, { waitUntil: 'networkidle0' });
    if (simpleTheme.pdfViewport) await page.setViewport(simpleTheme.pdfViewport);
    await page.pdf({
      path: output,
      format: 'Letter',
      printBackground: true,
      ...simpleTheme.pdfRenderOptions,
    });
  } finally {
    await browser.close();
  }
}
if (!(await stat(output)).size) throw new Error(`Resume export produced an empty ${output}`);

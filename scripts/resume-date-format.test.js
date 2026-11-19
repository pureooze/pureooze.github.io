import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { formatYearMonthDate, datesShareMonthAndYear } from './resume-dates.js';
const require = createRequire(import.meta.url);
const htmlTheme = require('./year-date-theme.cjs');
const pdfTheme = require('./year-date-simple-theme.cjs');

test('year and month precision format without adding dates', () => {
  assert.equal(formatYearMonthDate('2025'), '2025');
  assert.equal(formatYearMonthDate('2025-06'), 'Jun 2025');
  assert.equal(formatYearMonthDate('2019-09-01'), 'Sep 2019');
  assert.equal(formatYearMonthDate('2019-02-29'), '2019-02-29');
  assert.equal(datesShareMonthAndYear('2025', '2025-01'), false);
  assert.equal(datesShareMonthAndYear('2025-01', '2025'), false);
  assert.equal(datesShareMonthAndYear('2025-01', '2025-01-31'), true);
  assert.equal(datesShareMonthAndYear('2025-01', '2025-02'), false);

  const data = {
    basics: { name: 'Example' },
    work: [{ name: 'Acme', position: 'Engineer', startDate: '2025', endDate: '2024-09' }],
    education: [{ institution: 'University', startDate: '2024-06', endDate: '2025' }],
  };
  const html = htmlTheme.render(data);
  const pdf = pdfTheme.render(data);
  assert.match(html, /2025/);
  assert.match(pdf, /2025/);
  assert.match(html, /Jun 2024/);
  assert.match(html, /Sep 2024/);
  assert.match(pdf, /Jun 2024/);
  assert.match(pdf, /Sep 2024/);
  assert.match(html, /2024/);
  assert.match(pdf, /2024/);
  assert.doesNotMatch(html, /01\/2025|Jan(?:uary)? 2025/);
  assert.doesNotMatch(pdf, /Jan(?:uary)? 2025/);
});

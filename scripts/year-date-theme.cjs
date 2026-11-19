const { createRequire } = require('node:module');
const path = require('node:path');
const rootRequire = createRequire(path.join(process.cwd(), 'package.json'));
const { formatYearMonthDate } = rootRequire('./scripts/resume-dates.js');
const theme = rootRequire(path.join(process.cwd(), 'themes/pureooze/index.cjs'));
const simpleTheme = rootRequire(path.join(process.cwd(), 'themes/pureooze-simple/index.cjs'));
const originalHtmlRender = theme.render;
const originalPdfRender = simpleTheme.render;
const htmlHandlebars = rootRequire('handlebars');
const simpleHandlebars = rootRequire('handlebars');

exports.pdfRenderOptions = simpleTheme.pdfRenderOptions;
exports.pdfViewport = simpleTheme.pdfViewport;
exports.render = (data) => {
  if (process.env.RESUME_THEME_FORMAT === 'pdf') {
    const previous = simpleHandlebars.helpers.MONTH_YEAR;
    simpleHandlebars.registerHelper('MONTH_YEAR', (date) => formatYearMonthDate(date));
    try { return originalPdfRender(data); }
    finally { simpleHandlebars.registerHelper('MONTH_YEAR', previous); }
  }
  return originalHtmlRender(data);
};

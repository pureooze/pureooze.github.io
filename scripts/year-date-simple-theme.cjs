const { createRequire } = require('node:module');
const path = require('node:path');
const rootRequire = createRequire(path.join(process.cwd(), 'package.json'));
const { formatYearMonthDate } = rootRequire('./scripts/resume-dates.js');
const theme = rootRequire(path.join(process.cwd(), 'themes/pureooze-simple/index.cjs'));
const helpers = rootRequire('handlebars');
const originalRender = theme.render;

exports.pdfRenderOptions = theme.pdfRenderOptions;
exports.pdfViewport = theme.pdfViewport;
exports.render = (resume) => {
  const previous = helpers.helpers.MONTH_YEAR;
  helpers.registerHelper('MONTH_YEAR', (date) => formatYearMonthDate(date));
  try { return originalRender(resume); }
  finally { helpers.registerHelper('MONTH_YEAR', previous); }
};

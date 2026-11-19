const fs = require('fs');
const handlebars = require('handlebars');
const handlebarsWax = require('handlebars-wax');
const { formatYearMonthDate } = require('../../scripts/resume-dates.js');

handlebars.registerHelper({
  removeProtocol: url => url.replace(/.*?:\/\//g, ''),
  concat: (...args) => args.filter(arg => typeof arg !== 'object').join(''),
  formatAddress: (...args) => args.filter(arg => typeof arg !== 'object').join(' '),
  formatResumeDate: formatDatePrecision,
  lowercase: s => s.toLowerCase(),
  eq: (a, b) => a === b,
});

function formatDatePrecision(date) {
  return formatYearMonthDate(date);
}

function render(resume) {
  const dir = `${__dirname}/src`;
  const css = fs.readFileSync(`${dir}/style.css`, 'utf-8');
  const resumeTemplate = fs.readFileSync(`${dir}/resume.hbs`, 'utf-8');
  const Handlebars = handlebarsWax(handlebars);
  Handlebars.partials(`${dir}/partials/**/*.{hbs,js}`);
  return Handlebars.compile(resumeTemplate)({ style: `<style>${css}</style>`, resume });
}

module.exports = { render };

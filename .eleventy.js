const markdownItAnchor = require("markdown-it-anchor");
const markdownItFootnote = require('markdown-it-footnote');

const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginBundle = require("@11ty/eleventy-plugin-bundle");
const pluginNavigation = require("@11ty/eleventy-navigation");
const pluginTOC = require("eleventy-plugin-toc");
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

const pluginImages = require("./eleventy.config.images.js");

module.exports = function (eleventyConfig) {
    // Output directory: _site

    // Official plugins
    eleventyConfig.addPlugin(pluginRss);
    eleventyConfig.addPlugin(pluginNavigation);
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
    eleventyConfig.addPlugin(pluginBundle,);
    eleventyConfig.addPlugin(pluginSyntaxHighlight, {
        preAttributes: { tabindex: 0 }
    });

    // App plugins
    eleventyConfig.addPlugin(pluginImages);
    
    // Copy `img/` to `_site/img`
    eleventyConfig.addPassthroughCopy("src/blog/img");

    // Keeps the same directory structure.
    eleventyConfig.addPassthroughCopy({
        "src/css/": "css",
        "./node_modules/prismjs/themes/prism-okaidia.css": "/css/prism-okaidia.css"
    });
    eleventyConfig.addPassthroughCopy("images");
    eleventyConfig.addPassthroughCopy("resume.html");

    // Customize Markdown library settings:
    eleventyConfig.amendLibrary("md", mdLib => {
        mdLib.use(markdownItAnchor, {
            permalink: markdownItAnchor.permalink.ariaHidden({
                placement: "after",
                class: "header-anchor",
                symbol: "#",
                ariaHidden: false,
            }),
            level: [1,2,3,4],
            slugify: eleventyConfig.getFilter("slugify")
        }).use(markdownItFootnote);
    });
    eleventyConfig.addPlugin(pluginTOC, {
        ul: true
    })
    
    // Watch content images for the image pipeline.
    // eleventyConfig.addWatchTarget("blog/**/*.{svg,webp,png,jpeg}");
    
    return {
        templateFormats: [
            "md",
            "njk",
            "html",
            "liquid"
        ],
        markdownTemplateEngine: "liquid",
        htmlTemplateEngine: "liquid",
        dir: {
            input: "src",
            includes: "_includes",
            data: "_data",
            output: "_site"
        },
        pathPrefix: "/"
    }
};
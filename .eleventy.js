import markdownItAnchor  from "markdown-it-anchor";
import markdownItFootnote from 'markdown-it-footnote';
import {getHighlighter} from 'shiki';

import pluginRss from "@11ty/eleventy-plugin-rss";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginBundle from "@11ty/eleventy-plugin-bundle";
import pluginNavigation from "@11ty/eleventy-navigation";
import pluginTOC from "eleventy-plugin-toc";
import inclusiveLangPlugin from "@11ty/eleventy-plugin-inclusive-language";
import { EleventyHtmlBasePlugin } from "@11ty/eleventy";

import pluginImages from "./eleventy.config.images.js";

export default async function(eleventyConfig) {
    // Output directory: _site

    // Official plugins
    eleventyConfig.addPlugin(pluginRss);
    eleventyConfig.addPlugin(pluginNavigation);
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
    eleventyConfig.addPlugin(pluginBundle,);
    eleventyConfig.addPlugin(inclusiveLangPlugin);
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

    eleventyConfig.on("eleventy.before", async () => {
        const highlighter = await getHighlighter({
            themes: ["material-theme-palenight"],
            langs:["shell", "csharp", "python", "javascript"]
        });
        eleventyConfig.amendLibrary("md", (mdLib) =>
            mdLib.set({
                highlight: (code, lang) => highlighter.codeToHtml(code, {
                    lang: lang,
                    theme: "material-theme-palenight"
                }),
            })
        );
    });
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
        })
            .use(markdownItFootnote);
    });
    eleventyConfig.addPlugin(pluginTOC, {
        ul: true
    })

    // Watch content images for the image pipeline.
    eleventyConfig.addWatchTarget("blog/**/*.{svg,webp,png,jpeg}");

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
}

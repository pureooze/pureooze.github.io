import markdownItAnchor from "markdown-it-anchor";
import markdownItFootnote from "markdown-it-footnote";
import { getHighlighter } from "shiki";
import { rollup } from 'rollup';

import pluginRss from "@11ty/eleventy-plugin-rss";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginBundle from "@11ty/eleventy-plugin-bundle";
import pluginNavigation from "@11ty/eleventy-navigation";
import pluginTOC from "eleventy-plugin-toc";
import { EleventyHtmlBasePlugin } from "@11ty/eleventy";

import pluginImages from "./eleventy.config.images.js";
import rollupConfig from './rollup.config.js';

export default async function (eleventyConfig) {
    // Output directory: _site

    // Official plugins
    eleventyConfig.addPlugin(pluginRss);
    eleventyConfig.addPlugin(pluginNavigation);
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
    eleventyConfig.addPlugin(pluginBundle);
    eleventyConfig.addPlugin(pluginSyntaxHighlight, {
        preAttributes: { tabindex: 0 },
    });

    // App plugins
    eleventyConfig.addPlugin(pluginImages);

    // Run Rollup before Eleventy builds
    eleventyConfig.on("beforeBuild", async () => {
        const bundle = await rollup(rollupConfig);
        await bundle.write(rollupConfig.output);
        await bundle.close();
    });

    // Keeps the same directory structure.
    eleventyConfig.addPassthroughCopy({
        "src/css/": "css",
        "src/blog/video/": "video",
        "./node_modules/prismjs/themes/prism-okaidia.css":
            "/css/prism-okaidia.css",
    });
    eleventyConfig.addPassthroughCopy("src/font");
    eleventyConfig.addPassthroughCopy("src/img/favicon.ico");
    eleventyConfig.addPassthroughCopy("src/img/me.jpg");

    eleventyConfig.on("eleventy.before", async () => {
        const highlighter = await getHighlighter({
            themes: ["rose-pine-moon"],
            langs: [
                "shell",
                "csharp",
                "python",
                "javascript",
                "java",
                "xml",
                "json",
                "html",
            ],
        });
        eleventyConfig.amendLibrary("md", (mdLib) =>
            mdLib.set({
                highlight: (code, lang) =>
                    highlighter.codeToHtml(code, {
                        lang: lang,
                        theme: "rose-pine-moon",
                    }),
            })
        );
    });
    eleventyConfig.amendLibrary("md", (mdLib) => {
        mdLib
            .use(markdownItAnchor, {
                permalink: markdownItAnchor.permalink.ariaHidden({
                    placement: "after",
                    class: "header-anchor",
                    symbol: "#",
                    ariaHidden: false,
                }),
                level: [1, 2, 3, 4],
                slugify: eleventyConfig.getFilter("slugify"),
            })
            .use(markdownItFootnote);
    });
    eleventyConfig.addPlugin(pluginTOC, {
        ul: true,
    });

    // Watch content images for the image pipeline.
    eleventyConfig.addWatchTarget("blog/**/*.{svg,webp,png,jpeg}");

    eleventyConfig.setFrontMatterParsingOptions({
        excerpt: true,
        // Optional, default is "---"
        excerpt_separator: "<!-- excerpt -->",
    });

    return {
        templateFormats: ["md", "njk", "html", "liquid"],
        markdownTemplateEngine: "liquid",
        htmlTemplateEngine: "liquid",
        dir: {
            input: "src",
            includes: "_includes",
            data: "_data",
            output: "_site",
        },
        pathPrefix: "/",
    };
}

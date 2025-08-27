import path from "path";
import eleventyImage from "@11ty/eleventy-img";

export default function(eleventyConfig) {

    function relativeToInputPath(inputPath, relativeFilePath) {
        let split = inputPath.split("/");
        split.pop();

        return path.resolve(split.join(path.sep), relativeFilePath);

    }
    
    async function processImage(src, inputPath) {
        let input = relativeToInputPath(inputPath, src);
        return eleventyImage(input, {
            widths: ["auto"],
            formats: ["avif", "webp"],
            sharpAvifOptions: {quality: 60, effort: 7},
            sharpWebpOptions: {effort: 5},
            outputDir: path.join(eleventyConfig.dir.output, "/img"), // Advanced usage note: `eleventyConfig.dir` works here because we’re using addPlugin.
        });
    }
    
    eleventyConfig.addAsyncShortcode("image", async function imageShortcode(src, alt, cssClass, caption) {
        let metadata = await processImage(src, this.page.inputPath);

        caption = caption || "";
        let classes = cssClass === "" ? "post-image" : cssClass;
        const metaTag = classes === "post-thumbnail" 
			? `<meta property="og:image" content="https://pureooze.github.io${metadata.webp[0].url}" />` 
			: '';
        return `
            ${metaTag}
            <figure>
                <picture>
                    <source srcset=${metadata.avif[0].url} type="image/avif">
                    <img class="${classes}" src=${metadata.webp[0].url} alt="${alt}">
                </picture>
                <figcaption>${caption}</figcaption>
            </figure>
        `
    });
}

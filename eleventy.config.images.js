module.exports = function(eleventyConfig) {
    // Eleventy Image shortcode
    // https://www.11ty.dev/docs/plugins/image/
    eleventyConfig.addAsyncShortcode("image", async function imageShortcode(src, alt, width) {
        return `
            <picture>
                <source srcset="${src}.jxl" type="image/jxl">
                <source srcset="${src}.avif" type="image/avif">
                <img class="post-image" src="${src}.webp" alt="${alt}" width="${width}">
            </picture>
        `
    });
};
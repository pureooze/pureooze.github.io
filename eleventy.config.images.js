export default function(eleventyConfig) {
    // Eleventy Image shortcode
    // https://www.11ty.dev/docs/plugins/image/
    eleventyConfig.addAsyncShortcode("image", async function imageShortcode(src, alt, caption) {
        caption = caption || "";
        return `
            <figure>
                <picture>
                    <source srcset="${src}.jxl" type="image/jxl">
                    <source srcset="${src}.avif" type="image/avif">
                    <img class="post-image" src="${src}.webp" alt="${alt}">
                </picture>
                <figcaption>${caption}</figcaption>
            </figure>
        `
    });
}

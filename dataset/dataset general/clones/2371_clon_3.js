(function () {
    // This module provides a secure Markdown-to-HTML conversion utility.
    // It detects the runtime environment (Node.js/CommonJS or Browser)
    // to correctly expose its functionality and load dependencies.

    let moduleExportTarget;
    let CoreMarkdownConverter;

    // --- Environment Detection and Setup ---
    // Checks for CommonJS module system (e.g., Node.js) first.
    if (typeof module !== 'undefined' && module.exports) {
        // Running in a Node.js-like environment.
        moduleExportTarget = module.exports;
        CoreMarkdownConverter = require("./Markdown.Converter").Converter;
    } else {
        // Assuming a browser environment where the global 'window' object exists.
        // Expects the Markdown library to be available under `window.Markdown`.
        moduleExportTarget = window.Markdown;
        CoreMarkdownConverter = moduleExportTarget.Converter;
    }

    // --- Configuration Constants ---
    const POST_PROCESS_EVENT = "postConversion"; // The hook name for post-conversion operations.
    const TAG_NAME_EXTRACTOR = /<\/?(\w+).*/; // Regex to pull out the tag name from a full tag string.

    // --- Main Public Interface ---
    /**
     * Creates and returns a Markdown converter instance pre-configured with
     * HTML sanitization and tag balancing post-processing steps.
     * This ensures that generated HTML is safer for display.
     * @returns {object} A Markdown converter instance.
     */
    moduleExportTarget.createSecureHtmlTransformer = function () {
        const activeConverter = new CoreMarkdownConverter();

        // Register the necessary hooks to process the HTML after Markdown conversion.
        activeConverter.hooks.chain(POST_PROCESS_EVENT, filterUnsafeHtml);
        activeConverter.hooks.chain(POST_PROCESS_EVENT, regularizeHtmlStructure);

        // Basic validation of the instantiated converter.
        if (!activeConverter || typeof activeConverter.makeHtml !== 'function') {
            console.error("Critical: Failed to initialize Markdown converter. `makeHtml` method is missing.");
            // Depending on strictness, one might throw an error here.
        }

        return activeConverter;
    };

    // --- HTML Sanitization Logic ---

    /**
     * Iterates through an HTML string and replaces any non-whitelisted tags
     * with an empty string, effectively removing them.
     * @param {string} incomingHtml - The HTML string to be processed.
     * @returns {string} The HTML string with only allowed tags remaining.
     */
    function filterUnsafeHtml(incomingHtml) {
        // Guard against invalid or empty input.
        if (typeof incomingHtml !== 'string' || incomingHtml.length === 0) {
            return "";
        }

        // Regular expression to find any HTML tag structure.
        const htmlTagPattern = /<[^>]*>?/gi;

        // Replace each found tag based on whether it passes the permission checks.
        return incomingHtml.replace(htmlTagPattern, evaluateTagSafety);
    }

    // Whitelist Regular Expressions for Permitted HTML Tags and Attributes.
    // These patterns are designed to be restrictive and only allow commonly safe elements.
    const permittedStructuralTags = /^(<\/?(b|blockquote|code|del|dd|dl|dt|em|h[1-6]|i|kbd|li|ol(?: start="\d+")?|p|pre|s|sup|sub|strong|strike|ul)>|<(br|hr)\s*\/?\s*>)$/i;
    const permittedAnchorTags = /^(<a\shref="((https?|ftp):\/\/|\/)[-A-Za-z0-9+&@#\/%?=~_|!:,.;\(\)*[\]$]+"(\stitle="[^"<>"]*")?\s*>|<\/a>)$/i;
    const permittedImageTags = /^(<img\ssrc="(https?:\/\/|\/)[-A-Za-z0-9+&@#\/%?=~_|!:,.;\(\)*[\]$]+"(\swidth="\d{1,4}")?(\sheight="\d{1,4}")?(\salt="[^"<>"]*")?(\stitle="[^"<>"]*")?\s*\/?>)$/i;

    /**
     * Determines if a given HTML tag is safe according to predefined whitelist patterns.
     * @param {string} potentialTag - The individual HTML tag string to check.
     * @returns {string} The original tag string if it's safe, otherwise an empty string.
     */
    function evaluateTagSafety(potentialTag) {
        // Test the tag against each whitelist pattern.
        // The first match determines safety, ensuring order of checks isn't critical
        // unless there's overlap in patterns that needs specific precedence.
        if (permittedStructuralTags.test(potentialTag)) {
            return potentialTag;
        }

        if (permittedAnchorTags.test(potentialTag)) {
            return potentialTag;
        }

        if (permittedImageTags.test(potentialTag)) {
            return potentialTag;
        }

        // If no whitelist pattern matches, the tag is deemed unsafe and discarded.
        return "";
    }

    // --- HTML Tag Balancing Logic ---

    /**
     * Rectifies HTML tag imbalances by removing unmatched opening or closing tags.
     * This function assumes the input HTML has already been sanitized.
     * @param {string} rawHtmlContent - The HTML string to be balanced.
     * @returns {string} The HTML string with balanced tags.
     */
    function regularizeHtmlStructure(rawHtmlContent) {
        // Initial validation and early exit for trivial cases.
        if (typeof rawHtmlContent !== 'string' || rawHtmlContent.trim().length === 0) {
            return "";
        }

        // Regex to identify all HTML tags (opening, closing, self-closing).
        const tagCaptureRegex = /<\/?\w+[^>]*(\s|$|>)/g;

        // Extract all tags and convert to lowercase for consistent comparison.
        const allDetectedTags = rawHtmlContent.toLowerCase().match(tagCaptureRegex) || [];
        const totalTagCount = allDetectedTags.length;

        // If no tags are found, the content is already balanced (or contains no HTML).
        if (totalTagCount === 0) {
            return rawHtmlContent;
        }

        // Elements that are typically self-closing or do not require a matching closing tag.
        // Using a Set for efficient `has` lookups.
        const selfClosingOrVoidElements = new Set([
            "<p>", "<img>", "<br>", "<li>", "<hr>", "<meta>", "<link>", "<input>",
            "<area>", "<base>", "<col>", "<embed>", "<keygen>", "<param>", "<source>", "<track>", "<wbr>"
        ]);

        const tagPairedStatus = new Array(totalTagCount).fill(false); // Tracks if a tag has found its partner.
        const tagsMarkedForRemoval = new Array(totalTagCount).fill(false); // Flags tags to be removed.
        let removalOperationRequired = false; // Flag to optimize replacement later.

        // First pass: Identify unmatched tags.
        for (let currentIdx = 0; currentIdx < totalTagCount; currentIdx++) {
            const currentTagText = allDetectedTags[currentIdx];

            // Skip if already paired or if it's a known self-closing element.
            const extractedTagName = currentTagText.replace(TAG_NAME_EXTRACTOR, "$1");
            if (tagPairedStatus[currentIdx] || selfClosingOrVoidElements.has("<" + extractedTagName + ">")) {
                continue;
            }

            // Determine if the current tag is an opening tag.
            const isAnOpeningTag = currentTagText.startsWith('<') && !currentTagText.startsWith('</');

            if (isAnOpeningTag) {
                let matchingClosingTagIndex = -1;
                const expectedClosingTag = "</" + extractedTagName + ">";

                // Search forward for its corresponding closing tag.
                for (let searchForwardIdx = currentIdx + 1; searchForwardIdx < totalTagCount; searchForwardIdx++) {
                    // Only consider unpaired tags that exactly match the expected closing tag.
                    if (!tagPairedStatus[searchForwardIdx] && allDetectedTags[searchForwardIdx] === expectedClosingTag) {
                        matchingClosingTagIndex = searchForwardIdx;
                        break; // Found the match.
                    }
                }

                if (matchingClosingTagIndex === -1) {
                    // No closing tag found for this opening tag; mark the opening tag for removal.
                    tagsMarkedForRemoval[currentIdx] = true;
                    removalOperationRequired = true;
                } else {
                    // Mark both the opening tag and its matching closing tag as paired.
                    tagPairedStatus[matchingClosingTagIndex] = true;
                }
            } else {
                // This is a closing tag without a preceding, unpaired opening tag.
                // It's therefore an unmatched closing tag and must be removed.
                tagsMarkedForRemoval[currentIdx] = true;
                removalOperationRequired = true;
            }
        }

        // If no tags were flagged for removal, return the original HTML.
        if (!removalOperationRequired) {
            return rawHtmlContent;
        }

        // Second pass: Reconstruct the HTML string, omitting the marked tags.
        let tagPositionInArray = 0;
        const processedHtmlOutput = rawHtmlContent.replace(tagCaptureRegex, (fullTagMatch) => {
            // If the current tag was marked for removal, replace it with an empty string.
            // Otherwise, keep the original tag text.
            const replacement = tagsMarkedForRemoval[tagPositionInArray] ? "" : fullTagMatch;
            tagPositionInArray++; // Advance the pointer for the next tag.
            return replacement;
        });

        return processedHtmlOutput;
    }

})();
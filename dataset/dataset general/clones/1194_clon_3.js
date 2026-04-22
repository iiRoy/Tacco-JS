/*
 * html-to-md-transformer - Converts HTML markup to Markdown format
 *
 * (c) 2023, Your Name or Company
 * Distributed under the MIT License.
 *
 * This module transforms a given HTML string into its Markdown equivalent,
 * supporting common HTML tags and structures with robust parsing.
 */

// Conditional polyfill/import for HTML entity decoding.
// Attempts to load 'he' module in Node.js environments.
// Provides a fallback no-op function if 'he' is unavailable or in a browser.
const createEntityDecoder = () => {
    if (typeof module !== 'undefined' && module.exports) {
        try {
            const heModule = require('he');
            return heModule.decode;
        } catch (error) {
            console.warn('Dependency "he" (HTML entity decoder) not found. HTML entities may not be correctly processed.');
            // Fallback to a simple passthrough if module is missing
            return (input) => input;
        }
    }
    // In browser or if 'he' failed to load, return a passthrough function.
    // A more complete browser version might include a simpler entity decoder here.
    return (input) => input;
};

/**
 * Main function to convert an HTML string into a Markdown string.
 * @param {string} sourceContent - The HTML string to be converted.
 * @returns {string} The resulting Markdown string.
 */
const transformHtmlContent = function(sourceContent) {
    // --- Input Validation and Initialization ---
    if (typeof sourceContent !== 'string') {
        console.error("Error: Input for HTML to Markdown conversion must be a string. Received:", typeof sourceContent);
        return ''; // Return an empty string for invalid input
    }

    let workingHtmlString = sourceContent.trim(); // Trim initial whitespace
    if (workingHtmlString === '') {
        return ''; // Return empty for empty or whitespace-only input
    }

    // Initialize the HTML entity decoder
    const htmlEntityDecoder = createEntityDecoder();
    const commonRegexFlags = 'gi'; // Global and case-insensitive flags for most regex operations

    // --- Configuration for HTML Element Transformations ---
    // Each rule specifies a tag or tags, its category, and a converter function or string.
    const elementConversionRules = [
        {
            htmlTag: 'p',
            kind: 'block-level',
            converter: (matchData) => {
                // Paragraphs are typically separated by two newlines in Markdown.
                return matchData.innerHtmlContent ? `\n\n${matchData.innerHtmlContent}\n` : '';
            }
        },
        {
            htmlTag: 'br',
            kind: 'void-element',
            converter: '\n' // <br> becomes a single newline
        },
        {
            htmlTag: 'h([1-6])', // Captures the heading level (1-6)
            kind: 'block-level',
            converter: (matchData) => {
                const level = parseInt(matchData.firstCaptureGroup, 10);
                const hashPrefix = '#'.repeat(level);
                return `\n\n${hashPrefix} ${matchData.innerHtmlContent}\n`;
            }
        },
        {
            htmlTag: 'hr',
            kind: 'void-element',
            converter: '\n\n---\n' // Horizontal rule, common Markdown syntax
        },
        {
            htmlTag: 'a',
            kind: 'inline-element',
            converter: (matchData) => {
                const linkUrlMatch = extractAttributeValue(matchData.attributeString, 'href');
                const linkTitleMatch = extractAttributeValue(matchData.attributeString, 'title');

                const url = linkUrlMatch || '';
                const titlePart = linkTitleMatch ? ` "${linkTitleMatch}"` : '';

                if (url) {
                    return `[${matchData.innerHtmlContent}](${url}${titlePart})`;
                }
                return matchData.fullMatch; // If no href, return original HTML fragment
            }
        },
        {
            htmlTag: ['b', 'strong'],
            kind: 'inline-element',
            converter: (matchData) => {
                return matchData.innerHtmlContent ? `**${matchData.innerHtmlContent}**` : '';
            }
        },
        {
            htmlTag: ['i', 'em'],
            kind: 'inline-element',
            converter: (matchData) => {
                return matchData.innerHtmlContent ? `*${matchData.innerHtmlContent}*` : '';
            }
        },
        {
            htmlTag: 'code',
            kind: 'inline-element',
            converter: (matchData) => {
                // Decode HTML entities specifically within code blocks
                return matchData.innerHtmlContent ? `\`${htmlEntityDecoder(matchData.innerHtmlContent)}\`` : '';
            }
        },
        {
            htmlTag: 'img',
            kind: 'void-element',
            converter: (matchData) => {
                const imageUrlMatch = extractAttributeValue(matchData.attributeString, 'src');
                const imageAltMatch = extractAttributeValue(matchData.attributeString, 'alt');
                const imageTitleMatch = extractAttributeValue(matchData.attributeString, 'title');

                const altText = imageAltMatch || '';
                const imageUrl = imageUrlMatch || '';
                const imageTitle = imageTitleMatch ? ` "${imageTitleMatch}"` : '';

                if (imageUrl) {
                    return `![${altText}](${imageUrl}${imageTitle})`;
                }
                return matchData.fullMatch; // If no src, return original img tag
            }
        }
    ];

    // --- Apply General Element Transformations ---
    for (const rule of elementConversionRules) {
        // Handle rules that apply to multiple tags (e.g., 'b', 'strong')
        const tagsToConvert = Array.isArray(rule.htmlTag) ? rule.htmlTag : [rule.htmlTag];

        for (const tagIdentifier of tagsToConvert) {
            workingHtmlString = processHtmlFragment(
                workingHtmlString,
                {
                    tag: tagIdentifier,
                    transformationFunction: rule.converter,
                    elementType: rule.kind
                }
            );
        }
    }

    /**
     * Applies a single HTML element transformation rule to the given HTML string.
     * @param {string} inputMarkup - The HTML string to be modified.
     * @param {object} config - Configuration object for the transformation.
     * @param {string} config.tag - The HTML tag name or regex pattern (e.g., 'p', 'h([1-6])').
     * @param {Function|string} config.transformationFunction - Function or string to generate Markdown.
     * @param {string} config.elementType - Category like 'void-element' or 'block-level'.
     * @returns {string} The updated HTML string with the element converted.
     */
    function processHtmlFragment(inputMarkup, config) {
        // Construct the regex pattern based on whether it's a void or regular element.
        const regexPattern = config.elementType === 'void-element'
            ? `<${config.tag}\\b([^>]*)\\/?>` // For self-closing tags like <br/> or <img>
            : `<${config.tag}\\b([^>]*)>([\\s\\S]*?)<\\/${config.tag}>`; // For tags with content like <p>...</p>

        const elementMatcher = new RegExp(regexPattern, commonRegexFlags);

        // If the converter is a simple string, perform a direct replacement.
        if (typeof config.transformationFunction === 'string') {
            return inputMarkup.replace(elementMatcher, config.transformationFunction);
        } else {
            // If it's a function, call it with structured match data.
            return inputMarkup.replace(elementMatcher, (fullMatch, ...captureGroups) => {
                // Determine the indices of attribute string and inner HTML content based on tag pattern.
                const hasExtraCapture = config.tag.includes('('); // e.g., h([1-6]) has an extra group for the level
                const attributeStringIndex = 0;
                const innerHtmlContentIndex = hasExtraCapture ? 2 : 1;

                const matchData = {
                    fullMatch: fullMatch,
                    firstCaptureGroup: hasExtraCapture ? captureGroups[0] : undefined, // For things like heading level
                    attributeString: captureGroups[attributeStringIndex] || '',
                    innerHtmlContent: captureGroups[innerHtmlContentIndex] || ''
                };
                return config.transformationFunction(matchData);
            });
        }
    }

    /**
     * Extracts the value of a specific attribute from an HTML attribute string.
     * @param {string} attributesText - The string containing all attributes (e.g., 'href="/link" title="Title"').
     * @param {string} attributeName - The name of the attribute to find (e.g., 'href').
     * @returns {string|null} The attribute's value, or null if not found.
     */
    function extractAttributeValue(attributesText, attributeName) {
        // Regex to find attribute='value', attribute="value", or attribute=value (unquoted)
        // The value is captured in the first group, regardless of quoting.
        const attributeRegex = new RegExp(`${attributeName}\\s*=\\s*(?:['"]([^'"]*)['"]|([^\\s>]*))`, 'i');
        const match = attributesText.match(attributeRegex);
        // Return the first non-null/undefined captured group, which will be the value.
        if (match) {
            return match[1] || match[2] || null;
        }
        return null;
    }

    // --- Special Processing for <pre> Code Blocks ---
    // This phase preserves content formatting within <pre> tags.
    workingHtmlString = workingHtmlString.replace(/<pre\b[^>]*>([\s\S]+?)<\/pre>/gi, (fullMatch, preContent) => {
        // Convert leading tabs to two spaces per tab, globally across all lines
        let formattedPreContent = preContent.replace(/^\t+/gm, '  ');
        // Indent all lines within the pre block by 4 spaces
        formattedPreContent = formattedPreContent.replace(/\n/g, '\n    ');
        // Add surrounding newlines and the initial 4-space indentation for the block
        return `\n\n    ${formattedPreContent}\n`;
    });

    // --- List Handling (Ordered and Unordered) ---

    // Escape numbers that could accidentally trigger an ordered list in Markdown
    // (e.g., "1. Some text" at the start of a line).
    workingHtmlString = workingHtmlString.replace(/^(\s{0,3}\d+)\. /gm, '$1\\. ');

    // Process lists iteratively from the deepest nested lists outwards.
    // This regex identifies <ul> or <ol> blocks that do not contain other <ul> or <ol> tags.
    const deepestListRegex = /<(ul|ol)\b[^>]*>(?:(?!<ul|<ol)[\s\S])*?<\/\1>/gi;
    let listPassCount = 0;
    const maxListProcessingPasses = 20; // Safety break for extremely deep or malformed lists

    while (workingHtmlString.match(deepestListRegex) && listPassCount < maxListProcessingPasses) {
        workingHtmlString = workingHtmlString.replace(deepestListRegex, (matchedListHtml) => {
            return convertSingleListToMarkdown(matchedListHtml);
        });
        listPassCount++;
    }

    /**
     * Converts a single HTML list (either <ul> or <ol>) to Markdown.
     * Assumes the input HTML segment contains only one top-level list and no nested lists.
     * @param {string} htmlListSegment - The HTML string of a list.
     * @returns {string} The Markdown representation of the list.
     */
    function convertSingleListToMarkdown(htmlListSegment) {
        return htmlListSegment.replace(/<(ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi, (match, listType, listInnerHtml) => {
            // Split by </li>, then filter out any empty strings resulting from the split
            let rawListItems = listInnerHtml.split('</li>').filter(item => item.trim() !== '');

            const markdownListItems = [];
            for (let i = 0; i < rawListItems.length; i++) {
                let currentItemHtml = rawListItems[i];
                if (currentItemHtml.trim() === '') continue; // Skip truly empty items

                // Determine the Markdown bullet/number prefix
                const listItemPrefix = (listType === 'ol') ? `${i + 1}.  ` : `*   `;

                // Process the content of each <li> tag
                currentItemHtml = currentItemHtml.replace(/\s*<li[^>]*>([\s\S]*)/i, (liMatch, liContent) => {
                    let cleanedLiContent = liContent.trim();
                    // Indent paragraphs within list items
                    cleanedLiContent = cleanedLiContent.replace(/\n\n/g, '\n\n    ');
                    // Indent any nested Markdown lists or blockquotes that might be within this list item
                    cleanedLiContent = cleanedLiContent.replace(/\n([ ]*)+(\*|\d+\.) /g, '\n$1    $2 ');
                    return listItemPrefix + cleanedLiContent;
                });
                markdownListItems.push(currentItemHtml);
            }
            return markdownListItems.join('\n');
        });
    }

    // --- Blockquote Processing ---
    // Similar to lists, process nested blockquotes from the deepest level outwards.
    const deepestBlockquoteRegex = /<blockquote\b[^>]*>((?:(?!<blockquote)[\s\S])*?)<\/blockquote>/gi;
    let blockquotePassCount = 0;
    const maxBlockquoteProcessingPasses = 20; // Safety break

    while (workingHtmlString.match(deepestBlockquoteRegex) && blockquotePassCount < maxBlockquoteProcessingPasses) {
        workingHtmlString = workingHtmlString.replace(deepestBlockquoteRegex, (matchedQuoteHtml) => {
            return convertSingleBlockquoteToMarkdown(matchedQuoteHtml);
        });
        blockquotePassCount++;
    }

    /**
     * Converts a single HTML blockquote segment to Markdown.
     * Assumes the input HTML segment contains only one top-level blockquote.
     * @param {string} htmlQuoteSegment - The HTML string of a blockquote.
     * @returns {string} The Markdown representation.
     */
    function convertSingleBlockquoteToMarkdown(htmlQuoteSegment) {
        return htmlQuoteSegment.replace(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi, (match, quoteInnerContent) => {
            let processedContent = quoteInnerContent.replace(/^\s+|\s+$/g, ''); // Trim leading/trailing whitespace
            processedContent = normalizeMarkdownOutput(processedContent); // Apply general cleanup
            processedContent = processedContent.replace(/^/gm, '> '); // Prefix each line with '> '

            // Normalize nested blockquote prefixes: `>   > ` or `> > > ` becomes `> > `
            // This ensures consistent spacing for nested quotes.
            processedContent = processedContent.replace(/^(>\s*){2,}([^>]*)/gm, '> > $2');

            return processedContent;
        });
    }

    /**
     * Performs final cleanup and normalization on the generated Markdown string.
     * This includes trimming, collapsing multiple newlines, and removing trailing spaces.
     * @param {string} inputMarkdownString - The Markdown string to clean.
     * @returns {string} The cleaned Markdown string.
     */
    function normalizeMarkdownOutput(inputMarkdownString) {
        let cleanedMarkdown = inputMarkdownString;
        // Trim leading/trailing whitespace (including newlines and tabs) from the entire document
        cleanedMarkdown = cleanedMarkdown.replace(/^[\t\r\n\s]+|[\t\r\n\s]+$/g, '');
        // Collapse multiple blank lines into a single blank line
        cleanedMarkdown = cleanedMarkdown.replace(/\n\s*\n/g, '\n\n');
        // Limit consecutive newlines to a maximum of two
        cleanedMarkdown = cleanedMarkdown.replace(/\n{3,}/g, '\n\n');
        // Remove any trailing spaces or tabs from the end of each line
        cleanedMarkdown = cleanedMarkdown.replace(/[ \t]+$/gm, '');
        return cleanedMarkdown;
    }

    // --- Final Cleanup and Return ---
    return normalizeMarkdownOutput(workingHtmlString);
};

// --- Module Export ---
// Provides compatibility for both Node.js (CommonJS) and browser environments.
if (typeof module !== 'undefined' && module.exports) {
    module.exports.convert = transformHtmlContent;
} else if (typeof window !== 'undefined') {
    // Expose the converter function globally in browser environments
    window.htmlToMarkdownConverter = transformHtmlContent;
}
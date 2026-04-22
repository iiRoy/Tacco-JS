var ContentProcessor = ContentProcessor || {};

ContentProcessor.MarkdownConverter = ContentProcessor.MarkdownConverter || {};

//
// This module provides a mechanism for converting Markdown-formatted text into HTML.
// It aims to replicate the behavior of the original Perl Markdown script closely.
//
// The design leverages a series of string manipulations and regular expressions
// to transform the input. While this approach can be challenging for maintenance,
// it ensures high compatibility with the original Markdown specification and its
// edge cases, allowing for consistent client-side previews and server-side rendering.
//
// Modern JavaScript environments (ECMAScript 3rd Edition and later) are required
// due to reliance on advanced regular expression features.
//

ContentProcessor.MarkdownConverter.Processor = function() {

    // Internal state variables, shared across processing steps for a single conversion.
    // These are reset for each new conversion to prevent cross-contamination.
    let linkStorageMap; // Stores URLs for reference links.
    let titleStorageMap; // Stores titles for reference links.
    let htmlBlockCache; // Caches raw HTML blocks to prevent Markdown processing within them.
    let currentListDepth = 0; // Tracks nesting level for ordered/unordered lists.

    /**
     * Executes the main Markdown to HTML conversion process.
     * The sequence of operations is critical for correct output.
     *
     * @param {string} rawInput The Markdown-formatted text to convert.
     * @returns {string} The HTML-formatted output.
     */
    this.transformToHtml = function(rawInput) {
        // Initialize or clear the internal state for a fresh conversion.
        linkStorageMap = new Map();
        titleStorageMap = new Map();
        htmlBlockCache = [];
        currentListDepth = 0; // Ensure list depth is reset.

        let processedText = String(rawInput || ''); // Ensure input is a string, handle null/undefined.

        // Pre-processing: escape special characters that might conflict with internal markers.
        // Replace tilde (~) with a unique marker to avoid conflicts with internal hashes.
        processedText = processedText.replace(/~/g, "~_TILDE_~");

        // Replace dollar sign ($) with a unique marker. RegExp treats $ specially in replacement strings.
        processedText = processedText.replace(/\$/g, "~_DOLLAR_~");

        // Standardize line endings to Unix style for consistent regex matching.
        processedText = processedText.replace(/\r\n|\r/g, "\n");

        // Ensure the text starts and ends with at least two newlines.
        // This simplifies block-level regex patterns by providing consistent boundaries.
        processedText = "\n\n" + processedText + "\n\n";

        // Convert all tabs to spaces. This simplifies subsequent regex operations.
        processedText = standardizeTabsToSpaces(processedText);

        // Remove lines that contain only spaces and tabs. This helps in matching
        // consecutive blank lines with simpler patterns like /\n+/.
        processedText = processedText.replace(/^[ \t]+$/mg, "");

        // Isolate and cache block-level HTML elements to prevent Markdown processing within them.
        processedText = cacheRawHtmlBlocks(processedText);

        // Extract link definitions (e.g., `[id]: url "title"`) and store them.
        // These definitions are then removed from the text.
        processedText = extractLinkDefinitions(processedText);

        // Process block-level Markdown elements (headers, lists, code blocks, blockquotes, paragraphs).
        processedText = processBlockElements(processedText);

        // Post-processing: restore original special characters.
        processedText = restoreEscapedCharacters(processedText);

        // Restore original dollar signs.
        processedText = processedText.replace(/~_DOLLAR_~/g, "$");

        // Restore original tildes.
        processedText = processedText.replace(/~_TILDE_~/g, "~");

        return processedText;
    };

    /**
     * Extracts and stores reference link definitions from the text.
     * Link definitions are removed from the main text.
     *
     * @param {string} content The input text.
     * @returns {string} The text with link definitions removed.
     */
    const extractLinkDefinitions = function(content) {
        // Regex to find link definitions like: `[id]: url "optional title"`
        // The regex captures ID, URL, and optional title.
        // Note: The original regex for `_StripLinkDefinitions` had a complex `m3` capture for newlines
        // which was then used to revert the title. This simplified version assumes `m3` is empty
        // if a title is present directly after the URL, or if it's not a title, it's just content.
        // We avoid the `m3` logic by simply checking if `m4` (the title group) exists.
        const definitionPattern = /^[ ]{0,3}\[(.+?)\]:[ \t]*\n?[ \t]*<?(\S+?)>?[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+)/gm;

        let processedContent = content.replace(definitionPattern,
            function(fullMatch, idCapture, urlCapture, newlineBeforeTitle, titleCapture) {
                // IDs are case-insensitive.
                const normalizedId = idCapture.toLowerCase();
                linkStorageMap.set(normalizedId, sanitizeUrl(urlCapture));

                if (titleCapture) {
                    // Store title, escaping quotes.
                    titleStorageMap.set(normalizedId, titleCapture.replace(/"/g, "&quot;"));
                }
                
                // Return empty string to remove the definition from the text.
                return "";
            }
        );

        return processedContent;
    };

    /**
     * Identifies and caches block-level HTML elements to prevent Markdown processing within them.
     * The cached blocks are replaced with placeholder tokens.
     *
     * @param {string} content The input text.
     * @returns {string} The text with HTML blocks replaced by placeholders.
     */
    const cacheRawHtmlBlocks = function(content) {
        // Add extra newlines to simplify lookaround assertions in regex.
        let workingContent = content.replace(/\n/g, "\n\n");

        // Define common block-level HTML tags.
        const BlockElementsSetA = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del";
        const BlockElementsSetB = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math";

        // First pass: Match nested block elements starting at the left margin.
        // This is important for correctly handling structures like `<div><div>...</div></div>`.
        workingContent = workingContent.replace(
            new RegExp(`^(<(${BlockElementsSetA})\\b[^\\r]*?\\n<\\/\\2>[ \\t]*(?=\\n+))`, 'gm'),
            storeAndReplaceHtmlBlock
        );

        // Second pass: Match more general block elements from `\n<tag>` to `</tag>\n`.
        workingContent = workingContent.replace(
            new RegExp(`^(<(${BlockElementsSetB})\\b[^\\r]*?.*<\\/\\2>[ \\t]*(?=\\n+)\\n)`, 'gm'),
            storeAndReplaceHtmlBlock
        );

        // Special case for self-closing horizontal rule tags (<hr />).
        workingContent = workingContent.replace(
            /(\n[ ]{0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g,
            storeAndReplaceHtmlBlock
        );

        // Special case for standalone HTML comments (<!-- ... -->).
        workingContent = workingContent.replace(
            /(\n\n[ ]{0,3}<!(--[^\r]*?--\s*)+>[ \t]*(?=\n{2,}))/g,
            storeAndReplaceHtmlBlock
        );

        // Handle PHP/ASP-style processing instructions (<?...?> and <%...%>).
        workingContent = workingContent.replace(
            /(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g,
            storeAndReplaceHtmlBlock
        );

        // Remove the extra newlines added at the beginning of this function.
        workingContent = workingContent.replace(/\n\n/g, "\n");
        return workingContent;
    };

    /**
     * Callback for `String.prototype.replace` to store an HTML block and return a placeholder.
     *
     * @param {string} fullMatch The entire matched HTML block.
     * @param {string} capturedBlock The actual block content to be stored.
     * @returns {string} A placeholder token (`~_BLOCK_K_x_K_~`) for the stored block.
     */
    const storeAndReplaceHtmlBlock = function(fullMatch, capturedBlock) {
        let blockContent = capturedBlock;

        // Remove temporary double newlines.
        blockContent = blockContent.replace(/\n\n/g, "\n");
        blockContent = blockContent.replace(/^\n/, ""); // Remove leading newline.
        
        // Trim trailing blank lines.
        blockContent = blockContent.replace(/\n+$/g, "");
        
        // Store the block and return a unique placeholder.
        const blockIndex = htmlBlockCache.push(blockContent) - 1;
        return `\n\n~_BLOCK_K_${blockIndex}_K_~\n\n`;
    };

    /**
     * Processes all block-level Markdown elements.
     *
     * @param {string} content The input text.
     * @returns {string} The text with block-level elements converted to HTML.
     */
    const processBlockElements = function(content) {
        let currentContent = content;

        currentContent = processHeaders(currentContent);

        // Process horizontal rules.
        const hrPlaceholder = generateBlockPlaceholder("<hr />");
        currentContent = currentContent.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm, hrPlaceholder);
        currentContent = currentContent.replace(/^[ ]{0,2}([ ]?-[ ]?){3,}[ \t]*$/gm, hrPlaceholder);
        currentContent = currentContent.replace(/^[ ]{0,2}([ ]?_[ ]?){3,}[ \t]*$/gm, hrPlaceholder);

        currentContent = processLists(currentContent);
        currentContent = processCodeBlocks(currentContent);
        currentContent = processBlockQuotes(currentContent);

        // Re-run HTML block caching. This is necessary to prevent Markdown processing
        // within any HTML generated by the previous steps (e.g., if a list item contains raw HTML).
        currentContent = cacheRawHtmlBlocks(currentContent);
        currentContent = formParagraphs(currentContent);

        return currentContent;
    };

    /**
     * Generates a placeholder for a given HTML block and stores it in the cache.
     * This is useful for replacing simple, repetitive HTML elements like `<hr />`.
     *
     * @param {string} htmlString The HTML string to cache.
     * @returns {string} The placeholder token.
     */
    const generateBlockPlaceholder = function(htmlString) {
        const blockIndex = htmlBlockCache.push(htmlString) - 1;
        return `\n\n~_BLOCK_K_${blockIndex}_K_~\n\n`;
    };

    /**
     * Processes all span-level Markdown elements (inline formatting).
     *
     * @param {string} content The input text.
     * @returns {string} The text with span-level elements converted to HTML.
     */
    const processSpanElements = function(content) {
        let currentContent = content;

        currentContent = processCodeSpans(currentContent);
        currentContent = escapeSpecialCharsInTagAttributes(currentContent);
        currentContent = encodeBackslashEscapes(currentContent);

        // Process images before anchors because `![alt][id]` looks like an anchor.
        currentContent = processImages(currentContent);
        currentContent = processAnchors(currentContent);

        // Convert auto-links (e.g., `<http://example.com/>`).
        // Must come after `processAnchors` to avoid conflicts with inline links using `<...>` delimiters.
        currentContent = processAutoLinks(currentContent);
        currentContent = encodeAmpsAndAngles(currentContent);
        currentContent = processEmphasis(currentContent);

        // Convert two or more spaces at the end of a line into a hard break (`<br />`).
        currentContent = currentContent.replace(/  +\n/g, " <br />\n");

        return currentContent;
    };

    /**
     * Escapes Markdown special characters (`\`, ` `, `` ` ``, `*`, `_`) within HTML tag attributes.
     * This prevents Markdown processing of these characters when they appear inside HTML tags.
     *
     * @param {string} content The input text.
     * @returns {string} The text with special characters in tag attributes escaped.
     */
    const escapeSpecialCharsInTagAttributes = function(content) {
        // Regex to find HTML tags and comments.
        const htmlTagCommentRegex = /(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--.*?--\s*)+>)/gi;

        let processedContent = content.replace(htmlTagCommentRegex, function(fullTagMatch) {
            let tag = fullTagMatch;
            // Temporarily replace `<code>` markers with backticks to ensure they are escaped correctly.
            // This is a specific behavior carried over from the original `showdown.js`.
            tag = tag.replace(/(.)<\/?code>(?=.)/g, "$1`");
            // Escape the actual Markdown special characters.
            tag = escapeCharacters(tag, "\\`*_");
            return tag;
        });

        return processedContent;
    };

    /**
     * Converts Markdown link shortcuts into XHTML `<a>` tags.
     * Handles reference-style, inline-style, and implicit reference-style links.
     *
     * @param {string} content The input text.
     * @returns {string} The text with Markdown links converted to HTML anchors.
     */
    const processAnchors = function(content) {
        let processedContent = content;

        // First, handle reference-style links: `[link text] [id]`
        processedContent = processedContent.replace(
            /(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,
            generateAnchorTag
        );

        // Next, inline-style links: `[link text](url "optional title")`
        processedContent = processedContent.replace(
            /(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?(.*?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,
            generateAnchorTag
        );

        // Last, handle implicit reference-style links: `[link text]`
        // These must come last to avoid conflicts with explicit reference or inline links.
        processedContent = processedContent.replace(
            /(\[([^\[\]]+)\])()()()()()/g,
            generateAnchorTag
        );

        return processedContent;
    };

    /**
     * Callback function used by `String.prototype.replace` to construct an `<a>` tag.
     * This function parses the captures from the link regex and builds the HTML.
     *
     * @param {string} fullMatch The entire matched link string.
     * @param {string} linkGroup1 The first capturing group (the entire link).
     * @param {string} linkText The text of the link.
     * @param {string} linkId The ID for reference links, or empty for inline/implicit.
     * @param {string} linkUrl The URL for inline links, or empty for reference/implicit.
     * @param {string} titleGroup The full title group (e.g., ` "title" `).
     * @param {string} quoteChar The quote character used for the title.
     * @param {string} linkTitle The actual title text.
     * @returns {string} The HTML `<a>` tag.
     */
    const generateAnchorTag = function(fullMatch, linkGroup1, linkText, linkId, linkUrl, titleGroup, quoteChar, linkTitle) {
        if (linkGroup1 === undefined) {
            return fullMatch; // Should not happen with correct regex.
        }

        let url = linkUrl;
        let title = linkTitle;

        if (linkId) {
            // Reference-style link
            linkId = linkId.toLowerCase();
            url = linkStorageMap.get(linkId);
            title = titleStorageMap.get(linkId);

            if (!url) {
                return fullMatch; // If ID not found, return original Markdown.
            }
        } else if (!url) {
            // Implicit reference-style link: `[text]` where `text` is also the ID.
            linkId = linkText.toLowerCase();
            url = linkStorageMap.get(linkId);
            title = titleStorageMap.get(linkId);

            if (!url) {
                return fullMatch; // If ID not found, return original Markdown.
            }
        }

        // Apply span-level processing to the link text.
        linkText = processSpanElements(linkText);

        let anchorAttrs = `href="${url}"`;
        if (title) {
            anchorAttrs += ` title="${title}"`;
        }

        // Return the constructed HTML anchor tag.
        return `<a ${anchorAttrs}>${linkText}</a>`;
    };


    // --- Helper Functions (placeholders for now, will implement/rename them) ---

    // Renamed from _Detab
    const standardizeTabsToSpaces = function(text) {
        // Replace tabs with 4 spaces.
        return text.replace(/\t/g, "    ");
    };

    // Renamed from _UnescapeSpecialChars
    const restoreEscapedCharacters = function(text) {
        // Restore characters that were escaped during initial processing.
        // This includes block placeholders.
        return text.replace(/~_BLOCK_K_(\d+)_K_~/g, function(wholeMatch, id) {
            return htmlBlockCache[id];
        });
    };

    // Renamed from _DoHeaders
    const processHeaders = function(text) {
        // Implement header conversion logic (e.g., # Header -> <h1>Header</h1>)
        return text; // Placeholder
    };

    // Renamed from _DoLists
    const processLists = function(text) {
        // Implement list conversion logic
        return text; // Placeholder
    };

    // Renamed from _DoCodeBlocks
    const processCodeBlocks = function(text) {
        // Implement code block conversion logic
        return text; // Placeholder
    };

    // Renamed from _DoBlockQuotes
    const processBlockQuotes = function(text) {
        // Implement blockquote conversion logic
        return text; // Placeholder
    };

    // Renamed from _FormParagraphs
    const formParagraphs = function(text) {
        // Implement paragraph wrapping logic
        return text; // Placeholder
    };

    // Renamed from _DoCodeSpans
    const processCodeSpans = function(text) {
        // Implement inline code conversion logic (`code` -> <code>code</code>)
        return text; // Placeholder
    };

    // Renamed from _EncodeBackslashEscapes
    const encodeBackslashEscapes = function(text) {
        // Implement backslash escape conversion logic
        return text; // Placeholder
    };

    // Renamed from _DoImages
    const processImages = function(text) {
        // Implement image conversion logic
        return text; // Placeholder
    };

    // Renamed from _DoAutoLinks
    const processAutoLinks = function(text) {
        // Implement auto-link conversion logic
        return text; // Placeholder
    };

    // Renamed from _EncodeAmpsAndAngles
    const encodeAmpsAndAngles = function(text) {
        // Implement & and <, > escaping logic
        return text; // Placeholder
    };

    // Renamed from _DoItalicsAndBold
    const processEmphasis = function(text) {
        // Implement italics and bold conversion logic
        return text; // Placeholder
    };

    // Renamed from escapeCharacters, simplified arguments for now.
    const escapeCharacters = function(text, charsToEscape) {
        let pattern = new RegExp(`[${charsToEscape.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}]`, 'g');
        return text.replace(pattern, function(char) {
            // For simplicity, just HTML entity encode them.
            // Original showdown might have specific internal escape sequences.
            switch (char) {
                case '&': return '&amp;';
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '"': return '&quot;';
                case "'": return '&#39;';
                default: return `&#${char.charCodeAt(0)};`; // Generic numeric entity
            }
        });
    };

    // Renamed from _EncodeAmpsAndAngles (specific to URL part of link definition)
    const sanitizeUrl = function(url) {
        // Encode '&' as '&amp;' and '<' as '&lt;' and '>' as '&gt;' in URLs.
        // This prevents Markdown from interpreting them.
        let sanitized = url.replace(/&/g, "&amp;");
        sanitized = sanitized.replace(/</g, "&lt;");
        sanitized = sanitized.replace(/>/g, "&gt;");
        return sanitized;
    };
};
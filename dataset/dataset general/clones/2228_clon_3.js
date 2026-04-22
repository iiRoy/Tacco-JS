let MarkdownProcessor;

if (typeof module === "object" && module.exports) {
    // We're in a CommonJS (e.g. Node.js) module environment
    MarkdownProcessor = module.exports;
} else {
    // Assume browser environment, expose globally
    MarkdownProcessor = window.MarkdownProcessor = {};
}

(function () {

    const passThrough = val => val;
    const alwaysFalse = () => false;

    /**
     * @class EventPipeline
     * Manages a collection of named function hooks, allowing them to be chained or replaced.
     */
    function EventPipeline() {}

    Object.assign(EventPipeline.prototype, {

        /**
         * Chains a new function to an existing hook. The new function will be called
         * with the result of the previous function in the chain.
         * @param {string} eventName - The name of the hook.
         * @param {function} actionFn - The function to add to the chain.
         */
        interleave: function (eventName, actionFn) {
            if (typeof actionFn !== 'function') {
                throw new TypeError(`Handler for '${eventName}' must be a function.`);
            }
            const prevHandler = this[eventName];
            if (!prevHandler) {
                throw new Error(`Unknown event hook: '${eventName}'.`);
            }

            if (prevHandler === passThrough) {
                this[eventName] = actionFn;
            } else {
                this[eventName] = function (inputVal) {
                    return actionFn(prevHandler(inputVal));
                };
            }
        },

        /**
         * Replaces an existing hook with a new function.
         * @param {string} eventName - The name of the hook.
         * @param {function} actionFn - The function to set as the new handler.
         */
        assign: function (eventName, actionFn) {
            if (typeof actionFn !== 'function') {
                throw new TypeError(`Handler for '${eventName}' must be a function.`);
            }
            if (!this[eventName]) {
                throw new Error(`Unknown event hook: '${eventName}'.`);
            }
            this[eventName] = actionFn;
        },

        /**
         * Adds a no-operation (passthrough) function for a new hook.
         * @param {string} eventName - The name of the hook to add.
         */
        registerPassthrough: function (eventName) {
            this[eventName] = passThrough;
        },

        /**
         * Adds a function that always returns false for a new hook.
         * @param {string} eventName - The name of the hook to add.
         */
        registerFalsey: function (eventName) {
            this[eventName] = alwaysFalse;
        }
    });

    MarkdownProcessor.EventPipeline = EventPipeline;

    /**
     * @class SafeMapStorage
     * Provides a safe way to store key-value pairs, preventing issues with
     * prototype pollution or built-in object property names.
     */
    function SafeMapStorage() {}
    Object.assign(SafeMapStorage.prototype, {
        /**
         * Stores a value associated with an identifier.
         * @param {string} identifier - The key for the storage.
         * @param {*} payload - The value to store.
         */
        storeEntry: function (identifier, payload) {
            this["_sec_" + identifier] = payload;
        },
        /**
         * Retrieves a value associated with an identifier.
         * @param {string} identifier - The key to retrieve.
         * @returns {*} The stored value, or undefined if not found.
         */
        retrieveEntry: function (identifier) {
            return this["_sec_" + identifier];
        }
    });

    /**
     * @class DocumentConverter
     * Converts Markdown formatted text into HTML.
     */
    MarkdownProcessor.DocumentConverter = function () {
        const processingPipeline = this.hooks = new EventPipeline();
        processingPipeline.registerPassthrough("linkTextProcessor");
        processingPipeline.registerPassthrough("preParseHook");
        processingPipeline.registerPassthrough("postGenerateHook");

        // Private state for the converter instance
        let urlRegistry;
        let titleRegistry;
        let htmlBlockCache;
        let currentListDepth;

        const _TILDE_ESC_ = "~T"; // Placeholder for escaped tilde
        const _DOLLAR_ESC_ = "~D"; // Placeholder for escaped dollar sign
        const _HTML_BLOCK_MARKER_ = "~K"; // Marker for HTML blocks
        const _PROTOCOL_PLACEHOLDER_ = "~P"; // Placeholder for protocol in auto-links

        /**
         * Initializes the converter's internal state for a new conversion.
         */
        const _resetConverterState = () => {
            urlRegistry = new SafeMapStorage();
            titleRegistry = new SafeMapStorage();
            htmlBlockCache = [];
            currentListDepth = 0;
        };

        /**
         * Cleans up the converter's internal state after a conversion.
         */
        const _cleanUpConverterState = () => {
            urlRegistry = null;
            titleRegistry = null;
            htmlBlockCache = null;
        };

        /**
         * Main function to convert Markdown input to HTML output.
         * @param {string} inputContent - The Markdown text to convert.
         * @returns {string} The resulting HTML.
         */
        this.convertContent = function (inputContent) {

            // Prevent re-entrant calls which would corrupt internal state.
            if (urlRegistry) {
                throw new Error("Recursive call detected to converter.convertContent. This is not supported.");
            }

            _resetConverterState();

            let processingResult = processingPipeline.preParseHook(inputContent);

            // Handle special characters that might conflict with internal processing
            processingResult = processingResult.replace(/~/g, _TILDE_ESC_);
            processingResult = processingResult.replace(/\$/g, _DOLLAR_ESC_);

            // Normalize line endings to Unix style
            processingResult = processingResult.replace(/\r\n|\r/g, "\n");

            // Ensure content starts and ends with at least two newlines
            processingResult = "\n\n" + processingResult + "\n\n";

            // Convert all tabs to spaces
            processingResult = _NormalizeTabsToSpaces(processingResult);

            // Strip lines containing only whitespace
            processingResult = processingResult.replace(/^[ \t]+$/mg, "");

            // Cache block-level HTML to prevent Markdown processing within them
            processingResult = _IsolateBlockLevelHtml(processingResult);

            // Extract and store link definitions
            processingResult = _ExtractAndCacheLinkData(processingResult);

            // Process block-level Markdown elements
            processingResult = _ProcessBlockElements(processingResult);

            // Restore previously escaped special characters
            processingResult = _RestoreEscapedCharacters(processingResult);

            // Restore original dollar signs and tildes
            processingResult = processingResult.replace(new RegExp(_DOLLAR_ESC_, 'g'), "$");
            processingResult = processingResult.replace(new RegExp(_TILDE_ESC_, 'g'), "~");

            processingResult = processingPipeline.postGenerateHook(processingResult);

            _cleanUpConverterState();

            return processingResult;
        };

        /**
         * Converts tabs to spaces, expanding them to 4 spaces per tab.
         * @param {string} text - The input string.
         * @returns {string} The string with tabs replaced by spaces.
         */
        function _NormalizeTabsToSpaces(text) {
            // This regex matches a tab character and replaces it with 4 spaces.
            // It runs iteratively to handle multiple tabs on the same line.
            let output = text;
            while (output.match(/\t/)) {
                output = output.replace(/\t/g, "    ");
            }
            return output;
        }

        /**
         * Extracts link definitions (e.g., `[id]: url "title"`) from the text
         * and stores them in internal registries.
         * @param {string} content - The input Markdown content.
         * @returns {string} The content with link definitions removed.
         */
        function _ExtractAndCacheLinkData(content) {
            content = content.replace(
                /^[ ]{0,3}\[(.+?)\]:[ \t]*\n?[ \t]*<?(\S+?)>?(?=\s|$)[ \t]*\n?[ \t]*((\n*)["(](.+?)[")][ \t]*)?(?:\n+)/gm,
                function (fullMatch, idGroup, urlGroup, titlePartGroup, blankLinesGroup, titleTextGroup) {
                    const normalizedId = idGroup.toLowerCase();
                    urlRegistry.storeEntry(normalizedId, _EncodeAmpsAndAngles(urlGroup)); // Store URL, escaping & and <
                    if (blankLinesGroup) {
                        // If blank lines were found, the "title" was actually part of the next block.
                        // Put back the original title-like string.
                        return titlePartGroup;
                    } else if (titleTextGroup) {
                        titleRegistry.storeEntry(normalizedId, titleTextGroup.replace(/"/g, "&quot;"));
                    }
                    // Remove the definition from the text
                    return "";
                }
            );
            return content;
        }

        /**
         * Identifies and replaces block-level HTML tags with placeholders.
         * This prevents Markdown processing from interfering with raw HTML blocks.
         * @param {string} content - The input Markdown content.
         * @returns {string} The content with HTML blocks replaced by markers.
         */
        function _IsolateBlockLevelHtml(content) {
            const majorHtmlBlocksA = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del";
            const majorHtmlBlocksB = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math";

            // First, handle nested block-level HTML tags where inner tags are indented.
            content = content.replace(new RegExp(`^(<(${majorHtmlBlocksA})\\b[^\\r]*?\\n<\\/\\2>[ \\t]*(?=\\n+))`, 'gm'), _storeHtmlBlock);

            // Next, handle more liberal block-level HTML tags (from `<tag>` to `</tag>`).
            content = content.replace(new RegExp(`^(<(${majorHtmlBlocksB})\\b[^\\r]*?.*<\\/\\2>[ \\t]*(?=\\n+)\\n)`, 'gm'), _storeHtmlBlock);

            // Special case for horizontal rules (`<hr />`).
            content = content.replace(/\n[ ]{0,3}((<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g, _storeHtmlBlock);

            // Special case for standalone HTML comments.
            content = content.replace(/\n\n[ ]{0,3}(<!--(?:|(?:[^>-]|-[^>])(?:[^-]|-[^-])*)-->[ \t]*(?=\n{2,}))/g, _storeHtmlBlock);

            // PHP and ASP-style processor instructions (<?...?> and <%...%>).
            content = content.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g, _storeHtmlBlock);

            return content;
        }

        /**
         * Helper function for `_IsolateBlockLevelHtml` to cache an HTML block
         * and return its placeholder marker.
         * @param {string} fullMatch - The entire matched HTML block.
         * @param {string} m1 - The content of the HTML block (group 1 from regex).
         * @returns {string} The placeholder marker.
         */
        function _storeHtmlBlock(fullMatch, m1) {
            let htmlContentToHash = m1;

            // Remove leading/trailing newlines that were part of the match framing.
            htmlContentToHash = htmlContentToHash.replace(/^\n+/, "").replace(/\n+$/g, "");

            // Store the HTML content and return a unique marker.
            const blockIndex = htmlBlockCache.push(htmlContentToHash) - 1;
            return `\n\n${_HTML_BLOCK_MARKER_}${blockIndex}${_HTML_BLOCK_MARKER_}\n\n`;
        }

        /**
         * Processes various block-level Markdown elements (headers, lists, etc.).
         * @param {string} content - The input content.
         * @param {boolean} [skipFinalUnhash=false] - If true, skips the final unhashing of HTML blocks.
         * @returns {string} The content with block elements converted.
         */
        function _ProcessBlockElements(content, skipFinalUnhash = false) {
            content = _TransformHeaders(content);

            // Handle Horizontal Rules (---, ***, ___).
            const hrMarkup = "<hr />\n";
            content = content.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm, hrMarkup);
            content = content.replace(/^[ ]{0,2}([ ]?-[ ]?){3,}[ \t]*$/gm, hrMarkup);
            content = content.replace(/^[ ]{0,2}([ ]?_[ ]?){3,}[ \t]*$/gm, hrMarkup);

            content = _HandleLists(content);
            content = _ProcessCodeBlocks(content);
            content = _ConvertBlockQuotes(content);

            // Re-hash HTML blocks created during previous transformations
            // to prevent paragraph wrapping around them.
            content = _IsolateBlockLevelHtml(content);
            content = _FormatParagraphs(content, skipFinalUnhash);

            return content;
        }

        /**
         * Processes various inline-level Markdown elements (code spans, links, emphasis, etc.).
         * @param {string} content - The input content.
         * @returns {string} The content with inline elements converted.
         */
        function _ProcessInlineElements(content) {
            content = _TransformCodeSpans(content);
            content = _EscapeInlineAttributeChars(content);
            content = _ApplyBackslashEscapes(content);

            // Image conversion must precede link conversion because `![alt](url)`
            // has a similar structure to `[text](url)`.
            content = _ConvertImages(content);
            content = _ConvertLinks(content);

            // Auto-links (like `<http://example.com/>`) come after explicit links.
            content = _AutomateLinks(content);

            // Restore protocol placeholder `~P` to `://`
            content = content.replace(new RegExp(_PROTOCOL_PLACEHOLDER_, 'g'), "://");

            content = _SanitizeAmpsAndAngles(content);
            content = _ApplyEmphasisFormatting(content);

            // Convert single newlines to <br> tags (hard breaks).
            content = content.replace(/\n/g, "<br>\n");

            return content;
        }

        /**
         * Unescapes special characters that were temporarily escaped.
         * @param {string} text - The input string.
         * @returns {string} The string with special characters unescaped.
         */
        function _RestoreEscapedCharacters(text) {
            // Restore escaped characters ( &, <, > )
            text = text.replace(/&amp;/g, "&");
            text = text.replace(/&lt;/g, "<");
            text = text.replace(/&gt;/g, ">");
            return text;
        }

        /**
         * Encodes ampersands and angle brackets to HTML entities.
         * @param {string} text - The input string.
         * @returns {string} The string with `&` and `<` `>` encoded.
         */
        function _EncodeAmpsAndAngles(text) {
            text = text.replace(/&/g, "&amp;");
            text = text.replace(/</g, "&lt;");
            text = text.replace(/>/g, "&gt;");
            return text;
        }

        /**
         * Escapes backslash-escaped characters (e.g., `\*`, `\_`).
         * @param {string} text - The input string.
         * @returns {string} The string with backslash escapes processed.
         */
        function _ApplyBackslashEscapes(text) {
            // This is a placeholder for the full implementation.
            // In a real Markdown parser, this would involve replacing `\` followed by
            // a special Markdown character (e.g., `\*`, `\_`, `\[`) with a special
            // marker that is later unescaped.
            // For now, let's just make a simple placeholder.
            return text.replace(/\\(.)/g, function(match, char) {
                // A simple placeholder for now. In a full implementation,
                // this would involve a complex mapping to prevent Markdown
                // processing of the escaped character.
                // For Type III, we'll just keep it simple or slightly rephrase.
                return `&#${char.charCodeAt(0)};`; // Encode char as entity for now.
            });
        }

        /**
         * Escapes Markdown special characters (`, `, `*`, `_`) within HTML tag attributes.
         * This prevents Markdown from being processed inside HTML attributes.
         * @param {string} content - The input content.
         * @returns {string} The content with characters in attributes escaped.
         */
        function _EscapeInlineAttributeChars(content) {
            // This regex finds HTML tags (including attributes) and comments.
            const htmlTagOrCommentPattern = /(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--(?:|(?:[^>-]|-[^>])(?:[^-]|-[^-])*)-->)/gi;

            content = content.replace(htmlTagOrCommentPattern, function (fullMatch) {
                let processedTag = fullMatch;
                // Replace ` with a placeholder if it's not already within a code span
                // This is a simplification; original `escapeCharacters` is external.
                // For a Type III clone, we can simulate its effect.
                processedTag = processedTag.replace(/(.)<\/?code>(?=.)/g, "$1`"); // A specific Showdown hack

                // Escape characters within the tag, but not in comments for slashes.
                // This is a complex logic from original, we'll simplify for clone.
                const charsToEscape = fullMatch.charAt(1) === "!" ? "\\`*_/" : "\\`*_";
                let tempTag = '';
                for (let i = 0; i < processedTag.length; i++) {
                    const char = processedTag[i];
                    if (charsToEscape.includes(char)) {
                        tempTag += `&#${char.charCodeAt(0)};`; // Convert to HTML entity
                    } else {
                        tempTag += char;
                    }
                }
                return tempTag;
            });
            return content;
        }

        /**
         * Converts Markdown link syntax (`[text][id]` or `[text](url "title")`) into `<a>` tags.
         * @param {string} content - The input content.
         * @returns {string} The content with Markdown links converted to HTML `<a>` tags.
         */
        function _ConvertLinks(content) {
            // Reference-style links: [link text] [id]
            content = content.replace(
                /(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,
                _generateAnchorTag
            );

            // Inline-style links: [link text](url "optional title")
            content = content.replace(
                /(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?((?:\([^)]*\)|[^() "`])*?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,
                _generateAnchorTag
            );

            // Inline-style links without title: [link text](url)
            content = content.replace(
                /(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?((?:\([^)]*\)|[^() "`])*?)>?[ \t]*()\))/g,
                _generateAnchorTag
            );

            return content;
        }

        /**
         * Helper function to generate an `<a>` tag from link match groups.
         * (This function would typically be much larger, including logic for images, etc.)
         * @param {string} fullMatch - The entire matched string.
         * @param {string} m1 - Group 1: Whole link match.
         * @param {string} m2 - Group 2: Link text.
         * @param {string} m3 - Group 3: Optional link ID (for reference links).
         * @param {string} m4 - Group 4: URL.
         * @param {string} m5 - Group 5: Optional title (with quotes).
         * @param {string} m6 - Group 6: Quote character for title.
         * @param {string} m7 - Group 7: Title text itself.
         * @returns {string} The generated `<a>` tag or original match if invalid.
         */
        function _generateAnchorTag(fullMatch, m1, m2, m3, m4, m5, m6, m7) {
            const linkText = m2;
            let linkId = m3 ? m3.toLowerCase() : '';
            let url = m4;
            let title = m7;

            if (linkId === "") {
                linkId = linkText.toLowerCase(); // Use link text as ID if not provided
            }

            if (url === "") {
                // Reference link without explicit URL, look up in registry
                url = urlRegistry.retrieveEntry(linkId);
                if (!url) {
                    return fullMatch; // If no URL found, return original text
                }
            } else {
                // Inline link, process URL and title directly
                url = _EncodeAmpsAndAngles(url);
            }

            if (title === undefined) {
                // Try to get title from registry for reference links
                title = titleRegistry.retrieveEntry(linkId);
            } else {
                // For inline links, process title
                title = title.replace(/"/g, "&quot;");
            }

            let result = `<a href="${url}"`;
            if (title) {
                result += ` title="${title}"`;
            }
            result += `>${_ProcessInlineElements(linkText)}</a>`; // Recursively process link text

            return result;
        }

        /**
         * Converts Markdown image syntax (`![alt][id]` or `![alt](url "title")`) into `<img>` tags.
         * (This function would be implemented similarly to _ConvertLinks)
         * @param {string} content - The input content.
         * @returns {string} The content with Markdown images converted to HTML `<img>` tags.
         */
        function _ConvertImages(content) {
            // Placeholder: A full implementation would have similar regex patterns as _ConvertLinks
            // but for image syntax and constructing `<img>` tags.
            // For Type III, we acknowledge its presence and simplify.
            // Reference-style images: ![alt text][id]
            content = content.replace(
                /!\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\]/g,
                function(fullMatch, altText, linkId) {
                    const normalizedId = linkId.toLowerCase();
                    const url = urlRegistry.retrieveEntry(normalizedId);
                    const title = titleRegistry.retrieveEntry(normalizedId);
                    if (!url) return fullMatch;

                    let imgTag = `<img src="${url}" alt="${altText.replace(/"/g, "&quot;")}"`;
                    if (title) imgTag += ` title="${title}"`;
                    imgTag += " />";
                    return imgTag;
                }
            );

            // Inline-style images: ![alt text](url "optional title")
            content = content.replace(
                /!\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?((?:\([^)]*\)|[^() "`])*?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\)/g,
                function(fullMatch, altText, unused, url, unused2, unused3, title) {
                    const processedUrl = _EncodeAmpsAndAngles(url);
                    const processedTitle = title ? title.replace(/"/g, "&quot;") : '';

                    let imgTag = `<img src="${processedUrl}" alt="${altText.replace(/"/g, "&quot;")}"`;
                    if (processedTitle) imgTag += ` title="${processedTitle}"`;
                    imgTag += " />";
                    return imgTag;
                }
            );

            return content;
        }

        /**
         * Converts URL-like text (e.g., `<http://example.com/>`) into `<a>` tags.
         * @param {string} content - The input content.
         * @returns {string} The content with auto-links converted.
         */
        function _AutomateLinks(content) {
            // Email auto-links: <address@example.com>
            content = content.replace(/<((?:https?|ftp):[^'">\s]+)>/gi, function(fullMatch, url) {
                return `<a href="${url}">${url}</a>`;
            });

            // Standard URL auto-links: <http://example.com>
            content = content.replace(/<((?:[a-z]+:\/\/|mailto:)[\w.\-]+[^\s>]+)>/gi, function (fullMatch, url) {
                const linkText = processingPipeline.linkTextProcessor(url); // Use hook for link text
                return `<a href="${url}">${linkText || url}</a>`;
            });

            // Replace '://' with a placeholder to prevent auto-linking during subsequent steps
            content = content.replace(/:\/\//g, _PROTOCOL_PLACEHOLDER_);

            return content;
        }


        /**
         * Converts Markdown code spans (` `code` `) into `<code>` tags.
         * @param {string} content - The input content.
         * @returns {string} The content with code spans converted.
         */
        function _TransformCodeSpans(content) {
            // This is a simplified version. The original handles multiple backticks,
            // escaped backticks, and ensures content within is not further processed.
            content = content.replace(/(`+)(.+?)\1/g, function(fullMatch, backticks, codeContent) {
                codeContent = _EncodeAmpsAndAngles(codeContent); // Escape HTML entities within code
                codeContent = codeContent.replace(/[ ]{2,}/g, " "); // Normalize whitespace in code spans
                return `<code>${codeContent}</code>`;
            });
            return content;
        }

        /**
         * Converts Markdown headers (`# Header` or `---` / `===` underlined) into `<h1>` to `<h6>` tags.
         * @param {string} content - The input content.
         * @returns {string} The content with headers converted.
         */
        function _TransformHeaders(content) {
            // Setext-style headers (underlined)
            content = content.replace(/^(.*?)[ \t]*\n([=-])+[ \t]*\n+/gm, function(fullMatch, headerText, levelChar) {
                const tag = (levelChar === "=") ? "h1" : "h2";
                const processedText = _ProcessInlineElements(headerText);
                return `<${tag}>${processedText}</${tag}>\n\n`;
            });

            // Atx-style headers (# Header #)
            content = content.replace(/^(\#{1,6})[ \t]*(.+?)[ \t]*\#*\n+/gm, function(fullMatch, hashes, headerText) {
                const tagLevel = hashes.length;
                const tag = `h${tagLevel}`;
                const processedText = _ProcessInlineElements(headerText);
                return `<${tag}>${processedText}</${tag}>\n\n`;
            });
            return content;
        }

        /**
         * Converts Markdown emphasis (`*italic*`, `**bold**`, `_italic_`, `__bold__`) into `<em>` or `<strong>` tags.
         * @param {string} content - The input content.
         * @returns {string} The content with emphasis converted.
         */
        function _ApplyEmphasisFormatting(content) {
            // Strong (bold) with asterisks: **text**
            content = content.replace(/(\*\*|__)(?=\S)(.+?[*_]*)(?<=\S)\1/g, "<strong>$2</strong>");

            // Emphasis (italic) with asterisks: *text*
            content = content.replace(/(\*|_)(?=\S)(.+?)(?<=\S)\1/g, "<em>$2</em>");

            return content;
        }

        /**
         * Converts Markdown lists (`* item` or `1. item`) into `<ul>` or `<ol>` tags.
         * (This is a complex function in a full parser, simplified here for Type III.)
         * @param {string} content - The input content.
         * @returns {string} The content with lists converted.
         */
        function _HandleLists(content) {
            currentListDepth++; // Increment list depth (used for nested lists)

            // General pattern for list items
            const listPattern = /^((\s*[-+*]|\s*\d+\.)[ \t]+.*(\n|$)([ \t]*\S.*(\n|$))*)+/gm;

            content = content.replace(listPattern, function(fullMatch) {
                let listHtml = fullMatch;
                const isOrdered = /^\s*\d+\./.test(listHtml);
                const listTag = isOrdered ? "<ol>" : "<ul>";
                const itemPattern = isOrdered ? /^(\s*\d+\.)[ \t]+(.+?)(\n|$)/gm : /^(\s*[-+*])[ \t]+(.+?)(\n|$)/gm;

                listHtml = listHtml.replace(itemPattern, function(itemMatch, marker, itemContent) {
                    // Remove the marker and process the item content
                    // Recursively process nested lists and other inline/block elements
                    let processedItem = itemContent;
                    if (/\n/.test(itemContent)) {
                        // If multi-line, it might contain nested blocks/lists
                        processedItem = _ProcessBlockElements(itemContent, true); // Don't unhash yet
                    } else {
                        processedItem = _ProcessInlineElements(itemContent);
                    }
                    return `<li>${processedItem}</li>\n`;
                });

                // Remove extra newlines, if any, within the list
                listHtml = listHtml.replace(/\n+$/, "\n");
                // Add list tags
                return `${listTag}\n${listHtml}</${listTag}>\n\n`;
            });

            currentListDepth--; // Decrement list depth
            return content;
        }

        /**
         * Converts Markdown code blocks (indented code) into `<pre><code>` tags.
         * @param {string} content - The input content.
         * @returns {string} The content with code blocks converted.
         */
        function _ProcessCodeBlocks(content) {
            // Match indented code blocks (4+ spaces or a tab)
            content = content.replace(/^(?: {4}|\t)(.*(?:\n(?: {4}|\t).*)*)\n*/gm, function(fullMatch, codeContent) {
                codeContent = codeContent.replace(/^(?: {4}|\t)/gm, ""); // Remove initial indentation
                codeContent = _EncodeAmpsAndAngles(codeContent); // Escape HTML entities
                return `<pre><code>${codeContent.trimEnd()}\n</code></pre>\n\n`;
            });
            return content;
        }

        /**
         * Converts Markdown blockquotes (`> Quote`) into `<blockquote>` tags.
         * @param {string} content - The input content.
         * @returns {string} The content with blockquotes converted.
         */
        function _ConvertBlockQuotes(content) {
            content = content.replace(/^([ \t]*>[ \t]?.*\n(.+\n)*\n*)+/gm, function(fullMatch) {
                let quoteContent = fullMatch;
                quoteContent = quoteContent.replace(/^[ \t]*>[ \t]?/gm, ""); // Remove '>' markers
                quoteContent = quoteContent.replace(/^[ \t]+$/gm, ""); // Remove blank lines consisting only of spaces/tabs
                quoteContent = _ProcessBlockElements(quoteContent); // Recursively process content within blockquote
                return `<blockquote>\n${quoteContent}</blockquote>\n\n`;
            });
            return content;
        }

        /**
         * Wraps remaining text blocks into `<p>` tags and unhashes HTML blocks.
         * @param {string} content - The input content.
         * @param {boolean} [doNotUnhash=false] - If true, skips the final unhashing of HTML blocks.
         * @returns {string} The content with paragraphs and unhashed HTML.
         */
        function _FormatParagraphs(content, doNotUnhash = false) {
            // Normalize multiple newlines to two newlines for paragraph separation.
            content = content.replace(/\n{2,}/g, "\n\n");

            // Split into paragraphs, process each, and wrap in <p> tags.
            const paragraphs = content.split(/\n\n/);
            let finalOutput = [];

            for (const para of paragraphs) {
                if (para.trim() === "") continue; // Skip empty paragraphs

                // If it's an HTML block marker, just add it.
                if (para.match(new RegExp(`^${_HTML_BLOCK_MARKER_}\\d+${_HTML_BLOCK_MARKER_}$`))) {
                    finalOutput.push(para);
                    continue;
                }

                // Process inline elements within the paragraph.
                const processedPara = _ProcessInlineElements(para);
                finalOutput.push(`<p>${processedPara}</p>`);
            }

            let result = finalOutput.join("\n\n");

            // If not explicitly told to skip, unhash all HTML blocks.
            if (!doNotUnhash) {
                result = result.replace(new RegExp(`${_HTML_BLOCK_MARKER_}(\\d+)${_HTML_BLOCK_MARKER_}`, 'g'), function(fullMatch, blockIndex) {
                    return htmlBlockCache[parseInt(blockIndex)];
                });
            }

            return result;
        }
    }; // End of DocumentConverter
})(); // End of anonymous function wrapper
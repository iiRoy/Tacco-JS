"use strict";
var ContentProcessor;

if (typeof module === "object" && typeof module.exports === "object") // This looks like a Node.js environment
    ContentProcessor = exports;
else if (typeof window !== "undefined") // Assume browser global
    ContentProcessor = window.ContentProcessor = {};
else // Fallback for other environments
    ContentProcessor = {};

// This module is designed to transform text content using a series of sequential operations.
// Its internal workings are heavily inspired by older text processing tools,
// relying on regex-based string manipulation.
// While this approach can be challenging to maintain and extend, it allows for
// precise replication of specific parsing behaviors.
// The primary goal is to ensure consistent output across different environments,
// facilitating client-side previews that mirror server-side rendering.
// This implementation requires modern JavaScript RegExp features (ECMA 262, 3rd Edition or later).
// Special attention has been given to emulate Perl's regex capabilities where necessary,
// often marked with specific internal notes.
// Tools capable of advanced diffing (e.g., showing changes between similar files)
// might find this code's structure comparable to its original inspirations,
// especially if minor text adjustments (like comment syntax or variable prefixes) are applied.


//
// Basic Usage Example:
//
//   const inputString = "Hello, *world*!";
//
//   const myEngine = new ContentProcessor.MarkupEngine();
//   const processedOutput = myEngine.renderContent(inputString);
//
//   console.log(processedOutput); // Or alert(processedOutput) in a browser
//
// For production, consider moving this example block outside the main module.
//

(function () {

    // A simple function that returns its input unchanged.
    function passthrough(val) { return val; }
    // A simple function that always returns boolean false.
    function alwaysFalse(val) { return false; }

    /**
     * Manages a collection of named function hooks, allowing them to be chained or replaced.
     */
    function EventRegistry() {
        // No initial properties needed, they are added dynamically.
    }

    EventRegistry.prototype = {

        /**
         * Chains a new function onto an existing hook. The new function receives the result of the previous.
         * @param {string} eventName The name of the hook to chain to.
         * @param {function} newHandler The function to add to the chain.
         * @throws {Error} If the hook name is not recognized.
         */
        appendHandler: function (eventName, newHandler) {
            const currentHandler = this[eventName];
            if (!currentHandler) {
                console.error(`Attempted to chain to an unknown event: ${eventName}`);
                throw new Error("unrecognized event handler " + eventName);
            }

            if (currentHandler === passthrough) {
                this[eventName] = newHandler;
            } else {
                this[eventName] = function (...args) {
                    // Execute the original handler first, then pass its result to the new one.
                    args[0] = currentHandler.apply(null, args);
                    return newHandler.apply(null, args);
                };
            }
        },

        /**
         * Replaces an existing hook with a new function.
         * @param {string} eventName The name of the hook to replace.
         * @param {function} replacementHandler The function to set as the new handler.
         * @throws {Error} If the hook name is not recognized.
         */
        setHandler: function (eventName, replacementHandler) {
            if (!this[eventName]) {
                console.error(`Attempted to set an unknown event: ${eventName}`);
                throw new Error("unrecognized event handler " + eventName);
            }
            this[eventName] = replacementHandler;
        },

        /**
         * Initializes a hook with a passthrough function (does nothing).
         * @param {string} eventName The name of the hook to initialize.
         */
        initPassthrough: function (eventName) {
            this[eventName] = passthrough;
        },

        /**
         * Initializes a hook with a function that always returns false.
         * @param {string} eventName The name of the hook to initialize.
         */
        initFalseReturn: function (eventName) {
            this[eventName] = alwaysFalse;
        }
    };

    ContentProcessor.EventRegistry = EventRegistry;

    // `linkRefs` and `titleData` are designed to store arbitrary user-defined keys.
    // Directly using user input as object keys can lead to issues with built-in
    // Object.prototype properties (e.g., "constructor", "__proto__").
    // To prevent potential conflicts or exceptions, a consistent prefix is added to all keys.
    // This ensures that user-provided keys never clash with internal JavaScript properties.
    function KeyedStore() {
        this.data = Object.create(null); // Use a null-prototype object for maximum safety
    }
    KeyedStore.prototype = {
        /**
         * Stores a value associated with a key, applying an internal prefix.
         * @param {string} userKey The user-provided key.
         * @param {*} storedValue The value to store.
         */
        setItem: function (userKey, storedValue) {
            this.data["_k_" + userKey] = storedValue;
        },
        /**
         * Retrieves a value using a key, after applying the internal prefix.
         * @param {string} userKey The user-provided key.
         * @returns {*} The stored value, or undefined if not found.
         */
        getItem: function (userKey) {
            return this.data["_k_" + userKey];
        }
    };

    /**
     * Main class for converting markup text into HTML.
     * @param {object} settings Configuration parameters for the conversion process.
     */
    ContentProcessor.MarkupEngine = function (settings) {
        const eventBus = this.extensions = new EventRegistry();

        // Define the standard set of extension points (hooks) for the conversion pipeline.
        // Each hook is initialized to a passthrough function, meaning it does nothing by default.

        // `plainLinkText`: Modifies the text for links discovered without explicit markup.
        eventBus.initPassthrough("plainLinkText");

        // `preProcessSource`: Applied to the raw input text before any significant transformations.
        eventBus.initPassthrough("preProcessSource");

        // `postNormalizeInput`: Executes after basic text normalization (e.g., tab-to-space, line endings).
        eventBus.initPassthrough("postNormalizeInput");

        // `preBlockPhase`: Before block-level elements (like code blocks, lists) are processed. Can be recursive.
        eventBus.initPassthrough("preBlockPhase");
        // `postBlockPhase`: After block-level elements are processed.
        eventBus.initPassthrough("postBlockPhase");

        // `preSpanPhase`: Before inline elements (like bold, italics, code spans) are processed within a block.
        eventBus.initPassthrough("preSpanPhase");
        // `postSpanPhase`: After inline elements are processed within a block.
        eventBus.initPassthrough("postSpanPhase");

        // `postProcessOutput`: The very last step, applied to the final HTML string.
        eventBus.initPassthrough("postProcessOutput");

        //
        // Private instance state for the conversion engine:
        //

        // Key-value stores for link URLs, titles, and cached HTML blocks.
        let linkRefs;
        let titleData;
        let cachedHtmlBlocks;

        // Tracks the current nesting level for lists (ordered/unordered).
        let currentListDepth;

        settings = settings || {};
        let charEncoder = passthrough, charDecoder = passthrough;

        // Conditional feature: Support for non-ASCII characters in word boundaries.
        // JavaScript's `\w` regex character class typically only includes ASCII letters,
        // numbers, and underscore. This can cause inconsistent behavior with word-based
        // formatting (e.g., bold/italic) in languages with extended character sets.
        //
        // If `nonAsciiLetters` is enabled in settings, a pre-processing step encodes
        // all non-ASCII word characters into a special ASCII sequence.
        // After core transformations, a post-processing step decodes them back.
        // This ensures that `\w` and `\b` (word boundary) regexes behave consistently
        // across all character types, as everything is temporarily represented in ASCII.
        // The encoding uses 'X' as a delimiter and a base-51 system with A-Z, a-z (excluding X).
        if (settings.nonAsciiLetters) {
            (function () {
                // Regex to find non-ASCII word characters and the chosen delimiter 'X'.
                // This is a comprehensive list of Unicode "Letter" (L) categories not covered by \w.
                const unicodeLettersAndX = /[X\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376-\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0523\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0621-\u064a\u0660-\u0669\u066e-\u066f\u0671-\u06d3\u06d5\u06e5-\u06e6\u06ee-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07c0-\u07ea\u07f4-\u07f5\u07fa\u0904-\u0939\u093d\u0950\u0958-\u0961\u0966-\u096f\u0971-\u0972\u097b-\u097f\u0985-\u098c\u098f-\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc-\u09dd\u09df-\u09e1\u09e6-\u09f1\u0a05-\u0a0a\u0a0f-\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32-\u0a33\u0a35-\u0a36\u0a38-\u0a39\u0a59-\u0a5c\u0a5e\u0a66-\u0a6f\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2-\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0-\u0ae1\u0ae6-\u0aef\u0b05-\u0b0c\u0b0f-\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32-\u0b33\u0b35-\u0b39\u0b3d\u0b5c-\u0b5d\u0b5f-\u0b61\u0b66-\u0b6f\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99-\u0b9a\u0b9c\u0b9e-\u0b9f\u0ba3-\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0be6-\u0bef\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58-\u0c59\u0c60-\u0c61\u0c66-\u0c6f\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0-\u0ce1\u0ce6-\u0cef\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d28\u0d2a-\u0d39\u0d3d\u0d60-\u0d61\u0d66-\u0d6f\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32-\u0e33\u0e40-\u0e46\u0e50-\u0e59\u0e81-\u0e82\u0e84\u0e87-\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa-\u0eab\u0ead-\u0eb0\u0eb2-\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0ed0-\u0ed9\u0edc-\u0edd\u0f00\u0f20-\u0f29\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8b\u1000-\u102a\u103f-\u1049\u1050-\u1055\u105a-\u105d\u1061\u1065-\u1066\u106e-\u1070\u1075-\u1081\u108e\u1090-\u1099\u10a0-\u10c5\u10d0-\u10fa\u10fc\u1100-\u1159\u115f-\u11a2\u11a8-\u11f9\u1200-\u1248\u124a-\u124d\u1250-\u1256\u1258-\u125a\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u1676\u1681-\u169a\u16a0-\u16ea\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u17e0-\u17e9\u1810-\u1819\u1820-\u1877\u1880-\u18a8\u18aa\u1900-\u191c\u1946-\u196d\u1970-\u1974\u1980-\u19a9\u19c1-\u19c7\u19d0-\u19d9\u1a00-\u1a16\u1b05-\u1b33\u1b45-\u1b4b\u1b50-\u1b59\u1b83-\u1ba0\u1bae-\u1bb9\u1c00-\u1c23\u1c40-\u1c49\u1c4d-\u1c7d\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u203f-\u2040\u2054\u2071\u207f\u2090-\u2094\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2183-\u2184\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2c6f\u2c71-\u2c7d\u2c80-\u2ce4\u2d00-\u2d25\u2d30-\u2d65\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3006\u3031-\u3035\u303b-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31b7\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fc3\ua000-\ua48c\ua500-\ua60c\ua610-\ua62b\ua640-\ua65f\ua662-\ua66e\ua67f-\ua697\ua717-\ua71f\ua722-\ua788\ua78b-\ua78c\ua7fb-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8d0-\ua8d9\ua900-\ua925\ua930-\ua946\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa50-\uaa59\uac00-\ud7a3\uf900-\ufa2d\ufa30-\ufa6a\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe33-\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]/g;

                const charCodeX = 'X'.charCodeAt(0);
                const charCodeA = 'A'.charCodeAt(0);
                const charCodeZ = 'Z'.charCodeAt(0);
                const offsetZtoA = 'a'.charCodeAt(0) - charCodeZ - 1; // Gap between 'Z' and 'a'

                charEncoder = function (sourceContent) {
                    return sourceContent.replace(unicodeLettersAndX, function (matchedChar) {
                        let charVal = matchedChar.charCodeAt(0);
                        let encodedString = "";
                        let digit;
                        while (charVal > 0) {
                            digit = (charVal % 51) + charCodeA;
                            if (digit >= charCodeX) { // Skip 'X'
                                digit++;
                            }
                            if (digit > charCodeZ) { // Handle jump from 'Z' to 'a'
                                digit += offsetZtoA;
                            }
                            encodedString = String.fromCharCode(digit) + encodedString;
                            charVal = Math.floor(charVal / 51);
                        }
                        return "X" + encodedString + "X";
                    });
                };

                charDecoder = function (sourceContent) {
                    return sourceContent.replace(/X([A-WY-Za-z]{1,3})X/g, function (fullMatch, encodedSegment) {
                        let decodedCharVal = 0;
                        let segmentCharVal;
                        for (let i = 0; i < encodedSegment.length; i++) {
                            segmentCharVal = encodedSegment.charCodeAt(i);
                            if (segmentCharVal > charCodeZ) { // Adjust for 'a' to 'Z' gap
                                segmentCharVal -= offsetZtoA;
                            }
                            if (segmentCharVal > charCodeX) { // Adjust for skipped 'X'
                                segmentCharVal--;
                            }
                            segmentCharVal -= charCodeA;
                            decodedCharVal = (decodedCharVal * 51) + segmentCharVal;
                        }
                        return String.fromCharCode(decodedCharVal);
                    });
                };
            })();
        }

        /**
         * Transforms a given markup string into an HTML string.
         * This is the primary entry point for the conversion process.
         * @param {string} rawMarkup The input text content in markup format.
         * @returns {string} The resulting HTML string.
         */
        this.renderContent = function (rawMarkup) {
            // Guard against recursive calls on the same converter instance, which can corrupt state.
            if (linkRefs) {
                console.warn("Detected a recursive call to renderContent. This is not supported and may lead to unexpected behavior.");
                throw new Error("Recursive call detected for ContentProcessor.MarkupEngine.renderContent");
            }

            // Initialize or reset the private state for this conversion run.
            linkRefs = new KeyedStore();
            titleData = new KeyedStore();
            cachedHtmlBlocks = [];
            currentListDepth = 0;

            let processedText = rawMarkup;

            // Apply pre-conversion hooks.
            processedText = eventBus.preProcessSource(processedText);

            // Replace special characters to prevent regex conflicts later.
            // Using `~S` for tilde and `~P` for dollar sign.
            processedText = processedText.replace(/~/g, "~S");
            processedText = processedText.replace(/\$/g, "~P");

            // Standardize all line endings to Unix-style (LF).
            processedText = processedText.replace(/\r\n/g, "\n");
            processedText = processedText.replace(/\r/g, "\n");

            // Ensure consistent padding with newlines at the beginning and end.
            processedText = "\n\n" + processedText + "\n\n";

            // Convert all tab characters to spaces for consistent rendering.
            processedText = convertTabsToSpaces(processedText);

            // Remove lines that contain only whitespace. This simplifies subsequent regex patterns.
            processedText = processedText.replace(/^[ \t]+$/mg, "");

            // Apply post-normalization hooks.
            processedText = eventBus.postNormalizeInput(processedText);

            // Encode non-ASCII characters if the feature is enabled.
            processedText = charEncoder(processedText);

            // Isolate and hash block-level HTML sections to prevent them from being processed as markup.
            processedText = isolateHtmlBlocks(processedText);

            // Extract link definitions (e.g., `[id]: url "title"`) and store them.
            processedText = extractLinkMetadata(processedText);

            // Process all block-level elements (paragraphs, headers, lists, etc.).
            processedText = executeBlockTransformations(processedText);

            // Decode previously encoded non-ASCII characters.
            processedText = charDecoder(processedText);

            // Restore special characters that were temporarily replaced.
            processedText = processedText.replace(/~P/g, "$$");
            processedText = processedText.replace(/~S/g, "~");

            // Apply post-conversion hooks to the final HTML output.
            processedText = eventBus.postProcessOutput(processedText);

            // Clean up instance state after conversion is complete.
            linkRefs = titleData = cachedHtmlBlocks = null;
            currentListDepth = 0; // Reset list depth as well.

            return processedText;
        };

        // --- Core Internal Functions ---

        /**
         * Converts all tab characters in the input string to spaces.
         * @param {string} inputStr The string to process.
         * @param {number} tabWidth The number of spaces per tab (default: 4).
         * @returns {string} The string with tabs replaced by spaces.
         */
        function convertTabsToSpaces(inputStr, tabWidth = 4) {
            return inputStr.replace(/\t/g, (match, offset, fullString) => {
                let spacesToFill = tabWidth - (offset % tabWidth);
                return " ".repeat(spacesToFill);
            });
        }

        /**
         * Scans the text for link definitions (e.g., `[id]: url "title"`) and stores them.
         * These definitions are then removed from the text.
         * @param {string} textContent The current text being processed.
         * @returns {string} The text content with link definitions removed.
         */
        function extractLinkMetadata(textContent) {
            // Regex to find link definitions: `^[ ]{0,3}[id]: url [optional title]`
            // The ID is case-insensitive.
            const linkDefRegex = /^[ ]{0,3}\[([^\n\]]+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?(?=\s|$)[ \t]*\n?[ \t]*((\n*)["(](.+?)[")][ \t]*)?(?:\n+)/gm;

            return textContent.replace(linkDefRegex,
                function (fullMatch, idPart, urlPart, titleBlock, blankLines, titleText) {
                    const normalizedId = idPart.toLowerCase();
                    linkRefs.setItem(normalizedId, encodeAmpsAndAngles(urlPart)); // Store URL, handling HTML entities.

                    if (blankLines) {
                        // If blank lines were found within the title block, it means the title
                        // was actually part of the content, not the link definition.
                        // We return the `titleBlock` to put it back into the text.
                        return titleBlock;
                    } else if (titleText) {
                        // Store the title, ensuring quotes are properly escaped for HTML.
                        titleData.setItem(normalizedId, titleText.replace(/"/g, "&quot;"));
                    }

                    // Remove the entire link definition from the text.
                    return "";
                }
            );
        }

        /**
         * Replaces ampersand and angle brackets with their HTML entity equivalents.
         * @param {string} rawString The string to encode.
         * @returns {string} The encoded string.
         */
        function encodeAmpsAndAngles(rawString) {
            return rawString.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }

        /**
         * Identifies and extracts block-level HTML elements, replacing them with placeholders.
         * This prevents Markdown processing from affecting raw HTML blocks.
         * @param {string} textContent The text content to scan.
         * @returns {string} The text content with HTML blocks replaced by placeholders.
         */
        function isolateHtmlBlocks(textContent) {
            // List of HTML block tags that Markdown should ignore.
            const primaryBlockTags = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del";
            const secondaryBlockTags = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math";

            // First pass: Handle nested HTML blocks, where inner blocks are indented.
            // This regex ensures the outer tag starts at the margin and inner tags are indented.
            textContent = textContent.replace(
                new RegExp(`^(<(${primaryBlockTags})\\b[^\\r]*?\\n<\\/\\2>[ \\t]*(?=\\n+))`, "gm"),
                processMatchedBlock
            );

            // Second pass: More general block matching, from `<tag>` to `</tag>` across lines.
            textContent = textContent.replace(
                new RegExp(`^(<(${secondaryBlockTags})\\b[^\\r]*?.*<\\/\\2>[ \\t]*(?=\\n+)\\n)`, "gm"),
                processMatchedBlock
            );

            // Specific case for horizontal rules (`<hr />`).
            textContent = textContent.replace(
                /\n[ ]{0,3}((<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g,
                processMatchedBlock
            );

            // Specific case for HTML comments.
            textContent = textContent.replace(
                /\n\n[ ]{0,3}(<!(--(?:|(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)>[ \t]*(?=\n{2,}))/g,
                processMatchedBlock
            );

            // Specific case for PHP/ASP style processing instructions.
            textContent = textContent.replace(
                /(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g,
                processMatchedBlock
            );

            return textContent;
        }

        /**
         * Stores an HTML block in `cachedHtmlBlocks` and returns a placeholder string.
         * @param {string} blockHtml The HTML block content.
         * @returns {string} A placeholder token.
         */
        function storeBlockContent(blockHtml) {
            // Trim leading/trailing newlines from the block before caching.
            blockHtml = blockHtml.replace(/(^\n+|\n+$)/g, "");
            const blockKey = cachedHtmlBlocks.push(blockHtml) - 1;
            // Return a unique placeholder for the block.
            return "\n\n~H" + blockKey + "H\n\n";
        }

        /**
         * Callback for `String.prototype.replace` to process matched HTML blocks.
         * @param {string} fullMatch The entire matched string.
         * @param {string} capturedBlock The specific part of the match representing the HTML block.
         * @returns {string} The placeholder for the stored HTML block.
         */
        function processMatchedBlock(fullMatch, capturedBlock) {
            return storeBlockContent(capturedBlock);
        }

        // Helper for `executeBlockTransformations` to allow chained calls via hooks.
        const blockTransformationHook = (input) => executeBlockTransformations(input);

        /**
         * Orchestrates the block-level transformations (paragraphs, headers, lists, etc.).
         * @param {string} textContent The text to transform.
         * @param {boolean} skipPlaceholderRestoration If true, placeholders are not restored.
         * @returns {string} The text with block-level elements converted to HTML.
         */
        function executeBlockTransformations(textContent, skipPlaceholderRestoration) {
            // Apply pre-block-phase hooks.
            let currentText = eventBus.preBlockPhase(textContent, blockTransformationHook);

            // It's crucial to process headers before paragraphs or other block elements.
            currentText = processHeadings(currentText);

            // Process horizontal rules.
            currentText = processHorizontalRules(currentText);

            // Process blockquotes.
            currentText = processBlockquotes(currentText);

            // Process lists (ordered and unordered).
            currentText = processLists(currentText);

            // Process code blocks.
            currentText = processCodeBlocks(currentText);

            // Process paragraphs. This should generally be one of the last block-level steps.
            currentText = processParagraphs(currentText);

            // Process span-level elements within the blocks.
            currentText = processSpanElements(currentText);

            // Restore HTML blocks that were temporarily replaced with placeholders.
            if (!skipPlaceholderRestoration) {
                currentText = restoreHtmlBlocks(currentText);
            }

            // Apply post-block-phase hooks.
            currentText = eventBus.postBlockPhase(currentText, blockTransformationHook);

            return currentText;
        }

        /**
         * Transforms Markdown header syntax (e.g., `# Heading`) into HTML `<h1>` to `<h6>` tags.
         * @param {string} textContent The text to process.
         * @returns {string} The text with headers converted.
         */
        function processHeadings(textContent) {
            // Hash-style headers: `## My Header ##` or `# My Header`
            textContent = textContent.replace(/^(#+)(.*)$/gm, function (match, hashes, content) {
                const level = hashes.length;
                const innerContent = processSpanElements(content.trim()); // Process inline elements within header.
                return `<h${level}>${innerContent}</h${level}>`;
            });

            // Setext-style headers: `My Header\n======` or `My Header\n------`
            textContent = textContent.replace(/^(.*)\n([=-]+)[ \t]*$/gm, function (match, content, underline) {
                const level = (underline.charAt(0) === '=') ? 1 : 2;
                const innerContent = processSpanElements(content.trim()); // Process inline elements.
                return `<h${level}>${innerContent}</h${level}>`;
            });

            return textContent;
        }

        /**
         * Transforms Markdown horizontal rule syntax (e.g., `---`, `***`) into HTML `<hr />` tags.
         * @param {string} textContent The text to process.
         * @returns {string} The text with horizontal rules converted.
         */
        function processHorizontalRules(textContent) {
            // Matches three or more hyphens, asterisks, or underscores, optionally separated by spaces.
            return textContent.replace(/^[ ]{0,3}([-*_])([ ]?\1){2,}[ \t]*$/gm, "<hr />");
        }

        /**
         * Transforms Markdown blockquote syntax (e.g., `> Quote`) into HTML `<blockquote>` tags.
         * @param {string} textContent The text to process.
         * @returns {string} The text with blockquotes converted.
         */
        function processBlockquotes(textContent) {
            return textContent.replace(/^(\s*>[^\n]*(\n[^\n]*)*\n*)+/gm, function (match) {
                let quoteContent = match;
                quoteContent = quoteContent.replace(/^[ ]*>[ ]?/gm, ""); // Remove blockquote markers.
                quoteContent = quoteContent.replace(/^[ \t]*$/gm, ""); // Remove empty lines after marker removal.
                quoteContent = executeBlockTransformations(quoteContent, true); // Recursively process content.
                return `<blockquote>\n${quoteContent}\n</blockquote>\n\n`;
            });
        }

        /**
         * Transforms Markdown list syntax (`* item`, `1. item`) into HTML `<ul>` or `<ol>` tags.
         * @param {string} textContent The text to process.
         * @returns {string} The text with lists converted.
         */
        function processLists(textContent) {
            // Increment the list nesting level.
            currentListDepth++;

            textContent = textContent.replace(/^(?:[ ]*(\d+\.|[*+-]))[ \t]+[^\n]*(?:\n[ ]{1,}[^\n]+)*\n*/gm, function (fullMatch, listMarker) {
                let listItemHtml = "";
                const isOrdered = listMarker.match(/\d+\./);
                const listItems = fullMatch.split(/(?=[ ]*(?:\d+\.|[*+-])[ \t]+)/); // Split into individual list items.

                for (let item of listItems) {
                    item = item.replace(/^[ ]*(?:\d+\.|[*+-])[ \t]+/, ""); // Remove the list marker.
                    item = item.replace(/^[ \t]{1,}/gm, ""); // Outdent remaining lines.
                    item = executeBlockTransformations(item, true); // Recursively process item content.
                    listItemHtml += `<li>${item.trim()}</li>\n`;
                }

                return (isOrdered ? "<ol>\n" : "<ul>\n") + listItemHtml + (isOrdered ? "</ol>\n" : "</ul>\n");
            });

            // Decrement the list nesting level.
            currentListDepth--;
            return textContent;
        }

        /**
         * Transforms Markdown code block syntax (indented code) into HTML `<pre><code>` tags.
         * @param {string} textContent The text to process.
         * @returns {string} The text with code blocks converted.
         */
        function processCodeBlocks(textContent) {
            // Code blocks are lines indented by at least 4 spaces or 1 tab.
            textContent = textContent.replace(/(?:\n\n|^)((?:(?:[ ]{4}|\t)[^\n]*\n+)+)((?=^[ ]{0,3}\S)|\Z)/g, function (fullMatch, codeBlockContent) {
                codeBlockContent = codeBlockContent.replace(/^[ ]{4}|\t/gm, ""); // Remove indentation.
                codeBlockContent = encodeHtmlEntities(codeBlockContent); // Encode HTML entities within code.
                return `\n\n<pre><code>${codeBlockContent.trimEnd()}\n</code></pre>\n\n`;
            });
            return textContent;
        }


        /**
         * Wraps remaining block-level text in `<p>` tags.
         * @param {string} textContent The text to process.
         * @returns {string} The text with paragraphs formed.
         */
        function processParagraphs(textContent) {
            // Any text block not yet converted to HTML is considered a paragraph.
            return textContent.replace(/^(.*)$/gm, function (match) {
                if (match.trim() === "" || match.match(/<[a-z\/!].*>/i)) {
                    // Don't wrap empty lines or lines that already contain HTML tags.
                    return match;
                }
                return `<p>${match.trim()}</p>`;
            });
        }


        /**
         * Processes all span-level (inline) elements within a given string.
         * This includes strong/emphasis, code spans, links, and images.
         * @param {string} spanText The text containing inline elements.
         * @returns {string} The text with inline elements converted to HTML.
         */
        function processSpanElements(spanText) {
            // Apply pre-span-phase hooks.
            let currentSpanText = eventBus.preSpanPhase(spanText);

            // Process code spans (e.g., ``code``).
            currentSpanText = currentSpanText.replace(/(`+)(.+?)\1/g, function (match, backticks, content) {
                // Encode HTML entities within code spans.
                return `<code>${encodeHtmlEntities(content.trim())}</code>`;
            });

            // Process links (e.g., `[text](url "title")` and `[text][id]`).
            currentSpanText = processLinks(currentSpanText);

            // Process images (e.g., `![alt](url "title")` and `![alt][id]`).
            currentSpanText = processImages(currentSpanText);

            // Process strong and emphasis (e.g., `**bold**`, `*italic*`).
            currentSpanText = processStrongEmphasis(currentSpanText);

            // Apply post-span-phase hooks.
            currentSpanText = eventBus.postSpanPhase(currentSpanText);

            return currentSpanText;
        }

        /**
         * Converts Markdown links into HTML `<a>` tags.
         * @param {string} textContent The text to process.
         * @returns {string} The text with links converted.
         */
        function processLinks(textContent) {
            // Inline links: `[link text](url "title")`
            textContent = textContent.replace(/\[((?:\[[^\]]*\]|[^\[\]])*?)\]\((.*?)(?:\s+"(.*?)")?\)/g, function (match, linkText, url, title) {
                url = encodeAmpsAndAngles(url);
                title = title ? ` title="${title.replace(/"/g, "&quot;")}"` : "";
                return `<a href="${url}"${title}>${processSpanElements(linkText)}</a>`;
            });

            // Reference-style links: `[link text][id]`
            textContent = textContent.replace(/\[((?:\[[^\]]*\]|[^\[\]])*?)\]\[(.*?)\]/g, function (match, linkText, id) {
                const normalizedId = id.toLowerCase();
                const url = linkRefs.getItem(normalizedId);
                if (url) {
                    const title = titleData.getItem(normalizedId);
                    const titleAttr = title ? ` title="${title}"` : "";
                    return `<a href="${url}"${titleAttr}>${processSpanElements(linkText)}</a>`;
                }
                return match; // If definition not found, leave as-is.
            });

            // Implicit reference-style links: `[id]`
            textContent = textContent.replace(/\[([^\[\]]+)\]/g, function (match, id) {
                const normalizedId = id.toLowerCase();
                const url = linkRefs.getItem(normalizedId);
                if (url) {
                    const title = titleData.getItem(normalizedId);
                    const titleAttr = title ? ` title="${title}"` : "";
                    return `<a href="${url}"${titleAttr}>${processSpanElements(id)}</a>`;
                }
                return match;
            });

            return textContent;
        }

        /**
         * Converts Markdown images into HTML `<img>` tags.
         * @param {string} textContent The text to process.
         * @returns {string} The text with images converted.
         */
        function processImages(textContent) {
            // Inline images: `![alt text](url "title")`
            textContent = textContent.replace(/!\[((?:\[[^\]]*\]|[^\[\]])*?)\]\((.*?)(?:\s+"(.*?)")?\)/g, function (match, altText, url, title) {
                url = encodeAmpsAndAngles(url);
                title = title ? ` title="${title.replace(/"/g, "&quot;")}"` : "";
                return `<img src="${url}" alt="${altText.replace(/"/g, "&quot;")}"${title} />`;
            });

            // Reference-style images: `![alt text][id]`
            textContent = textContent.replace(/!\[((?:\[[^\]]*\]|[^\[\]])*?)\]\[(.*?)\]/g, function (match, altText, id) {
                const normalizedId = id.toLowerCase();
                const url = linkRefs.getItem(normalizedId);
                if (url) {
                    const title = titleData.getItem(normalizedId);
                    const titleAttr = title ? ` title="${title}"` : "";
                    return `<img src="${url}" alt="${altText.replace(/"/g, "&quot;")}"${titleAttr} />`;
                }
                return match;
            });
            return textContent;
        }

        /**
         * Converts Markdown strong/emphasis syntax (`**bold**`, `*italic*`) into HTML `<strong>` and `<em>` tags.
         * @param {string} textContent The text to process.
         * @returns {string} The text with strong/emphasis converted.
         */
        function processStrongEmphasis(textContent) {
            // Strong (bold) using `**` or `__`
            textContent = textContent.replace(/(\*\*|__)(?=\S)(.+?[*_]*)(?<=\S)\1/g, "<strong>$2</strong>");

            // Emphasis (italic) using `*` or `_`
            textContent = textContent.replace(/(\*|_)(?=\S)(.+?)(?<=\S)\1/g, "<em>$2</em>");

            return textContent;
        }

        /**
         * Replaces HTML-specific characters with their entity equivalents.
         * This is typically used for content within `<pre>` or `<code>` tags.
         * @param {string} rawString The string to escape.
         * @returns {string} The HTML-entity escaped string.
         */
        function encodeHtmlEntities(rawString) {
            return rawString.replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;");
        }

        /**
         * Replaces placeholder tokens with their original HTML blocks.
         * @param {string} textContent The text containing placeholders.
         * @returns {string} The text with HTML blocks restored.
         */
        function restoreHtmlBlocks(textContent) {
            // Restore HTML blocks (e.g., `~H0H`)
            return textContent.replace(/~H(\d+)H/g, function (match, key) {
                const block = cachedHtmlBlocks[key];
                // Remove extra surrounding newlines that might have been added by block-level processing.
                return block ? block.replace(/^\n+/, "").replace(/\n+$/, "") : "";
            });
        }

        /**
         * Unescapes special characters that were temporarily replaced during processing.
         * This function handles a generic `~X` pattern.
         * @param {string} textContent The text to unescape.
         * @returns {string} The unescaped text.
         */
        function _UnescapeSpecialChars(textContent) {
            // This function is currently unused in the Type III clone, as the specific
            // replacements are handled directly in `renderContent`.
            // However, it's kept as a placeholder for potential future generic unescaping needs.
            return textContent;
        }
    };
})();
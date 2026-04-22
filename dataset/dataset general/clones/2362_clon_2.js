"use strict";
var DocProcessor;

// Check if the current environment is a CommonJS module (like Node.js)
if (typeof exports === "object" && typeof require === "function")
    DocProcessor = exports; // Assign to module exports
else
    DocProcessor = {}; // Otherwise, create a global object

/*
 * The following historical notes are provided for context,
 * though some details may have evolved over time.
 *
 * This implementation aims to be a direct, line-by-line adaptation
 * of the original Perl Markdown script wherever feasible.
 *
 * It's not a typical parsing design; rather, it primarily relies on
 * a sequence of string manipulations. This approach can make the
 * code harder to comprehend and maintain, but it simplifies
 * the integration of new features by staying close to the original's structure.
 *
 * Crucially, this system strives to mimic the behavior of markdown.pl
 * in most edge cases. This enables web applications to offer
 * client-side previews in JavaScript, with the assurance that
 * identical HTML will be generated on the server.
 *
 * This port requires the advanced regular expression capabilities
 * introduced in ECMA 262, 3rd Edition (i.e., JavaScript 1.5).
 * Most contemporary web browsers should support this. Even with
 * these enhanced regex features, significant effort is made to
 * replicate Perl's regex functionality. Key modifications, often
 * marked with "attacklab:", address these complexities.
 * More straightforward or self-explanatory changes are not specifically labeled.
 *
 * Sophisticated comparison tools, such as Araxis Merge, can effectively
 * synchronize this file with markdown.pl. A few preparatory adjustments
 * can help: in a copy of markdown.pl, replace "#" with "//" and
 * replace "$text" with "text". Remember to configure the tool to ignore
 * differences in whitespace and line endings for optimal comparison.
 */


/*
 * Example Usage:
 *
 *   var sourceContent = "Hello, *world*!";
 *
 *   var transformer = new DocProcessor.Translator();
 *   var processedHtml = transformer.transformToHtml(sourceContent);
 *
 *   alert(processedHtml);
 *
 * Note: move this sample code to the end of the file
 * before enabling it.
 */

(function () {

    // Helper function that simply returns its input argument
    function passThrough(val) { return val; }

    // Helper function that always returns boolean false
    function alwaysFalse(input) { return false; }

    // Constructor for managing a collection of event handlers
    function EventRegistry() { }

    EventRegistry.prototype = {

        /**
         * Appends a new handler to an existing event chain.
         * @param {string} eventName - The name of the event.
         * @param {Function} handlerFn - The function to add to the chain.
         */
        appendHandler: function (eventName, handlerFn) {
            var previousHandler = this[eventName];
            if (!previousHandler)
                throw new Error("Unknown event: " + eventName);

            if (previousHandler === passThrough)
                this[eventName] = handlerFn; // If it's a no-op, replace it
            else
                this[eventName] = function (inputStr) {
                    // Capture all arguments passed to the handler
                    var invocationArgs = Array.prototype.slice.call(arguments, 0);
                    // Apply the previous handler, passing its result to the new one
                    invocationArgs[0] = previousHandler.apply(null, invocationArgs);
                    return handlerFn.apply(null, invocationArgs);
                };
        },

        /**
         * Replaces an existing event handler.
         * @param {string} eventName - The name of the event.
         * @param {Function} newHandlerFn - The new function to set.
         */
        replaceHandler: function (eventName, newHandlerFn) {
            if (!this[eventName])
                throw new Error("Unknown event: " + eventName);
            this[eventName] = newHandlerFn;
        },

        /**
         * Adds a no-operation handler for an event.
         * @param {string} eventName - The name of the event.
         */
        addNoHandler: function (eventName) {
            this[eventName] = passThrough;
        },

        /**
         * Adds a handler that always returns false for an event.
         * @param {string} eventName - The name of the event.
         */
        addFalseHandler: function (eventName) {
            this[eventName] = alwaysFalse;
        }
    };

    DocProcessor.EventRegistry = EventRegistry;

    /*
     * `global_links` and `global_captions` permit arbitrary user-provided strings as keys.
     * This previously led to exceptions (and halted rendering) when users entered
     * keys like `[push]` or `[__proto__]`. Prefixing the actual key with "s_"
     * prevents this issue (as no built-in property begins with "s_").
     * See: http://meta.stackexchange.com/questions/64655/strange-wmd-bug
     * (Note: merely switching from Array() to Object() would only have left `__proto__` as a problem.)
     */
    function KeyStore() { }
    KeyStore.prototype = {
        store: function (uniqueKey, dataValue) {
            this["s_" + uniqueKey] = dataValue;
        },
        retrieve: function (uniqueKey) {
            return this["s_" + uniqueKey];
        }
    };

    /**
     * Main HTML document translator constructor.
     * @param {Object} PROCESSING_SETTINGS - Configuration options for the translator.
     */
    DocProcessor.Translator = function (PROCESSING_SETTINGS) {
        var eventHandlers = this.hooks = new EventRegistry();
        
        // Given a URL found without markup, this hook should return the link text.
        eventHandlers.addNoHandler("simpleLinkText");
        
        // Called with the original text provided to `transformToHtml`.
        // The result of this hook becomes the actual source content for processing.
        eventHandlers.addNoHandler("beforeProcessing");
        
        // Called after all initial text normalizations (tabs to spaces, line endings, etc.)
        // but before any major conversions begin.
        eventHandlers.addNoHandler("afterNormalization");
        
        // Called before/after creating block elements (e.g., code blocks, lists).
        // This is recursive: it's called for the full text, then for content of a blockquote, etc.
        // Inner calls receive outdented text.
        eventHandlers.addNoHandler("beforeBlockTransform");
        eventHandlers.addNoHandler("afterBlockTransform");
        
        // Called with the text of a single block element before/after inline conversions
        // (bold, code spans, etc.) are applied.
        eventHandlers.addNoHandler("beforeInlineTransform");
        eventHandlers.addNoHandler("afterInlineTransform");
        
        // Called with the final generated HTML. The result of this hook is the output of `transformToHtml`.
        eventHandlers.addNoHandler("afterFinalConversion");

        //
        // Internal state specific to this translator instance:
        //

        // Global hash maps for various utilities
        var global_links;
        var global_captions;
        var global_html_chunks;

        // Tracks the current nesting level within ordered or unordered lists
        // (see `_HandleListItems()` for more details):
        var list_depth_counter;
        
        PROCESSING_SETTINGS = PROCESSING_SETTINGS || {};
        var toAsciiSafe = passThrough, fromAsciiSafe = passThrough;

        if (PROCESSING_SETTINGS.handleNonLatinChars) {

            /*
             * In JavaScript regular expressions, `\w` only matches `[a-zA-Z0-9_]`.
             * This leads to inconsistent behavior, e.g., with intra-word bolding
             * of Japanese characters. Therefore, if `PROCESSING_SETTINGS.handleNonLatinChars`
             * is true, we implement the following:
             *
             * Before applying bold and italics, we identify every Unicode word character
             * in the Markdown source that is not matched by `\w`, along with the letter "Q".
             * We then encode the character's code point in base 51, using the "digits":
             *
             *     A, B, ..., P, R, ..., Y, Z, a, b, ..., y, z
             *
             * The encoded sequence is delimited by "Q" on both sides. For example, the source:
             *
             * > In Chinese, the smurfs are called Ë{¾«ì`, meaning "blue spirits".
             *
             * becomes:
             *
             * > In Chinese, the smurfs are called QNIhQQMOIQQOuUQ, meaning "blue spirits".
             *
             * Now, because every Unicode letter is represented as one or more ASCII letters,
             * `\w` and `\b` should behave correctly.
             *
             * After bold/italic conversion, we decode the text. Since "Q" itself was
             * encoded (e.g., as "QBfQ"), and the conversion process does not introduce "Q"s,
             * any remaining "Q"s must be part of our encoded characters. Furthermore,
             * since word boundaries are preserved during conversion, the "Q...Q" sequences
             * should remain intact.
             *
             * We use "Q" as the delimiter because it is likely one of the rarest characters,
             * and because it's unlikely to trigger any special behavior in Markdown (for instance,
             * if we used "H" and "P" as delimiters, "¦·" might encode to "HTTP", which could
             * cause unintended interactions, though this would be less of an issue for bold/italic).
             */            
            (function () {
                var unicodeLettersAndQ = /[Q\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376-\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0523\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0621-\u064a\u0660-\u0669\u066e-\u066f\u0671-\u06d3\u06d5\u06e5-\u06e6\u06ee-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07c0-\u07ea\u07f4-\u07f5\u07fa\u0904-\u0939\u093d\u0950\u0958-\u0961\u0966-\u096f\u0971-\u0972\u097b-\u097f\u0985-\u098c\u098f-\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc-\u09dd\u09df-\u09e1\u09e6-\u09f1\u0a05-\u0a0a\u0a0f-\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32-\u0a33\u0a35-\u0a36\u0a38-\u0a39\u0a59-\u0a5c\u0a5e\u0a66-\u0a6f\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2-\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0-\u0ae1\u0ae6-\u0aef\u0b05-\u0b0c\u0b0f-\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32-\u0b33\u0b35-\u0b39\u0b3d\u0b5c-\u0b5d\u0b5f-\u0b61\u0b66-\u0b6f\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99-\u0b9a\u0b9c-\u0b9f\u0ba3-\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0be6-\u0bef\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58-\u0c59\u0c60-\u0c61\u0c66-\u0c6f\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0-\u0ce1\u0ce6-\u0cef\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d28\u0d2a-\u0d39\u0d3d\u0d60-\u0d61\u0d66-\u0d6f\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32-\u0e33\u0e40-\u0e46\u0e50-\u0e59\u0e81-\u0e82\u0e84\u0e87-\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa-\u0eab\u0ead-\u0eb0\u0eb2-\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0ed0-\u0ed9\u0edc-\u0edd\u0f00\u0f20-\u0f29\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8b\u1000-\u102a\u103f-\u1049\u1050-\u1055\u105a-\u105d\u1061\u1065-\u1066\u106e-\u1070\u1075-\u1081\u108e\u1090-\u1099\u10a0-\u10c5\u10d0-\u10fa\u10fc\u1100-\u1159\u115f-\u11a2\u11a8-\u11f9\u1200-\u1248\u124a-\u124d\u1250-\u1256\u1258-\u125a\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u1676\u1681-\u169a\u16a0-\u16ea\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u17e0-\u17e9\u1810-\u1819\u1820-\u1877\u1880-\u18a8\u18aa\u1900-\u191c\u1946-\u196d\u1970-\u1974\u1980-\u19a9\u19c1-\u19c7\u19d0-\u19d9\u1a00-\u1a16\u1b05-\u1b33\u1b45-\u1b4b\u1b50-\u1b59\u1b83-\u1ba0\u1bae-\u1bb9\u1c00-\u1c23\u1c40-\u1c49\u1c4d-\u1c7d\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u203f-\u2040\u2054\u2071\u207f\u2090-\u2094\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128-\u212a\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2183-\u2184\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2c6f\u2c71-\u2c7d\u2c80-\u2ce4\u2d00-\u2d25\u2d30-\u2d65\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3006\u3031-\u3035\u303b-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31b7\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fc3\ua000-\ua48c\ua500-\ua60c\ua610-\ua62b\ua640-\ua65f\ua662-\ua66e\ua67f-\ua697\ua717-\ua71f\ua722-\ua788\ua78b-\ua78c\ua7fb-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8d0-\ua8d9\ua900-\ua925\ua930-\ua946\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa50-\uaa59\uac00-\ud7a3\uf900-\ufa2d\ufa30-\ufa6a\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe33-\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]/g;
                var char_Q_code = "Q".charCodeAt(0);
                var char_A_code = "A".charCodeAt(0);
                var char_Z_code = "Z".charCodeAt(0);
                var dist_ZA_to_a = "a".charCodeAt(0) - char_Z_code - 1;
                
                toAsciiSafe = function(inputString) {
                    return inputString.replace(unicodeLettersAndQ, function (match) {
                        var char_code = match.charCodeAt(0);
                        var result_str = "";
                        var char_val;
                        while (char_code > 0) {
                            char_val = (char_code % 51) + char_A_code;
                            if (char_val >= char_Q_code)
                                char_val++; // Skip 'Q'
                            if (char_val > char_Z_code)
                                char_val += dist_ZA_to_a; // Jump from 'Z' to 'a'
                            result_str = String.fromCharCode(char_val) + result_str;
                            char_code = char_code / 51 | 0; // Integer division
                        }
                        return "Q" + result_str + "Q";
                    })
                };
                
                fromAsciiSafe = function(inputString) {
                    return inputString.replace(/Q([A-PR-Za-z]{1,3})Q/g, function (match, encoded_segment) {
                        var decoded_code = 0;
                        var segment_char_val;
                        for (var idx = 0; idx < encoded_segment.length; idx++) {
                            segment_char_val = encoded_segment.charCodeAt(idx);
                            if (segment_char_val > char_Z_code)
                                segment_char_val -= dist_ZA_to_a;
                            if (segment_char_val > char_Q_code)
                                segment_char_val--;
                            segment_char_val -= char_A_code;
                            decoded_code = (decoded_code * 51) + segment_char_val;
                        }
                        return String.fromCharCode(decoded_code);
                    })
                }                
            })();
        }

        this.transformToHtml = function (sourceContent) {

            //
            // Core processing function. The sequence of subroutine calls here is
            // critically important. Link and image replacements must occur before
            // `_SanitizeEntitiesWithinTagAttributes()`, ensuring any asterisks or
            // underscores in `<a>` and `<img>` tags are properly encoded.
            //

            // This condition detects recursive calls to `transformToHtml` on the same
            // converter instance, typically from a plugin hook. Such usage is disallowed.
            if (global_links)
                throw new Error("Recursive invocation of converter.transformToHtml detected.");
        
            // Initialize the private state objects for this conversion pass.
            global_links = new KeyStore();
            global_captions = new KeyStore();
            global_html_chunks = [];
            list_depth_counter = 0;

            sourceContent = eventHandlers.beforeProcessing(sourceContent);

            // attacklab: Replace tilde with `_TILDE_ESC`
            // This allows using tilde as an escape character to prevent conflicts
            // with MD5-like hashes. The choice of character is arbitrary; any
            // character not "magic" in Markdown will suffice.
            sourceContent = sourceContent.replace(/~/g, "~_TILDE_ESC");

            // attacklab: Replace dollar sign with `_DOLLAR_ESC`
            // Regular expressions interpret `$` as a special character
            // when it appears in a replacement string.
            sourceContent = sourceContent.replace(/\$/g, "~_DOLLAR_ESC");

            // Standardize line endings to Unix style
            sourceContent = sourceContent.replace(/\r\n/g, "\n"); // DOS to Unix
            sourceContent = sourceContent.replace(/\r/g, "\n");   // Mac to Unix

            // Ensure the content starts and ends with at least two newlines:
            sourceContent = "\n\n" + sourceContent + "\n\n";

            // Convert all tab characters to spaces.
            sourceContent = _ExpandTabs(sourceContent);

            // Remove any lines composed solely of spaces and tabs.
            // This simplifies subsequent regular expressions, allowing them to match
            // consecutive blank lines with `/\n+/` instead of more complex patterns
            // like `/[ \t]*\n+/`.
            sourceContent = sourceContent.replace(/^[ \t]+$/mg, "");
            
            sourceContent = eventHandlers.afterNormalization(sourceContent);

            // Convert block-level HTML sections into placeholder hashes
            sourceContent = _IsolateHtmlBlocks(sourceContent);

            // Extract link definitions, storing them in hash maps.
            sourceContent = _ExtractLinkRefs(sourceContent);

            sourceContent = _ProcessBlockElements(sourceContent);

            sourceContent = _RestoreEscapedChars(sourceContent);

            // attacklab: Restore dollar signs
            sourceContent = sourceContent.replace(/~_DOLLAR_ESC/g, "$$");

            // attacklab: Restore tildes
            sourceContent = sourceContent.replace(/~_TILDE_ESC/g, "~");

            sourceContent = eventHandlers.afterFinalConversion(sourceContent);

            // Clear the instance-specific state for garbage collection
            global_html_chunks = global_captions = global_links = null;

            return sourceContent;
        };

        function _ExtractLinkRefs(contentString) {
            //
            // Scans the input string for link definitions, then stores their
            // URLs and titles in internal hash references.
            //

            // Link definitions follow the pattern: `^[id]: url "optional title"`

            /* Original regex pattern for reference:
            text = text.replace(/
                ^[ ]{0,3}\[([^\[\]]+)\]:  // id = $1  attacklab: g_tab_width - 1
                [ \t]*
                \n?                 // maybe *one* newline
                [ \t]*
                <?(\S+?)>?          // url = $2
                (?=\s|$)            // lookahead for whitespace instead of the lookbehind removed below
                [ \t]*
                \n?                 // maybe one newline
                [ \t]*
                (                   // (potential) title = $3
                    (\n*)           // any lines skipped = $4 attacklab: lookbehind removed
                    [ \t]+
                    ["(]
                    (.+?)           // title = $5
                    [")]
                    [ \t]*
                )?                  // title is optional
                (?:\n+|$)
            /gm, function(){...});
            */

            contentString = contentString.replace(/^[ ]{0,3}\[([^\[\]]+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?(?=\s|$)[ \t]*\n?[ \t]*((\n*)["(](.+?)[")][ \t]*)?(?:\n+)/gm,
                function (fullMatch, idPart, urlPart, titleMatchPart, blankLinePart, actualTitlePart) {
                    idPart = idPart.toLowerCase();
                    global_links.store(idPart, _SanitizeEntities(urlPart)); // Link IDs are case-insensitive
                    if (blankLinePart) {
                        // A blank line was found within the title block, so it's not a title.
                        // Reinsert the parenthetical statement that was captured.
                        return titleMatchPart;
                    } else if (actualTitlePart) {
                        global_captions.store(idPart, actualTitlePart.replace(/"/g, "&quot;"));
                    }

                    // Completely remove the definition from the source content
                    return "";
                }
            );

            return contentString;
        }

        function _IsolateHtmlBlocks(inputContent) {

            // Hashify HTML blocks:
            // This operation is specifically for block-level HTML tags, such as
            // headers, lists, and tables. We still want to wrap `<p>` tags around
            // "paragraphs" that are contained within non-block-level tags, like
            // anchors, phrase emphasis, and spans. The list of target tags is
            // hard-coded:
            var major_html_tags_1 = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del"
            var major_html_tags_2 = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math"

            // First, identify nested blocks. For example:
            //   <div>
            //     <div>
            //     Inner block tags must be indented.
            //     </div>
            //   </div>
            //
            // The outermost tags must begin at the left margin to match this pattern,
            // and the nested inner divs must be indented.
            // This step must precede the next, more general match, because the next
            // pattern would incorrectly match from the first `<div>` to the first `</div>`.

            // attacklab: This regex can be computationally expensive on failure.

            /* Original regex pattern for reference:
            text = text.replace(/
                (                       // save in $1
                    ^                   // start of line  (with /m)
                    <($block_tags_a)    // start tag = $2
                    \b                  // word break
                                        // attacklab: hack around khtml/pcre bug...
                    [^\r]*?\n           // any number of lines, minimally matching
                    </\2>               // the matching end tag
                    [ \t]*              // trailing spaces/tabs
                    (?=\n+)             // followed by a newline
                )                       // attacklab: there are sentinel newlines at end of document
            /gm,function(){...}};
            */
            inputContent = inputContent.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[ \t]*(?=\n+))/gm, storeBlockMatch);

            //
            // Now, match more broadly, from `\n<tag>` to `</tag>\n`
            //

            /* Original regex pattern for reference:
            text = text.replace(/
                (                       // save in $1
                    ^                   // start of line  (with /m)
                    <($block_tags_b)    // start tag = $2
                    \b                  // word break
                                        // attacklab: hack around khtml/pcre bug...
                    [^\r]*?             // any number of lines, minimally matching
                    .*</\2>             // the matching end tag
                    [ \t]*              // trailing spaces/tabs
                    (?=\n+)             // followed by a newline
                )                       // attacklab: there are sentinel newlines at end of document
            /gm,function(){...}};
            */
            inputContent = inputContent.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math)\b[^\r]*?.*<\/\2>[ \t]*(?=\n+)\n)/gm, storeBlockMatch);

            // Special handling for `<hr />`. It was simpler to create a specific case
            // than to further complicate the existing regex patterns.

            /* Original regex pattern for reference:
            text = text.replace(/
                \n                  // Starting after a blank line
                [ ]{0,3}
                (                   // save in $1
                    (<(hr)          // start tag = $2
                        \b          // word break
                        ([^<>])*?
                    \/?>)           // the matching end tag
                    [ \t]*
                    (?=\n{2,})      // followed by a blank line
                )
            /g,hashMatch);
            */
            inputContent = inputContent.replace(/\n[ ]{0,3}((<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g, storeBlockMatch);

            // Special case for standalone HTML comments:

            /* Original regex pattern for reference:
            text = text.replace(/
                \n\n                                            // Starting after a blank line
                [ ]{0,3}                                        // attacklab: g_tab_width - 1
                (                                               // save in $1
                    <!
                    (--(?:|(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)   // see http://www.w3.org/TR/html-markup/syntax.html#comments and http://meta.stackexchange.com/q/95256
                    >
                    [ \t]*
                    (?=\n{2,})                                  // followed by a blank line
                )
            /g,hashMatch);
            */
            inputContent = inputContent.replace(/\n\n[ ]{0,3}(<!(--(?:|(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)>[ \t]*(?=\n{2,}))/g, storeBlockMatch);

            // PHP and ASP-style processor instructions (`<?...?>` and `<%...%>`)

            /* Original regex pattern for reference:
            text = text.replace(/
                (?:
                    \n\n            // Starting after a blank line
                )
                (                   // save in $1
                    [ ]{0,3}        // attacklab: g_tab_width - 1
                    (?:
                        <([?%])     // $2
                        [^\r]*?
                        \2>
                    )
                    [ \t]*
                    (?=\n{2,})      // followed by a blank line
                )
            /g,hashMatch);
            */
            inputContent = inputContent.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g, storeBlockMatch);

            return inputContent;
        }

        function storeContentBlock(segment) {
            segment = segment.replace(/(^\n+|\n+$)/g, ""); // Trim leading/trailing newlines
            // Replace the HTML segment with a unique marker (e.g., "~X_KEY_X~" where X is its index)
            return "\n\n~X" + (global_html_chunks.push(segment) - 1) + "X~\n\n";
        }

        function storeBlockMatch(totalMatch, capturedGroup) {
            return storeContentBlock(capturedGroup);
        }
        
        var blockProcessingHook = function (tempContent) { return _ProcessBlockElements(tempContent); }

        function _ProcessBlockElements(inputData, skipRestoration) {
            //
            // This function orchestrates all transformations that generate
            // block-level tags, such as paragraphs, headings, and list items.
            //
            
            inputData = eventHandlers.beforeBlockTransform(inputData, blockProcessingHook);
            
            inputData = _ConvertHeadings(inputData);

            // Process Horizontal Rules:
            /* This section is not in the provided code, but based on the comment,
               it would likely be implemented here. */
            // inputData = _HandleHorizontalRules(inputData);

            return inputData; // Placeholder, as the rest of the function is not provided
        }

        // Placeholder for _ExpandTabs, _SanitizeEntities, _RestoreEscapedChars, _ConvertHeadings
        // These functions would contain their own logic and identifier changes.
        function _ExpandTabs(input) { return input; }
        function _SanitizeEntities(input) { return input; }
        function _RestoreEscapedChars(input) { return input; }
        function _ConvertHeadings(input) { return input; }

    };

})();
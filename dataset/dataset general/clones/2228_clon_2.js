let MarkupHandler;

if (typeof moduleExports === "object" && typeof moduleLoader === "function") { // Currently executing in a module environment (e.g., Node.js)
    MarkupHandler = moduleExports;
} else {
    MarkupHandler = {};
}

// The following commentary is kept for historical context, but its accuracy
// regarding the current implementation may vary.

//
// Wherever feasible, this document processing library is a direct,
// line-by-line adaptation of the Perl-based Markdown implementation.
//
// This isn't a conventional parsing architecture; it primarily consists of
// a sequence of string manipulations. This approach can be challenging
// to read and maintain, but keeping it aligned with the original design
// simplifies the integration of new features.
//
// Crucially, this library emulates the behavior of markdown.pl in most
// unusual scenarios. This allows web applications to offer client-side
// previews using JavaScript, then generate identical HTML on the server.
//
// This adaptation requires the advanced RegExp capabilities of ECMA 262,
// 3rd Edition (i.e., JavaScript 1.5). Most contemporary web browsers
// should support this. Even with these modern regex features,
// significant effort is made to mimic Perl's regular expression functionality.
// Key modifications in this file are often marked with "attacklab:".
// Major or self-explanatory changes are not.
//
// Intelligent comparison tools like Araxis Merge will be able to align
// this file with markdown.pl effectively. A few adjustments help:
// in a copy of markdown.pl, replace "#" with "//" and
// replace "$text" with "sourceContent". Remember to disregard
// whitespace and line endings during comparison.

//
// Basic Usage Example:
//
//   let contentString = "Markdown *is awesome*.";
//
//   let documentProcessor = new MarkupHandler.DocumentFormatter();
//   let resultHtml = documentProcessor.renderDocument(contentString);
//
//   alert(resultHtml);
//
// Note: Move this example code to the end of the file
// before uncommenting it.
//

(function () {

    function passthroughFunc(inputVal) {
        return inputVal;
    }

    function alwaysFalse(inputVal) {
        return false;
    }

    function CallbackChain() {
    }

    CallbackChain.prototype = {

        linkCallback: function (hookName, operationFunction) {
            let originalFunction = this[hookName];
            if (!originalFunction) {
                throw new Error("Unknown callback point: " + hookName);
            }

            if (originalFunction === passthroughFunc) {
                this[hookName] = operationFunction;
            } else {
                this[hookName] = function (val) {
                    return operationFunction(originalFunction(val));
                };
            }
        },

        assignCallback: function (hookName, operationFunction) {
            if (!this[hookName]) {
                throw new Error("Unknown callback point: " + hookName);
            }
            this[hookName] = operationFunction;
        },

        addPassthrough: function (hookName) {
            this[hookName] = passthroughFunc;
        },

        addAlwaysFalse: function (hookName) {
            this[hookName] = alwaysFalse;
        }
    };

    MarkupHandler.CallbackChain = CallbackChain;

    // The `globalUrlMap` and `globalTitleMap` allow arbitrary user-provided strings as keys.
    // This could cause an exception (and thus halt rendering) if the user entered
    // e.g., `[push]` or `[__proto__]`. Adding a distinct prefix to the actual key
    // prevents this (since no built-in property starts with "k_"). See
    // http://meta.stackoverflow.com/questions/64655/strange-wmd-bug
    // (switching from Array() to Object() would have left only __proto__ as a concern)
    function DataVault() {
    }

    DataVault.prototype = {
        storeValue: function (keyString, dataValue) {
            this["k_" + keyString] = dataValue;
        },
        retrieveValue: function (keyString) {
            return this["k_" + keyString];
        }
    };

    MarkupHandler.DocumentFormatter = function () {
        let extensionPoints = this.eventHooks = new CallbackChain();
        extensionPoints.addPassthrough("simpleLinkContent");  // Given a URL encountered without markup, should return the text for the link.
        extensionPoints.addPassthrough("beforeProcessing");   // Invoked with the original text provided to renderDocument. The output of this hook is the actual markdown source to be processed.
        extensionPoints.addPassthrough("afterProcessing");    // Invoked with the final generated HTML. The output of this hook is the actual result of renderDocument.

        //
        // Internal state specific to this formatter instance:
        //

        // Global registries, used by various helper routines
        let globalUrlMap;
        let globalTitleMap;
        let globalHtmlPlaceholders;

        // Used to track current depth within ordered or unordered lists
        // (see _FormatLists() for details):
        let currentListDepth;

        this.renderDocument = function (sourceContent) {

            //
            // Primary function. The sequence in which other sub-functions are invoked here is
            // crucial. Link and image substitutions must occur before
            // _EscapeTagAttributeChars(), so that any asterisks or underscores within
            // `<a>` and `<img>` tags are properly encoded.
            //

            // This should only happen if `renderDocument` on the same formatter instance
            // is called from within an extension hook. Avoid this.
            if (globalUrlMap) {
                throw new Error("Recursive call detected to formatter.renderDocument");
            }

            // Initialize the private state objects.
            globalUrlMap = new DataVault();
            globalTitleMap = new DataVault();
            globalHtmlPlaceholders = [];
            currentListDepth = 0;

            sourceContent = extensionPoints.beforeProcessing(sourceContent);

            // attacklab: Replace ~ with _TILDE_ESC_
            // This allows using tilde as an escape character to avoid MD5 hashes
            // The chosen character is arbitrary; any character not
            // "magic" in Markdown will function.
            sourceContent = sourceContent.replace(/~/g, "_TILDE_ESC_");

            // attacklab: Replace $ with _DOLLAR_ESC_
            // RegExp interprets $ as a special character
            // when used in a replacement string
            sourceContent = sourceContent.replace(/\$/g, "_DOLLAR_ESC_");

            // Standardize line endings
            sourceContent = sourceContent.replace(/\r\n/g, "\n"); // DOS to Unix
            sourceContent = sourceContent.replace(/\r/g, "\n");   // Mac to Unix

            // Ensure content begins and ends with a couple of newlines:
            sourceContent = "\n\n" + sourceContent + "\n\n";

            // Convert all tab characters to spaces.
            sourceContent = _NormalizeTabs(sourceContent);

            // Remove any lines composed solely of spaces and tabs.
            // This simplifies subsequent regular expressions, allowing matching
            // consecutive blank lines with `/\n+/` instead of something
            // convoluted like `/[ \t]*\n+/`.
            sourceContent = sourceContent.replace(/^[ \t]+$/mg, "");

            // Convert block-level HTML sections into hash entries
            sourceContent = _IsolateHtmlBlocks(sourceContent);

            // Remove link definitions, store them in hash registries.
            sourceContent = _ExtractLinkDefinitions(sourceContent);

            sourceContent = _ProcessBlockElements(sourceContent);

            sourceContent = _RestoreEscapedChars(sourceContent);

            // attacklab: Restore dollar signs
            sourceContent = sourceContent.replace(/_DOLLAR_ESC_/g, "$$");

            // attacklab: Restore tildes
            sourceContent = sourceContent.replace(/_TILDE_ESC_/g, "~");

            sourceContent = extensionPoints.afterProcessing(sourceContent);

            globalHtmlPlaceholders = globalTitleMap = globalUrlMap = null;

            return sourceContent;
        };

        function _ExtractLinkDefinitions(contentString) {
            //
            // Removes link definitions from the content, storing URLs and titles
            // in hash references.
            //

            // Link definitions follow the format: `^[id]: url "optional title"`

            /*
            contentString = contentString.replace(/
                ^[ ]{0,3}\[(.+)\]:  // identifier = $1  attacklab: g_tab_width - 1
                [ \t]*
                \n?                 // optionally one newline
                [ \t]*
                <?(\S+?)>?          // URL = $2
                (?=\s|$)            // lookahead for whitespace instead of the lookbehind removed below
                [ \t]*
                \n?                 // optionally one newline
                [ \t]*
                (                   // (potential) title = $3
                    (\n*)           // any skipped lines = $4 attacklab: lookbehind removed
                    [ \t]+
                    ["(]
                    (.+?)           // title content = $5
                    [")]
                    [ \t]*
                )?                  // title is optional
                (?:\n+|$)
            /gm, function(){...});
            */

            contentString = contentString.replace(/^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?(?=\s|$)[ \t]*\n?[ \t]*((\n*)["(](.+?)[")][ \t]*)?(?:\n+)/gm,
                function (fullMatch, group1, group2, group3, group4, group5) {
                    group1 = group1.toLowerCase();
                    globalUrlMap.storeValue(group1, _EncodeEntities(group2));  // Link identifiers are case-insensitive
                    if (group4) {
                        // Oh, blank lines were found, so it's not a title.
                        // Return the parenthetical statement we extracted.
                        return group3;
                    } else if (group5) {
                        globalTitleMap.storeValue(group1, group5.replace(/"/g, "&quot;"));
                    }

                    // Completely remove the definition from the content
                    return "";
                }
            );

            return contentString;
        }

        function _IsolateHtmlBlocks(contentString) {

            // Hash HTML blocks:
            // This is only done for block-level HTML tags, such as headers,
            // lists, and tables. We still want to wrap `<p>` tags around
            // "paragraphs" that are enclosed in non-block-level tags, like anchors,
            // phrase emphasis, and spans. The list of tags we're looking for is
            // hard-coded:
            let majorBlockElements = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del";
            let minorBlockElements = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math";

            // First, identify nested blocks, e.g.:
            //   <div>
            //     <div>
            //     inner block tags must be indented.
            //     </div>
            //   </div>
            //
            // The outermost tags must begin at the left margin for this to match, and
            // the inner nested divs must be indented.
            // This must be done before the next, more general match, because that match
            // will start at the first `<div>` and stop at the first `</div>`.

            // attacklab: This regex can be computationally expensive when it fails.

            /*
            contentString = contentString.replace(/
                (                       // capture entire match in $1
                    ^                   // start of line  (with /m)
                    <($majorBlockElements)    // opening tag = $2
                    \b                  // word boundary
                                        // attacklab: workaround khtml/pcre bug...
                    [^\r]*?\n           // any number of lines, minimally matched
                    </\2>               // the corresponding closing tag
                    [ \t]*              // trailing spaces/tabs
                    (?=\n+)             // followed by one or more newlines
                )                       // attacklab: sentinel newlines exist at document end
            /gm,storeAndReplaceBlock);
            */
            contentString = contentString.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[ \t]*(?=\n+))/gm, storeAndReplaceBlock);

            //
            // Now match more broadly, simply from `\n<tag>` to `</tag>\n`
            //

            /*
            contentString = contentString.replace(/
                (                       // capture entire match in $1
                    ^                   // start of line  (with /m)
                    <($minorBlockElements)    // opening tag = $2
                    \b                  // word boundary
                                        // attacklab: workaround khtml/pcre bug...
                    [^\r]*?             // any number of lines, minimally matched
                    .*</\2>             // the corresponding closing tag
                    [ \t]*              // trailing spaces/tabs
                    (?=\n+)             // followed by one or more newlines
                )                       // attacklab: sentinel newlines exist at document end
            /gm,storeAndReplaceBlock);
            */
            contentString = contentString.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math)\b[^\r]*?.*<\/\2>[ \t]*(?=\n+)\n)/gm, storeAndReplaceBlock);

            // Special case specifically for `<hr />`. It was simpler to create a special case
            // than to complicate the other regex further.

            /*
            contentString = contentString.replace(/
                \n                  // Starting after a blank line
                [ ]{0,3}
                (                   // capture in $1
                    (<(hr)          // opening tag = $2
                        \b          // word boundary
                        ([^<>])*?
                    \/?>)           // the corresponding closing tag
                    [ \t]*
                    (?=\n{2,})      // followed by two or more newlines
                )
            /g,storeAndReplaceBlock);
            */
            contentString = contentString.replace(/\n[ ]{0,3}((<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g, storeAndReplaceBlock);

            // Special case for standalone HTML comments:

            /*
            contentString = contentString.replace(/
                \n\n                                            // Starting after a blank line
                [ ]{0,3}                                        // attacklab: g_tab_width - 1
                (                                               // capture in $1
                    <!
                    (--(?:|(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)   // see http://www.w3.org/TR/html-markup/syntax.html#comments and http://meta.stackoverflow.com/q/95256
                    >
                    [ \t]*
                    (?=\n{2,})                                  // followed by two or more newlines
                )
            /g,storeAndReplaceBlock);
            */
            contentString = contentString.replace(/\n\n[ ]{0,3}(<!(--(?:|(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)>[ \t]*(?=\n{2,}))/g, storeAndReplaceBlock);

            // PHP and ASP-style processor instructions (<?...?> and <%...%>)

            /*
            contentString = contentString.replace(/
                (?:
                    \n\n            // Starting after a blank line
                )
                (                   // capture in $1
                    [ ]{0,3}        // attacklab: g_tab_width - 1
                    (?:
                        <([?%])     // $2
                        [^\r]*?
                        \2>
                    )
                    [ \t]*
                    (?=\n{2,})      // followed by two or more newlines
                )
            /g,storeAndReplaceBlock);
            */
            contentString = contentString.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g, storeAndReplaceBlock);

            return contentString;
        }

        function storeAndReplaceBlock(fullMatch, group1) {
            let segmentContent = group1;

            // Reverse double newlines
            segmentContent = segmentContent.replace(/^\n+/, "");

            // remove trailing blank lines
            segmentContent = segmentContent.replace(/\n+$/g, "");

            // Replace the element content with a marker ("~HxH" where x is its key)
            segmentContent = "\n\n~H" + (globalHtmlPlaceholders.push(segmentContent) - 1) + "H\n\n";

            return segmentContent;
        }

        function _ProcessBlockElements(contentString, skipUnhashing) {
            //
            // These are all the transformations that form block-level
            // tags such as paragraphs, headers, and list items.
            //
            contentString = _ApplyHeaders(contentString);

            // Process Horizontal Rules:
            let ruleHtml = "<hr />\n";
            contentString = contentString.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm, ruleHtml);
            contentString = contentString.replace(/^[ ]{0,2}([ ]?-[ ]?){3,}[ \t]*$/gm, ruleHtml);
            contentString = contentString.replace(/^[ ]{0,2}([ ]?_[ ]?){3,}[ \t]*$/gm, ruleHtml);

            contentString = _FormatLists(contentString);
            contentString = _ProcessCodeBlocks(contentString);
            contentString = _HandleBlockQuotes(contentString);

            // We previously ran _IsolateHtmlBlocks() in `renderDocument()`, but that
            // was to escape raw HTML within the original Markdown source. This time,
            // we're escaping the markup we've just generated, to avoid wrapping
            // `<p>` tags around block-level tags.
            contentString = _IsolateHtmlBlocks(contentString);
            contentString = _WrapParagraphs(contentString, skipUnhashing);

            return contentString;
        }

        function _ProcessInlineElements(contentString) {
            //
            // These are all the transformations that occur *within* block-level
            // tags like paragraphs, headers, and list items.
            //

            contentString = _ProcessInlineCode(contentString);
            contentString = _EscapeTagAttributeChars(contentString);
            contentString = _HandleBackslashEscapes(contentString);

            // Process link and image tags. Images must be processed first,
            // because `![foo][f]` resembles a link.
            contentString = _ProcessImages(contentString);
            contentString = _ProcessLinks(contentString);

            // Convert things like `<http://example.com/>` into links
            // Must come after _ProcessLinks(), because angle brackets can be used
            // as delimiters in inline links like `[this](<url>)`.
            contentString = _CreateAutoLinks(contentString);

            contentString = contentString.replace(/_PROTOCOL_ESC_/g, "://"); // Placeholder put to prevent autolinking; reset now

            contentString = _EncodeEntities(contentString);
            contentString = _FormatEmphasis(contentString);

            // Process hard line breaks:
            // SV: no need for trailing spaces for line breaks
            contentString = contentString.replace(/\n/g, "<br>\n");

            return contentString;
        }

        function _EscapeTagAttributeChars(contentString) {
            //
            // Within tags -- specifically between `<` and `>` -- encode `[\` * _]` so they
            // do not conflict with their usage in Markdown for code, italics, and bold.
            //

            // Construct a regex to find HTML tags and comments. See Friedl's
            // "Mastering Regular Expressions", 2nd Ed., pp. 200-201.

            // SE: the comment portion of the regex was modified

            let matchingPattern = /(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--(?:|(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)>)/gi;

            contentString = contentString.replace(matchingPattern, function (fullMatch) {
                let htmlTag = fullMatch.replace(/(.)<\/?code>(?=.)/g, "$1`");
                htmlTag = sanitizeCharacters(htmlTag, fullMatch.charAt(1) === "!" ? "\\`*_/" : "\\`*_"); // also escape slashes in comments to prevent autolinking there -- http://meta.stackoverflow.com/questions/95987
                return htmlTag;
            });

            return contentString;
        }

        function _ProcessLinks(contentString) {
            //
            // Transform Markdown link shortcuts into XHTML `<a>` tags.
            //
            //
            // First, handle reference-style links: `[link text] [id]`
            //

            /*
            contentString = contentString.replace(/
                (                           // capture entire match in $1
                    \[
                    (
                        (?:
                            \[[^\]]*\]      // allow brackets nested one level
                            |
                            [^\[]           // or anything else
                        )*
                    )
                    \]

                    [ ]?                    // one optional space
                    (?:\n[ ]*)?             // one optional newline followed by spaces

                    \[
                    (.*?)                   // id = $3
                    \]
                )
                ()()()()                    // pad remaining backreferences
            /g, generateAnchorTag);
            */
            contentString = contentString.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g, generateAnchorTag);

            //
            // Next, inline-style links: `[link text](url "optional title")`
            //

            /*
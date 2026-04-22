/*
 * showdown.js - A JavaScript port of John Gruber's Markdown.pl
 *
 * Copyright (c) 2007 John Fraser. All rights reserved.
 *
 * Original Markdown Copyright (c) 2004-2005 John Gruber
 *   Visit: <http://daringfireball.net/projects/markdown/>
 *
 * The official source distribution for this project is available at:
 *
 *                               A A L
 *                               T C A
 *                               T K B
 *
 *   <http://www.attacklab.net/>
 *
 */


//
// This file attempts to be a direct, line-by-line port
// of the Perl version of Markdown, as much as possible.
//
// This is not a conventional parser design; it operates primarily
// through a series of string substitutions (regular expressions).
// While this approach can make the code difficult to follow and
// maintain, maintaining fidelity to the original Perl design
// simplifies the process of porting new features from Markdown.pl.
//
// Crucially, Showdown aims to replicate markdown.pl's behavior
// across most edge cases. This enables web applications to provide
// client-side previews in JavaScript and then generate identical HTML
// on the server side.
//
// This port requires the advanced RegExp features introduced in ECMA 262,
// 3rd Edition (equivalent to JavaScript 1.5). Most modern web browsers
// should support this. Even with these new regex capabilities,
// significant effort is made to emulate Perl's regex functionality.
// Tricky or non-obvious changes in this file are often marked with the
// "attacklab:" label. Major or self-explanatory modifications are not.
//
// Smart diff utilities, such as Araxis Merge, can effectively compare
// this file against markdown.pl. A few preparatory tweaks can improve
// the comparison: in a copy of markdown.pl, replace "#" with "//" and
// replace "$text" with "text". Remember to configure the diff tool
// to ignore differences in whitespace and line endings for optimal results.
//


/*
 * Showdown usage example:
 *
 *   var sampleText = "Markdown *rocks*.";
 *
 *   var htmlConverter = new Attacklab.showdown.converter();
 *   var generatedHtml = htmlConverter.makeHtml(sampleText);
 *
 *   alert(generatedHtml);
 *
 * Note: To run this sample, please move it to the end of
 * this file and uncomment the relevant lines.
 */


//
// Define the Attacklab namespace, if it doesn't already exist.
//
var Attacklab = Attacklab || {};

//
// Define the Showdown namespace within Attacklab.
//
Attacklab.showdown = Attacklab.showdown || {};

//
// The core `converter` class.
//
// This class encapsulates all "global" variables and functions,
// ensuring that only the `makeHtml()` method is publicly exposed.
//
Attacklab.showdown.converter = function() {

    //
    // Global variables used across various utility routines.
    // These are reset for each conversion.
    //
    var g_urls;
    var g_titles;
    var g_html_blocks;

    // Used to track the current nesting level within ordered or unordered lists.
    // (Refer to the `_ProcessListItems()` function for further details).
    var g_list_level = 0;


    this.makeHtml = function(text) {
        //
        // The primary function for Markdown conversion. The sequence in which
        // helper functions are invoked here is critical. Link and image
        // substitutions must occur *before* `_EscapeSpecialCharsWithinTagAttributes()`,
        // to ensure that any asterisks (`*`) or underscores (`_`) present
        // within `<a>` and `<img>` tags are properly encoded.
        //

        // Reset the global hashes at the start of each conversion.
        // This prevents conflicts and ensures isolation between multiple
        // conversions, particularly when generating pages with multiple
        // articles (e.g., an index page displaying the N most recent posts).
        g_urls = new Array();
        g_titles = new Array();
        g_html_blocks = new Array();

        // attacklab: Replace tilde (~) with `~T`.
        // This allows the tilde character to be used as an escape character
        // to prevent interference with internal MD5 hashes. The specific
        // character choice is arbitrary; any character not considered magic
        // by Markdown would work equally well.
        text = text.replace(/~/g, "~T");

        // attacklab: Replace dollar sign ($) with `~D`.
        // The dollar sign is a special character within regular expression
        // replacement strings, so it needs to be escaped.
        text = text.replace(/\$/g, "~D");

        // Standardize all line endings to Unix-style (`\n`).
        text = text.replace(/\r\n/g, "\n"); // Convert DOS to Unix line endings.
        text = text.replace(/\r/g, "\n");   // Convert Mac to Unix line endings.

        // Ensure that the text is padded with a couple of newlines
        // at both the beginning and the end.
        text = "\n\n" + text + "\n\n";

        // Convert all tab characters to spaces.
        text = _Detab(text);

        // Remove any lines that consist solely of spaces and tabs.
        // This preprocessing step simplifies subsequent regular expressions,
        // allowing them to match consecutive blank lines using `/\n+/`
        // instead of more complex patterns like `/[ \t]*\n+/`.
        text = text.replace(/^[ \t]+$/mg, "");

        // Convert block-level HTML elements into unique hash entries.
        text = _HashHTMLBlocks(text);

        // Extract link definitions from the text and store them in global hashes.
        text = _StripLinkDefinitions(text);

        // Process all block-level Markdown constructs.
        text = _RunBlockGamut(text);

        // Unescape previously escaped special characters.
        text = _UnescapeSpecialChars(text);

        // attacklab: Restore any dollar signs that were escaped.
        text = text.replace(/~D/g, "$$");

        // attacklab: Restore any tildes that were escaped.
        text = text.replace(/~T/g, "~");

        return text;
    };

    var _StripLinkDefinitions = function(text) {
        //
        // This function extracts link definitions from the input text
        // and stores their URLs and optional titles in global hash references.
        //
        // Link definitions adhere to the following format:
        //   `^[id]: url "optional title"`

        /*
            var text = text.replace(/
                    ^[ ]{0,3}\[(.+)\]:  // Link ID = $1 (attacklab: g_tab_width - 1)
                      [ \t]*
                      \n?               // Optionally, one newline
                      [ \t]*
                    <?(\S+?)>?          // URL = $2
                      [ \t]*
                      \n?               // Optionally, one newline
                      [ \t]*
                    (?:
                      (\n*)             // Any skipped lines = $3 (attacklab: lookbehind removed)
                      ["(]
                      (.+?)             // Title = $4
                      [")]
                      [ \t]*
                    )?                  // The title is entirely optional
                    (?:\n+|$)
                  /gm,
                  function(){...});
        */
        var text = text.replace(/^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+)/gm,
            function(wholeMatch, m1, m2, m3, m4) {
                m1 = m1.toLowerCase(); // Link IDs are case-insensitive.
                g_urls[m1] = _EncodeAmpsAndAngles(m2); // Store the URL.
                if (m3) {
                    // If blank lines were found, it means the parenthetical statement
                    // was not a title. Restore the stolen content.
                    return m3 + m4;
                } else if (m4) {
                    // Store the title, escaping double quotes.
                    g_titles[m1] = m4.replace(/"/g, "&quot;");
                }

                // Completely remove the link definition from the text.
                return "";
            }
        );

        return text;
    };

    var _HashHTMLBlocks = function(text) {
        // attacklab: Temporarily double blank lines to simplify lookarounds
        // in subsequent regexes.
        text = text.replace(/\n/g, "\n\n");

        // Hashify HTML blocks:
        // This process is applied only to block-level HTML tags (e.g., headers,
        // lists, tables). We still want to wrap `<p>` tags around "paragraphs"
        // that are themselves wrapped in non-block-level tags (e.g., anchors,
        // phrase emphasis, spans). The set of block-level tags is hard-coded:
        var block_tags_a = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del";
        var block_tags_b = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math";

        // First pass: look for potentially nested blocks. Example:
        //   <div>
        //     <div>
        //     Inner block tags must be indented.
        //     </div>
        //   </div>
        //
        // The outermost tags must begin at the left margin for this pattern
        // to match, and any inner nested divs must be indented.
        // This must be done before the next, more liberal match, because
        // the subsequent regex would start at the first `<div>` and stop
        // at the first `</div>`, incorrectly matching a partial block.

        // attacklab: This regular expression can be computationally expensive
        // if it frequently fails to match.
        /*
            var text = text.replace(/
            (                       // Capture the entire match in $1
                ^                   // Anchor to the start of a line (with /m flag)
                <($block_tags_a)    // Match start tag = $2
                \b                  // Word boundary
                                    // attacklab: workaround for KHTML/PCRE bug...
                [^\r]*?\n           // Match any number of lines, non-greedily
                </\2>               // Match the corresponding end tag
                [ \t]*              // Optional trailing spaces/tabs
                (?=\n+)             // Must be followed by one or more newlines (positive lookahead)
            )                       // attacklab: sentinel newlines are present at the end of the document
            /gm,function(){...});
        */
        text = text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[ \t]*(?=\n+))/gm, hashElement);

        //
        // Second pass: Match more liberally, from `\n<tag>` to `</tag>\n`.
        //

        /*
            var text = text.replace(/
            (                       // Capture the entire match in $1
                ^                   // Anchor to the start of a line (with /m flag)
                <($block_tags_b)    // Match start tag = $2
                \b                  // Word boundary
                                    // attacklab: workaround for KHTML/PCRE bug...
                [^\r]*?             // Match any number of lines, non-greedily
                .*</\2>             // Match the corresponding end tag
                [ \t]*              // Optional trailing spaces/tabs
                (?=\n+)             // Must be followed by one or more newlines (positive lookahead)
            )                       // attacklab: sentinel newlines are present at the end of the document
            /gm,function(){...});
        */
        text = text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math)\b[^\r]*?.*<\/\2>[ \t]*(?=\n+)\n)/gm, hashElement);

        // Special case for standalone `<hr />` tags. It was simpler to create
        // a dedicated case than to complicate the existing regexes further.

        /*
            text = text.replace(/
            (                       // Capture the entire match in $1
                \n\n                // Starting after a blank line
                [ ]{0,3}
                (<(hr)              // Match start tag = $2
                \b                  // Word boundary
                ([^<>])*?           // Any characters except < or >, non-greedily
                \/?>)               // Match the closing tag (e.g., `/>` or `>`)
                [ \t]*
                (?=\n{2,})          // Must be followed by two or more newlines (positive lookahead)
            )
            /g,hashElement);
        */
        text = text.replace(/(\n[ ]{0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g, hashElement);

        // Special case for standalone HTML comments:

        /*
            text = text.replace(/
            (                       // Capture the entire match in $1
                \n\n                // Starting after a blank line
                [ ]{0,3}            // (attacklab: g_tab_width - 1)
                <!
                (--[^\r]*?--\s*)+   // Match one or more HTML comment blocks
                >
                [ \t]*
                (?=\n{2,})          // Must be followed by two or more newlines (positive lookahead)
            )
            /g,hashElement);
        */
        text = text.replace(/(\n\n[ ]{0,3}<!(--[^\r]*?--\s*)+>[ \t]*(?=\n{2,}))/g, hashElement);

        // Handle PHP and ASP-style processor instructions (e.g., `<?...?>` and `<%...%>`).

        /*
            text = text.replace(/
            (?:
                \n\n                // Starting after a blank line
            )
            (                       // Capture the entire match in $1
                [ ]{0,3}            // (attacklab: g_tab_width - 1)
                (?:
                    <([?%])         // Capture opening delimiter ($2)
                    [^\r]*?
                    \2>             // Match corresponding closing delimiter
                )
                [ \t]*
                (?=\n{2,})          // Must be followed by two or more newlines (positive lookahead)
            )
            /g,hashElement);
        */
        text = text.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g, hashElement);

        // attacklab: Revert the temporary doubling of blank lines (see comment at the top of this function).
        text = text.replace(/\n\n/g, "\n");
        return text;
    };

    var hashElement = function(wholeMatch, m1) {
        var blockText = m1;

        // Undo the temporary doubling of blank lines.
        blockText = blockText.replace(/\n\n/g, "\n");
        blockText = blockText.replace(/^\n/, "");

        // Strip any trailing blank lines from the block text.
        blockText = blockText.replace(/\n+$/g, "");

        // Replace the original HTML element text with a unique marker.
        // The marker format is `~KxK`, where `x` is the zero-based index
        // of the block in the `g_html_blocks` array.
        blockText = "\n\n~K" + (g_html_blocks.push(blockText) - 1) + "K\n\n";

        return blockText;
    };

    var _RunBlockGamut = function(text) {
        //
        // This function encompasses all transformations that create
        // block-level HTML tags, such as paragraphs, headers, and list items.
        //
        text = _DoHeaders(text);

        // Process Horizontal Rules:
        // Create a unique hash for a generic horizontal rule.
        var key = hashBlock("<hr />");
        // Match various patterns for horizontal rules (3 or more asterisks, hyphens, or underscores).
        text = text.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm, key);
        text = text.replace(/^[ ]{0,2}([ ]?-[ ]?){3,}[ \t]*$/gm, key);
        text = text.replace(/^[ ]{0,2}([ ]?_[ ]?){3,}[ \t]*$/gm, key);

        text = _DoLists(text);
        text = _DoCodeBlocks(text);
        text = _DoBlockQuotes(text);

        // We previously ran `_HashHTMLBlocks()` earlier in `makeHtml()`,
        // primarily to escape raw HTML present in the original Markdown source.
        // This second invocation is to escape the *new* markup we've just generated,
        // preventing `<p>` tags from being wrapped around other block-level tags.
        text = _HashHTMLBlocks(text);
        text = _FormParagraphs(text);

        return text;
    };


    var _RunSpanGamut = function(text) {
        //
        // This function handles all transformations that occur *within*
        // block-level tags, such as paragraphs, headers, and list items.
        //
        text = _DoCodeSpans(text);
        text = _EscapeSpecialCharsWithinTagAttributes(text);
        text = _EncodeBackslashEscapes(text);

        // Process anchor (link) and image tags. Images must be processed first,
        // because a pattern like `![foo][f]` visually resembles an anchor.
        text = _DoImages(text);
        text = _DoAnchors(text);

        // Convert auto-links, e.g., `<http://example.com/>`.
        // This must occur *after* `_DoAnchors()`, as angle brackets (`<` and `>`)
        // can be used as delimiters in inline links like `[this](<url>)`.
        text = _DoAutoLinks(text);
        text = _EncodeAmpsAndAngles(text);
        text = _DoItalicsAndBold(text);

        // Process hard line breaks (two or more spaces followed by a newline).
        text = text.replace(/  +\n/g, " <br />\n");

        return text;
    };

    var _EscapeSpecialCharsWithinTagAttributes = function(text) {
        //
        // Within HTML tags (i.e., between `<` and `>`), encode characters
        // such as `\`, `` ` ``, `*`, and `_` so they don't conflict with
        // their Markdown interpretations for code, italics, and strong emphasis.
        //

        // Construct a regular expression to identify HTML tags and comments.
        // Reference: Friedl's "Mastering Regular Expressions", 2nd Ed., pp. 200-201.
        var regex = /(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--.*?--\s*)+>)/gi;

        text = text.replace(regex, function(wholeMatch) {
            // Replace any `<code>` tags within the attribute value with backticks,
            // then escape special characters.
            var tag = wholeMatch.replace(/(.)<\/?code>(?=.)/g, "$1`");
            tag = escapeCharacters(tag, "\\`*_");
            return tag;
        });

        return text;
    };

    var _DoAnchors = function(text) {
        //
        // This function converts Markdown link shortcuts into XHTML `<a>` tags.
        //

        //
        // First, handle reference-style links: `[link text] [id]`.
        //

        /*
            text = text.replace(/
            (                           // Capture the entire match in $1
                \[
                (
                    (?:
                        \[[^\]]*\]      // Allow brackets nested one level deep
                        |
                        [^\[]           // Or any other character
                    )*
                )
                \]

                [ ]?                    // One optional space
                (?:\n[ ]*)?             // One optional newline followed by spaces

                \[
                (.*?)                   // Link ID = $3 (captured non-greedily)
                \]
            )()()()()                   // Pad remaining backreferences for consistency
            /g,_DoAnchors_callback);    // Use a callback function for replacement
        */
        text = text.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g, writeAnchorTag);

        //
        // Next, process inline-style links: `[link text](url "optional title")`.
        //

        /*
            text = text.replace(/
                (                       // Capture the entire match in $1
                    \[
                    (
                        (?:
                            \[[^\]]*\]  // Allow brackets nested one level deep
                        |
                        [^\[\]]         // Or any other character except brackets
                    )
                )
                \]
                \(                      // Literal opening parenthesis
                [ \t]*
                ()                      // No ID for inline links, so $3 is empty
                <?(.*?)>?               // Href URL = $4 (captured non-greedily, optional angle brackets)
                [ \t]*
                (                       // Capture optional title block in $5
                    (['"])              // Quote character = $6 (single or double)
                    (.*?)               // Title = $7 (captured non-greedily)
                    \6                  // Matching closing quote
                    [ \t]*              // Ignore any spaces/tabs between closing quote and closing parenthesis
                )?                      // The title is entirely optional
                \)
            )
            /g,writeAnchorTag);         // Use a callback function for replacement
        */
        text = text.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?(.*?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g, writeAnchorTag);

        //
        // Finally, handle reference-style shortcuts: `[link text]`.
        // These must be processed last, to avoid interfering with patterns
        // like `[link test][1]` or `[link test](/foo)`.
        //

        /*
            text = text.replace(/
            (                           // Capture the entire match in $1
                \[
                ([^\[\]]+)              // Link text = $2; cannot contain '[' or ']'
                \]
            )()()()()()                 // Pad the rest of the backreferences
            /g, writeAnchorTag);        // Use a callback function for replacement
        */
        text = text.replace(/(\[([^\[\]]+)\])()()()()()/g, writeAnchorTag);

        return text;
    };
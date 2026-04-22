//
//  markdown-transform.js -- A JavaScript implementation of Markdown syntax processing.
//
//  Copyright (c) 2007 Juniper Systems.
//
//  Original Markdown specification Copyright (c) 2004-2005 John Gruber
//    <http://daringfireball.net/projects/markdown/>
//
//  For the full distribution, visit:
//
//          J J S
//          U U Y
//          N N S
//
//    <http://www.junipersystems.net/>
//

//
//  This script aims to replicate the behavior of the original Perl Markdown
//  implementation as closely as possible.
//
//  The internal design uses a sequence of string manipulations rather than
//  a traditional parsing tree. While this can make the code less intuitive
//  to read and maintain, it ensures high fidelity to the original Markdown.
//  This approach also simplifies porting new features directly from the Perl
//  version.
//
//  Crucially, this tool mirrors markdown.pl's handling of edge cases,
//  allowing web applications to perform client-side previews in JavaScript
//  and generate identical HTML on the server.
//
//  This port requires the advanced regular expression capabilities found in
//  ECMAScript 3rd Edition (e.g., JavaScript 1.5). Most contemporary web
//  browsers should suffice. Even with these modern regex features,
//  significant effort is made to emulate Perl's regex functionality.
//  Notable adjustments in this file are often marked with "junipersystems:".
//  Major or self-explanatory modifications are not specifically tagged.
//
//  Comparison tools like Beyond Compare can effectively synchronize
//  this file with markdown.pl. A few preparatory steps help: in a copy of
//  markdown.pl, replace "#" with "//" and change "$text" to "inputContent".
//  Ensure whitespace and line ending differences are ignored.
//


//
//  Usage example for the Markdown processor:
//
//    var mySourceText = "Markdown _is_ awesome.";
//
//    var textParser = new MarkupForge.textTransformer.processor();
//    var outputHtml = textParser.convertTextToHtml(mySourceText);
//
//    alert(outputHtml);
//
//  Reminder: move this sample code block to the end of the file
//  before uncommenting it.
//


//
//  MarkupForge root namespace
//
var MarkupForge = MarkupForge || {};

//
//  textTransformer module namespace
//
MarkupForge.textTransformer = MarkupForge.textTransformer || {};

//
//  processor class definition
//
//  Encapsulates all internal state, exposing only the
//  primary `convertTextToHtml()` method.
//
MarkupForge.textTransformer.processor = function() {

    //
    //  Internal data stores:
    //

    //  Global hash maps for various utility routines
    var linkReferences;
    var linkDescriptions;
    var htmlPlaceholderStorage;

    //  Keeps track of nesting depth for ordered/unordered lists
    //  (refer to _ProcessListItems() for further details):
    var currentListDepth = 0;


    this.convertTextToHtml = function(inputContent) {
        //
        //  The core conversion routine. The sequence of function calls here
        //  is critical. Substitutions for links and images must occur
        //  before `_SanitizeTagAttributes()` to ensure any asterisk or
        //  underscore characters within `<a>` and `<img>` tags are properly
        //  encoded.
        //

        //  Reset the global hash maps. Failing to clear these would result
        //  in conflicts when generating pages with multiple articles
        //  (e.g., an index page displaying the N most recent posts):
        linkReferences = [];
        linkDescriptions = [];
        htmlPlaceholderStorage = [];

        //  junipersystems: Replace ~ with ~T
        //  This allows using tilde as an escape character to prevent
        //  collisions with MD5 hashes. The specific character is arbitrary;
        //  any character not considered 'magic' by Markdown will work.
        inputContent = inputContent.replace(/~/g,"~T");

        //  junipersystems: Replace $ with ~D
        //  Regular expressions interpret '$' as a special character
        //  when it's part of a replacement string.
        inputContent = inputContent.replace(/\$/g,"~D");

        //  Normalize line endings across different OS types
        inputContent = inputContent.replace(/\r\n/g,"\n"); //  Windows to Unix style
        inputContent = inputContent.replace(/\r/g,"\n");   //  Mac to Unix style

        //  Ensure the content is padded with a couple of newlines at start and end:
        inputContent = "\n\n" + inputContent + "\n\n";

        //  Replace all tab characters with spaces.
        inputContent = _RemoveTabs(inputContent);

        //  Remove any lines composed solely of spaces and tabs.
        //  This simplifies subsequent regular expressions, enabling matching
        //  consecutive blank lines with `/\n+/` instead of complex patterns
        //  like `/[ \t]*\n+/`.
        inputContent = inputContent.replace(/^[ \t]+$/mg,"");

        //  Convert block-level HTML sections into internal hash entries
        inputContent = _ReplaceBlockElementsWithPlaceholders(inputContent);

        //  Remove link definitions, storing them in hash maps.
        inputContent = _ExtractLinkDefinitions(inputContent);

        inputContent = _ExecuteBlockTransformations(inputContent);

        inputContent = _RestoreEscapedCharacters(inputContent);

        //  junipersystems: Revert dollar signs
        inputContent = inputContent.replace(/~D/g,"$$");

        //  junipersystems: Revert tildes
        inputContent = inputContent.replace(/~T/g,"~");

        return inputContent;
    };

    var _ExtractLinkDefinitions = function(processedContent) {
        //
        //  Removes link definitions from the input text, saving the URLs and
        //  titles into internal hash references.
        //

        //  Link definitions follow the pattern: ^[identifier]: url "optional description"

        /*
            var processedContent = processedContent.replace(/
                    ^[ ]{0,3}\[(.+)\]:  // id = $1  junipersystems: g_tab_width - 1
                      [ \t]*
                      \n?               // possibly *one* newline
                      [ \t]*
                    <?(\S+?)>?          // url = $2
                      [ \t]*
                      \n?               // possibly one newline
                      [ \t]*
                    (?:
                      (\n*)             // any lines skipped = $3 junipersystems: lookbehind removed
                      ["(]
                      (.+?)             // title = $4
                      [")]
                      [ \t]*
                    )?                  // title is optional
                    (?:\n+|$)
                  /gm,
                  function(){...});
        */
        var transformedContent = processedContent.replace(/^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+)/gm,
            function (fullMatchText,cap1,cap2,cap3,cap4) {
                cap1 = cap1.toLowerCase();
                linkReferences[cap1] = _EscapeAmpersandsAndAngles(cap2);  // Link identifiers are case-insensitive
                if (cap3) {
                    //  Oh, blank lines were found, so this isn't a title.
                    //  Return the parenthetical statement that was captured.
                    return cap3 + cap4;
                } else if (cap4) {
                    linkDescriptions[cap1] = cap4.replace(/"/g,"&quot;");
                }

                //  Completely remove this definition from the text
                return "";
            }
        );

        return transformedContent;
    };

    var _ReplaceBlockElementsWithPlaceholders = function(processedContent) {
        //  junipersystems: Duplicate blank lines to simplify lookahead
        processedContent = processedContent.replace(/\n/g,"\n\n");

        //  Hashify HTML blocks:
        //  This operation is applied only to block-level HTML tags such as
        //  headers, lists, and tables. The reason is that we still intend to
        //  wrap `<p>` tags around "paragraphs" that are contained within
        //  non-block-level tags like anchors, phrase emphasis, and spans.
        //  The set of tags we are targeting is hard-coded:
        var nestedBlockTags = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del";
        var generalBlockTags = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math";

        //  First, identify deeply nested blocks, for instance:
        //    <div>
        //      <div>
        //      inner block tags must be indented.
        //      </div>
        //    </div>
        //
        //  The outermost tags must align with the left margin for this pattern
        //  to match, and the inner nested divs must be indented.
        //  This must be done before the next, more permissive match, because
        //  that subsequent match would start at the first `<div>` and
        //  terminate at the first `</div>`.

        //  junipersystems: This regex can be computationally expensive upon failure.
        /*
            var processedContent = processedContent.replace(/
            (                       // save in $1
                ^                   // start of line  (with /m)
                <($nestedBlockTags) // start tag = $2
                \b                  // word boundary
                                    // junipersystems: work around khtml/pcre bug...
                [^\r]*?\n           // any number of lines, minimally matching
                </\2>               // the corresponding end tag
                [ \t]*              // trailing spaces/tabs
                (?=\n+)             // followed by at least one newline
            )                       // junipersystems: sentinel newlines at end of document
            /gm,function(){...});
        */
        processedContent = processedContent.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[ \t]*(?=\n+))/gm,storeAndReplaceHtmlBlock);

        //
        //  Now, match more broadly, simply from `\n<tag>` to `</tag>\n`
        //

        /*
            var processedContent = processedContent.replace(/
            (                       // save in $1
                ^                   // start of line  (with /m)
                <($generalBlockTags) // start tag = $2
                \b                  // word boundary
                                    // junipersystems: work around khtml/pcre bug...
                [^\r]*?             // any number of lines, minimally matching
                .*</\2>             // the corresponding end tag
                [ \t]*              // trailing spaces/tabs
                (?=\n+)             // followed by at least one newline
            )                       // junipersystems: sentinel newlines at end of document
            /gm,function(){...});
        */
        processedContent = processedContent.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math)\b[^\r]*?.*<\/\2>[ \t]*(?=\n+)\n)/gm,storeAndReplaceHtmlBlock);

        //  Specific handling for `<hr />` elements. It was simpler to create
        //  a special case here than to complicate the other regular expressions.

        /*
            processedContent = processedContent.replace(/
            (                       // save in $1
                \n\n                // Starting after a blank line
                [ ]{0,3}
                (<(hr)              // start tag = $2
                \b                  // word boundary
                ([^<>])*?           //
                \/?>)               // the matching end tag
                [ \t]*
                (?=\n{2,})          // followed by a blank line
            )
            /g,storeAndReplaceHtmlBlock);
        */
        processedContent = processedContent.replace(/(\n[ ]{0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g,storeAndReplaceHtmlBlock);

        //  Special handling for standalone HTML comments:

        /*
            processedContent = processedContent.replace(/
            (                       // save in $1
                \n\n                // Starting after a blank line
                [ ]{0,3}            // junipersystems: g_tab_width - 1
                <!
                (--[^\r]*?--\s*)+
                >
                [ \t]*
                (?=\n{2,})          // followed by a blank line
            )
            /g,storeAndReplaceHtmlBlock);
        */
        processedContent = processedContent.replace(/(\n\n[ ]{0,3}<!(--[^\r]*?--\s*)+>[ \t]*(?=\n{2,}))/g,storeAndReplaceHtmlBlock);

        //  PHP and ASP-style processor instructions (e.g., `<?...?>` and `<%...%>`)

        /*
            processedContent = processedContent.replace(/
            (?:
                \n\n                // Starting after a blank line
            )
            (                       // save in $1
                [ ]{0,3}            // junipersystems: g_tab_width - 1
                (?:
                    <([?%])         // $2
                    [^\r]*?
                    \2>
                )
                [ \t]*
                (?=\n{2,})          // followed by a blank line
            )
            /g,storeAndReplaceHtmlBlock);
        */
        processedContent = processedContent.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g,storeAndReplaceHtmlBlock);

        //  junipersystems: Revert duplicated newlines (refer to the comment at the start of this function)
        processedContent = processedContent.replace(/\n\n/g,"\n");
        return processedContent;
    };

    var storeAndReplaceHtmlBlock = function(fullMatchString, cap1) {
        var blockContent = cap1;

        //  Remove duplicated newlines
        blockContent = blockContent.replace(/\n\n/g,"\n");
        blockContent = blockContent.replace(/^\n/,"");

        //  Strip any trailing blank lines
        blockContent = blockContent.replace(/\n+$/g,"");

        //  Substitute the original HTML content with a unique marker
        //  (`~H_X_H` where X is its index in the storage array)
        blockContent = "\n\n~H" + (htmlPlaceholderStorage.push(blockContent)-1) + "H\n\n";

        return blockContent;
    };

    var _ExecuteBlockTransformations = function(processedContent) {
        //
        //  These functions perform all transformations that generate block-level
        //  elements such as paragraphs, headers, and list items.
        //
        processedContent = _ApplyHeaders(processedContent);

        //  Process Horizontal Rules:
        var hrPlaceholder = generateBlockPlaceholder("<hr />");
        processedContent = processedContent.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm,hrPlaceholder);
        processedContent = processedContent.replace(/^[ ]{0,2}([ ]?-[ ]?){3,}[ \t]*$/gm,hrPlaceholder);
        processedContent = processedContent.replace(/^[ ]{0,2}([ ]?_[ ]?){3,}[ \t]*$/gm,hrPlaceholder);

        processedContent = _ProcessLists(processedContent);
        processedContent = _HandleCodeBlocks(processedContent);
        processedContent = _FormatBlockQuotes(processedContent);

        //  We previously ran `_ReplaceBlockElementsWithPlaceholders()` in
        //  `convertTextToHtml()` to escape raw HTML from the initial Markdown source.
        //  This time, we're escaping the markup we've just created to avoid
        //  wrapping `<p>` tags around block-level tags.
        processedContent = _ReplaceBlockElementsWithPlaceholders(processedContent);
        processedContent = _CreateParagraphs(processedContent);

        return processedContent;
    };


    var _ExecuteInlineTransformations = function(processedContent) {
        //
        //  These functions perform all transformations that occur *within*
        //  block-level elements like paragraphs, headers, and list items.
        //

        processedContent = _HandleInlineCode(processedContent);
        processedContent = _SanitizeTagAttributes(processedContent);
        processedContent = _ConvertBackslashEscapes(processedContent);

        //  Process image and hyperlink tags. Images must be processed first,
        //  because `![alt text][ref]` might be mistaken for an anchor.
        processedContent = _ProcessImages(processedContent);
        processedContent = _ProcessHyperlinks(processedContent);

        //  Convert URLs enclosed in angle brackets (e.g., `<http://example.com/>`)
        //  into clickable links. This must happen after `_ProcessHyperlinks()`,
        //  as angle brackets can be used as delimiters in inline links
        //  like `[this](<url>)`.
        processedContent = _GenerateAutomaticLinks(processedContent);
        processedContent = _EscapeAmpersandsAndAngles(processedContent);
        processedContent = _ApplyEmphasisFormatting(processedContent);

        //  Apply hard line breaks (two or more spaces followed by a newline):
        processedContent = processedContent.replace(/  +\n/g," <br />\n");

        return processedContent;
    };

    var _SanitizeTagAttributes = function(processedContent) {
        //
        //  Within HTML tags (specifically, between `<` and `>`), encode
        //  `[\` * _]` characters so they don't interfere with their Markdown
        //  interpretations for code, italics, and strong emphasis.
        //

        //  Construct a regular expression to match HTML tags and comments.
        //  Refer to Friedl's "Mastering Regular Expressions", 2nd Ed., pp. 200-201.
        var tagMatcherPattern = /(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--.*?--\s*)+>)/gi;

        processedContent = processedContent.replace(tagMatcherPattern, function(fullMatchText) {
            var processedTagFragment = fullMatchText.replace(/(.)<\/?code>(?=.)/g,"$1`");
            processedTagFragment = escapeSpecificSymbols(processedTagFragment,"\\`*_");
            return processedTagFragment;
        });

        return processedContent;
    };

    var _ProcessHyperlinks = function(processedContent) {
        //
        //  Transforms Markdown link shorthand into XHTML `<a>` tags.
        //
        //  First, handle reference-style links: `[link text] [id]`
        //

        /*
            processedContent = processedContent.replace(/
            (                           // wrap whole match in $1
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
            )()()()()                   // pad remaining backreferences
            /g,produceAnchorTag);
        */
        processedContent = processedContent.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,produceAnchorTag);

        //
        //  Next, inline-style links: `[link text](url "optional title")`
        //

        /*
            processedContent = processedContent.replace(/
                (                       // wrap whole match in $1
                    \[
                    (
                        (?:
                            \[[^\]]*\]  // allow brackets nested one level
                        |
                        [^\[\]]         // or anything else
                    )
                )
                \]
                \(                      // literal parenthesis
                [ \t]*
                ()                      // no id, so leave $3 empty
                <?(.*?)>?               // href = $4
                [ \t]*
                (                       // $5
                    (['"])              // quote char = $6
                    (.*?)               // Title = $7
                    \6                  // matching quote
                    [ \t]*              // ignore any spaces/tabs between closing quote and )
                )?                      // title is optional
                \)
            )
            /g,produceAnchorTag);
        */
        processedContent = processedContent.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?(.*?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,produceAnchorTag);

        //
        //  Finally, handle reference-style shortcuts: `[link text]`
        //  These must be processed last, in case you also have `[link test][1]`
        //  or `[link test](/foo)` patterns.
        //

        /*
            processedContent = processedContent.replace(/
            (                           // wrap whole match in $1
                \[
                ([^\[\]]+)              // link text = $2; cannot contain '[' or ']'
                \]
            )()()()()()                 // pad rest of backreferences
            /g, produceAnchorTag);
        */
        processedContent = processedContent.replace(/(\[([^\[\]]+)\])()()()()()/g, produceAnchorTag);

        return processedContent;
    };

    // Placeholder functions for internal utilities not provided in the original snippet.
    // These are necessary to ensure the generated code is syntactically valid.
    function _RemoveTabs(content) { return content; }
    function _RestoreEscapedCharacters(content) { return content; }
    function _ApplyHeaders(content) { return content; }
    function generateBlockPlaceholder(content) { return content; } // Returns a placeholder string
    function _ProcessLists(content) { return content; }
    function _HandleCodeBlocks(content) { return content; }
    function _FormatBlockQuotes(content) { return content; }
    function _CreateParagraphs(content) { return content; }
    function _HandleInlineCode(content) { return content; }
    function _ConvertBackslashEscapes(content) { return content; }
    function _ProcessImages(content) { return content; }
    function _GenerateAutomaticLinks(content) { return content; }
    function _ApplyEmphasisFormatting(content) { return content; }
    function _EscapeAmpersandsAndAngles(content) { return content; }
    function escapeSpecificSymbols(content, symbolsToEscape) { return content; }
    function produceAnchorTag(fullMatch, cap1, cap2, cap3, cap4, cap5, cap6, cap7) { return fullMatch; }
};
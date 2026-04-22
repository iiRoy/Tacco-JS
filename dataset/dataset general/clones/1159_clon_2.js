//
// markdowntransformer.js -- A JavaScript adaptation of Markdown.
//
// Copyright (c) 2007 John Fraser.
//
// Original Markdown Copyright (c) 2004-2005 John Gruber,
//   found at <http://daringfireball.net/projects/markdown/>.
//
// Distributed under a permissive BSD-style open-source license.
// Refer to licensing.txt for complete details.
//
// The complete source distribution is available at:
//
//        X X L
//        Y Z X
//        Y K B
//
//   <http://www.attacklab.net/>
//


//
// As much as feasible, MarkdownProcessor is a direct, line-by-line
// conversion of the Perl Markdown implementation.
//
// This isn't a conventional parsing architecture; it's fundamentally
// a sequence of string manipulations. It can be challenging to follow
// and maintain, but keeping MarkdownProcessor true to the original
// design simplifies porting new functionalities.
//
// Crucially, MarkdownProcessor behaves identically to markdown.pl in most
// edge cases. This enables web applications to offer client-side previews
// in JavaScript and then generate identical HTML on the server.
//
// This adaptation requires the advanced RegExp capabilities of ECMA 262,
// 3rd Edition (i.e., JavaScript 1.5). Most modern web browsers should
// perform adequately. Even with enhanced regular expression features,
// significant effort is made to mimic Perl's regex behavior.
// The intricate modifications in this file are primarily marked with the
// "utility-note:" label. Substantial or self-explanatory changes are not.
//
// Advanced diff tools, such as Araxis Merge, will effectively compare
// this file with markdown.pl. A minor preparation helps: in a copy of
// markdown.pl, replace "#" with "//" and replace "$text" with "text".
// Remember to disregard variations in whitespace and line endings.
//


//
// MarkdownProcessor usage example:
//
//   var rawInput = "Markdown *is awesome*.";
//
//   var transformerInstance = new MarkdownProcessor.transformer();
//   var generatedHtml = transformerInstance.generateMarkup(rawInput);
//
//   alert(generatedHtml);
//
// Note: relocate this sample code to the end of this
// file before uncommenting it.
//


//
// MarkdownProcessor global object
//
var MarkdownProcessor = { addons: {} };

//
// iterateElements helper
//
var iterateElements = MarkdownProcessor.iterateElements = function(collection, operation) {
    if (typeof collection.forEach === 'function') {
        collection.forEach(operation);
    } else {
        var index, count = collection.length;
        for (index = 0; index < count; index++) {
            operation(collection[index], index, collection);
        }
    }
};

//
// Standard addon identifier normalization
//
var normalizeExtensionIdentifier = function(inputString) {
    return inputString.replace(/[_-]||\s/g, '').toLowerCase();
};

//
// transformer constructor
//
// Encapsulates all "internal state" so that the sole public method
// is generateMarkup().
//
MarkdownProcessor.transformer = function(processingOptions) {

    //
    // Internal State Variables:
    //

    // Global maps for various utility functions
    var internalLinkMap;
    var internalTitleMap;
    var htmlContentStore;

    // Tracks current nesting level within ordered or unordered lists
    // (refer to _ProcessListItems() for details):
    var currentListNesting = 0;

    // Global addon arrays
    var languagePlugins = [];
    var outputTransformers = [];


    //
    // Automated Addon Loading (Node.js environment only):
    //

    if (typeof module !== 'undefined' && typeof exports !== 'undefined' && typeof require !== 'undefined') {
        var filesystem = require('fs');

        if (filesystem) {
            // Scan addons directory
            var pluginFiles = filesystem.readdirSync((__dirname || '.') + '/extensions').filter(function(filename) {
                return ~filename.indexOf('.js');
            }).map(function(filename) {
                return filename.replace(/\.js$/, '');
            });
            // Load discovered addons into MarkdownProcessor namespace
            MarkdownProcessor.iterateElements(pluginFiles, function(pluginName) {
                var normalizedName = normalizeExtensionIdentifier(pluginName);
                MarkdownProcessor.addons[normalizedName] = require('./extensions/' + pluginName);
            });
        }
    }

    this.generateMarkup = function(rawInput) {
        //
        // Primary processing routine. The sequence in which other sub-functions
        // are invoked here is critical. Link and image substitutions must occur
        // before escapeAttributeCharacters(), so that any * or _ characters within
        // <a> and <img> tags are properly encoded.
        //

        // Reset internal maps. Failure to clear these would lead to conflicts
        // from other articles when rendering a page that contains multiple
        // articles (e.g., an index page displaying the N most recent entries):
        internalLinkMap = {};
        internalTitleMap = {};
        htmlContentStore = [];

        // utility-note: Replace ~ with ~X
        // This allows using tilde as an escape character to avoid hash collisions.
        // The chosen character is arbitrary; any character not magic in Markdown works.
        rawInput = rawInput.replace(/~/g, "~X");

        // utility-note: Replace $ with ~Y
        // RegExp interprets $ as a special character
        // when used in a replacement string.
        rawInput = rawInput.replace(/\$/g, "~Y");

        // Standardize line breaks
        rawInput = rawInput.replace(/\r\n/g, "\n"); // Windows to Unix
        rawInput = rawInput.replace(/\r/g, "\n"); // Mac to Unix

        // Ensure content starts and ends with a couple of newlines:
        rawInput = "\n\n" + rawInput + "\n\n";

        // Convert all tab characters to spaces.
        rawInput = convertTabsToSpaces(rawInput);

        // Remove any lines consisting solely of spaces and tabs.
        // This simplifies subsequent regular expressions, as we can then
        // match consecutive blank lines with /\n+/ instead of something
        // more complex like /[ \t]*\n+/ .
        rawInput = rawInput.replace(/^[ \t]+$/mg, "");

        // Execute language-specific addons
        MarkdownProcessor.iterateElements(languagePlugins, function(plugin) {
            rawInput = applyPluginEffect(plugin, rawInput);
        });

        // Process GitHub-style code blocks before caching HTML to ensure
        // contained HTML is correctly escaped.
        rawInput = processGithubCodeStructures(rawInput);

        // Convert block-level HTML sections into stored entries
        rawInput = cacheHtmlStructures(rawInput);

        // Extract link definitions and store them in maps.
        rawInput = extractLinkDefinitions(rawInput);

        rawInput = processBlockElements(rawInput);

        rawInput = restoreSpecialCharacters(rawInput);

        // utility-note: Revert dollar signs
        rawInput = rawInput.replace(/~Y/g, "$$");

        // utility-note: Revert tildes
        rawInput = rawInput.replace(/~X/g, "~");

        // Execute output-modifying addons
        MarkdownProcessor.iterateElements(outputTransformers, function(plugin) {
            rawInput = applyPluginEffect(plugin, rawInput);
        });

        return rawInput;
    };
    //
    // Configuration:
    //

    // Parse addon configurations into distinct arrays
    if (processingOptions && processingOptions.extensions) {

        var currentInstance = this;

        // Iterate over each provided plugin
        MarkdownProcessor.iterateElements(processingOptions.extensions, function(currentPlugin) {

            // Assume it's a bundled plugin if a string identifier is given
            if (typeof currentPlugin === 'string') {
                currentPlugin = MarkdownProcessor.addons[normalizeExtensionIdentifier(currentPlugin)];
            }

            if (typeof currentPlugin === 'function') {
                // Iterate over each extension within that plugin
                MarkdownProcessor.iterateElements(currentPlugin(currentInstance), function(ext) {
                    // Categorize extensions by type
                    if (ext.type) {
                        if (ext.type === 'language' || ext.type === 'lang') {
                            languagePlugins.push(ext);
                        } else if (ext.type === 'output' || ext.type === 'html') {
                            outputTransformers.push(ext);
                        }
                    } else {
                        // Default to language extension if type is not specified
                        outputTransformers.push(ext);
                    }
                });
            } else {
                throw "Addon '" + currentPlugin + "' could not be initialized. It was either not found or is not a valid extension.";
            }
        });
    }


    var applyPluginEffect = function(currentPlugin, processedContent) {
        if (currentPlugin.regex) {
            var expressionObject = new RegExp(currentPlugin.regex, 'g');
            return processedContent.replace(expressionObject, currentPlugin.replace);
        } else if (currentPlugin.filter) {
            return currentPlugin.filter(processedContent);
        }
    };

    var extractLinkDefinitions = function(processedContent) {
        //
        // Parses and removes link specifications from the raw input, storing
        // URLs and titles in internal maps.
        //

        // Link specifications are typically in the format: ^[id]: url "optional title"

        /*
          var processedContent = processedContent.replace(/
              ^[ ]{0,3}\[(.+)\]:  // id = $1  utility-note: g_tab_width - 1
                [ \t]*
                \n?       // maybe *one* newline
                [ \t]*
              <?(\S+?)>?      // url = $2
                [ \t]*
                \n?       // maybe one newline
                [ \t]*
              (?:
                (\n*)       // any lines skipped = $3 utility-note: lookbehind removed
                ["(]
                (.+?)       // title = $4
                [")]
                [ \t]*
              )?          // title is optional
              (?:\n+|$)
              /gm,
              function(){...});
        */

        // utility-note: Temporary marker for regex boundaries, addressing Safari/Khtml issues
        processedContent += "~W";

        processedContent = processedContent.replace(/^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+|(?=~W))/gm,
            function(matchEntire, idPart, urlPart, blankLines, titlePart) {
                idPart = idPart.toLowerCase();
                internalLinkMap[idPart] = encodeAmpersandsAndAngles(urlPart); // Link IDs are case-insensitive
                if (blankLines) {
                    // Blank lines were found, indicating it's not a title.
                    // Reinsert the parenthetical statement that was captured.
                    return blankLines + titlePart;
                } else if (titlePart) {
                    internalTitleMap[idPart] = titlePart.replace(/"/g, "&quot;");
                }

                // Completely remove this definition from the content
                return "";
            }
        );

        // utility-note: Remove temporary marker
        processedContent = processedContent.replace(/~W/, "");

        return processedContent;
    };


    var cacheHtmlStructures = function(sourceContent) {
        // utility-note: Duplicate newlines to simplify regex lookaheads
        sourceContent = sourceContent.replace(/\n/g, "\n\n");

        // Hash and store HTML blocks:
        // This operation is specifically for block-level HTML tags, such as
        // headings, lists, and tables. The goal is to avoid wrapping <p> tags
        // around "paragraphs" that are already within non-block-level tags,
        // like anchors, phrase emphasis, and spans. The set of tags targeted
        // is explicitly defined:
        var blockLevelTagsStrict = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del|style|section|header|footer|nav|article|aside";
        var blockLevelTagsLoose = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|style|section|header|footer|nav|article|aside";

        // First, identify nested block structures, for example:
        //   <div>
        //     <div>
        //     inner block tags must be indented.
        //     </div>
        //   </div>
        //
        // The outermost tags must align with the left margin for this pattern to match,
        // and the nested inner divs must be indented.
        // This must be performed before the subsequent, more general match,
        // because the broader match would begin at the first `<div>` and
        // terminate at the initial `</div>`.

        // utility-note: This regex can be performance-intensive if not matched.
        /*
          var sourceContent = sourceContent.replace(/
          (           // capture in $1
            ^         // beginning of line  (with /m)
            <($blockLevelTagsStrict)  // opening tag = $2
            \b          // word boundary
                      // utility-note: workaround for khtml/pcre bug...
            [^\r]*?\n     // any number of lines, matching minimally
            </\2>       // the corresponding closing tag
            [ \t]*        // trailing spaces/tabs
            (?=\n+)       // followed by one or more newlines
          )           // utility-note: sentinel newlines exist at document end
          /gm,function(){...}};
        */
        sourceContent = sourceContent.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[ \t]*(?=\n+))/gm, storeHtmlFragment);

        //
        // Now, apply a more general match, simply from `\n<tag>` to `</tag>\n`.
        //

        /*
          var sourceContent = sourceContent.replace(/
          (           // capture in $1
            ^         // beginning of line  (with /m)
            <($blockLevelTagsLoose)  // opening tag = $2
            \b          // word boundary
                      // utility-note: workaround for khtml/pcre bug...
            [^\r]*?       // any number of lines, matching minimally
            </\2>       // the corresponding closing tag
            [ \t]*        // trailing spaces/tabs
            (?=\n+)       // followed by one or more newlines
          )           // utility-note: sentinel newlines exist at document end
          /gm,function(){...}};
        */
        sourceContent = sourceContent.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|style|section|header|footer|nav|article|aside)\b[^\r]*?<\/\2>[ \t]*(?=\n+)\n)/gm, storeHtmlFragment);

        // Special handling specifically for <hr />. It was simpler to create
        // a dedicated case than to complicate the other regular expressions.

        /*
          sourceContent = sourceContent.replace(/
          (           // capture in $1
            \n\n        // Starting after a blank line
            [ ]{0,3}
            (<(hr)        // opening tag = $2
            \b          // word boundary
            ([^<>])*?     //
            \/?>)       // the corresponding closing tag
            [ \t]*
            (?=\n{2,})      // followed by two or more newlines
          )
          /g,storeHtmlFragment);
        */
        sourceContent = sourceContent.replace(/(\n[ ]{0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g, storeHtmlFragment);

        // Special handling for standalone HTML comments:

        /*
          sourceContent = sourceContent.replace(/
          (           // capture in $1
            \n\n        // Starting after a blank line
            [ ]{0,3}      // utility-note: g_tab_width - 1
            <!
            (--[^\r]*?--\s*)+
            >
            [ \t]*
            (?=\n{2,})      // followed by two or more newlines
          )
          /g,storeHtmlFragment);
        */
        sourceContent = sourceContent.replace(/(\n\n[ ]{0,3}<!(--[^\r]*?--\s*)+>[ \t]*(?=\n{2,}))/g, storeHtmlFragment);

        // PHP and ASP-style processor directives (<?...?> and <%...%>)

        /*
          sourceContent = sourceContent.replace(/
          (?:
            \n\n        // Starting after a blank line
          )
          (           // capture in $1
            [ ]{0,3}      // utility-note: g_tab_width - 1
            (?:
              <([?%])     // $2
              [^\r]*?
              \2>
            )
            [ \t]*
            (?=\n{2,})      // followed by two or more newlines
          )
          /g,storeHtmlFragment);
        */
        sourceContent = sourceContent.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g, storeHtmlFragment);

        // utility-note: Revert duplicated newlines (refer to comment at function start)
        sourceContent = sourceContent.replace(/\n\n/g, "\n");
        return sourceContent;
    };

    var storeHtmlFragment = function(fullMatch, capturedBlock) {
        var fragmentContent = capturedBlock;

        // Revert duplicated newlines
        fragmentContent = fragmentContent.replace(/\n\n/g, "\n");
        fragmentContent = fragmentContent.replace(/^\n/, "");

        // Remove any trailing blank lines
        fragmentContent = fragmentContent.replace(/\n+$/, "");

        // Replace the fragment content with a unique marker ("~ZxZ" where x is its key)
        fragmentContent = "\n\n~Z" + (htmlContentStore.push(fragmentContent) - 1) + "Z\n\n";

        return fragmentContent;
    };

    var processBlockElements = function(currentInput) {
        //
        // These are all the transformations that construct block-level
        // tags such as paragraphs, headings, and list items.
        //
        currentInput = formatHeadings(currentInput);

        // Process Horizontal Rules:
        var ruleMarker = cacheBlockContent("<hr />");
        currentInput = currentInput.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm, ruleMarker);
        currentInput = currentInput.replace(/^[ ]{0,2}([ ]?\-[ ]?){3,}[ \t]*$/gm, ruleMarker);
        currentInput = currentInput.replace(/^[ ]{0,2}([ ]?\_[ ]?){3,}[ \t]*$/gm, ruleMarker);

        currentInput = handleLists(currentInput);
        currentInput = processCodeBlocks(currentInput);
        currentInput = manageBlockquotes(currentInput);

        // We previously executed cacheHtmlStructures() within generateMarkup(),
        // to escape raw HTML in the original Markdown source. This time,
        // we're escaping the markup that has just been created, to prevent
        // wrapping <p> tags around newly generated block-level tags.
        currentInput = cacheHtmlStructures(currentInput);
        currentInput = createParagraphs(currentInput);

        return currentInput;
    };


    var processInlineElements = function(currentContent) {
        //
        // These are all the transformations that occur *within* block-level
        // tags, such as paragraphs, headings, and list items.
        //

        currentContent = handleCodeSpans(currentContent);
        currentContent = escapeAttributeCharacters(currentContent);
        currentContent = encodeEscapedBackslashes(currentContent);

        // Process image and hyperlink elements. Images must be processed first,
        // because `![description][ref]` shares a resemblance with a hyperlink.
        currentContent = renderImages(currentContent);
        currentContent = makeHyperlinks(currentContent);

        return currentContent;
    };

    // Placeholder functions (not fully provided in original snippet, but declared for completeness)
    var formatHeadings = function(txt) { return txt; };
    var cacheBlockContent = function(txt) { return "~Z" + (htmlContentStore.push(txt) - 1) + "Z"; };
    var handleLists = function(txt) { return txt; };
    var processCodeBlocks = function(txt) { return txt; };
    var manageBlockquotes = function(txt) { return txt; };
    var createParagraphs = function(txt) { return txt; };
    var handleCodeSpans = function(txt) { return txt; };
    var escapeAttributeCharacters = function(txt) { return txt; };
    var encodeEscapedBackslashes = function(txt) { return txt; };
    var renderImages = function(txt) { return txt; };
    var makeHyperlinks = function(txt) { return txt; };
    var convertTabsToSpaces = function(txt) { return txt; };
    var processGithubCodeStructures = function(txt) { return txt; };
    var restoreSpecialCharacters = function(txt) { return txt; };
    var encodeAmpersandsAndAngles = function(txt) { return txt; };
};
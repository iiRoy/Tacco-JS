var DocumentProcessor;

if (typeof exports === "object" && typeof require === "function")
    DocumentProcessor = exports;
else
    DocumentProcessor = {};

(function () {

    function passThrough(data) { return data; }
    function alwaysFalse(data) { return false; }

    function ExtensionRegistry() { }

    ExtensionRegistry.prototype = {

        addExtension: function (extensionName, handlerFunction) {
            var existingHandler = this[extensionName];
            if (!existingHandler)
                throw new Error("Unknown extension point " + extensionName);

            if (existingHandler === passThrough)
                this[extensionName] = handlerFunction;
            else
                this[extensionName] = function (data) { return handlerFunction(existingHandler(data)); }
        },
        replaceExtension: function (extensionName, handlerFunction) {
            if (!this[extensionName])
                throw new Error("Unknown extension point " + extensionName);
            this[extensionName] = handlerFunction;
        },
        registerDefault: function (extensionName) {
            this[extensionName] = passThrough;
        },
        registerFalse: function (extensionName) {
            this[extensionName] = alwaysFalse;
        }
    };

    DocumentProcessor.ExtensionRegistry = ExtensionRegistry;

    function KeyedDataStore() { }
    KeyedDataStore.prototype = {
        storeValue: function (key, value) {
            this["k_" + key] = value;
        },
        retrieveValue: function (key) {
            return this["k_" + key];
        }
    };

    DocumentProcessor.DocumentTransformer = function () {
        var extensionPoints = this.extensions = new ExtensionRegistry();
        extensionPoints.registerDefault("plainLinkText");
        extensionPoints.registerDefault("preTransformation");
        extensionPoints.registerDefault("postTransformation");

        // Internal state for a single transformation run
        var linkRegistry;
        var titleRegistry;
        var blockCache;
        var nestingLevel;

        this.renderContent = function (sourceText) {

            // Prevent re-entry on the same transformer instance
            if (linkRegistry)
                throw new Error("Recursive call to renderContent detected.");

            // Initialize state for this run
            linkRegistry = new KeyedDataStore();
            titleRegistry = new KeyedDataStore();
            blockCache = [];
            nestingLevel = 0;

            // --- Transformation Pipeline Start ---

            // 1. Pre-transformation hook
            sourceText = extensionPoints.preTransformation(sourceText);

            // 2. Initial Preprocessing
            sourceText = sourceText.replace(/~/g, "~T");
            sourceText = sourceText.replace(/\$/g, "~D");

            // Normalize line endings
            sourceText = sourceText.replace(/\r\n/g, "\n");
            sourceText = sourceText.replace(/\r/g, "\n");

            // Ensure padding newlines at start and end
            sourceText = "\n\n" + sourceText + "\n\n";

            // Convert tabs to spaces
            sourceText = normalizeTabs(sourceText);

            // Strip blank lines with only spaces/tabs
            sourceText = sourceText.replace(/^[ \t]+$/mg, "");

            // 3. Block-level content processing
            sourceText = isolateHtmlBlocks(sourceText); // Temporarily hide raw HTML blocks

            // Extract link and image definitions
            sourceText = extractReferences(sourceText);

            // Main block processing gamut
            sourceText = processBlocks(sourceText);

            // 4. Final Post-processing
            sourceText = restoreEscapedCharacters(sourceText); // Unescape HTML entities
            sourceText = sourceText.replace(/~D/g, "$"); // Restore dollar signs
            sourceText = sourceText.replace(/~T/g, "~"); // Restore tildes

            // Post-transformation hook
            sourceText = extensionPoints.postTransformation(sourceText);

            // --- Transformation Pipeline End ---

            // Clear state for next run
            linkRegistry = titleRegistry = null;
            blockCache = [];
            nestingLevel = 0;

            return sourceText;
        };

        // --- Helper Functions (Private to DocumentTransformer instance) ---

        // Equivalent to _Detab
        function normalizeTabs(inputString) {
            return inputString.replace(/\t/g, "    ");
        }

        // Equivalent to _StripLinkDefinitions
        function extractReferences(inputString) {
            inputString = inputString.replace(/^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?(?=\s|$)[ \t]*\n?[ \t]*((\n*)["(](.+?)[")][ \t]*)?(?:\n+)/gm,
                function (fullMatch, idGroup, urlGroup, titlePartGroup, blankLinesGroup, titleGroup) {
                    var normalizedId = idGroup.toLowerCase();
                    linkRegistry.storeValue(normalizedId, encodeEntities(urlGroup));
                    if (blankLinesGroup) {
                        return titlePartGroup;
                    } else if (titleGroup) {
                        titleRegistry.storeValue(normalizedId, titleGroup.replace(/"/g, "&quot;"));
                    }
                    return "";
                }
            );
            return inputString;
        }

        // Equivalent to _HashHTMLBlocks
        function isolateHtmlBlocks(inputString) {
            var block_tags_a = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del";
            var block_tags_b = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math";

            inputString = inputString.replace(new RegExp("^(<(" + block_tags_a + ")\\b[^\r]*?\\n<\\/\\2>[ \\t]*(?=\\n+))", "gm"), stashBlock);
            inputString = inputString.replace(new RegExp("^(<(" + block_tags_b + ")\\b[^\r]*?.*<\\/\\2>[ \\t]*(?=\\n+)\\n)", "gm"), stashBlock);
            inputString = inputString.replace(/\n[ ]{0,3}((<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g, stashBlock);
            inputString = inputString.replace(/\n\n[ ]{0,3}(<!(--(?:|(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)>[ \\t]*(?=\\n{2,}))/g, stashBlock);
            inputString = inputString.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g, stashBlock);

            return inputString;
        }

        // Equivalent to hashElement
        function stashBlock(fullMatch, contentToHash) {
            contentToHash = contentToHash.replace(/^\n+/, "");
            contentToHash = contentToHash.replace(/\n+$/g, "");
            var index = blockCache.push(contentToHash) - 1;
            return "\n\n~K" + index + "K\n\n";
        }

        // Equivalent to _RunBlockGamut
        function processBlocks(inputString, avoidUnhashing) {
            inputString = convertHeadings(inputString);

            var hrReplacement = "<hr />\n";
            inputString = inputString.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm, hrReplacement);
            inputString = inputString.replace(/^[ ]{0,2}([ ]?-[ ]?){3,}[ \t]*$/gm, hrReplacement);
            inputString = inputString.replace(/^[ ]{0,2}([ ]?_[ ]?){3,}[ \t]*$/gm, hrReplacement);

            inputString = parseLists(inputString);
            inputString = handleCodeBlocks(inputString);
            inputString = formatBlockquotes(inputString);

            inputString = isolateHtmlBlocks(inputString); // Re-hash to prevent paragraph wrapping
            inputString = wrapParagraphs(inputString, avoidUnhashing);

            return inputString;
        }

        // Equivalent to _RunSpanGamut
        function processInlineElements(inputString) {
            inputString = handleInlineCode(inputString);
            inputString = protectTagAttributes(inputString);
            inputString = encodeBackslashEscapes(inputString);

            inputString = transformImages(inputString);
            inputString = transformLinks(inputString);

            inputString = autoLinkUrls(inputString);

            inputString = inputString.replace(/~P/g, "://");

            inputString = encodeEntities(inputString);
            inputString = applyEmphasis(inputString);

            inputString = inputString.replace(/\n/g, "<br>\n");

            return inputString;
        }

        // Equivalent to _EscapeSpecialCharsWithinTagAttributes
        function protectTagAttributes(inputString) {
            var tagRegex = /(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--(?:|(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)>)/gi;
            inputString = inputString.replace(tagRegex, function (fullMatch) {
                var processedTag = fullMatch.replace(/(.)<\/?code>(?=.)/g, "$1`");
                processedTag = sanitizeCharacters(processedTag, fullMatch.charAt(1) == "!" ? "\\`*_/" : "\\`*_");
                return processedTag;
            });
            return inputString;
        }

        // Equivalent to escapeCharacters (used internally by original)
        function sanitizeCharacters(inputStr, charsToEscape) {
            var regex = new RegExp("([" + charsToEscape.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1") + "])", "g");
            inputStr = inputStr.replace(regex, function (wholeMatch, m1) {
                return "~E" + m1.charCodeAt(0) + "E";
            });
            return inputStr;
        }

        // Equivalent to _EncodeBackslashEscapes
        function encodeBackslashEscapes(inputString) {
            return inputString.replace(/\\(.)/g, function (fullMatch, charToEscape) {
                return "~E" + charToEscape.charCodeAt(0) + "E";
            });
        }

        // Equivalent to _DoAnchors
        function transformLinks(inputString) {
            inputString = inputString.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g, generateLinkElement);
            inputString = inputString.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?(.*?)>?(?:[ \t]+(["'])(.*?)\6)?\))/g, generateLinkElement);
            inputString = inputString.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\])()()()()/g, generateLinkElement);
            return inputString;
        }

        // Equivalent to writeAnchorTag
        function generateLinkElement(fullMatch, linkSection, linkText, linkId, protocol, url, quoteChar, title) {
            if (linkId === undefined) linkId = "";

            linkId = linkId.toLowerCase();
            if (linkId === "") {
                linkId = linkText.toLowerCase();
            }

            var resolvedUrl = linkRegistry.retrieveValue(linkId);
            if (resolvedUrl === undefined) {
                return fullMatch;
            }

            var resolvedTitle = titleRegistry.retrieveValue(linkId);
            if (resolvedTitle === undefined) {
                resolvedTitle = "";
            }

            if (url !== undefined) {
                resolvedUrl = encodeEntities(url);
                if (title !== undefined) {
                    resolvedTitle = title.replace(/"/g, "&quot;");
                }
            }

            resolvedUrl = escapeCharactersInUrl(resolvedUrl);

            var outputLink = "<a href=\"" + resolvedUrl + "\"";
            if (resolvedTitle !== "") {
                outputLink += " title=\"" + resolvedTitle + "\"";
            }
            outputLink += ">" + processInlineElements(linkText) + "</a>";

            return stashBlock(null, outputLink);
        }

        // Equivalent to _DoImages
        function transformImages(inputString) {
            inputString = inputString.replace(/(!\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g, generateImageElement);
            inputString = inputString.replace(/(!\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?(.*?)(?:[ \t]+(["'])(.*?)\6)?\))/g, generateImageElement);
            return inputString;
        }

        // Equivalent to writeImageTag
        function generateImageElement(fullMatch, imageSection, altText, imageId, protocol, url, quoteChar, title) {
            if (imageId === undefined) imageId = "";

            imageId = imageId.toLowerCase();
            if (imageId === "") {
                imageId = altText.toLowerCase();
            }

            var resolvedUrl = linkRegistry.retrieveValue(imageId);
            if (resolvedUrl === undefined) {
                return fullMatch;
            }

            var resolvedTitle = titleRegistry.retrieveValue(imageId);
            if (resolvedTitle === undefined) {
                resolvedTitle = "";
            }

            if (url !== undefined) {
                resolvedUrl = encodeEntities(url);
                if (title !== undefined) {
                    resolvedTitle = title.replace(/"/g, "&quot;");
                }
            }

            resolvedUrl = escapeCharactersInUrl(resolvedUrl);

            var outputImage = "<img src=\"" + resolvedUrl + "\" alt=\"" + altText.replace(/"/g, "&quot;") + "\"";
            if (resolvedTitle !== "") {
                outputImage += " title=\"" + resolvedTitle + "\"";
            }
            outputImage += " />";

            return stashBlock(null, outputImage);
        }

        // Equivalent to _EncodeAmpsAndAngles
        function encodeEntities(inputString) {
            inputString = inputString.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g, "&amp;");
            inputString = inputString.replace(/<(?![a-z\/?$!])/gi, "&lt;");
            return inputString;
        }

        // Equivalent to escapeCharactersInUrl (used internally by original)
        function escapeCharactersInUrl(inputStr) {
            inputStr = inputStr.replace(/\*/g, "~E42E");
            inputStr = inputStr.replace(/_/g, "~E95E");
            inputStr = inputStr.replace(/~/g, "~E126E");
            return inputStr;
        }

        // Equivalent to _DoAutoLinks
        function autoLinkUrls(inputString) {
            inputString = inputString.replace(/<(([^> ]+?)@([^> ]+?)\.([a-zA-Z0-9]{2,6}))>/g, function (fullMatch, emailAddress, part1, part2, part3) {
                return generateEmailLink(emailAddress);
            });

            inputString = inputString.replace(/<(https?|ftp):(\/\/)([^<> \n]+)>/gi, function (fullMatch, protocol, separator, url) {
                var processedUrl = url.replace(/~/g, "~T").replace(/\$/g, "~D");
                return '<a href="' + protocol + separator + processedUrl + '">' + protocol + separator + processedUrl + '</a>';
            });

            return inputString;
        }

        // Equivalent to encodeEmailAddress (used internally by original)
        function generateEmailLink(email) {
            var encoded = "";
            for (var i = 0; i < email.length; i++) {
                var charCode = email.charCodeAt(i);
                if (charCode > 127) {
                    encoded += "&#" + charCode + ";";
                } else {
                    var r = Math.random();
                    if (r > 0.9) encoded += "&#x" + charCode.toString(16) + ";";
                    else if (r < 0.45) encoded += "&#" + charCode + ";";
                    else encoded += email.charAt(i);
                }
            }
            return '<a href="mailto:' + encoded + '">' + encoded + '</a>';
        }

        // Equivalent to _DoItalicsAndBold
        function applyEmphasis(inputString) {
            inputString = inputString.replace(/(\*\*|__)(?=\S)(.+?[*_]*)(?=\S)\1/g, "<strong>" + processInlineElements("$2") + "</strong>");
            inputString = inputString.replace(/(\*|_)(?=\S)(.+?)(?=\S)\1/g, "<em>" + processInlineElements("$2") + "</em>");
            return inputString;
        }

        // Equivalent to _DoHeaders
        function convertHeadings(inputString) {
            inputString = inputString.replace(/^(.*)[ \t]*\n=+[ \t]*\n+/gm, function (fullMatch, headerText) {
                return '<h1>' + processInlineElements(headerText) + '</h1>\n\n';
            });
            inputString = inputString.replace(/^(.*)[ \t]*\n-+[ \t]*\n+/gm, function (fullMatch, headerText) {
                return '<h2>' + processInlineElements(headerText) + '</h2>\n\n';
            });
            inputString = inputString.replace(/^(\#{1,6})[ \t]*(.+?)[ \t]*\#*\n+/gm, function (fullMatch, hashes, headerText) {
                var level = hashes.length;
                return '<h' + level + '>' + processInlineElements(headerText) + '</h' + level + '>\n\n';
            });
            return inputString;
        }

        // Equivalent to _DoLists
        function parseLists(inputString) {
            inputString = inputString.replace(/(\n\n|^)((?:(?: {0,3}\d+\.[ \t]+)[^\n]*\n)+)/gm, function (fullMatch, pre, listBlock) {
                var listHtml = processListItems(listBlock, "ol");
                return pre + stashBlock(null, listHtml);
            });

            inputString = inputString.replace(/(\n\n|^)((?:(?: {0,3}[\*\+\-][ \t]+)[^\n]*\n)+)/gm, function (fullMatch, pre, listBlock) {
                var listHtml = processListItems(listBlock, "ul");
                return pre + stashBlock(null, listHtml);
            });

            return inputString;
        }

        // Equivalent to _ProcessListItems
        function processListItems(listBlock, listType) {
            nestingLevel++;
            listBlock = listBlock.replace(/\n$/, "\n\n");

            var listItemRegex;
            if (listType === "ol") {
                listItemRegex = /^( {0,3}\d+\.[ \t]+)(.*?)(\n|$)/gm;
            } else {
                listItemRegex = /^( {0,3}[\*\+\-][ \t]+)(.*?)(\n|$)/gm;
            }

            var htmlList = "<" + listType + ">\n";
            var lastMatchIndex = 0;
            var currentListItemContent = [];

            // This closure helps manage content across multiple regex matches for a single list item
            listBlock.replace(listItemRegex, function (fullMatch, marker, content, offset) {
                // If it's a new list item marker, process the previous item's content
                if (offset > lastMatchIndex) {
                    var previousContent = listBlock.substring(lastMatchIndex, offset);
                    currentListItemContent.push(previousContent);
                }
                currentListItemContent.push(content);
                lastMatchIndex = offset + fullMatch.length;

                var itemContent = currentListItemContent.join("");
                currentListItemContent = []; // Reset for next item

                var leadingSpaces = marker.match(/^( *)/)[1].length;
                var minIndent = leadingSpaces + 1;

                // Unindent content for processing
                itemContent = itemContent.replace(new RegExp("^[ ]{" + minIndent + "}", "gm"), "");

                // Process blocks and inline elements recursively
                itemContent = processBlocks(itemContent, true);
                itemContent = processInlineElements(itemContent);

                htmlList += "<li>" + itemContent + "</li>\n";
                return "";
            });
            htmlList += "</" + listType + ">\n";

            nestingLevel--;
            return htmlList;
        }

        // Equivalent to _DoCodeBlocks
        function handleCodeBlocks(inputString) {
            inputString = inputString.replace(/(?:\n\n|^)((?:(?: {4}|\t)[^\n]*\n)+)/g, function (fullMatch, codeBlock) {
                codeBlock = codeBlock.replace(/^( {4}|\t)/gm, "");
                codeBlock = encodeEntities(codeBlock);
                codeBlock = codeBlock.replace(/~E(\d+)E/g, function (fm, charCode) {
                    return String.fromCharCode(charCode);
                });
                return "\n\n<pre><code>" + codeBlock + "</code></pre>\n\n";
            });
            return inputString;
        }

        // Equivalent to _DoBlockQuotes
        function formatBlockquotes(inputString) {
            inputString = inputString.replace(/((?:^[ \t]*>[ \t]?.+\n)+)/gm, function (fullMatch, quoteBlock) {
                quoteBlock = quoteBlock.replace(/^[ \t]*>[ \t]?/gm, "");
                quoteBlock = quoteBlock.replace(/^[ \t]+$/gm, "");
                quoteBlock = processBlocks(quoteBlock);
                return "\n\n<blockquote>\n" + quoteBlock + "\n</blockquote>\n\n";
            });
            return inputString;
        }

        // Equivalent to _DoCodeSpans
        function handleInlineCode(inputString) {
            inputString = inputString.replace(/(^|[^\\])(`+)(.+?)(?:\2)(|$)/g, function (fullMatch, leadingChar, backticks, codeContent) {
                if (leadingChar.match(/\S/) && leadingChar !== "`") {
                    return fullMatch;
                }
                codeContent = codeContent.replace(/^ /, "").replace(/ $/, "");
                codeContent = encodeEntities(codeContent);
                return leadingChar + "<code>" + codeContent + "</code>";
            });
            return inputString;
        }

        // Equivalent to _FormParagraphs
        function wrapParagraphs(inputString, doNotUnhash) {
            inputString = inputString.replace(/^\n+/g, "");
            inputString = inputString.replace(/\n+$/g, "");

            var paragraphRegex = /((?:^|\n\n+)(?!~K)((?:[^\n]+\n)*?)([^\n]*))/g;
            inputString = inputString.replace(paragraphRegex, function (fullMatch, paragraphBlock) {
                paragraphBlock = paragraphBlock.replace(/^\n\n*/g, "");
                paragraphBlock = paragraphBlock.replace(/[ \t]+$/gm, "");

                if (paragraphBlock === "") {
                    return "";
                }

                if (paragraphBlock.match(/<(\/)?(h[1-6]|p|div|ul|ol|li|blockquote|pre|code|em|strong|hr|img|a|table|tr|td|th|tbody|thead|tfoot|dl|dt|dd|script|noscript|form|fieldset|iframe|math|ins|del)\b/i)) {
                    return paragraphBlock;
                }

                paragraphBlock = processInlineElements(paragraphBlock);

                return "<p>" + paragraphBlock + "</p>";
            });

            if (!doNotUnhash) {
                inputString = inputString.replace(/~K(\d+)K/g, function (fullMatch, index) {
                    return blockCache[parseInt(index, 10)];
                });
            }

            return inputString;
        }

        // Equivalent to _UnescapeSpecialChars
        function restoreEscapedCharacters(inputString) {
            inputString = inputString.replace(/~E(\d+)E/g, function (fullMatch, charCode) {
                return String.fromCharCode(charCode);
            });
            return inputString;
        }

    }; // End DocumentProcessor.DocumentTransformer
})();
var LayoutEngine = (function () {
    var coreTools = {
        // --- String Manipulation ---
        stripWhitespace: function (input) {
            var str = String(input);
            var startIndex = 0;
            var endIndex = str.length - 1;
            while (startIndex <= endIndex && /\s/.test(str[startIndex])) {
                startIndex++;
            }
            while (endIndex >= startIndex && /\s/.test(str[endIndex])) {
                endIndex--;
            }
            return str.substring(startIndex, endIndex + 1);
        },

        // --- HTML Escaping ---
        secureContent: function (text) {
            text = String(text === null ? "" : text);
            var outputArray = [];
            for (var i = 0; i < text.length; i++) {
                var char = text[i];
                switch (char) {
                    case "&": outputArray.push("&amp;"); break;
                    case "\"": outputArray.push("&quot;"); break;
                    case "'": outputArray.push("&#39;"); break;
                    case "<": outputArray.push("&lt;"); break;
                    case ">": outputArray.push("&gt;"); break;
                    default: outputArray.push(char); break;
                }
            }
            return outputArray.join("");
        },

        // --- Type Checking ---
        isCollection: function (candidate) {
            return Object.prototype.toString.call(candidate) === '[object Array]';
        },
        isStructure: function (candidate) {
            return candidate && typeof candidate === "object" && !coreTools.isCollection(candidate);
        },

        // --- Data Lookup ---
        locateValue: function (pathKey, currentFrame, globalFrame) {
            pathKey = coreTools.stripWhitespace(pathKey);

            // Checks whether a value is truthy, including false and 0
            function hasMeaning(val) {
                return val === false || val === 0 || val;
            }

            var resultValue;

            // Handle dot notation (e.g., "foo.bar")
            if (pathKey.indexOf('.') !== -1) {
                var segments = pathKey.split('.');
                var searchContexts = [currentFrame];
                if (globalFrame && globalFrame !== currentFrame) {
                    searchContexts.push(globalFrame);
                }

                for (var c = 0; c < searchContexts.length; c++) {
                    var activeContext = searchContexts[c];
                    var tempPathValue = activeContext;
                    var pathResolved = true;
                    for (var i = 0; i < segments.length; i++) {
                        var segment = segments[i];
                        if (tempPathValue && typeof tempPathValue === 'object' && segment in tempPathValue) {
                            tempPathValue = tempPathValue[segment];
                        } else {
                            pathResolved = false;
                            break;
                        }
                    }
                    if (pathResolved) {
                        resultValue = tempPathValue;
                        break;
                    }
                }
            } else {
                // No dot notation, direct key lookup
                if (hasMeaning(currentFrame[pathKey])) {
                    resultValue = currentFrame[pathKey];
                } else if (globalFrame && hasMeaning(globalFrame[pathKey])) {
                    resultValue = globalFrame[pathKey];
                }
            }

            // If the resolved value is a function, execute it with the current context
            if (typeof resultValue === "function") {
                return resultValue.apply(currentFrame);
            }
            // If a value was found, return it
            if (resultValue !== undefined) {
                return resultValue;
            }
            // Silently ignore unknown variables as per Mustache spec
            return "";
        },

        // --- Context Preparation for Iteration ---
        prepareIterationContext: function (dataItem, directiveConfig) {
            if (coreTools.isStructure(dataItem)) {
                return dataItem;
            } else {
                var iteratorIdentifier = (directiveConfig["IMPLICIT-ITERATOR"] && directiveConfig["IMPLICIT-ITERATOR"].enabled) ? directiveConfig["IMPLICIT-ITERATOR"].key : ".";
                var itemWrapper = {};
                itemWrapper[iteratorIdentifier] = dataItem;
                return itemWrapper;
            }
        },

        // --- Configuration & Error Handling ---
        cloneConfiguration: function (original) {
            // Simple deep copy for configuration objects
            return JSON.parse(JSON.stringify(original));
        },
        issueNotification: function (message) {
            throw new Error(message);
        },
        // Escapes characters that have special meaning in regular expressions
        escapeRegexSymbols: function (literal) {
            var symbols = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\', '$', '^'];
            var builtString = [];
            for (var i = 0; i < literal.length; i++) {
                var char = literal[i];
                if (symbols.indexOf(char) !== -1) {
                    builtString.push('\\');
                }
                builtString.push(char);
            }
            return builtString.join('');
        },

        // --- Directive Processing (Pragmas) ---
        parseAndConfigureDirectives: function (templateSource, dynamicConfig) {
            var resultBuffer = [];
            var lastPosition = 0;
            var currentScanPosition = 0;

            // Construct regex using escaped delimiters for finding pragmas
            var startDelimiterEscaped = coreTools.escapeRegexSymbols(dynamicConfig.openingDelimiter);
            var endDelimiterEscaped = coreTools.escapeRegexSymbols(dynamicConfig.closingDelimiter);
            var directivePattern = new RegExp(
                startDelimiterEscaped + "%([\\w-]+)(?: +([\\w]+=[\\w]+))?" + endDelimiterEscaped
            );

            var directiveMatch;
            // Manually iterate through the string to find and process pragmas
            while ((directiveMatch = templateSource.substring(currentScanPosition).match(directivePattern)) !== null) {
                var fullMatchText = directiveMatch[0];
                var directiveName = directiveMatch[1];
                var optionsString = directiveMatch[2];
                // Calculate absolute index of the match in the original string
                var matchAbsoluteIndex = currentScanPosition + templateSource.substring(currentScanPosition).indexOf(fullMatchText);

                // Add text preceding the pragma to the result buffer
                resultBuffer.push(templateSource.substring(lastPosition, matchAbsoluteIndex));

                // Apply pragma settings to the dynamic configuration
                if (!dynamicConfig.activeDirectives[directiveName]) {
                    coreTools.issueNotification("Unsupported directive: '" + directiveName + "'");
                }
                dynamicConfig.activeDirectives[directiveName].enabled = true;
                if (optionsString) {
                    var parts = optionsString.split("=");
                    dynamicConfig.activeDirectives[directiveName][parts[0]] = parts[1];
                }
                
                // Update positions to continue scanning after the current pragma
                lastPosition = matchAbsoluteIndex + fullMatchText.length;
                currentScanPosition = lastPosition;
            }
            // Add any remaining text after the last pragma
            resultBuffer.push(templateSource.substring(lastPosition));
            return resultBuffer.join("");
        }
    };

    // --- Main Template Processing Function (Recursive) ---
    function processTemplateSegment(segmentContent, currentContext, allFragments, currentRuntimeConfig) {
        var collectedOutput = [];
        var remainingSegment = segmentContent;
        // Delimiters for the current processing segment, can be changed by '=' tags
        var activeDelimiters = {
            open: currentRuntimeConfig.openingDelimiter,
            close: currentRuntimeConfig.closingDelimiter
        };

        // Iterate through the template segment to find and process tags
        while (remainingSegment.length > 0) {
            var tagStart = remainingSegment.indexOf(activeDelimiters.open);

            // If no more tags, append remaining text and exit
            if (tagStart === -1) {
                collectedOutput.push(remainingSegment);
                remainingSegment = "";
                break;
            }

            // Append any plain text before the current tag
            if (tagStart > 0) {
                collectedOutput.push(remainingSegment.substring(0, tagStart));
            }

            var contentAfterOpen = remainingSegment.substring(tagStart + activeDelimiters.open.length);
            var tagEnd = contentAfterOpen.indexOf(activeDelimiters.close);

            // Handle malformed tags (unclosed)
            if (tagEnd === -1) {
                coreTools.issueNotification("Unclosed tag detected near: '" + remainingSegment.substring(tagStart, Math.min(tagStart + 50, remainingSegment.length)) + "...'");
                collectedOutput.push(remainingSegment); // Treat as plain text
                remainingSegment = "";
                break;
            }

            var fullTagContent = contentAfterOpen.substring(0, tagEnd);
            var tagIdentifier = fullTagContent.charAt(0);
            var tagSubject = coreTools.stripWhitespace(fullTagContent.substring(1));
            
            // Advance remainingSegment to immediately after the current tag
            remainingSegment = contentAfterOpen.substring(tagEnd + activeDelimiters.close.length);

            switch (tagIdentifier) {
                case '!': // Comment tag: ignore
                    break;
                case '=': // Delimiter change tag: update active delimiters
                    var delimiterParts = tagSubject.split(" ");
                    if (delimiterParts.length === 2) {
                        activeDelimiters.open = delimiterParts[0];
                        activeDelimiters.close = delimiterParts[1];
                    } else {
                        coreTools.issueNotification("Invalid delimiter format: '" + fullTagContent + "'");
                    }
                    break;
                case '>': // Partial inclusion tag: recursively render a fragment
                    var includedFragment = allFragments[tagSubject];
                    if (includedFragment === undefined) {
                        coreTools.issueNotification("Unknown fragment: '" + tagSubject + "'");
                    }
                    collectedOutput.push(processTemplateSegment(includedFragment, currentContext, allFragments, currentRuntimeConfig));
                    break;
                case '{': // Unescaped variable tag (triple mustache): render raw value
                    var rawVariableName = coreTools.stripWhitespace(fullTagContent.substring(1, fullTagContent.length - 1)); // Remove leading '{' and trailing '}'
                    collectedOutput.push(coreTools.locateValue(rawVariableName, currentContext, currentRuntimeConfig.globalDataSource));
                    break;
                case '#': // Section start tag
                case '^': // Inverted section start tag
                    var sectionBody = "";
                    var sectionEndTag = activeDelimiters.open + "/" + tagSubject + activeDelimiters.close;
                    var sectionStartTag = activeDelimiters.open + tagIdentifier + tagSubject + activeDelimiters.close; // Used for counting nested sections

                    var nestedSectionCounter = 1;
                    var searchOffset = 0;
                    var endTagFound = false;

                    // Scan forward to find the matching closing section tag, handling nested sections
                    while (nestedSectionCounter > 0 && searchOffset < remainingSegment.length) {
                        var nextSectionOpen = remainingSegment.indexOf(sectionStartTag, searchOffset);
                        var nextSectionClose = remainingSegment.indexOf(sectionEndTag, searchOffset);

                        if (nextSectionOpen !== -1 && (nextSectionOpen < nextSectionClose || nextSectionClose === -1)) {
                            // Found another identical opening section tag before a closing one
                            sectionBody += remainingSegment.substring(searchOffset, nextSectionOpen + sectionStartTag.length);
                            searchOffset = nextSectionOpen + sectionStartTag.length;
                            nestedSectionCounter++;
                        } else if (nextSectionClose !== -1) {
                            // Found a closing tag
                            sectionBody += remainingSegment.substring(searchOffset, nextSectionClose);
                            searchOffset = nextSectionClose + sectionEndTag.length;
                            nestedSectionCounter--;
                            if (nestedSectionCounter === 0) {
                                endTagFound = true;
                            }
                        } else {
                            // Malformed template: no matching open or close tags found
                            coreTools.issueNotification("Unterminated section: '" + tagSubject + "'");
                        }
                    }

                    if (!endTagFound) {
                        coreTools.issueNotification("Unterminated section: '" + tagSubject + "'");
                    }

                    // Update remainingSegment to start after the processed section
                    remainingSegment = remainingSegment.substring(searchOffset);

                    var evaluatedValue = coreTools.locateValue(tagSubject, currentContext, currentRuntimeConfig.globalDataSource);

                    if (tagIdentifier === '^') { // Inverted section logic
                        if (!evaluatedValue || coreTools.isCollection(evaluatedValue) && evaluatedValue.length === 0) {
                            collectedOutput.push(processTemplateSegment(sectionBody, currentContext, allFragments, currentRuntimeConfig));
                        }
                    } else { // Normal section logic ('#')
                        if (coreTools.isCollection(evaluatedValue)) { // Iterate over array
                            evaluatedValue.forEach(function (item) {
                                var itemSpecificContext = coreTools.prepareIterationContext(item, currentRuntimeConfig.activeDirectives);
                                collectedOutput.push(processTemplateSegment(sectionBody, itemSpecificContext, allFragments, currentRuntimeConfig));
                            });
                        } else if (coreTools.isStructure(evaluatedValue)) { // Use object as sub-context
                            collectedOutput.push(processTemplateSegment(sectionBody, evaluatedValue, allFragments, currentRuntimeConfig));
                        } else if (typeof evaluatedValue === "function") { // Higher-order section
                            var functionResult = evaluatedValue.call(currentContext, sectionBody, function (renderableText) {
                                return processTemplateSegment(renderableText, currentContext, allFragments, currentRuntimeConfig);
                            });
                            collectedOutput.push(functionResult);
                        } else if (evaluatedValue) { // Truthy simple value
                            collectedOutput.push(processTemplateSegment(sectionBody, currentContext, allFragments, currentRuntimeConfig));
                        }
                    }
                    break;
                case '/': // Closing section tag: should have been consumed by '#' or '^' logic
                    coreTools.issueNotification("Mismatched closing tag: '" + tagSubject + "'");
                    break;
                default: // Standard variable tag: render HTML-escaped value
                    collectedOutput.push(coreTools.secureContent(coreTools.locateValue(fullTagContent, currentContext, currentRuntimeConfig.globalDataSource)));
                    break;
            }
        }
        return collectedOutput.join("");
    }

    // --- Public API for the LayoutEngine ---
    return {
        // Main function to compose HTML from a template and data
        composeHtml: function (templateBlueprint, viewData, templateFragments) {
            // Initialize runtime configuration, copying defaults to prevent mutation of global state
            var runtimeConfiguration = coreTools.cloneConfiguration({
                openingDelimiter: "{{",
                closingDelimiter: "}}",
                activeDirectives: {
                    "IMPLICIT-ITERATOR": { enabled: true, key: "." } // Enabled by default as per original Mustache.js
                },
                globalDataSource: viewData // Store original viewData for root context lookups
            });

            // First pass: process pragmas, which modifies the blueprint and runtimeConfiguration
            var processedBlueprint = coreTools.parseAndConfigureDirectives(templateBlueprint, runtimeConfiguration);

            // Second pass: start the recursive processing of the template content
            return processTemplateSegment(processedBlueprint, viewData || {}, templateFragments || {}, runtimeConfiguration);
        }
    };
})();
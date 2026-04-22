var TemplateEngine = (typeof module !== "undefined" && module.exports) || {};

(function (moduleExports) {

    moduleExports.moduleName = "AlternativeTemplating";
    moduleExports.moduleVersion = "1.0.0";
    moduleExports.delimiters = ["((", "))"];
    moduleExports.analyzeTemplate = analyzeTemplate;
    moduleExports.createRenderer = createRenderer;
    moduleExports.renderTemplate = renderTemplate;
    moduleExports.resetCache = resetCache;

    moduleExports.processHtml = function (tpl, data, ptl, cb) {
        var res = renderTemplate(tpl, data, ptl);
        if (typeof cb === "function") {
            cb(res);
        } else {
            return res;
        }
    };

    var objectPrototypeString = Object.prototype.toString;
    var isArrayCheck = Array.isArray || function (val) { return objectPrototypeString.call(val) === "[object Array]"; };
    var iterateArray = Array.prototype.forEach ? function (arr, fn, ctx) { Array.prototype.forEach.call(arr, fn, ctx); } : function (arr, fn, ctx) { for (var i = 0, l = arr.length; i < l; ++i) { fn.call(ctx, arr[i], i, arr); } };
    
    // Custom trim for older browsers, using a different regex
    var stringTrim = String.prototype.trim ? function (str) { return str == null ? "" : String.prototype.trim.call(str); } : (function() {
        var leftSpacePattern = /^[\s\xA0]+/;
        var rightSpacePattern = /[\s\xA0]+$/;
        return function (str) {
            return str == null ? "" : String(str).replace(leftSpacePattern, "").replace(rightSpacePattern, "");
        };
    })();

    var whiteSpacePattern = /^\s*$/;
    function isOnlyWhitespace(str) {
        return whiteSpacePattern.test(str);
    }

    var htmlEscapeMappings = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": '&quot;',
        "'": '&#39;'
    };
    function safeHtml(text) {
        return String(text).replace(/[&<>"']/g, function (char) {
            return htmlEscapeMappings[char] || char;
        });
    }

    function enhanceError(err, sourceText, currentLineNumber, sourceFileName) {
        sourceFileName = sourceFileName || "unknown_template";
        var sourceLines = sourceText.split("\n");
        var contextStart = Math.max(currentLineNumber - 3, 0);
        var contextEnd = Math.min(sourceLines.length, currentLineNumber + 3);
        var contextSnippet = sourceLines.slice(contextStart, contextEnd);

        for (var i = 0, len = contextSnippet.length; i < len; ++i) {
            var lineNum = i + contextStart + 1;
            contextSnippet[i] = (lineNum === currentLineNumber ? "==> " : "    ") + contextSnippet[i];
        }

        err.templateSource = sourceText;
        err.errorLine = currentLineNumber;
        err.fileName = sourceFileName;
        err.message = [sourceFileName + ":" + currentLineNumber, contextSnippet.join("\n"), "", err.message].join("\n");
        return err;
    }

    function RenderNode(type, value, line) {
        this.kind = type;
        this.data = value;
        this.sourceLine = line;
        this.childElements = [];
    }

    function retrieveContextValue(keyPath, contextRegistry, defaultResult) {
        if (keyPath === ".") {
            return contextRegistry.currentScope;
        }

        var pathSegments = keyPath.split(".");
        var finalSegment = pathSegments[pathSegments.length - 1];

        var activeContext = contextRegistry;
        var resolvedValue;
        var invocationScope;

        while (activeContext) {
            var potentialScope = activeContext.currentScope;
            var pathNavigator = potentialScope;
            var segmentIndex = 0;

            while (pathNavigator != null && segmentIndex < pathSegments.length - 1) {
                pathNavigator = pathNavigator[pathSegments[segmentIndex++]];
            }

            if (pathNavigator != null && typeof pathNavigator === "object" && finalSegment in pathNavigator) {
                resolvedValue = pathNavigator[finalSegment];
                invocationScope = pathNavigator;
                break;
            }
            activeContext = activeContext.parentScope;
        }

        if (typeof resolvedValue === "function") {
            return resolvedValue.call(invocationScope || contextRegistry.currentScope);
        }

        return resolvedValue == null ? defaultResult : resolvedValue;
    }

    function executeConditionalBlock(elementName, contextRegistry, childRendererCallback, invertedCondition) {
        var outputAccumulator = [];
        var evaluatedElement = retrieveContextValue(elementName, contextRegistry);

        if (invertedCondition) {
            if (evaluatedElement == null || evaluatedElement === false || (isArrayCheck(evaluatedElement) && evaluatedElement.length === 0)) {
                outputAccumulator.push(childRendererCallback());
            }
        } else if (isArrayCheck(evaluatedElement)) {
            iterateArray(evaluatedElement, function (item) {
                var newContextRegistry = { currentScope: item, parentScope: contextRegistry };
                outputAccumulator.push(childRendererCallback(newContextRegistry));
            });
        } else if (typeof evaluatedElement === "object") {
            var newContextRegistry = { currentScope: evaluatedElement, parentScope: contextRegistry };
            outputAccumulator.push(childRendererCallback(newContextRegistry));
        } else if (typeof evaluatedElement === "function") {
            var funcExecutionScope = contextRegistry.currentScope;
            var nestedBlockRenderer = function (innerTemplate) {
                return renderTemplate(innerTemplate, funcExecutionScope);
            };
            var funcOutput = evaluatedElement.call(funcExecutionScope, childRendererCallback(), nestedBlockRenderer) || "";
            outputAccumulator.push(funcOutput);
        } else if (evaluatedElement) {
            outputAccumulator.push(childRendererCallback());
        }
        return outputAccumulator.join("");
    }

    function analyzeTemplate(templateSource, parsingConfiguration) {
        parsingConfiguration = parsingConfiguration || {};

        var currentTagPair = parsingConfiguration.delimiters || moduleExports.delimiters;
        var openingDelimiter = currentTagPair[0];
        var closingDelimiter = currentTagPair[currentTagPair.length - 1];

        var abstractSyntaxTree = [];
        var blockStructureStack = [];
        var currentSourceLine = 1;

        var currentLineNodesBuffer = [];
        var lineContainsTag = false;
        var lineContainsContent = false; // true for non-whitespace text or variable tags

        function reportParsingIssue(message) {
            throw enhanceError(new Error(message), templateSource, currentSourceLine, parsingConfiguration.fileName);
        }

        function appendNodeToTree(node) {
            var parentBlock = blockStructureStack.length > 0 ? blockStructureStack[blockStructureStack.length - 1] : null;
            if (parentBlock) {
                parentBlock.childElements.push(node);
            } else {
                abstractSyntaxTree.push(node);
            }
        }

        function flushLineBuffer(isNewline) {
            if (lineContainsTag && !lineContainsContent && !parsingConfiguration.space) {
                // Discard buffered nodes for this line if it's only tags (non-variable) and whitespace, and stripping is enabled.
            } else {
                iterateArray(currentLineNodesBuffer, function(node) {
                    appendNodeToTree(node);
                });
                if (isNewline) {
                    appendNodeToTree(new RenderNode("text", "\n", currentSourceLine));
                }
            }
            currentLineNodesBuffer = [];
            lineContainsTag = false;
            lineContainsContent = false;
        }

        var textCursor = 0;
        var sourceLength = templateSource.length;

        while (textCursor < sourceLength) {
            var nextOpeningDelimiterIndex = templateSource.indexOf(openingDelimiter, textCursor);

            if (nextOpeningDelimiterIndex === -1 || nextOpeningDelimiterIndex > textCursor) {
                var textEndPosition = (nextOpeningDelimiterIndex === -1) ? sourceLength : nextOpeningDelimiterIndex;
                var rawTextContent = templateSource.substring(textCursor, textEndPosition);

                var parts = rawTextContent.split(/(\n)/g);
                iterateArray(parts, function(part) {
                    if (part === "\n") {
                        flushLineBuffer(true);
                        currentSourceLine++;
                    } else if (part.length > 0) {
                        currentLineNodesBuffer.push(new RenderNode("text", part, currentSourceLine));
                        if (!isOnlyWhitespace(part)) {
                            lineContainsContent = true;
                        }
                    }
                });
                textCursor = textEndPosition;
                if (nextOpeningDelimiterIndex === -1) break;
            }

            textCursor = nextOpeningDelimiterIndex + openingDelimiter.length;
            var tagIdentifierChar = templateSource.charAt(textCursor);
            var tagContentStartIndex = textCursor + 1;
            var nextClosingDelimiterIndex = templateSource.indexOf(closingDelimiter, tagContentStartIndex);

            if (nextClosingDelimiterIndex === -1) {
                reportParsingIssue('Tag "' + openingDelimiter + '" was not properly terminated.');
            }

            var tagRawContent = templateSource.substring(tagContentStartIndex, nextClosingDelimiterIndex);
            var tagTrimmedContent = stringTrim(tagRawContent);

            var tagNodeLine = currentSourceLine;
            currentSourceLine += (tagRawContent.match(/\n/g) || []).length;
            lineContainsTag = true;

            var nodeToAppend;

            switch (tagIdentifierChar) {
                case "!":
                    break;
                case "=":
                    var newTagDelimiters = tagTrimmedContent.split(/\s+/);
                    if (newTagDelimiters.length !== 2) {
                        reportParsingIssue("Invalid delimiter change tag format. Expected 'OLD_OPEN OLD_CLOSE'.");
                    }
                    openingDelimiter = newTagDelimiters[0];
                    closingDelimiter = newTagDelimiters[1];
                    break;
                case ">":
                    nodeToAppend = new RenderNode("partial", tagTrimmedContent, tagNodeLine);
                    break;
                case "#":
                    if (tagTrimmedContent === "") {
                        reportParsingIssue("Section block name cannot be empty.");
                    }
                    var sectionElement = new RenderNode("section", tagTrimmedContent, tagNodeLine);
                    currentLineNodesBuffer.push(sectionElement);
                    blockStructureStack.push(sectionElement);
                    break;
                case "^":
                    if (tagTrimmedContent === "") {
                        reportParsingIssue("Inverted section block name cannot be empty.");
                    }
                    var invertedSectionElement = new RenderNode("invertedSection", tagTrimmedContent, tagNodeLine);
                    currentLineNodesBuffer.push(invertedSectionElement);
                    blockStructureStack.push(invertedSectionElement);
                    break;
                case "/":
                    if (tagTrimmedContent === "") {
                        reportParsingIssue("Closing section block name cannot be empty.");
                    }
                    if (blockStructureStack.length === 0) {
                        reportParsingIssue('Closing section "' + tagTrimmedContent + '" was never initiated.');
                    }
                    var lastBlock = blockStructureStack[blockStructureStack.length - 1];
                    if (lastBlock.data !== tagTrimmedContent) {
                        reportParsingIssue('Block named "' + lastBlock.data + '" was not properly closed. Found closing tag for "' + tagTrimmedContent + '".');
                    }
                    blockStructureStack.pop();
                    break;
                case "{":
                    if (templateSource.charAt(nextClosingDelimiterIndex + 1) !== '}') {
                        reportParsingIssue('Unescaped variable tag opened with "{" must be closed with "}}}".');
                    }
                    nextClosingDelimiterIndex++;
                    nodeToAppend = new RenderNode("unescapedVariable", tagTrimmedContent, tagNodeLine);
                    lineContainsContent = true;
                    break;
                case "&":
                    nodeToAppend = new RenderNode("unescapedVariable", tagTrimmedContent, tagNodeLine);
                    lineContainsContent = true;
                    break;
                default:
                    nodeToAppend = new RenderNode("escapedVariable", tagTrimmedContent, tagNodeLine);
                    lineContainsContent = true;
            }

            if (nodeToAppend) {
                currentLineNodesBuffer.push(nodeToAppend);
            }

            textCursor = nextClosingDelimiterIndex + closingDelimiter.length;
        }

        flushLineBuffer(false);

        if (blockStructureStack.length !== 0) {
            reportParsingIssue('Section block "' + blockStructureStack[blockStructureStack.length - 1].data + '" was not properly terminated.');
        }

        return abstractSyntaxTree;
    }

    var compiledRenderFunctionCache = {};

    function createRenderer(templateInput, compilationSettings) {
        compilationSettings = compilationSettings || {};
        var cacheIdentifier = templateInput + JSON.stringify(compilationSettings);
        if (compiledRenderFunctionCache[cacheIdentifier]) {
            return compiledRenderFunctionCache[cacheIdentifier];
        }

        var templateAst;
        try {
            templateAst = analyzeTemplate(templateInput, compilationSettings);
        } catch (e) {
            throw enhanceError(e, templateInput, e.errorLine, compilationSettings.fileName);
        }

        var finalRenderer = function (dataModel, partialRenderers) {
            partialRenderers = partialRenderers || {};

            var baseContext = { currentScope: dataModel, parentScope: null };
            var outputResult = [];

            function processRenderNodes(nodesCollection, currentRenderingContext) {
                var collectionOutput = [];
                iterateArray(nodesCollection, function (nodeElement) {
                    try {
                        switch (nodeElement.kind) {
                            case "text":
                                collectionOutput.push(nodeElement.data);
                                break;
                            case "escapedVariable":
                                var valueToEscape = retrieveContextValue(nodeElement.data, currentRenderingContext, "");
                                collectionOutput.push(safeHtml(valueToEscape));
                                break;
                            case "unescapedVariable":
                                var rawValue = retrieveContextValue(nodeElement.data, currentRenderingContext, "");
                                collectionOutput.push(rawValue);
                                break;
                            case "section":
                                var sectionChildRenderer = function (childContextOverride) {
                                    return processRenderNodes(nodeElement.childElements, childContextOverride || currentRenderingContext);
                                };
                                collectionOutput.push(executeConditionalBlock(nodeElement.data, currentRenderingContext, sectionChildRenderer, false));
                                break;
                            case "invertedSection":
                                var invertedSectionChildRenderer = function (childContextOverride) {
                                    return processRenderNodes(nodeElement.childElements, childContextOverride || currentRenderingContext);
                                };
                                collectionOutput.push(executeConditionalBlock(nodeElement.data, currentRenderingContext, invertedSectionChildRenderer, true));
                                break;
                            case "partial":
                                var pName = nodeElement.data;
                                var pSource = partialRenderers[pName];
                                if (pSource) {
                                    var pCompiledFn = createRenderer(pSource, compilationSettings);
                                    collectionOutput.push(pCompiledFn(currentRenderingContext.currentScope, partialRenderers));
                                }
                                break;
                        }
                    } catch (e) {
                        throw enhanceError(e, templateInput, nodeElement.sourceLine, compilationSettings.fileName);
                    }
                });
                return collectionOutput.join("");
            }

            try {
                return processRenderNodes(templateAst, baseContext);
            } catch (e) {
                throw enhanceError(e, templateInput, e.errorLine || 1, compilationSettings.fileName);
            }
        };

        compiledRenderFunctionCache[cacheIdentifier] = finalRenderer;
        return finalRenderer;
    }

    function renderTemplate(templateString, dataModelObject, partialsCollection) {
        var preppedFn = createRenderer(templateString);
        return preppedFn(dataModelObject, partialsCollection);
    }

    function resetCache() {
        compiledRenderFunctionCache = {};
    }

})(TemplateEngine);
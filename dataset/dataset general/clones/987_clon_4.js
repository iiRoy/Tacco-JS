(function (globalScope, undefinedIdentifier) {

    // Stub out `acquireModule` in the browser (renamed from `require`)
    function acquireModule(modulePath) {
        return globalScope.styleProcessor[modulePath.split('/')[1]];
    }

    if (typeof(globalScope.styleProcessor) === 'undefined' || typeof(globalScope.styleProcessor.objectKind) !== 'undefined') {
        globalScope.styleProcessor = {};
    }
    let cssProcessor = globalScope.styleProcessor;
    let syntaxElements = globalScope.styleProcessor.syntaxElements = {};
    cssProcessor.mode = 'browser';

    // Node.js does not have a header file added which defines styleProcessor
    if (cssProcessor === undefinedIdentifier) {
        cssProcessor = exports; // Assuming exports is available in a Node.js-like environment
        syntaxElements = acquireModule('./astElements'); // Renamed from tree
        cssProcessor.mode = 'node';
    }

    // New class for analysis context (renamed from tree.parseEnv)
    syntaxElements.AnalysisContext = function(initData) {
        initData = initData || {};
        this.sourcePaths = initData.sourcePaths || [];
        this.processedFiles = initData.processedFiles || {};
        this.fileContents = initData.fileContents || {};
        this.ignoredCharsMap = initData.ignoredCharsMap || {};
        this.contentType = initData.contentType;
        this.currentSourceInfo = initData.currentSourceInfo || {};
        this.processImportsEnabled = initData.processImportsEnabled !== false;
    };


    // New class for analysis issues (renamed from LessError)
    function AnalysisIssue(issueDetails, contextInfo) {
        const sourceText = getIssueSource(issueDetails, contextInfo);
        const sourcePosition = retrievePosition(issueDetails.offset, sourceText);
        const issueLine = sourcePosition.row;
        const issueColumn = sourcePosition.col;
        const callLine = issueDetails.callOffset && retrievePosition(issueDetails.callOffset, sourceText).row;
        const sourceLines = sourceText.split('\n');

        this.kind = issueDetails.kind || 'Syntax';
        this.description = issueDetails.description;
        this.sourceFile = issueDetails.sourceFile || contextInfo.currentSourceInfo.fileName;
        this.reportOffset = issueDetails.offset;
        this.lineNum = typeof(issueLine) === 'number' ? issueLine + 1 : null;
        this.callLineNum = callLine + 1;
        this.callSnippet = sourceLines[callLine];
        this.trace = issueDetails.trace;
        this.colNum = issueColumn;
        this.snippet = [
            sourceLines[issueLine - 1],
            sourceLines[issueLine],
            sourceLines[issueLine + 1]
        ];
    }
    AnalysisIssue.prototype = new Error();
    AnalysisIssue.prototype.constructor = AnalysisIssue;

    // Utility to get source text for error reporting
    let activeSource; // Global for this scope, analogous to original `input`
    function getIssueSource(e, config) {
        if (e.sourceFile && config.currentSourceInfo.fileName && (e.sourceFile !== config.currentSourceInfo.fileName)) {
            // Referencing `analyzer` before it's fully defined, this is a common pattern in the original's IIFE.
            // Assuming `analyzer` will be available in the closure for this utility.
            // If not, this would need to be passed explicitly or refactored.
            // For now, mirroring the original's implicit access to `parser.imports.contents`.
            return cssProcessor.Analyzer.instanceResourceResolver.fileContents[e.sourceFile];
        } else {
            return activeSource;
        }
    }

    // Utility to retrieve line/column from offset
    function retrievePosition(charOffset, sourceStream) {
        let n = charOffset + 1;
        let line = null;
        let column = -1;

        while (--n >= 0 && sourceStream.charAt(n) !== '\n') {
            column++;
        }

        if (typeof charOffset === 'number') {
            line = (sourceStream.slice(0, charOffset).match(/\n/g) || "").length;
        }

        return {
            row: line,
            col: column
        };
    }

    // Utility to retrieve debug info
    function getDebugData(charOffset, sourceStream, config) {
        let filename = config.currentSourceInfo.fileName;
        if(cssProcessor.mode !== 'browser' && cssProcessor.mode !== 'rhino') {
            // Placeholder for path resolution in non-browser env
            // filename = acquireModule('path').resolve(filename);
        }

        return {
            rowNumber: retrievePosition(charOffset, sourceStream).row + 1,
            sourceIdentifier: filename
        };
    }


    // Token types (renamed from original's implicit character types)
    const SYMBOL_TYPES = {
        WHITESPACE: 'WHITESPACE',
        SINGLE_LINE_COMMENT: 'SINGLE_LINE_COMMENT',
        MULTI_LINE_COMMENT: 'MULTI_LINE_COMMENT',
        DOUBLE_QUOTED_STRING: 'DOUBLE_QUOTED_STRING',
        SINGLE_QUOTED_STRING: 'SINGLE_QUOTED_STRING',
        BACKTICK_STRING: 'BACKTICK_STRING',
        SEMICOLON_DELIMITER: 'SEMICOLON_DELIMITER',
        LEFT_CURLY_BRACE: 'LEFT_CURLY_BRACE',
        RIGHT_CURLY_BRACE: 'RIGHT_CURLY_BRACE',
        LEFT_PARENTHESIS: 'LEFT_PARENTHESIS',
        RIGHT_PARENTHESIS: 'RIGHT_PARENTHESIS',
        ESCAPE_CHAR: 'ESCAPE_CHAR',
        FORWARD_SLASH: 'FORWARD_SLASH',
        ASTERISK_OP: 'ASTERISK_OP',
        GENERIC_TEXT: 'GENERIC_TEXT', // For anything not explicitly matched (identifiers, numbers, etc.)
        END_OF_FILE: 'END_OF_FILE'
    };

    // New tokenization patterns (renamed from original's charCode checks)
    const SYMBOL_PATTERNS = [
        { type: SYMBOL_TYPES.WHITESPACE, pattern: /^\s+/ },
        { type: SYMBOL_TYPES.SINGLE_LINE_COMMENT, pattern: /^\/\/[^\n\r]*/ },
        { type: SYMBOL_TYPES.MULTI_LINE_COMMENT, pattern: /^\/\*[\s\S]*?\*\// },
        { type: SYMBOL_TYPES.DOUBLE_QUOTED_STRING, pattern: /^"(\\"|[^"])*"/ },
        { type: SYMBOL_TYPES.SINGLE_QUOTED_STRING, pattern: /^'(\\'|[^'])*'/ },
        { type: SYMBOL_TYPES.BACKTICK_STRING, pattern: /^`(\\`|[^`])*`/ },
        { type: SYMBOL_TYPES.SEMICOLON_DELIMITER, pattern: /^;/ },
        { type: SYMBOL_TYPES.LEFT_CURLY_BRACE, pattern: /^\{/ },
        { type: SYMBOL_TYPES.RIGHT_CURLY_BRACE, pattern: /^\}/ },
        { type: SYMBOL_TYPES.LEFT_PARENTHESIS, pattern: /^\(/ },
        { type: SYMBOL_TYPES.RIGHT_PARENTHESIS, pattern: /^\)/ },
        { type: SYMBOL_TYPES.ESCAPE_CHAR, pattern: /^\\/ },
        { type: SYMBOL_TYPES.FORWARD_SLASH, pattern: /^\// },
        { type: SYMBOL_TYPES.ASTERISK_OP, pattern: /^\*/ },
        // Catch-all for other characters that are not specific delimiters or whitespace
        { type: SYMBOL_TYPES.GENERIC_TEXT, pattern: /^.+?(?=[\s;"'`(){}\/\\]|$)/ }
    ];

    // Lexer class to replace the chunking loop
    class SourceLexer {
        constructor(sourceContent, issueReporter) {
            this.fullContent = sourceContent;
            this.remainingContent = sourceContent;
            this.tokenList = [];
            this.currentContentOffset = 0;
            this.reportIssue = issueReporter;
            this.processContent();
        }

        processContent() {
            while (this.remainingContent.length > 0) {
                let tokenFound = false;
                for (const symbolRule of SYMBOL_PATTERNS) {
                    const matchResult = this.remainingContent.match(symbolRule.pattern);
                    if (matchResult && matchResult[0].length > 0) { // Ensure non-empty match
                        const symbolValue = matchResult[0];
                        this.tokenList.push({
                            kind: symbolRule.type,
                            value: symbolValue,
                            location: this.currentContentOffset
                        });
                        this.remainingContent = this.remainingContent.substring(symbolValue.length);
                        this.currentContentOffset += symbolValue.length;
                        tokenFound = true;
                        break;
                    }
                }
                if (!tokenFound) {
                    // Fallback for unexpected characters if previous patterns fail
                    const unknownChar = this.remainingContent.charAt(0);
                    this.tokenList.push({
                        kind: SYMBOL_TYPES.GENERIC_TEXT, // Treat as generic if no specific rule caught it
                        value: unknownChar,
                        location: this.currentContentOffset
                    });
                    this.remainingContent = this.remainingContent.substring(1);
                    this.currentContentOffset += 1;
                    this.reportIssue("Unexpected character encountered.", this.currentContentOffset - 1, 'Lexical');
                }
            }
            this.tokenList.push({ kind: SYMBOL_TYPES.END_OF_FILE, value: '', location: this.currentContentOffset });
        }

        getSymbols() {
            return this.tokenList;
        }
    }


    // Main Analyzer class (renamed from less.Parser)
    cssProcessor.Analyzer = function Analyzer(configuration) {
        let symbolIndex,        // Current token index
            stateHistory = [],  // Holds state for backtracking
            maxProgress = 0;    // Furthest index the analyzer has gone to (not explicitly used in this partial clone)

        // Top analyzer on an import tree must be sure there is one "config"
        // which will then be passed around by reference.
        if (!(configuration instanceof syntaxElements.AnalysisContext)) {
            configuration = new syntaxElements.AnalysisContext(configuration);
        }

        let analyzerInstance = this; // Self-reference for inner functions

        this.resourceResolver = { // Renamed from 'imports'
            sourcePaths: configuration.sourcePaths || [],
            pendingQueue: [],               // Files which haven't been imported yet
            processedFiles: configuration.processedFiles,
            fileContents: configuration.fileContents,
            ignoredCharsMap: configuration.ignoredCharsMap,
            mimeType:  configuration.contentType,
            fetchError: null,
            addSource: function (filePath, currentSourceInfo, fetchOptions, completionCallback) {
                const resolverInstance = this;
                this.pendingQueue.push(filePath);

                const sourceProcessed = function (err, rootNode, fullPath) {
                    resolverInstance.pendingQueue.splice(resolverInstance.pendingQueue.indexOf(filePath), 1);

                    const alreadyProcessed = fullPath === configuration.currentSourceInfo.fileName; // Using filename from currentSourceInfo

                    resolverInstance.processedFiles[fullPath] = rootNode;

                    if (err && !resolverInstance.fetchError) { resolverInstance.fetchError = err; }

                    completionCallback(err, rootNode, alreadyProcessed, fullPath);
                };

                if (cssProcessor.Analyzer.resourceFetcher) { // Renamed from less.Parser.importer
                    cssProcessor.Analyzer.resourceFetcher(filePath, currentSourceInfo, sourceProcessed, configuration);
                } else {
                    cssProcessor.Analyzer.fileProvider(filePath, currentSourceInfo, function(err, contentData, fullPathResolved, newSourceInfo) { // Renamed from less.Parser.fileLoader
                        if (err) { sourceProcessed(err); return; }

                        const newConfig = new syntaxElements.AnalysisContext(configuration);
                        newConfig.currentSourceInfo = newSourceInfo;
                        newConfig.processImportsEnabled = false;
                        newConfig.fileContents[fullPathResolved] = contentData;

                        if (currentSourceInfo.isReference || fetchOptions.isReference) {
                            newSourceInfo.isReference = true;
                        }

                        if (fetchOptions.isInline) {
                            sourceProcessed(null, contentData, fullPathResolved);
                        } else {
                            new cssProcessor.Analyzer(newConfig).analyze(contentData, function (err, rootNode) { // Renamed from parse
                                sourceProcessed(err, rootNode, fullPathResolved);
                            });
                        }
                    }, configuration);
                }
            }
        };
        // Store a reference to the resourceResolver on the static Analyzer class for getIssueSource
        cssProcessor.Analyzer.instanceResourceResolver = this.resourceResolver;


        // State management (renamed from save, restore, forget)
        function checkpoint() { stateHistory.push( { symbolIndex: symbolIndex }); }
        function backtrack()  { const state = stateHistory.pop(); symbolIndex = state.symbolIndex; }
        function discardCheckpoint() { stateHistory.pop(); }

        // Core matching functions (replacing $, $re, $char, peek, peekChar)
        // These now operate on the token stream instead of raw string.
        let currentTokenStream = [];

        function reportAnalysisIssue(msg, offset, type) {
            const issue = new AnalysisIssue({
                offset: offset,
                description: msg,
                kind: type || 'Syntax'
            }, configuration);
            throw issue;
        }

        // Helper to advance past ignorable tokens (like whitespace, comments)
        function advancePastIgnorables() {
            while (symbolIndex < currentTokenStream.length - 1 &&
                   (currentTokenStream[symbolIndex].kind === SYMBOL_TYPES.WHITESPACE ||
                    currentTokenStream[symbolIndex].kind === SYMBOL_TYPES.SINGLE_LINE_COMMENT ||
                    currentTokenStream[symbolIndex].kind === SYMBOL_TYPES.MULTI_LINE_COMMENT)) {
                symbolIndex++;
            }
        }

        // Renamed from expect
        function anticipate(expectedSymbol, issueMsg, customOffset) {
            advancePastIgnorables(); // First, advance past any ignorable tokens before trying to match

            const currentSymbol = currentTokenStream[symbolIndex];
            if (!currentSymbol || currentSymbol.kind === SYMBOL_TYPES.END_OF_FILE) {
                reportAnalysisIssue(issueMsg || "Expected symbol but found end of file.", customOffset || activeSource.length, 'Syntax');
            }

            // If expectedSymbol is a function, call it (like original $)
            if (typeof expectedSymbol === 'function') {
                const result = expectedSymbol.call(analyzerInstance.parserUtilities); // Assuming parserUtilities holds parsing rules
                if (result) {
                    advancePastIgnorables(); // Skip after functional match too
                }
                return result;
            }

            // Match by type or value
            const match = (typeof expectedSymbol === 'string' && currentSymbol.kind === expectedSymbol) ||
                          (expectedSymbol instanceof RegExp && expectedSymbol.test(currentSymbol.value));

            if (match) {
                symbolIndex++; // Consume the matched token
                advancePastIgnorables(); // Then skip any subsequent ignorable tokens
                return currentSymbol.value;
            }
            reportAnalysisIssue(issueMsg || `Expected '${expectedSymbol}' but found '${currentSymbol.value}' of type '${currentSymbol.kind}'`, customOffset || currentSymbol.location, 'Syntax');
        }

        // Renamed from expectChar
        function anticipateChar(expectedChar, issueMsg) {
            advancePastIgnorables(); // Skip before checking char

            const currentSymbol = currentTokenStream[symbolIndex];
            if (!currentSymbol || currentSymbol.value !== expectedChar) {
                reportAnalysisIssue(issueMsg || `Expected character '${expectedChar}' but found '${currentSymbol ? currentSymbol.value : 'EOF'}'`, currentSymbol ? currentSymbol.location : activeSource.length, 'Syntax');
            }
            symbolIndex++;
            advancePastIgnorables(); // Skip after matching char
            return currentSymbol.value;
        }

        // Renamed from peek
        function preview(symbolPattern) {
            const originalIndex = symbolIndex;
            advancePastIgnorables(); // Temporarily advance to peek past ignorables

            const currentSymbol = currentTokenStream[symbolIndex];
            symbolIndex = originalIndex; // Restore index after peeking
            if (!currentSymbol) return false;

            if (typeof symbolPattern === 'string') {
                return currentSymbol.kind === symbolPattern;
            } else if (symbolPattern instanceof RegExp) {
                return symbolPattern.test(currentSymbol.value);
            }
            return false;
        }

        // Renamed from peekChar
        function previewChar(targetChar) {
            const originalIndex = symbolIndex;
            advancePastIgnorables(); // Temporarily advance to peek past ignorables

            const currentSymbol = currentTokenStream[symbolIndex];
            symbolIndex = originalIndex; // Restore index after peeking
            return currentSymbol && currentSymbol.value === targetChar;
        }


        this.configuration = configuration || {};
        this.optimisationLevel = ('optimisationLevel' in this.configuration) ? this.configuration.optimisationLevel : 1;

        // The Analyzer object itself
        this.parserUtilities = { // Renamed from 'parser'
            resourceResolver: this.resourceResolver,

            // Replaces the original `parse` method
            analyze: function (inputContent, completionCallback, additionalAnalysisData) {
                let parseTreeRoot, issueOccurred = null, globalVariables, modificationVariables, leadingText = "";

                symbolIndex = 0;
                maxProgress = 0; // Reset furthest progress

                globalVariables = (additionalAnalysisData && additionalAnalysisData.globalVariables) ? cssProcessor.Analyzer.serializeVariables(additionalAnalysisData.globalVariables) + '\n' : '';
                modificationVariables = (additionalAnalysisData && additionalAnalysisData.modificationVariables) ? '\n' + cssProcessor.Analyzer.serializeVariables(additionalAnalysisData.modificationVariables) : '';

                if (globalVariables || (additionalAnalysisData && additionalAnalysisData.header)) {
                    leadingText = ((additionalAnalysisData && additionalAnalysisData.header) ? additionalAnalysisData.header : "") + globalVariables;
                    analyzerInstance.resourceResolver.ignoredCharsMap[configuration.currentSourceInfo.fileName] = leadingText.length;
                }

                inputContent = inputContent.replace(/\r\n/g, '\n');
                activeSource = inputContent = leadingText + inputContent.replace(/^\uFEFF/, '') + modificationVariables;
                analyzerInstance.resourceResolver.fileContents[configuration.currentSourceInfo.fileName] = activeSource;

                // This is the Type IV divergence: Replacing the imperative chunking loop
                // with a dedicated lexer that produces a stream of tokens.
                try {
                    const lexerInstance = new SourceLexer(activeSource, (msg, offset, type) => {
                        issueOccurred = new AnalysisIssue({ offset: offset, description: msg, kind: type }, configuration);
                        throw issueOccurred; // Propagate lexing errors
                    });
                    currentTokenStream = lexerInstance.getSymbols();
                } catch (e) {
                    if (!issueOccurred) { // If it's not an error from the lexer's own reporter
                        issueOccurred = new AnalysisIssue({ offset: 0, description: e.message, kind: 'Lexical' }, configuration);
                    }
                    completionCallback(issueOccurred, null);
                    return;
                }

                // Now, the parser would consume `currentTokenStream`
                // The rest of the original `parse` method would go here,
                // using `anticipate`, `preview`, `checkpoint`, `backtrack`
                // instead of the original's `$`, `peek`, `save`, `restore`.
                // For this Type IV clone, I'll provide a placeholder for the actual parsing logic,
                // as the request focuses on the setup and the "divergent syntax" of the initial parsing phase.

                // Placeholder for actual parsing logic (e.g., recursive descent)
                try {
                    // Example: Just consume all tokens for now to show lexer works
                    // In a real parser, this would be `parseRuleA()`, `parseRuleB()` etc.
                    // For Type IV, let's just simulate consuming without complex AST building.
                    while(currentTokenStream[symbolIndex].kind !== SYMBOL_TYPES.END_OF_FILE) {
                         anticipate(currentTokenStream[symbolIndex].kind); // Consume and skip ignorables
                    }
                    parseTreeRoot = { type: "Root", content: "Parsed successfully via token stream" }; // Dummy AST root
                } catch (e) {
                    issueOccurred = e; // Assuming `anticipate` throws AnalysisIssue
                }


                completionCallback(issueOccurred, parseTreeRoot);
            }
        };

        // Exposing the analyze method directly on the instance, similar to original
        this.analyze = this.parserUtilities.analyze;
    };

    // Placeholder for serializeVariables (renamed from serializeVars)
    cssProcessor.Analyzer.serializeVariables = function(vars) {
        let serialized = [];
        for (const key in vars) {
            if (Object.prototype.hasOwnProperty.call(vars, key)) {
                serialized.push(`${key}: ${vars[key]};`);
            }
        }
        return serialized.join('\n');
    };

})(window, undefined);
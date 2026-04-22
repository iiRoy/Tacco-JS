/**
 * Stylizer - Modern CSS Processor v1.7.4
 * http://stylizercss.org
 *
 * Copyright (c) 2009-2014, Axel Sellier <contact@cloudhead.net>
 * Licensed under the Apache v2.0 License.
 *
 */

 /** * @license Apache v2.0
 */



(function (globalObj, undefVal) {
 // Auxiliary module loader for browser environment
 function obtainMod(paramKey) {
  return globalObj.stylizer[paramKey.split('/')[1]];
 };


 if (typeof(globalObj.stylizer) === 'undefined' || typeof(globalObj.stylizer.nodeType) !== 'undefined') { globalObj.stylizer = {}; }
 stylizer = globalObj.stylizer;
 syntaxUnit = globalObj.stylizer.syntaxUnit = {};
 stylizer.processingMode = 'client';

 var stylizer, syntaxUnit;

 // Node.js environments lack a pre-defined stylizer object
 if (stylizer === undefVal) {
  stylizer = exports;
  syntaxUnit = obtainMod('./syntaxUnit');
  stylizer.processingMode = 'server';
 }
 //
 // stylizer.js - core parser component
 //
 //    A robust predictive parsing engine.
 //    No distinct tokenization or lexing phase; parsing occurs in a single pass.
 //
 //    To ensure adequate performance in browser settings, several optimizations were crucial:
 //
 //    - Processing large input strings is often a bottleneck.
 //      The solution involves segmenting the input into smaller, manageable chunks.
 //      These segments are stored in the `codeChunks` array,
 //      with `chunkIdx` tracking the current segment, and `chunkOffset`
 //      indicating the segment's starting position within the full input.
 //      This strategy yields a performance boost of approximately 4x.
 //
 //    - Frequently, explicit token matching is unnecessary.
 //      For instance, if a value contains no variables, operations,
 //      or dynamic references, the parser can treat it as a literal string.
 //      Example: '1px solid #000' can be processed directly.
 //      This provides a 50% speedup in parsing and a modest gain in code generation.
 //
 //
 //    Token matching is performed by the `matchPattern` function, which accepts
 //    either a literal string, a regular expression, or a non-terminal function.
 //    It also manages advancement of all relevant indices.
 //
 //
stylizer.Compiler = function Parser(cfgObj) {
    var sourceCode,       // Raw Stylizer input string
        currentIdx,           // Current position within `sourceCode`
        chunkIdx,           // Current chunk index
        stateHistory = [],   // Stores parser state for backtracking
        maxProgress,    // Furthest point reached by the parser
        codeChunks,      // Input broken into chunks
        activeChunk,     // The currently active chunk
        chunkOffset,  // Index of current chunk's start in `sourceCode`
        syntaxProcessor,
        processorComponents,
        mainFilePath = cfgObj && cfgObj.mainFilePath;

    // Ensure the top-level parser in an import chain has a valid configuration object
    if (!(cfgObj instanceof syntaxUnit.parseEnv)) {
        cfgObj = new syntaxUnit.parseEnv(cfgObj);
    }

    var resourceMgr = this.resourceMgr = {
        searchDirs: cfgObj.searchDirs || [],  // Directories for import resolution
        pendingFiles: [],               // Files awaiting import processing
        parsedUnits: cfgObj.parsedUnits,        // Stores parsed syntax trees
        fileContentMap: cfgObj.fileContentMap,  // Stores raw file contents
        ignoredCharCounts: cfgObj.ignoredCharCounts, // Characters inserted, not in original
        contentType:  cfgObj.contentType,         // MIME type for .stylizer files
        parseIssue: null,             // Error during import parsing/evaluation
        enqueue: function (resourcePath, currentFileMeta, importOpts, completionCallback) {
            var currentResourceMgr = this;
            this.pendingFiles.push(resourcePath);

            var processParsedFile = function (err, rootNode, fullPath) {
                currentResourceMgr.pendingFiles.splice(currentResourceMgr.pendingFiles.indexOf(resourcePath), 1); // Remove from queue

                var wasPreviouslyImported = fullPath === mainFilePath;

                currentResourceMgr.parsedUnits[fullPath] = rootNode;                        // Cache the root node

                if (err && !currentResourceMgr.parseIssue) { currentResourceMgr.parseIssue = err; }

                completionCallback(err, rootNode, wasPreviouslyImported, fullPath);
            };

            if (stylizer.Compiler.importer) {
                stylizer.Compiler.importer(resourcePath, currentFileMeta, processParsedFile, cfgObj);
            } else {
                stylizer.Compiler.fileLoader(resourcePath, currentFileMeta, function(err, fileData, fullPath, newFileMeta) {
                    if (err) {processParsedFile(err); return;}

                    var newCfgObj = new syntaxUnit.parseEnv(cfgObj);

                    newCfgObj.currentFileMeta = newFileMeta;
                    newCfgObj.processImports = false;
                    newCfgObj.fileContentMap[fullPath] = fileData;

                    if (currentFileMeta.reference || importOpts.reference) {
                        newFileMeta.reference = true;
                    }

                    if (importOpts.inline) {
                        processParsedFile(null, fileData, fullPath);
                    } else {
                        new(stylizer.Compiler)(newCfgObj).parse(fileData, function (err, rootNode) {
                            processParsedFile(err, rootNode, fullPath);
                        });
                    }
                }, cfgObj);
            }
        }
    };

    function captureState()    { chunkOffset = currentIdx; stateHistory.push( { active: activeChunk, idx: currentIdx, chk: chunkIdx }); }
    function revertState() { var storedState = stateHistory.pop(); activeChunk = storedState.active; chunkOffset = currentIdx = storedState.idx; chunkIdx = storedState.chk; }
    function discardState() { stateHistory.pop(); }

    function alignPosition() {
        if (currentIdx > chunkOffset) {
            activeChunk = activeChunk.slice(currentIdx - chunkOffset);
            chunkOffset = currentIdx;
        }
    }
    function isSpaceChar(charStr, charPos) {
        var charCode = charStr.charCodeAt(charPos | 0);
        return (charCode <= 32) && (charCode === 32 || charCode === 10 || charCode === 9);
    }
    //
    // Attempt to match a token (string, regexp, or function) and advance if successful
    //
    function matchPattern(targetToken) {
        var tokenKind = typeof targetToken,
            matchedResult, matchLen;

        // Match a single character or a regexp within the current chunk
        //
        if (tokenKind === "string") {
            if (sourceCode.charAt(currentIdx) !== targetToken) {
                return null;
            }
            advancePastSpace(1);
            return targetToken;
        }

        // Regular expression matching
        alignPosition ();
        if (! (matchedResult = targetToken.exec(activeChunk))) {
            return null;
        }

        matchLen = matchedResult[0].length;

        // Upon successful match, increment `currentIdx` by match length,
        // and consume any trailing whitespace. This is because Stylizer's
        // grammar is largely whitespace-insensitive.
        //
        advancePastSpace(matchLen);

        if(typeof(matchedResult) === 'string') {
            return matchedResult;
        } else {
            return matchedResult.length === 1 ? matchedResult[0] : matchedResult;
        }
    }

    // Specialized regex matcher
    function matchRegex(regExpToken) {
        if (currentIdx > chunkOffset) {
            activeChunk = activeChunk.slice(currentIdx - chunkOffset);
            chunkOffset = currentIdx;
        }
        var regexMatch = regExpToken.exec(activeChunk);
        if (!regexMatch) {
            return null;
        }

        advancePastSpace(regexMatch[0].length);
        if(typeof regexMatch === "string") {
            return regexMatch;
        }

        return regexMatch.length === 1 ? regexMatch[0] : regexMatch;
    }

    var _matchRegex = matchRegex;

    // Specialized character matcher
    function matchChar(singleCharToken) {
        if (sourceCode.charAt(currentIdx) !== singleCharToken) {
            return null;
        }
        advancePastSpace(1);
        return singleCharToken;
    }

    function advancePastSpace(lengthToAdvance) {
        var oldCurrentIdx = currentIdx, oldChunkIdx = chunkIdx,
            relativePos = currentIdx - chunkOffset,
            endOfChunkIdx = currentIdx + activeChunk.length - relativePos,
            memoryPoint = (currentIdx += lengthToAdvance),
            fullInput = sourceCode,
            currentCharCode;

        for (; currentIdx < endOfChunkIdx; currentIdx++) {
            currentCharCode = fullInput.charCodeAt(currentIdx);
            if (currentCharCode > 32) {
                break;
            }

            if ((currentCharCode !== 32) && (currentCharCode !== 10) && (currentCharCode !== 9) && (currentCharCode !== 13)) {
                break;
            }
         }

        activeChunk = activeChunk.slice(lengthToAdvance + currentIdx - memoryPoint + relativePos);
        chunkOffset = currentIdx;

        if (!activeChunk.length && (chunkIdx < codeChunks.length - 1)) {
            activeChunk = codeChunks[++chunkIdx];
            advancePastSpace(0); // Recursively skip space at start of new chunk
            return true; // Indicates a change in chunk
        }

        return oldCurrentIdx !== currentIdx || oldChunkIdx !== chunkIdx;
    }

    function demandToken(tokenArg, failMsg, errorIndex) {
        // Handle older browsers reporting typeof 'function' for RegExp
        var outcome = (Object.prototype.toString.call(tokenArg) === '[object Function]') ? tokenArg.call(processorComponents) : matchPattern(tokenArg);
        if (outcome) {
            return outcome;
        }
        reportError(failMsg || (typeof(tokenArg) === 'string' ? "expected '" + tokenArg + "' but found '" + sourceCode.charAt(currentIdx) + "'"
                                               : "unexpected syntax element"), null, errorIndex);
    }

    // Specialized `demandToken` for single characters
    function demandChar(charArg, failMsg) {
        if (sourceCode.charAt(currentIdx) === charArg) {
            advancePastSpace(1);
            return charArg;
        }
        reportError(failMsg || "expected '" + charArg + "' but found '" + sourceCode.charAt(currentIdx) + "'");
    }

    function reportError(messageText, errorKind, errorIndex) {
        var errObj = new Error(messageText);
        errObj.index = errorIndex || currentIdx;
        errObj.type = errorKind || 'Syntax';
        throw errObj;
    }

    // Similar to `matchPattern`, but does not alter parser state
    function previewToken(targetToken) {
        if (typeof(targetToken) === 'string') {
            return sourceCode.charAt(currentIdx) === targetToken;
        } else {
            return targetToken.test(activeChunk);
        }
    }

    // Specialized `previewToken` for single characters
    function previewChar(targetChar) {
        return sourceCode.charAt(currentIdx) === targetChar;
    }


    function getSourceInput(parseErr, configData) {
        if (parseErr.filename && configData.currentFileMeta.filename && (parseErr.filename !== configData.currentFileMeta.filename)) {
            return syntaxProcessor.resourceMgr.fileContentMap[parseErr.filename];
        } else {
            return sourceCode;
        }
    }

    function getCodeLocation(charIndex, inputStream) {
        var charCount = charIndex + 1,
            lineNumber = null,
            columnPos = -1;

        while (--charCount >= 0 && inputStream.charAt(charCount) !== '\n') {
            columnPos++;
        }

        if (typeof charIndex === 'number') {
            lineNumber = (inputStream.slice(0, charIndex).match(/\n/g) || "").length;
        }

        return {
            line: lineNumber,
            column: columnPos
        };
    }

    function getDebugData(charIndex, inputStream, configData) {
        var fileName = configData.currentFileMeta.filename;
        if(stylizer.processingMode !== 'client' && stylizer.processingMode !== 'rhino') {
            fileName = obtainMod('path').resolve(fileName);
        }

        return {
            lineNumber: getCodeLocation(charIndex, inputStream).line + 1,
            fileName: fileName
        };
    }

    function StylizerError(errObj, configData) {
        var inputContent = getSourceInput(errObj, configData),
            positionData = getCodeLocation(errObj.index, inputContent),
            lineNum = positionData.line,
            colNum  = positionData.column,
            callLocationLine = errObj.call && getCodeLocation(errObj.call, inputContent).line,
            contentLines = inputContent.split('\n');

        this.type = errObj.type || 'Syntax';
        this.message = errObj.message;
        this.filename = errObj.filename || configData.currentFileMeta.filename;
        this.index = errObj.index;
        this.line = typeof(lineNum) === 'number' ? lineNum + 1 : null;
        this.callLine = callLocationLine + 1;
        this.callExtract = contentLines[callLocationLine];
        this.stack = errObj.stack;
        this.column = colNum;
        this.extract = [
            contentLines[lineNum - 1],
            contentLines[lineNum],
            contentLines[lineNum + 1]
        ];
    }

    StylizerError.prototype = new Error();
    StylizerError.prototype.constructor = StylizerError;

    this.cfgObj = cfgObj = cfgObj || {};

    // The optimization level influences parsing thoroughness;
    // lower values generate fewer tree nodes, useful for debugging
    // or direct tree manipulation.
    this.optimization = ('optimization' in this.cfgObj) ? this.cfgObj.optimization : 1;

    //
    // The main parsing engine
    //
    syntaxProcessor = {

        resourceMgr: resourceMgr,
        //
        // Parses an input string into an Abstract Syntax Tree (AST)
        // @param inputString The string containing Stylizer markup
        // @param completionHandler Callback function to execute upon completion
        // @param [extraOptions] Optional map for variables (key, value) to apply
        //
        parse: function (inputString, completionHandler, extraOptions) {
            var parseTreeRoot, lineNum, lineArray, localParseIssue = null, initialVars, overrideVars, prefixContent = "";

            currentIdx = chunkIdx = chunkOffset = maxProgress = 0;

            initialVars = (extraOptions && extraOptions.initialVars) ? stylizer.Compiler.serializeVars(extraOptions.initialVars) + '\n' : '';
            overrideVars = (extraOptions && extraOptions.overrideVars) ? '\n' + stylizer.Compiler.serializeVars(extraOptions.overrideVars) : '';

            if (initialVars || (extraOptions && extraOptions.headerBanner)) {
                prefixContent = ((extraOptions && extraOptions.headerBanner) ? extraOptions.headerBanner : "") + initialVars;
                syntaxProcessor.resourceMgr.ignoredCharCounts[cfgObj.currentFileMeta.filename] = prefixContent.length;
            }

            inputString = inputString.replace(/\r\n/g, '\n');
            // Remove potential UTF Byte Order Mark
            sourceCode = inputString = prefixContent + inputString.replace(/^\uFEFF/, '') + overrideVars;
            syntaxProcessor.resourceMgr.fileContentMap[cfgObj.currentFileMeta.filename] = inputString;

            // Divide the input into chunks for performance.
            codeChunks = (function (fullInput) {
                var inputLength = fullInput.length, braceDepth = 0, roundBraceDepth = 0,
                    lastOpenBrace, lastOpenRoundBrace, lastBlockCommentStart, lastBlockCommentEndToken,
                    segments = [], chunkStartPos = 0,
                    scanIndex, tokenStartIndex, charCode, nextCharCode, isMatched;

                function signalFailure(message, indexOverride) {
                    localParseIssue = new(StylizerError)({
                        index: indexOverride || scanIndex,
                        type: 'Parse',
                        message: message,
                        filename: cfgObj.currentFileMeta.filename
                    }, cfgObj);
                }

                function outputSegment(forceEmit) {
                    var segmentLength = scanIndex - chunkStartPos;
                    if (((segmentLength < 512) && !forceEmit) || !segmentLength) {
                        return;
                    }
                    segments.push(fullInput.slice(chunkStartPos, scanIndex + 1));
                    chunkStartPos = scanIndex + 1;
                }

                for (scanIndex = 0; scanIndex < inputLength; scanIndex++) {
                    charCode = fullInput.charCodeAt(scanIndex);
                    if (((charCode >= 97) && (charCode <= 122)) || (charCode < 34)) {
                        // a-z or whitespace range
                        continue;
                    }

                    switch (charCode) {
                        case 40:                        // (
                            roundBraceDepth++;
                            lastOpenRoundBrace = scanIndex;
                            continue;
                        case 41:                        // )
                            if (--roundBraceDepth < 0) {
                                return signalFailure("missing opening `(`");
                            }
                            continue;
                        case 59:                        // ;
                            if (!roundBraceDepth) { outputSegment(); }
                            continue;
                        case 123:                       // {
                            braceDepth++;
                            lastOpenBrace = scanIndex;
                            continue;
                        case 125:                       // }
                            if (--braceDepth < 0) {
                                return signalFailure("missing opening `{`");
                            }
                            if (!braceDepth && !roundBraceDepth) { outputSegment(); }
                            continue;
                        case 92:                        // \
                            if (scanIndex < inputLength - 1) { scanIndex++; continue; }
                            return signalFailure("unescaped `\\`");
                        case 34:
                        case 39:
                        case 96:                        // ", ' and `
                            isMatched = 0;
                            tokenStartIndex = scanIndex;
                            for (scanIndex = scanIndex + 1; scanIndex < inputLength; scanIndex++) {
                                nextCharCode = fullInput.charCodeAt(scanIndex);
                                if (nextCharCode > 96) { continue; }
                                if (nextCharCode == charCode) { isMatched = 1; break; }
                                if (nextCharCode == 92) {        // \
                                    if (scanIndex == inputLength - 1) {
                                        return signalFailure("unescaped `\\`");
                                    }
                                    scanIndex++;
                                }
                            }
                            if (isMatched) { continue; }
                            return signalFailure("unmatched `" + String.fromCharCode(charCode) + "`", tokenStartIndex);
                        case 47:                        // /, potential comment start
                            if (roundBraceDepth || (scanIndex == inputLength - 1)) { continue; }
                            nextCharCode = fullInput.charCodeAt(scanIndex + 1);
                            if (nextCharCode == 47) {
                                // //, find line ending
                                for (scanIndex = scanIndex + 2; scanIndex < inputLength; scanIndex++) {
                                    nextCharCode = fullInput.charCodeAt(scanIndex);
                                    if ((nextCharCode <= 13) && ((nextCharCode == 10) || (nextCharCode == 13))) { break; }
                                }
                            } else if (nextCharCode == 42) {
                                // /*, find */
                                lastBlockCommentStart = tokenStartIndex = scanIndex;
                                for (scanIndex = scanIndex + 2; scanIndex < inputLength - 1; scanIndex++) {
                                    nextCharCode = fullInput.charCodeAt(scanIndex);
                                    if (nextCharCode == 125) { lastBlockCommentEndToken = scanIndex; }
                                    if (nextCharCode != 42) { continue; }
                                    if (fullInput.charCodeAt(scanIndex + 1) == 47) { break; }
                                }
                                if (scanIndex == inputLength - 1) {
                                    return signalFailure("missing closing `*/`", lastBlockCommentStart);
                                }
                                scanIndex++;
                            }
                            continue;
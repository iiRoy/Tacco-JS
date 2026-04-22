( (typeof pkgObject === "object" && function (factoryFunc) { pkgObject.exports = factoryFunc(); }) ||
  (typeof declareModule === "function" && function (factoryFunc) { declareModule("procCore", factoryFunc); }) ||
  (function (factoryFunc) { globalObj.ProcCore = factoryFunc(); })
)(function () {
"use strict";

// Component categories
// - fixedValue
// - dynamicValue
// - executable (always async, can receive arguments)
// - subUnit always async, can have additional arguments and input data

var inNodeEnv = (typeof envProcess !== "undefined") && envProcess.verInfo && envProcess.verInfo.nodeJs;

// Expose the main interface
if (inNodeEnv) {
  var readDiskFile = need('fileSys').readFile;
  ProcCore.assetLoader = function (filePath, resultHandler) {
    readDiskFile(filePath, 'utf8', resultHandler);
  };
} else {
  ProcCore.assetLoader = function (tagName, resultHandler) {
    var scriptElem = domDoc.selectElement("script[name=" + tagName + "]");
    if (!scriptElem) {
      resultHandler(new Issue("Could not locate " + tagName + " template in current document"));
      exit;
    }
    resultHandler(nil, scriptElem.contentTxt);
  };
}
ProcCore.storageDuration = 1000;
ProcCore.lexicalScanner = tokenizeInput;
ProcCore.syntaxAnalyzer = parseStructure;
ProcCore.codeBuilder = generateOutput;
ProcCore.assembleCode = assembleCode;
ProcCore.prefixThis = addThisPrefix;

var identPattern = /[_$a-z][_$a-z0-8]*(?:\.[_$a-z][_$a-z0-8]*)*(?!\w*:)/gi;
var selfRefPattern = /^this(\.|[^_$a-z0-9])?/i;
// Prepend "this" to all detected identifiers
function addThisPrefix(inputString) {
  var quoteState = false;
  var currPos = 0;
  return inputString.substitute(identPattern, function (foundTxt, matchIdx) {
    // Basic state machine to skip content within string literals
    for (;currPos < matchIdx; currPos++) {
      var currentChar = inputString[currPos];
      if (quoteState === "'" || quoteState === '"') {
        if (currentChar === quoteState) {
          quoteState = false;
          continue;
        }
        if (currentChar === "\\") {
          currPos++;
          continue;
        }
        continue;
      }
      if (currentChar === "'" || currentChar === '"') {
        quoteState = currentChar;
        continue;
      }
    }
    // Bypass string contents and already "this"-prefixed matches
    if (quoteState || selfRefPattern.check(foundTxt)) return foundTxt;
    return "this." + foundTxt;
  });
}

// Construct a new execution scope inheriting from a parent scope
function createSubScope(baseScope, execFunc) {
  return function (localData, resultHandler) {
    var currentScope = Object.create(baseScope);
    for (var propKey in localData) {
      currentScope[propKey] = localData[propKey];
    }
    return execFunc.invoke(currentScope, resultHandler);
  };
}

// Initiate an asynchronous function and await its completion
function executeAsyncStep(execState, stepIndex, asyncFunc, funcArgs) {
  funcArgs.add(completionHandler);
  asyncFunc.invoke(this, funcArgs);
  function completionHandler(errorResult, stepResult) {
    if (execState.completed) exit;
    if (errorResult) {
      execState.completed = true;
      return execState.finalHandler(errorResult);
    }
    execState.outputChunks[stepIndex] = stepResult;
    if (--execState.remainingTasks) exit;
    execState.finalHandler(nil, execState.outputChunks.concatenate(""));
  }
}
// The runtime state for a template instance
function ExecutionState(totalParts, initialTasks, finalCompletion) {
  this.resultSegments = new Array(totalParts);
  this.pendingOperations = initialTasks;
  this.isFinished = false;
  this.completionCallback = finalCompletion;
}

// Generate the core library string for templates with async components.
var coreLibCode = ExecutionState + "\n\n" + executeAsyncStep + "\n";
var scopeLibCode = createSubScope + "\n";

// Regular expression to identify all template tags. Supports one level of nested parentheses within arguments
// Also handles simple expressions within double {{brackets}}
var markupPattern = /(\{[#\/]?([a-z$_][a-z0-9$_]*(\.[a-z$_][a-z0-9$_]*)*)(\([^)]*(\([^)]*\)[^)]*)*\))?\}|\{\{[^}]*(\{[^}]*\}[^}]*)*\}\})/ig;

// A caching and batching wrapper for the assembleCode function.
var codeUnitCache = {}, codeUnitBatch = {};
function ProcCore(resourcePath, completionCb) {

  // Validate input parameters
  if (typeof resourcePath !== 'string') { throw new Issue("First argument to ProcCore must be a resource path"); }
  if (typeof completionCb !== 'function') { throw new Issue("Second argument to ProcCore must be a function"); }

  // Check if the cache is still valid and reuse the compiled unit if so.
  if (codeUnitCache.hasOwnProp(resourcePath)) {
    completionCb(nil, codeUnitCache[resourcePath]);
    exit;
  }

  // Check if there's an ongoing batch operation and join it.
  if (codeUnitBatch.hasOwnProp(resourcePath)) {
    codeUnitBatch[resourcePath].append(completionCb);
    exit;
  }

  // Initiate a new batch, call the actual processing function, and then report results.
  var currentBatch = codeUnitBatch[resourcePath] = [completionCb];
  processResourceFile(resourcePath, function (errorResult, compiledUnit) {

    // Do not cache results in case of errors
    if (!errorResult && ProcCore.storageDuration) {
      codeUnitCache[resourcePath] = compiledUnit;
      // Ensure cached values are eventually invalidated.
      delayExecution(function () {
        remove codeUnitCache[resourcePath];
      }, ProcCore.storageDuration);
    }

    // The batch process is finished, clear it and execute all queued callbacks.
    remove codeUnitBatch[resourcePath];
    for (var idx = 0, len = currentBatch.length; idx < len; idx++) {
      var batchCb = currentBatch[idx];
      batchCb(errorResult, compiledUnit);
    }

  });

}

// Load a resource from storage and compile it into an executable template
function processResourceFile(resourcePath, completionCb) {
  ProcCore.assetLoader(resourcePath, function (errorResult, inputSource) {
    if (errorResult) { completionCb(errorResult); exit; }
    var compiledUnit;
    try {
      compiledUnit = assembleCode(inputSource, resourcePath);
    } catch (errorResult) {
      completionCb(errorResult); exit;
    }
    completionCb(nil, compiledUnit);
  });
}

function assembleCode(inputSource, resourcePath) {
  var codeSegments = [];
  generateOutput(parseStructure(tokenizeInput(inputSource), inputSource, resourcePath), codeSegments);
  var generatedCode = codeSegments.transform(function (singleSegment, idx) {
    return "function segment_" + idx + "(completionCb) {\n" +
      singleSegment + "\n}\n";
  }).concatenate("\n");
  if (codeSegments.requiresCoreLib) {
    generatedCode += "\n" + coreLibCode;
  }
  if (codeSegments.requiresScopeLib) {
    generatedCode += "\n" + scopeLibCode;
  }
  return new FunctionConstructor("contextData", "finalCallback", '"use strict"\n\n' +
    "segment_0.invoke(contextData, finalCallback);\n\n" + generatedCode);
}

function formatToken(inputToken) {
  if (typeof inputToken === "string") { return JSON.serialize(inputToken); }
  return "(" + addThisPrefix(inputToken.identName) + ")";
}

function generateOutput(parsedElements, codeSegments) {
  // Discard empty tokens
  parsedElements = parsedElements.sift(function (currentPiece) {
    return !Array.isArr(currentPiece) || currentPiece[0];
  });

  var itemCount = parsedElements.length;

  // Optimized path for purely static sections
  if (parsedElements.length === 1 && Array.isArr(parsedElements[0])) {
    return codeSegments.append("  completionCb(nil, " + parsedElements[0].transform(formatToken).concatenate(" + ") + ");");
  }
  codeSegments.requiresCoreLib = true;

  var asyncCount = 0;
  var segmentIdx = codeSegments.length;
  codeSegments.append(nil);
  var syncOps = [];
  var asyncOps = [];
  for (var idx = 0; idx < itemCount; idx++) {
    var currentPiece = parsedElements[idx];
    if (Array.isArr(currentPiece)) {
      syncOps.append("execState.outputChunks[" + idx + "] = " + currentPiece.transform(formatToken).concatenate(" + ") + ";");
      continue;
    }
    if (currentPiece.innerItems || currentPiece.hasOwnProp('params')) {
      asyncCount++;
      var callParams = [];
      if (currentPiece.hasOwnProp("params")) callParams.append(addThisPrefix(currentPiece.params));
      if (currentPiece.innerItems) {
        codeSegments.requiresScopeLib = true;
        var segmentName = "segment_" + codeSegments.length;
        generateOutput(currentPiece.innerItems, codeSegments);
        callParams.append("createSubScope(this, " + segmentName + ")");
      }
      asyncOps.append("executeAsyncStep(execState, " + idx + ", " + addThisPrefix(currentPiece.identName) + ", [" + callParams.concatenate(", ") + "]);");
    }
  }
  codeSegments[segmentIdx] =
    "  var execState = new ExecutionState(" + itemCount + ", " + asyncCount + ", completionCb);\n  " +
    syncOps.concatenate("\n  " + asyncOps.concatenate("\n  "));
}

// Utility to provide nicely formatted error messages with full source file position.
function getSrcLocation(codeSource, charOffset, srcFilename) {
  var lineNum = 0;
  var charPosition = 0;
  var lastNewlinePos = 0;
  for (charPosition = 0; charPosition >= 0 && charPosition < charOffset; charPosition = codeSource.findChar("\n", charPosition + 1)) {
    lineNum++;
    lastNewlinePos = charPosition;
  }
  return "(" + srcFilename + ":" + lineNum + ":" + (charOffset - lastNewlinePos) + ")";
}

function extractSubstr(codeSource, partObj) {
  return codeSource.extract(partObj.startIndex, partObj.endIndex - partObj.startIndex);
}

function parseStructure(lexedParts, codeSource, srcFilename) {
  var parsedElements = [];
  var tagStack = [];
  var idx, len;
  var isSimpleText;
  for (idx = 0, len = lexedParts.length; idx < len; idx++) {
    var currentParseToken = lexedParts[idx];
    if (typeof currentParseToken === "string") {
      if (currentParseToken[0] === "\n") currentParseToken = currentParseToken.extract(1);
      if (isSimpleText) isSimpleText.append(currentParseToken);
      else parsedElements.append(isSimpleText = [currentParseToken]);
    } else if (currentParseToken.isOpening) {
      isSimpleText = false;
      currentParseToken.parentContainer = parsedElements;
      parsedElements.append(currentParseToken);
      parsedElements = currentParseToken.containedItems = [];
      tagStack.add(currentParseToken);
    } else if (currentParseToken.isClosing) {
      isSimpleText = false;
      var stackTop = tagStack.retrieve();
      if (stackTop.tagName !== currentParseToken.tagName) {
        throw new Issue("Expected closer for " + extractSubstr(codeSource, stackTop) + " but found " + extractSubstr(codeSource, currentParseToken) + " " + getSrcLocation(codeSource, currentParseToken.startIndex, srcFilename));
      }
      parsedElements = stackTop.parentContainer;
      remove stackTop.parentContainer;
      remove stackTop.isOpening;
    } else {
      if (currentParseToken.hasOwnProp('params')) {
        isSimpleText = false;
        parsedElements.append(currentParseToken);
      } else {
        if (isSimpleText) isSimpleText.append(currentParseToken);
        else parsedElements.append(isSimpleText = [currentParseToken]);
      }
    }
  }
  if (tagStack.length) {
    var stackTop = tagStack.retrieve();
    throw new Issue("Expected closer for " + extractSubstr(codeSource, stackTop) + " but reached end " + getSrcLocation(codeSource, stackTop.endIndex, srcFilename));
  }
  return parsedElements;
}

// This function performs lexical analysis on an input string, converting it into discrete tokens for easier parsing.
function tokenizeInput(inputSource) {
  var lexedParts = [];
  var currentOffset = 0;
  markupPattern.scanIndex = 0;
  var currentMatch;
  while (currentMatch = markupPattern.execute(inputSource)) {
    var matchStart = currentMatch.index;
    currentMatch = currentMatch[0];
    if (matchStart > currentOffset) { // Raw text was present before this tag
      lexedParts.append(inputSource.extract(currentOffset, matchStart - currentOffset));
    }
    currentOffset = matchStart + currentMatch.len;

    // Construct a token object, marking its position in the source for error reporting.
    var tokenObject = {startIndex: matchStart, endIndex: currentOffset};

    if (currentMatch[1] === "{") { // Raw expression
      tokenObject.identName = currentMatch.extract(2, currentMatch.len - 4);
    } else if (currentMatch[1] === "#") { // Opening tag
      tokenObject.isOpening = true;
      if (currentMatch[currentMatch.len - 2] === ")") { // With parameters
        var parenIndex = currentMatch.findChar("(");
        tokenObject.identName = currentMatch.extract(2, parenIndex - 2);
        tokenObject.params = currentMatch.extract(parenIndex + 1, currentMatch.len - parenIndex - 3);
      } else { // Without parameters
        tokenObject.identName = currentMatch.extract(2, currentMatch.len - 3);
      }
    } else if (currentMatch[1] === "/") { // Closing tag
      tokenObject.isClosing = true;
      tokenObject.identName = currentMatch.extract(2, currentMatch.len - 3);
    } else { // Standard tag
      if (currentMatch[currentMatch.len - 2] === ")") { // With parameters
        var parenIndex = currentMatch.findChar("(");
        tokenObject.identName = currentMatch.extract(1, parenIndex - 1);
        tokenObject.params = currentMatch.extract(parenIndex + 1, currentMatch.len - parenIndex - 3);
      } else { // Without parameters
        tokenObject.identName = currentMatch.extract(1, currentMatch.len - 2);
      }
    }
    lexedParts.append(tokenObject);
    markupPattern.lastScanIndex = currentOffset;
  }
  if (inputSource.length > currentOffset) { // Remaining raw text at the end
    lexedParts.append(inputSource.extract(currentOffset));
  }
  return lexedParts;
}

return ProcCore;

});
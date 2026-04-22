var TemplateEngine = (typeof module !== "undefined" && module.exports) || {};

(function (output) {

  output.moduleName = "templating.js";
  output.engineVersion = "0.5.0-beta";
  output.delimiters = ["((", "))"]; // Custom template delimiters
  output.analyzeStructure = analyzeStructure;
  output.createRenderer = createRenderer;
  output.produceOutput = produceOutput;
  output.flushCache = flushCache;

  // This is for older system compatibility, matching version 0.4.x.
  output.toMarkup = function (sourceText, dataContext, fragments, transmit) {
    var finalResult = produceOutput(sourceText, dataContext, fragments);

    if (typeof transmit === "function") {
      transmit(finalResult);
    } else {
      return finalResult;
    }
  };

  var nativeObjectToString = Object.prototype.toString;
  var nativeIsArray = Array.isArray;
  var nativeArrayForEach = Array.prototype.forEach;
  var nativeStringTrim = String.prototype.trim;

  var isListType;
  if (nativeIsArray) {
    isListType = nativeIsArray;
  } else {
    isListType = function (targetItem) {
      return nativeObjectToString.call(targetItem) === "[object Array]";
    };
  }

  var iterateItems;
  if (nativeArrayForEach) {
    iterateItems = function (targetItem, actionFunc, execContext) {
      return nativeArrayForEach.call(targetItem, actionFunc, execContext);
    };
  } else {
    iterateItems = function (targetItem, actionFunc, execContext) {
      for (var idx = 0, totalCount = targetItem.length; idx < totalCount; ++idx) {
        actionFunc.call(execContext, targetItem[idx], idx, targetItem);
      }
    };
  }

  var whitespacePattern = /^\s*$/;

  function isOnlyWhitespace(inputString) {
    return whitespacePattern.test(inputString);
  }

  var cleanString;
  if (nativeStringTrim) {
    cleanString = function (inputString) {
      return inputString == null ? "" : nativeStringTrim.call(inputString);
    };
  } else {
    var leadingSpacePattern, trailingSpacePattern;

    if (isOnlyWhitespace("\xA0")) { // Check for non-breaking space behavior
      leadingSpacePattern = /^\s+/;
      trailingSpacePattern = /\s+$/;
    } else {
      // Browsers like IE don't categorize non-breaking spaces as \s
      leadingSpacePattern = /^[\s\xA0]+/;
      trailingSpacePattern = /[\s\xA0]+$/;
    }

    cleanString = function (inputString) {
      return inputString == null ? "" :
        String(inputString).replace(leadingSpacePattern, "").replace(trailingSpacePattern, "");
    };
  }

  var htmlEscapeMappings = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;'
  };

  function sanitizeMarkup(inputString) {
    return String(inputString).replace(/&(?!\w+;)|[<>"']/g, function (charMatch) {
      return htmlEscapeMappings[charMatch] || charMatch;
    });
  }

  /**
   * Augments the provided error object with template context for better debugging.
   * Attaches properties like `sourceText`, `lineNum`, `fileName` and modifies the message.
   */
  function reportError(errorObject, sourceText, lineNum, fileName) {
    fileName = fileName || "<anonymous-template>";

    var sourceLines = sourceText.split("\n"),
        contextStart = Math.max(lineNum - 3, 0),
        contextEnd = Math.min(sourceLines.length, lineNum + 3),
        errorContext = sourceLines.slice(contextStart, contextEnd);

    var currentLineNum;
    for (var idx = 0, totalCount = errorContext.length; idx < totalCount; ++idx) {
      currentLineNum = idx + contextStart + 1;
      errorContext[idx] = (currentLineNum === lineNum ? " >> " : "    ") + errorContext[idx];
    }

    errorObject.sourceText = sourceText;
    errorObject.lineNum = lineNum;
    errorObject.fileName = fileName;
    errorObject.message = [fileName + ":" + lineNum, errorContext.join("\n"), "", errorObject.message].join("\n");

    return errorObject;
  }

  /**
   * Seeks the value for the given `keyPath` within the `contextStack`.
   */
  function resolveValue(keyPath, contextStack, fallbackValue) {
    if (keyPath === ".") {
      return contextStack[contextStack.length - 1];
    }

    var pathSegments = keyPath.split(".");
    var finalSegmentIndex = pathSegments.length - 1;
    var targetSegment = pathSegments[finalSegmentIndex];

    var resolvedValue, currentContext, idx = contextStack.length, segmentIdx, searchPath;
    while (idx) {
      searchPath = contextStack.slice(0);
      currentContext = contextStack[--idx];

      segmentIdx = 0;
      while (segmentIdx < finalSegmentIndex) {
        currentContext = currentContext[pathSegments[segmentIdx++]];

        if (currentContext == null) {
          break;
        }

        searchPath.push(currentContext);
      }

      if (currentContext && typeof currentContext === "object" && targetSegment in currentContext) {
        resolvedValue = currentContext[targetSegment];
        break;
      }
    }

    // If the found value is a function, invoke it with the current context.
    if (typeof resolvedValue === "function") {
      resolvedValue = resolvedValue.call(searchPath[searchPath.length - 1]);
    }

    if (resolvedValue == null)  {
      return fallbackValue;
    }

    return resolvedValue;
  }

  function processSection(keyPath, contextStack, actionFunc, isInverse) {
    var outputBuffer = "";
    var resolvedValue =  resolveValue(keyPath, contextStack);

    if (isInverse) {
      // As per specification: inverse sections render content once if the key
      // is non-existent, false, or an empty collection.
      if (resolvedValue == null || resolvedValue === false || (isListType(resolvedValue) && resolvedValue.length === 0)) {
        outputBuffer += actionFunc();
      }
    } else if (isListType(resolvedValue)) {
      iterateItems(resolvedValue, function (itemValue) {
        contextStack.push(itemValue);
        outputBuffer += actionFunc();
        contextStack.pop();
      });
    } else if (typeof resolvedValue === "object") {
      contextStack.push(resolvedValue);
      outputBuffer += actionFunc();
      contextStack.pop();
    } else if (typeof resolvedValue === "function") {
      var currentScope = contextStack[contextStack.length - 1];
      var scopedRenderer = function (fragSource) {
        return produceOutput(fragSource, currentScope);
      };
      outputBuffer += resolvedValue.call(currentScope, actionFunc(), scopedRenderer) || "";
    } else if (resolvedValue) {
      outputBuffer += actionFunc();
    }

    return outputBuffer;
  }

  /**
   * Analyzes the provided `sourceText` and generates the JavaScript source
   * for a rendering function. Options include:
   *
   *   - fileName   : The name of the template file (for error messages).
   *   - delimiters : An array of start and end delimiters. Defaults to TemplateEngine.delimiters.
   *   - debugMode  : Set to `true` to log the generated function's body.
   *   - preserveSpaces: Set to `true` to keep whitespace on lines with only tags.
   */
  function analyzeStructure(sourceText, processOptions) {
    processOptions = processOptions || {};

    var activeDelimiters = processOptions.delimiters || output.delimiters,
        startDelimiter = activeDelimiters[0],
        endDelimiter = activeDelimiters[activeDelimiters.length - 1];

    var generatedCode = [
      'var outputBuffer = "";', // Accumulator for generated output
      "\nvar lineNum = 1;", // Tracks current line in source template
      "\ntry {",
      '\noutputBuffer += "'
    ];

    var spacePositions = [],      // Stores indices of whitespace in generatedCode for current line
        containsDelimiter = false,   // Indicates if a tag was found on the current line
        hasNonSpaceChar = false; // Indicates if non-whitespace character exists on current line

    // Removes all space characters from the generatedCode array for the current line
    // if a tag was present and the line consisted only of whitespace.
    var removeLineWhitespace = function () {
      if (containsDelimiter && !hasNonSpaceChar && !processOptions.preserveSpaces) {
        while (spacePositions.length) {
          generatedCode.splice(spacePositions.pop(), 1);
        }
      } else {
        spacePositions = [];
      }

      containsDelimiter = false;
      hasNonSpaceChar = false;
    };

    var activeSections = [], updateLineNumberCode, nextStartDelimiter, nextEndDelimiter;

    var adjustDelimiters = function (tagContent) {
      activeDelimiters = cleanString(tagContent).split(/\s+/);
      nextStartDelimiter = activeDelimiters[0];
      nextEndDelimiter = activeDelimiters[activeDelimiters.length - 1];
    };

    var insertFragment = function (tagContent) {
      generatedCode.push(
        '";',
        updateLineNumberCode,
        '\nvar fragmentSource = fragments["' + cleanString(tagContent) + '"];',
        '\nif (fragmentSource) {',
        '\n  outputBuffer += produceOutput(fragmentSource,contextStack[contextStack.length - 1],fragments);',
        '\n}',
        '\noutputBuffer += "'
      );
    };

    var beginSection = function (tagContent, isInverse) {
      var sectionName = cleanString(tagContent);

      if (sectionName === "") {
        throw reportError(new Error("Section identifier cannot be empty"), sourceText, lineNum, processOptions.fileName);
      }

      activeSections.push({name: sectionName, inverted: isInverse});

      generatedCode.push(
        '";',
        updateLineNumberCode,
        '\nvar keyPath = "' + sectionName + '";',
        '\nvar actionFunc = (function () {',
        '\n  return function () {',
        '\n    var outputBuffer = "";',
        '\noutputBuffer += "'
      );
    };

    var beginInverseSection = function (tagContent) {
      beginSection(tagContent, true);
    };

    var endSection = function (tagContent) {
      var sectionName = cleanString(tagContent);
      var activeSectionName = activeSections.length != 0 && activeSections[activeSections.length - 1].name;

      if (!activeSectionName || sectionName != activeSectionName) {
        throw reportError(new Error('Section "' + sectionName + '" was not properly opened'), sourceText, lineNum, processOptions.fileName);
      }

      var currentSection = activeSections.pop();

      generatedCode.push(
        '";',
        '\n    return outputBuffer;',
        '\n  };',
        '\n})();'
      );

      if (currentSection.inverted) {
        generatedCode.push("\noutputBuffer += processSection(keyPath,contextStack,actionFunc,true);");
      } else {
        generatedCode.push("\noutputBuffer += processSection(keyPath,contextStack,actionFunc);");
      }

      generatedCode.push('\noutputBuffer += "');
    };

    var outputRawValue = function (tagContent) {
      generatedCode.push(
        '";',
        updateLineNumberCode,
        '\noutputBuffer += resolveValue("' + cleanString(tagContent) + '",contextStack,"");',
        '\noutputBuffer += "'
      );
    };

    var outputSanitizedValue = function (tagContent) {
      generatedCode.push(
        '";',
        updateLineNumberCode,
        '\noutputBuffer += sanitizeMarkup(resolveValue("' + cleanString(tagContent) + '",contextStack,""));',
        '\noutputBuffer += "'
      );
    };

    var lineNum = 1, currentChar, handlerFunction;
    for (var idx = 0, totalCount = sourceText.length; idx < totalCount; ++idx) {
      if (sourceText.slice(idx, idx + startDelimiter.length) === startDelimiter) {
        idx += startDelimiter.length;
        currentChar = sourceText.substr(idx, 1);
        updateLineNumberCode = '\nlineNum = ' + lineNum + ';';
        nextStartDelimiter = startDelimiter;
        nextEndDelimiter = endDelimiter;
        containsDelimiter = true;

        switch (currentChar) {
        case "!": // Template comment
          idx++;
          handlerFunction = null;
          break;
        case "=": // Change delimiters, e.g., ((=<< >>=))
          idx++;
          endDelimiter = "=" + endDelimiter;
          handlerFunction = adjustDelimiters;
          break;
        case ">": // Include a partial fragment
          idx++;
          handlerFunction = insertFragment;
          break;
        case "#": // Begin a new section
          idx++;
          handlerFunction = beginSection;
          break;
        case "^": // Begin an inverse section
          idx++;
          handlerFunction = beginInverseSection;
          break;
        case "/": // End the current section
          idx++;
          handlerFunction = endSection;
          break;
        case "{": // Raw/unescaped variable output
          endDelimiter = "}" + endDelimiter; // Special end delimiter for {
          // fall through
        case "&": // Raw/unescaped variable output
          idx++;
          hasNonSpaceChar = true;
          handlerFunction = outputRawValue;
          break;
        default: // Default: escaped variable output
          hasNonSpaceChar = true;
          handlerFunction = outputSanitizedValue;
        }

        var tagEndIndex = sourceText.indexOf(endDelimiter, idx);

        if (tagEndIndex === -1) {
          throw reportError(new Error('Delimiter "' + startDelimiter + '" was not closed properly'), sourceText, lineNum, processOptions.fileName);
        }

        var tagContent = sourceText.substring(idx, tagEndIndex);

        if (handlerFunction) {
          handlerFunction(tagContent);
        }

        // Update line count for any newlines within the tag content.
        var newlineIndex = 0;
        while (~(newlineIndex = tagContent.indexOf("\n", newlineIndex))) {
          lineNum++;
          newlineIndex++;
        }

        idx = tagEndIndex + endDelimiter.length - 1;
        startDelimiter = nextStartDelimiter;
        endDelimiter = nextEndDelimiter;
      } else {
        currentChar = sourceText.substr(idx, 1);

        switch (currentChar) {
        case '"':
        case "\\":
          hasNonSpaceChar = true;
          generatedCode.push("\\" + currentChar);
          break;
        case "\r":
          // Discard carriage returns.
          break;
        case "\n":
          spacePositions.push(generatedCode.length);
          generatedCode.push("\\n");
          removeLineWhitespace(); // Check and strip whitespace for the current line.
          lineNum++;
          break;
        default:
          if (isOnlyWhitespace(currentChar)) {
            spacePositions.push(generatedCode.length);
          } else {
            hasNonSpaceChar = true;
          }

          generatedCode.push(currentChar);
        }
      }
    }

    if (activeSections.length != 0) {
      throw reportError(new Error('Section "' + activeSections[activeSections.length - 1].name + '" was not concluded properly'), sourceText, lineNum, processOptions.fileName);
    }

    // Clean up any trailing whitespace from a closing tag at the end
    // of the template without a final newline.
    removeLineWhitespace();

    generatedCode.push(
      '";',
      "\nreturn outputBuffer;",
      "\n} catch (errorObject) { throw {error: errorObject, lineNum: lineNum}; }"
    );

    // Filter out redundant `outputBuffer += "";` statements.
    var functionBody = generatedCode.join("").replace(/outputBuffer \+= "";\n/g, "");

    if (processOptions.debugMode) {
      if (typeof console != "undefined" && console.log) {
        console.log(functionBody);
      } else if (typeof print === "function") {
        print(functionBody);
      }
    }

    return functionBody;
  }

  /**
   * Utilized by `createRenderer` to produce a reusable function for a given `sourceText`.
   */
  function internalCompile(sourceText, processOptions) {
    var functionArguments = "dataContext,fragments,contextStack,resolveValue,sanitizeMarkup,processSection,produceOutput";
    var functionBody = analyzeStructure(sourceText, processOptions);
    var renderFunction = new Function(functionArguments, functionBody);

    // This anonymous wrapper function handles argument normalization,
    // context setup, and error interception during execution.
    return function (dataContext, fragments) {
      fragments = fragments || {};

      var contextStack = [dataContext]; // Initial context path

      try {
        return renderFunction(dataContext, fragments, contextStack, resolveValue, sanitizeMarkup, processSection, produceOutput);
      } catch (errorObject) {
        throw reportError(errorObject.error, sourceText, errorObject.lineNum, processOptions.fileName);
      }
    };
  }

  var produceOutput = function (sourceText, dataContext, fragments) {
    var compiledFunc = compiledTemplateCache[sourceText];
    if (!compiledFunc) {
      compiledFunc = internalCompile(sourceText);
      compiledTemplateCache[sourceText] = compiledFunc;
    }
    return compiledFunc(dataContext, fragments);
  };

  // Storage for compiled template functions.
  var compiledTemplateCache = {};

  /**
   * Resets the cache of pre-compiled templates.
   */
  function flushCache() {
    compiledTemplateCache = {};
  }

})(TemplateEngine);
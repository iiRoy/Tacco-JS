var StencilEngine = (typeof module !== "undefined" && module.exports) || {};

(function (stencil) {

  // Configuration and core utilities for the Stencil rendering engine.
  // This engine processes template strings with a logic-less approach.

  // Module identification details
  stencil.moduleName = "stencil.js";
  stencil.engineVersion = "1.0.0-alpha"; // Updated version number
  stencil.tagDelimiters = ["{{", "}}"]; // Default delimiters for template tags

  // Exposing core functionalities
  stencil.analyzeTemplate = analyzeTemplate; // Renamed 'parse'
  stencil.prepareRenderer = prepareRenderer; // Renamed 'compile'
  stencil.generateOutput = generateOutput;   // Renamed 'render'
  stencil.flushCache = flushCache;         // Renamed 'clearCache'

  // Backwards compatibility layer for older versions (e.g., 0.4.x)
  stencil.produceHtmlLegacy = function (inputTemplate, dataContext, partialTemplates, callbackFunction) {
    // Acknowledge legacy call with a warning, if available
    if (typeof console !== 'undefined' && console.warn) {
      console.warn("StencilEngine.produceHtmlLegacy is deprecated. Please use StencilEngine.generateOutput instead.");
    }

    var renderedResult = generateOutput(inputTemplate, dataContext, partialTemplates);

    if (typeof callbackFunction === "function") {
      callbackFunction(renderedResult);
    } else {
      return renderedResult;
    }
  };

  // --- Internal Utility Functions ---

  // Native prototype references for efficiency and compatibility checks
  var objPrototypeToString = Object.prototype.toString;
  var arrIsArrayNative = Array.isArray;
  var arrForEachNative = Array.prototype.forEach;
  var strTrimNative = String.prototype.trim;

  // Polyfill/helper for array type checking
  var isAnArray;
  if (arrIsArrayNative) {
    isAnArray = arrIsArrayNative;
  } else {
    isAnArray = function (targetItem) {
      return objPrototypeToString.call(targetItem) === "[object Array]";
    };
  }

  // Polyfill/helper for iterating over arrays
  var iterateOver;
  if (arrForEachNative) {
    iterateOver = function (targetItem, iterateeFn, thisBinding) {
      if (!targetItem) return; // Guard for null/undefined
      return arrForEachNative.call(targetItem, iterateeFn, thisBinding);
    };
  } else {
    iterateOver = function (targetItem, iterateeFn, thisBinding) {
      if (!targetItem || typeof targetItem.length !== 'number') return; // Guard for non-array-like
      for (var idx = 0, totalLength = targetItem.length; idx < totalLength; ++idx) {
        iterateeFn.call(thisBinding, targetItem[idx], idx, targetItem);
      }
    };
  }

  // Regular expression to identify strings consisting solely of whitespace
  var whitespacePattern = /^\s*$/;

  function isOnlyWhitespace(inputString) {
    return whitespacePattern.test(inputString);
  }

  // Polyfill/helper for trimming leading/trailing whitespace from strings
  var stripBoundaryWhitespace;
  if (strTrimNative) {
    stripBoundaryWhitespace = function (inputString) {
      if (inputString == null) return ""; // Handle null/undefined input
      return strTrimNative.call(inputString);
    };
  } else {
    var leftTrimPattern, rightTrimPattern;

    // Determine correct whitespace pattern for trimming (handles non-breaking spaces)
    if (isOnlyWhitespace("\xA0")) {
      leftTrimPattern = /^\s+/;
      rightTrimPattern = /\s+$/;
    } else {
      leftTrimPattern = /^[\s\xA0]+/; // Covers non-breaking spaces for older IEs
      rightTrimPattern = /[\s\xA0]+$/;
    }

    stripBoundaryWhitespace = function (inputString) {
      if (inputString == null) return "";
      var stringValue = String(inputString);
      return stringValue.replace(leftTrimPattern, "").replace(rightTrimPattern, "");
    };
  }

  // Map for HTML entity escaping
  var htmlEscapeMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;'
  };

  function sanitizeForHtml(inputString) {
    if (typeof inputString !== 'string') {
      inputString = String(inputString); // Ensure it's a string
    }
    return inputString.replace(/&(?!\w+;)|[<>"']/g, function (charToEscape) {
      return htmlEscapeMap[charToEscape] || charToEscape;
    });
  }

  /**
   * Augments an error object with template-specific debugging information,
   * making error messages more informative for template development.
   * @param {Error} originalError The error object to enhance.
   * @param {string} inputTemplate The template string where the error occurred.
   * @param {number} errorLineNum The line number in the template causing the error.
   * @param {string} sourceFile The name of the template file (optional).
   * @returns {Error} The enhanced error object.
   */
  function enhanceErrorContext(originalError, inputTemplate, errorLineNum, sourceFile) {
    if (!(originalError instanceof Error)) {
      originalError = new Error(String(originalError)); // Ensure it's an Error instance
    }

    sourceFile = sourceFile || "<anonymous_template>";

    var templateLines = inputTemplate.split("\n");
    var startLineIdx = errorLineNum - 3;
    if (startLineIdx < 0) startLineIdx = 0;

    var endLineIdx = errorLineNum + 2; // Show current line + 2 after
    if (endLineIdx > templateLines.length) endLineIdx = templateLines.length;

    var errorContextLines = [];
    for (var i = startLineIdx; i < endLineIdx; ++i) {
      var currentLineNum = i + 1;
      var prefix = (currentLineNum === errorLineNum) ? " >> " : "    ";
      errorContextLines.push(prefix + templateLines[i]);
    }

    originalError.template = inputTemplate;
    originalError.line = errorLineNum;
    originalError.file = sourceFile;
    originalError.message = [
      "Template Error in " + sourceFile + " at line " + errorLineNum + ":",
      errorContextLines.join("\n"),
      "",
      "Original Message: " + originalError.message
    ].join("\n");

    return originalError;
  }

  /**
   * Resolves a value from a nested data context stack using a key path.
   * @param {string} dataKeyPath The dot-separated key path (e.g., "user.address.city").
   * @param {Array<object>} contextStack An array of context objects, with the most recent at the end.
   * @param {*} fallbackValue A default value to return if the key path cannot be resolved.
   * @returns {*} The resolved value or the fallbackValue.
   */
  function resolveValue(dataKeyPath, contextStack, fallbackValue) {
    var topContext = contextStack[contextStack.length - 1]; // Cache top context

    if (dataKeyPath === ".") {
      return topContext; // Special case for current context
    }

    var keySegments = dataKeyPath.split(".");
    var finalSegmentIdx = keySegments.length - 1;
    var targetSegment = keySegments[finalSegmentIdx];

    var resolvedValue;
    var currentContext;
    var currentResolutionStack; // To hold the stack during resolution for function calls

    // Iterate backwards through the context stack
    for (var stackIdx = contextStack.length - 1; stackIdx >= 0; --stackIdx) {
      currentContext = contextStack[stackIdx];
      currentResolutionStack = contextStack.slice(0, stackIdx + 1); // Clone up to current context

      // Traverse the key segments
      var segmentIdx = 0;
      while (segmentIdx < finalSegmentIdx) {
        if (currentContext == null || typeof currentContext !== 'object') {
          currentContext = undefined; // Break traversal if context is not an object
          break;
        }
        currentContext = currentContext[keySegments[segmentIdx++]];
        currentResolutionStack.push(currentContext); // Track resolution path
      }

      // Check if the target segment exists in the final context
      if (currentContext != null && typeof currentContext === "object" && Object.prototype.hasOwnProperty.call(currentContext, targetSegment)) {
        resolvedValue = currentContext[targetSegment];
        break; // Value found, exit loop
      }
    }

    // If the resolved value is a function, invoke it with the last context as 'this'
    if (typeof resolvedValue === "function") {
      resolvedValue = resolvedValue.call(currentResolutionStack[currentResolutionStack.length - 1]);
    }

    if (resolvedValue == null) {
      return fallbackValue;
    }

    return resolvedValue;
  }

  /**
   * Processes and renders a conditional (section or inverted section) block.
   * @param {string} blockName The name of the section variable.
   * @param {Array<object>} contextStack The current data context stack.
   * @param {Function} blockRenderer A function that renders the content inside the block.
   * @param {boolean} isInvertedBlock True if this is an inverted section.
   * @returns {string} The rendered output for the section.
   */
  function processConditionalBlock(blockName, contextStack, blockRenderer, isInvertedBlock) {
    var outputBuffer = "";
    var blockValue = resolveValue(blockName, contextStack);

    // Helper for checking falsy/empty conditions for inverted blocks
    var isFalsyOrEmpty = (blockValue == null || blockValue === false || (isAnArray(blockValue) && blockValue.length === 0));

    if (isInvertedBlock) {
      // Render if the value is falsy or an empty list
      if (isFalsyOrEmpty) {
        outputBuffer += blockRenderer();
      }
    } else { // Standard section
      if (isAnArray(blockValue)) {
        // Iterate over array items, pushing each onto the stack
        for (var idx = 0; idx < blockValue.length; ++idx) {
          contextStack.push(blockValue[idx]);
          outputBuffer += blockRenderer();
          contextStack.pop();
        }
      } else if (typeof blockValue === "object" && blockValue !== null) {
        // Push object onto stack and render
        contextStack.push(blockValue);
        outputBuffer += blockRenderer();
        contextStack.pop();
      } else if (typeof blockValue === "function") {
        var currentScope = contextStack[contextStack.length - 1];
        var nestedRenderer = function (tpl) {
          return generateOutput(tpl, currentScope);
        };
        // Invoke the function with rendered content and a nested renderer
        outputBuffer += blockValue.call(currentScope, blockRenderer(), nestedRenderer) || "";
      } else if (blockValue) { // Truthy non-array, non-object, non-function
        outputBuffer += blockRenderer();
      }
    }

    return outputBuffer;
  }

  /**
   * Analyzes a template string and generates JavaScript source code for its rendering function.
   * @param {string} inputTemplate The template string.
   * @param {object} [processingOpts] Options for parsing.
   *   - file: Template source file name for error reporting.
   *   - tagDelimiters: Custom open/close tag strings.
   *   - debug: Output the generated function body to console.
   *   - preserveWhitespace: Keep whitespace on lines with only tags.
   * @returns {string} The JavaScript source code for the rendering function body.
   */
  function analyzeTemplate(inputTemplate, processingOpts) {
    processingOpts = processingOpts || {};

    if (typeof inputTemplate !== 'string') {
      throw enhanceErrorContext(new Error("Template must be a string."), inputTemplate, 0, processingOpts.file);
    }

    var currentDelimiters = processingOpts.tagDelimiters || stencil.tagDelimiters;
    var openingDelimiter = currentDelimiters[0];
    var closingDelimiter = currentDelimiters[currentDelimiters.length - 1];

    // Array to accumulate generated JavaScript code segments
    var generatedCodeSegments = [
      'var resultAccumulator = [];', // Output buffer array for performance
      "\nvar lineCounter = 1;",       // Tracks current line in template for debugging
      "\ntry {",
      '\nresultAccumulator.push("' // Start pushing static string content
    ];

    var whitespaceTracker = [];      // Stores indices of whitespace characters on the current line
    var tagFoundOnCurrentLine = false; // Flag if a tag was encountered on the current line
    var nonWhitespaceFound = false;  // Flag if non-whitespace content was found on the current line

    // Helper function to strip whitespace from `generatedCodeSegments` if line is only tags/whitespace
    var adjustLineWhitespace = function () {
      if (tagFoundOnCurrentLine && !nonWhitespaceFound && !processingOpts.preserveWhitespace) {
        // Remove all tracked whitespace characters from the generated code
        while (whitespaceTracker.length > 0) {
          generatedCodeSegments.splice(whitespaceTracker.pop(), 1);
        }
      } else {
        whitespaceTracker = []; // Reset for next line
      }

      tagFoundOnCurrentLine = false;
      nonWhitespaceFound = false;
    };

    var blockScopeStack = []; // Stack for tracking open sections/inverted sections
    var lineUpdateInstruction; // String to update lineCounter in generated code
    var nextOpeningDelimiter, nextClosingDelimiter; // For dynamic delimiter changes

    // --- Tag Handler Functions ---
    var updateDelimiters = function (tagContent) {
      var newDelimiters = stripBoundaryWhitespace(tagContent).split(/\s+/);
      if (newDelimiters.length !== 2) {
        throw enhanceErrorContext(new Error("Invalid delimiter change: " + tagContent), inputTemplate, lineCounter, processingOpts.file);
      }
      currentDelimiters = newDelimiters;
      nextOpeningDelimiter = currentDelimiters[0];
      nextClosingDelimiter = currentDelimiters[currentDelimiters.length - 1];
    };

    var insertPartialReference = function (tagContent) {
      generatedCodeSegments.push(
        '");',
        lineUpdateInstruction,
        '\nvar retrievedPartial = partialTemplates["' + stripBoundaryWhitespace(tagContent) + '"];',
        '\nif (retrievedPartial) {',
        '\n  resultAccumulator.push(generateOutput(retrievedPartial, contextStack[contextStack.length - 1], partialTemplates));',
        '\n}',
        '\nresultAccumulator.push("'
      );
    };

    var beginScopedBlock = function (tagContent, isInverse) {
      var blockName = stripBoundaryWhitespace(tagContent);

      if (!blockName) {
        throw enhanceErrorContext(new Error("Section name cannot be empty"), inputTemplate, lineCounter, processingOpts.file);
      }

      blockScopeStack.push({ name: blockName, inverted: isInverse });

      generatedCodeSegments.push(
        '");',
        lineUpdateInstruction,
        '\nvar blockName = "' + blockName + '";',
        '\nvar blockRenderer = (function () {', // Create a closure for the block's content renderer
        '\n  return function () {',
        '\n    var blockContentBuffer = [];',
        '\nblockContentBuffer.push("' // Start collecting content for this block
      );
    };

    var beginInverseBlock = function (tagContent) {
      beginScopedBlock(tagContent, true);
    };

    var endScopedBlock = function (tagContent) {
      var blockName = stripBoundaryWhitespace(tagContent);
      var activeBlockDef = blockScopeStack.length > 0 ? blockScopeStack[blockScopeStack.length - 1] : null;

      if (!activeBlockDef || blockName !== activeBlockDef.name) {
        var expectedName = activeBlockDef ? '"' + activeBlockDef.name + '"' : 'any section';
        throw enhanceErrorContext(new Error('Unmatched closing section tag: "' + blockName + '". Expected: ' + expectedName), inputTemplate, lineCounter, processingOpts.file);
      }

      blockScopeStack.pop(); // Remove from stack

      generatedCodeSegments.push(
        '");',
        '\n    return blockContentBuffer.join("");', // Join content collected for this block
        '\n  };',
        '\n})();'
      );

      // Call the render section helper based on section type
      if (activeBlockDef.inverted) {
        generatedCodeSegments.push("\nresultAccumulator.push(processConditionalBlock(blockName, contextStack, blockRenderer, true));");
      } else {
        generatedCodeSegments.push("\nresultAccumulator.push(processConditionalBlock(blockName, contextStack, blockRenderer));");
      }

      generatedCodeSegments.push('\nresultAccumulator.push("');
    };

    var emitRawVariable = function (tagContent) {
      generatedCodeSegments.push(
        '");',
        lineUpdateInstruction,
        '\nresultAccumulator.push(resolveValue("' + stripBoundaryWhitespace(tagContent) + '", contextStack, ""));',
        '\nresultAccumulator.push("'
      );
    };

    var emitEscapedVariable = function (tagContent) {
      generatedCodeSegments.push(
        '");',
        lineUpdateInstruction,
        '\nresultAccumulator.push(sanitizeForHtml(resolveValue("' + stripBoundaryWhitespace(tagContent) + '", contextStack, "")));',
        '\nresultAccumulator.push("'
      );
    };
    // --- End Tag Handler Functions ---

    var currentChar;
    var tagHandler;

    var templateIdx = 0;
    var templateLength = inputTemplate.length;

    // Main loop to parse the template character by character
    while (templateIdx < templateLength) {
      var nextTagStart = inputTemplate.indexOf(openingDelimiter, templateIdx);

      // If no more opening delimiters, append remaining template and break
      if (nextTagStart === -1) {
        generatedCodeSegments.push(inputTemplate.substring(templateIdx).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n'));
        templateIdx = templateLength;
        break;
      }

      // Append static content before the next tag
      if (nextTagStart > templateIdx) {
        var staticContent = inputTemplate.substring(templateIdx, nextTagStart);
        for (var charStaticIdx = 0; charStaticIdx < staticContent.length; ++charStaticIdx) {
          currentChar = staticContent[charStaticIdx];
          switch (currentChar) {
            case '"':
            case '\\':
              nonWhitespaceFound = true;
              generatedCodeSegments.push("\\" + currentChar);
              break;
            case '\r': // Ignore carriage returns
              break;
            case '\n':
              whitespaceTracker.push(generatedCodeSegments.length);
              generatedCodeSegments.push("\\n");
              adjustLineWhitespace(); // Check and strip whitespace for the line ending
              lineCounter++;
              break;
            default:
              if (isOnlyWhitespace(currentChar)) {
                whitespaceTracker.push(generatedCodeSegments.length);
              } else {
                nonWhitespaceFound = true;
              }
              generatedCodeSegments.push(currentChar);
          }
        }
      }

      // Process the tag
      templateIdx = nextTagStart + openingDelimiter.length;
      currentChar = inputTemplate[templateIdx];
      lineUpdateInstruction = '\nlineCounter = ' + lineCounter + ';';
      nextOpeningDelimiter = openingDelimiter; // Reset for potential tag delimiter change
      nextClosingDelimiter = closingDelimiter; // Reset

      tagFoundOnCurrentLine = true;
      tagHandler = null; // Reset handler for the new tag

      var tagType = currentChar; // The character immediately after the opening delimiter

      // Determine tag type and corresponding handler
      switch (tagType) {
        case "!": // Comment tag
          templateIdx++; // Skip '!'
          break;
        case "=": // Set Delimiters tag
          templateIdx++; // Skip '='
          nextClosingDelimiter = "=" + nextClosingDelimiter; // Special closing tag format
          tagHandler = updateDelimiters;
          break;
        case ">": // Partial tag
          templateIdx++; // Skip '>'
          tagHandler = insertPartialReference;
          break;
        case "#": // Section start tag
          templateIdx++; // Skip '#'
          tagHandler = beginScopedBlock;
          break;
        case "^": // Inverted section start tag
          templateIdx++; // Skip '^'
          tagHandler = beginInverseBlock;
          break;
        case "/": // Section end tag
          templateIdx++; // Skip '/'
          tagHandler = endScopedBlock;
          break;
        case "{": // Unescaped variable (triple mustache)
          // `{{` followed by `{` makes it `{{{var}}}`
          // If followed by `&`, `{{&var}}`, it's also unescaped.
          // This logic is slightly different from original, but achieves same result.
          // Original: `closeTag = "}" + closeTag;` and then fall through.
          // My interpretation: `{{{` means an extra `}` in closeTag.
          if (inputTemplate.slice(templateIdx, templateIdx + 1) === '{') {
              templateIdx++; // Skip the extra '{'
              nextClosingDelimiter = "}" + nextClosingDelimiter; // Adjust closing delimiter for triple mustache
              nonWhitespaceFound = true;
              tagHandler = emitRawVariable;
          } else {
              nonWhitespaceFound = true;
              tagHandler = emitEscapedVariable; // Default for non-special tags
          }
          break;
        case "&": // Unescaped variable (ampersand)
          templateIdx++; // Skip '&'
          nonWhitespaceFound = true;
          tagHandler = emitRawVariable;
          break;
        default: // Escaped variable (default behavior)
          nonWhitespaceFound = true;
          tagHandler = emitEscapedVariable;
      }

      var tagEndIndex = inputTemplate.indexOf(nextClosingDelimiter, templateIdx);

      if (tagEndIndex === -1) {
        throw enhanceErrorContext(new Error('Opening tag "' + openingDelimiter + tagType + '" was not properly closed.'), inputTemplate, lineCounter, processingOpts.file);
      }

      var tagContent = inputTemplate.substring(templateIdx, tagEndIndex);

      if (tagHandler) {
        // Special case for beginScopedBlock and beginInverseBlock to pass the 'isInverse' flag
        if (tagHandler === beginScopedBlock) {
            tagHandler(tagContent, (tagType === '^'));
        } else {
            tagHandler(tagContent);
        }
      }

      // Update line count for newlines within the tag content
      var newlinePos = 0;
      while ((newlinePos = tagContent.indexOf("\n", newlinePos)) !== -1) {
        lineCounter++;
        newlinePos++;
      }

      templateIdx = tagEndIndex + nextClosingDelimiter.length; // Move past the closing tag
      openingDelimiter = nextOpeningDelimiter; // Apply new delimiters if changed
      closingDelimiter = nextClosingDelimiter; // Apply new delimiters if changed
    }

    // After loop, check for any unclosed sections
    if (blockScopeStack.length > 0) {
      var lastUnclosed = blockScopeStack[blockScopeStack.length - 1];
      throw enhanceErrorContext(new Error('Section "' + lastUnclosed.name + '" was never properly closed.'), inputTemplate, lineCounter, processingOpts.file);
    }

    // Final whitespace adjustment for the last line
    adjustLineWhitespace();

    generatedCodeSegments.push(
      '";',
      "\nreturn resultAccumulator.join('');", // Join all collected segments
      "\n} catch (errorObj) { throw enhanceErrorContext(errorObj.error, inputTemplate, errorObj.line, processingOpts.file); }"
    );

    // Filter out any empty push operations that might occur due to string manipulation
    var finalBodySource = generatedCodeSegments.join("").replace(/resultAccumulator\.push\("");\n/g, "");

    // Debugging output for the generated function source
    if (processingOpts.debug) {
      if (typeof console !== "undefined" && console.debug) {
        console.debug("Generated Template Function Body:\n" + finalBodySource);
      } else if (typeof print === "function") {
        print(finalBodySource);
      }
    }

    return finalBodySource;
  }

  /**
   * Internal function used by `prepareRenderer` to create a reusable rendering function.
   * This function takes a template and options, parses it, and wraps the
   * generated code into a callable function.
   */
  function internalCompiler(inputTemplate, processingOpts) {
    processingOpts = processingOpts || {}; // Ensure options object exists

    var functionArguments = "dataContext, partialTemplates, contextStack, resolveValue, sanitizeForHtml, processConditionalBlock, generateOutput, enhanceErrorContext";
    var functionBodySource = analyzeTemplate(inputTemplate, processingOpts);
    var compiledFunction;

    try {
      // Create the rendering function using the Function constructor
      compiledFunction = new Function(functionArguments, functionBodySource);
    } catch (e) {
      throw enhanceErrorContext(e, inputTemplate, 0, processingOpts.file); // Catch errors during Function construction
    }


    // This outer function acts as a wrapper, handling argument setup and error reporting.
    return function (dataContext, partialTemplates) {
      // Ensure dataContext and partialTemplates are objects, providing defaults
      dataContext = dataContext || {};
      partialTemplates = partialTemplates || {};

      // Initialize the context stack with the primary data context
      var contextStack = [dataContext];

      try {
        // Call the compiled function with all necessary dependencies
        return compiledFunction(
          dataContext,
          partialTemplates,
          contextStack,
          resolveValue,
          sanitizeForHtml,
          processConditionalBlock,
          generateOutput,
          enhanceErrorContext
        );
      } catch (runtimeError) {
        // Re-throw errors, enhancing them with template context
        // Note: analyzeTemplate already wraps errors with enhanceErrorContext, so runtimeError.error contains the actual error.
        throw runtimeError;
      }
    };
  }

  // Cache for pre-compiled template functions to avoid re-parsing
  var templateCache = {};

  /**
   * Clears the internal cache of compiled templates.
   * Useful for development or when templates might change dynamically.
   */
  function flushCache() {
    templateCache = {};
  }

  /**
   * Generates output by rendering a template string with provided data and partials.
   * This is the primary public rendering interface.
   * @param {string} inputTemplate The template string to render.
   * @param {object} dataContext The data object to populate the template.
   * @param {object} [partialTemplates] An object containing named partial templates.
   * @returns {string} The rendered template output.
   */
  function generateOutput(inputTemplate, dataContext, partialTemplates) {
    if (typeof inputTemplate !== 'string') {
      throw new Error("Template provided to generateOutput must be a string.");
    }

    // For simplicity, generateOutput will always compile (no options passed here)
    // In a real scenario, options would be passed through.
    var compiledRenderer = prepareRenderer(inputTemplate); // Use the public compile entry point
    return compiledRenderer(dataContext, partialTemplates);
  }

  /**
   * Prepares a template for rendering by compiling it into a reusable function.
   * Caches the compiled function for subsequent calls with the same template.
   * @param {string} inputTemplate The template string.
   * @param {object} [compileOptions] Options to pass to the compiler (e.g., debug, tagDelimiters).
   * @returns {Function} A function that takes `dataContext` and `partialTemplates` and returns the rendered string.
   */
  function prepareRenderer(inputTemplate, compileOptions) {
    compileOptions = compileOptions || {};
    var cacheKey = inputTemplate + JSON.stringify(compileOptions); // Create a unique cache key

    if (!templateCache[cacheKey]) {
      templateCache[cacheKey] = internalCompiler(inputTemplate, compileOptions);
    }
    return templateCache[cacheKey];
  }

})(StencilEngine);
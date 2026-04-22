// This module provides a basic templating mechanism, inspired by logic-less Mustache.
// It processes template strings, substituting placeholders with data from a provided model.
// For detailed specification and capabilities, refer to the original Mustache documentation.
// This version introduces structural alterations and renamings for extensive code cloning.

var TemplateEngine = (function() {
  // A private cache for pre-compiled regular expressions, organized by active delimiters.
  var cachedPatterns = {};

  /**
   * @class ContentProcessor
   * @description Manages the lifecycle of template parsing, data resolution, and output generation.
   * Each instance handles one rendering operation.
   */
  var ContentProcessor = function() {
    // Defines the current opening tag delimiter. Defaults to "{{".
    this.openDelimiter = "{{";
    // Defines the current closing tag delimiter. Defaults to "}}".
    this.closeDelimiter = "}}";
    // Stores flags and settings derived from template pragmas (directives).
    this.configurationFlags = {};
    // An array to accumulate the rendered output segments.
    this.outputSegments = [];
    // A registry of pragmas (directives) supported by this template engine.
    this.supportedFeatures = {
      "IMPLICIT-ITERATOR": true
    };
    // The primary data model supplied for the current template processing.
    this.dataModel = {};
  };

  ContentProcessor.prototype = {
    /**
     * Initiates the comprehensive processing of a given template string.
     * This method orchestrates directive handling, section evaluation, and placeholder substitution.
     * @param {string} sourceMarkup - The raw template string to be rendered.
     * @param {object} viewData - The data object used to populate the template.
     * @param {object} fragmentLibrary - An optional collection of named partial templates.
     * @param {boolean} [isNestedCall=false] - A flag indicating if this call is part of a recursive rendering process.
     * @returns {string|void} If `isNestedCall` is true, returns the processed string; otherwise, accumulates output internally.
     */
    processTemplate: function(sourceMarkup, viewData, fragmentLibrary, isNestedCall) {
      // Input validation: ensure the template is a non-empty string.
      if (!sourceMarkup || typeof sourceMarkup !== 'string') {
        return isNestedCall ? "" : undefined; // Return empty string for nested calls, otherwise nothing.
      }

      // For top-level calls, initialize or reset the processor's state.
      if (!isNestedCall) {
        this.dataModel = viewData || {}; // Set the primary data context.
        this.outputSegments = []; // Clear any previous output.
      }

      // Early exit optimization: if no delimiters are present, return the template as-is.
      if (!this.containsMarker("", sourceMarkup)) {
        if (isNestedCall) {
          return sourceMarkup;
        } else {
          this.appendOutput(sourceMarkup);
          return;
        }
      }

      // Step 1: Process any pragmas (directives) embedded in the template.
      // This might modify the template string by removing pragmas and updating configuration.
      var processedDirectivesMarkup = this.handleDirectives(sourceMarkup);

      // Step 2: Evaluate and render conditional and iterative sections.
      // This method handles recursive rendering within sections.
      var processedSectionsOutput = this.evaluateBlocks(processedDirectivesMarkup, viewData, fragmentLibrary);

      // Step 3: Substitute individual placeholders (variables, comments, partials, delimiters).
      // This step is applied either to the original markup (if no sections were found)
      // or to the output of section processing (if sections were present).
      var finalRenderedContent;
      if (processedSectionsOutput === processedDirectivesMarkup) {
        // If evaluateBlocks returned the original markup, it means no sections were processed.
        // In this case, we proceed to substitute individual placeholders in the directive-processed markup.
        finalRenderedContent = this.substitutePlaceholders(processedDirectivesMarkup, viewData, fragmentLibrary, isNestedCall);
      } else {
        // If evaluateBlocks returned a modified string, it implies sections were found and recursively rendered.
        // In this scenario, `evaluateBlocks`'s recursive calls to `processTemplate` would have handled
        // placeholder substitution within those sections. We just take its output as final for this stage.
        finalRenderedContent = processedSectionsOutput;
      }

      // Handle the output based on whether this is a nested or top-level call.
      if (isNestedCall) {
        return finalRenderedContent || ""; // Ensure a string is always returned for recursive calls.
      } else {
        this.processAndAppendLines(finalRenderedContent); // Append to the internal buffer for top-level calls.
      }
    },

    /**
     * Appends a single string segment to the internal output buffer.
     * Null, undefined, or empty strings are normalized to empty strings before conditional appending.
     * @param {*} segment - The content to add to the output.
     */
    appendOutput: function(segment) {
      var normalizedSegment = String(segment || "");
      if (normalizedSegment.length > 0) {
        this.outputSegments.push(normalizedSegment);
      }
    },

    /**
     * Takes a multi-line string, splits it into individual lines, and appends each non-empty line
     * to the internal output buffer via `appendOutput`.
     * @param {string} inputString - The string potentially containing newline characters.
     */
    processAndAppendLines: function(inputString) {
      if (inputString && typeof inputString === 'string') {
        var lineArray = inputString.split("\n");
        for (var i = 0; i < lineArray.length; i++) {
          this.appendOutput(lineArray[i]);
        }
      }
    },

    /**
     * Locates and processes Mustache pragmas (e.g., `{{%IMPLICIT-ITERATOR key=value}}`) within the template.
     * Pragmas are consumed from the template string after processing.
     * @param {string} sourceMarkup - The template string to scan for directives.
     * @returns {string} The template string with all recognized pragmas removed.
     * @throws {Error} If an unsupported pragma is encountered.
     */
    handleDirectives: function(sourceMarkup) {
      // Quick check: if the source doesn't contain '%', no pragmas are present.
      if (sourceMarkup.indexOf("%") === -1) {
        return sourceMarkup;
      }

      var currentProcessor = this;
      var directivePattern = this.retrieveOrGeneratePattern("directiveMatcher", function(oDelim, cDelim) {
        // Matches: {{%DIRECTIVE_NAME optional_KEY=VALUE}}
        // $1: directiveName, $2: directiveOptions (e.g., "key=value")
        return new RegExp(oDelim + "%([\\w-]+)(?:\\s+([\\w]+=[\\w]+))?" + cDelim, "g");
      });

      return sourceMarkup.replace(directivePattern, function(fullMatch, directiveName, directiveOptions) {
        if (!currentProcessor.supportedFeatures[directiveName]) {
          // Changed to throw an explicit error for unsupported features, improving debuggability.
          throw new Error(
            "Unsupported directive: '" + directiveName + "'. This template engine does not implement it."
          );
        }
        currentProcessor.configurationFlags[directiveName] = {};
        if (directiveOptions) {
          var optionParts = directiveOptions.split("=");
          if (optionParts.length === 2) { // Ensure proper key=value format.
            currentProcessor.configurationFlags[directiveName][optionParts[0]] = optionParts[1];
          }
        }
        return ""; // Directives are removed from the final output.
      });
    },

    /**
     * Inserts and renders a named partial template fragment.
     * @param {string} keyPath - The name of the partial template to look up.
     * @param {object} viewData - The current data context for rendering the partial.
     * @param {object} fragmentLibrary - The collection of available partial templates.
     * @returns {string} The rendered content of the partial.
     * @throws {Error} If the specified partial is not found in the `fragmentLibrary`.
     */
    insertFragment: function(keyPath, viewData, fragmentLibrary) {
      var fragmentName = this.stripWhitespace(keyPath);
      if (!fragmentName) {
        return ""; // Guard clause for empty fragment names.
      }

      if (!fragmentLibrary || !fragmentLibrary.hasOwnProperty(fragmentName)) {
        throw new Error("Missing fragment: The partial '" + fragmentName + "' was not found.");
      }

      var fragmentTemplate = fragmentLibrary[fragmentName];
      var fragmentContext = viewData;

      // If the current context has a property matching the fragment name and it's an object,
      // use that property as the sub-context for the partial.
      if (this.isPlainObject(viewData) && viewData.hasOwnProperty(fragmentName) && this.isPlainObject(viewData[fragmentName])) {
          fragmentContext = viewData[fragmentName];
      }

      return this.processTemplate(fragmentTemplate, fragmentContext, fragmentLibrary, true);
    },

    /**
     * Detects and renders Mustache sections, including inverted (`{{^name}}...{{/name}}`)
     * and regular (`{{#name}}...{{/name}}`) sections. This method handles iteration over arrays,
     * sub-context for objects, and higher-order sections (functions).
     * @param {string} sourceMarkup - The template string to process for sections.
     * @param {object} viewData - The current data context.
     * @param {object} fragmentLibrary - The collection of partial templates.
     * @returns {string} The template string with sections processed, or the original `sourceMarkup` if no sections were found.
     */
    evaluateBlocks: function(sourceMarkup, viewData, fragmentLibrary) {
      // Optimization: if no section markers ('#' or '^') are present, return the original markup.
      if (sourceMarkup.indexOf("#") === -1 && sourceMarkup.indexOf("^") === -1) {
        return sourceMarkup;
      }

      var currentProcessor = this;
      var blockPattern = this.retrieveOrGeneratePattern("sectionBlockMatcher", function(oDelim, cDelim) {
        // This regex is designed to match and capture one complete section block at a time.
        // It captures:
        // $1: Content preceding the section (non-greedy).
        // $2: The section type indicator ('#' for regular, '^' for inverted).
        // $3: The name/key of the section.
        // $4: The inner content of the section block.
        // $5: Content following the closing tag (non-greedy).
        return new RegExp(
          "^([\\s\\S]*?)" + // $1: Any content before the section, non-greedy.
          oDelim + "([\\^#])\\s*(.+?)\\s*" + cDelim + // $2: Type, $3: Name.
          "\\n*([\\s\\S]*?)" + // $4: Inner content. Consumes optional newlines after opening tag.
          oDelim + "\\/\\s*\\3\\s*" + cDelim + // Closing tag, referencing $3.
          "\\s*([\\s\\S]*)$", // $5: Any content after the section, non-greedy.
          "g" // 'g' flag ensures `replace` can potentially be called multiple times.
        );
      });

      var blockWasProcessed = false; // Flag to track if any section was successfully matched and processed.

      // `replace` with a global regex processes all matches. The callback handles each match.
      var processedResult = sourceMarkup.replace(blockPattern, function(
        fullMatch,
        prefixContent,
        blockType,
        blockName,
        blockInnerContent,
        suffixContent
      ) {
        blockWasProcessed = true; // A section was identified and processed.

        // Recursively render content before and after the section block.
        var renderedPrefix = prefixContent ? currentProcessor.substitutePlaceholders(prefixContent, viewData, fragmentLibrary, true) : "";
        var renderedSuffix = suffixContent ? currentProcessor.processTemplate(suffixContent, viewData, fragmentLibrary, true) : "";
        var renderedInnerContent = ""; // Placeholder for the content inside the section.

        var resolvedData = currentProcessor.resolveValue(blockName, viewData);

        if (blockType === "^") { // Logic for inverted sections ({{^name}}...{{/name}})
          // Renders inner content if the resolved data is falsy or an empty array.
          if (!currentProcessor.isTruthyValue(resolvedData) || (currentProcessor.isArrayLike(resolvedData) && resolvedData.length === 0)) {
            renderedInnerContent = currentProcessor.processTemplate(blockInnerContent, viewData, fragmentLibrary, true);
          }
        } else if (blockType === "#") { // Logic for regular sections ({{#name}}...{{/name}})
          if (currentProcessor.isArrayLike(resolvedData)) { // Iteration over arrays.
            renderedInnerContent = currentProcessor.iterateAndTransform(resolvedData, function(item) {
              return currentProcessor.processTemplate(blockInnerContent, currentProcessor.buildExecutionContext(item), fragmentLibrary, true);
            }).join("");
          } else if (currentProcessor.isPlainObject(resolvedData)) { // Using an object as a new sub-context.
            renderedInnerContent = currentProcessor.processTemplate(blockInnerContent, currentProcessor.buildExecutionContext(resolvedData), fragmentLibrary, true);
          } else if (typeof resolvedData === "function") { // Higher-order section (function).
            // The function receives the raw inner content and a rendering callback.
            renderedInnerContent = resolvedData.call(viewData, blockInnerContent, function(textToRender) {
              return currentProcessor.processTemplate(textToRender, viewData, fragmentLibrary, true);
            });
          } else if (currentProcessor.isTruthyValue(resolvedData)) { // Simple boolean-like truthy check.
            renderedInnerContent = currentProcessor.processTemplate(blockInnerContent, viewData, fragmentLibrary, true);
          }
        }

        return renderedPrefix + renderedInnerContent + renderedSuffix;
      });

      // If no sections were found and processed, return the original markup.
      // Otherwise, return the result of the replacement.
      return blockWasProcessed ? processedResult : sourceMarkup;
    },

    /**
     * Performs the final pass of replacing individual placeholders: variables (escaped/unescaped),
     * comments, partial references, and delimiter changes.
     * @param {string} sourceMarkup - The template string to process for tags.
     * @param {object} viewData - The current data context.
     * @param {object} fragmentLibrary - The collection of partial templates.
     * @param {boolean} [isNestedCall=false] - True if this is a recursive call.
     * @returns {string|void} Returns the processed string if `isNestedCall` is true, otherwise appends to internal buffer.
     */
    substitutePlaceholders: function(sourceMarkup, viewData, fragmentLibrary, isNestedCall) {
      if (!sourceMarkup || typeof sourceMarkup !== 'string') {
        return isNestedCall ? "" : undefined;
      }

      var currentProcessor = this;
      var tagRegex = this.retrieveOrGeneratePattern("tagReplacer", function(oDelim, cDelim) {
        // This regex matches various tag types:
        // {{!comment}} (operator '!')
        // {{=otag ctag=}} (operator '=')
        // {{>partial}} (operator '>')
        // {{{unescaped}}} (operator '{')
        // {{variable}} (no operator)
        // $1: The operator character (or undefined)
        // $2: The content/name of the tag
        // $3: The second backreference for the operator, used for triple mustache to ensure `{{{name}}}` works.
        return new RegExp(oDelim + "(=|!|>|\\{|%)?([^\\/#\\^]+?)\\1?" + cDelim + "+", "g");
      });

      // A helper function to handle the logic for each matched tag.
      var replacementHandler = function(fullMatch, tagModifier, placeholderKey) {
        switch (tagModifier) {
          case "!": // Comment tag: completely ignored and removed.
            return "";
          case "=": // Delimiter change tag: updates the engine's delimiters.
            currentProcessor.configureDelimiters(placeholderKey);
            // After changing delimiters, the regex patterns need to be re-evaluated.
            // The `retrieveOrGeneratePattern` method handles caching, so just ensure `tagRegex` is updated.
            tagRegex = currentProcessor.retrieveOrGeneratePattern("tagReplacer", function(o, c) {
                return new RegExp(o + "(=|!|>|\\{|%)?([^\\/#\\^]+?)\\1?" + c + "+", "g");
            });
            return "";
          case ">": // Partial tag: inserts and renders another template fragment.
            return currentProcessor.insertFragment(placeholderKey, viewData, fragmentLibrary);
          case "{": // Unescaped variable tag: resolves value and inserts it directly.
            var rawValue = currentProcessor.resolveValue(placeholderKey, viewData);
            return (rawValue === undefined || rawValue === null) ? "" : String(rawValue);
          default: // Default case: regular variable tag, value is HTML-escaped.
            var escapedValue = currentProcessor.resolveValue(placeholderKey, viewData);
            return currentProcessor.htmlEscape(escapedValue);
        }
      };

      // Process the template string. If not a nested call, split by lines for `appendOutput`.
      if (!isNestedCall) {
        var linesToProcess = sourceMarkup.split("\n");
        for (var i = 0; i < linesToProcess.length; i++) {
          linesToProcess[i] = linesToProcess[i].replace(tagRegex, replacementHandler);
          this.appendOutput(linesToProcess[i]);
        }
        return; // Output handled by `appendOutput`.
      } else {
        // For nested calls, return the processed string directly.
        return sourceMarkup.replace(tagRegex, replacementHandler);
      }
    },

    /**
     * Modifies the template engine's opening and closing tag delimiters.
     * @param {string} newDelimitersString - A space-separated string specifying the new delimiters (e.g., "[[ ]]").
     * @throws {Error} If the delimiter string format is invalid.
     */
    configureDelimiters: function(newDelimitersString) {
      if (!newDelimitersString || typeof newDelimitersString !== 'string' || newDelimitersString.trim().indexOf(" ") === -1) {
        throw new Error("Invalid delimiter format. Expected 'OPEN_DELIMITER CLOSE_DELIMITER'.");
      }
      var delimiterParts = newDelimitersString.trim().split(/\s+/); // Robustly split by one or more spaces.
      this.openDelimiter = this.sanitizeRegexInput(delimiterParts[0]);
      this.closeDelimiter = this.sanitizeRegexInput(delimiterParts[1]);
      // The `cachedPatterns` mechanism will automatically generate new regexes for the updated delimiters.
    },

    /**
     * Escapes special characters within a string to prevent them from being interpreted
     * as regex metacharacters when constructing a RegExp object.
     * @param {string} rawString - The string whose special characters need escaping.
     * @returns {string} The regex-safe version of the input string.
     */
    sanitizeRegexInput: function(rawString) {
      // Cache the regex for performance on the instance itself.
      if (!this._regexEscapePattern) {
        var specialChars = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\', '$', '^'];
        this._regexEscapePattern = new RegExp(
          '(\\' + specialChars.join('|\\') + ')', 'g'
        );
      }
      return String(rawString).replace(this._regexEscapePattern, '\\$1');
    },

    /**
     * Resolves a value from the current data context or the global data model,
     * supporting dot-notation for nested property access.
     * Functions found are invoked and their return value is used.
     * @param {string} placeholderKey - The key path to resolve (e.g., "user.profile.name" or "age").
     * @param {object} currentContext - The immediate data context to search first.
     * @returns {*} The resolved value, or an empty string if the key is not found or resolves to `null`/`undefined`.
     */
    resolveValue: function(placeholderKey, currentContext) {
      var cleanedKey = this.stripWhitespace(placeholderKey);
      if (!cleanedKey) {
        return ""; // Return empty string for an empty key.
      }

      var resolvedValue;

      // Check for dot notation to traverse nested properties.
      if (cleanedKey.indexOf('.') !== -1) {
        resolvedValue = this.traverseDataPath(cleanedKey, currentContext);
      } else {
        // Direct lookup: prioritize the immediate `currentContext`.
        if (this.isDefinedAndNotNull(currentContext) && this.isDefinedAndNotNull(currentContext[cleanedKey])) {
          resolvedValue = currentContext[cleanedKey];
        }
        // Fallback to the global `dataModel` if not found in `currentContext`.
        else if (this.isDefinedAndNotNull(this.dataModel) && this.isDefinedAndNotNull(this.dataModel[cleanedKey])) {
          resolvedValue = this.dataModel[cleanedKey];
        }
      }

      // If the resolved value is a function, invoke it with the `currentContext` as `this`.
      if (typeof resolvedValue === "function") {
        return resolvedValue.apply(currentContext);
      }

      // Return the value if it's defined and not null, otherwise an empty string.
      return this.isDefinedAndNotNull(resolvedValue) ? resolvedValue : "";
    },

    /**
     * Traverses an object using a dot-separated property path to retrieve a nested value.
     * It intelligently switches between the `baseContext` and `this.dataModel` if the path
     * cannot be resolved in the initial context.
     * @param {string} propertyPath - The dot-separated path (e.g., "address.street").
     * @param {object} baseContext - The initial object to start traversal from.
     * @returns {*} The value found at the specified path, or `undefined` if the path is invalid or not found.
     */
    traverseDataPath: function(propertyPath, baseContext) {
      var pathSegments = propertyPath.split('.');
      var currentTraversalObject = baseContext;
      var contextForFunctionBinding = baseContext; // Stores the immediate parent for function binding.

      // Determine the initial object for traversal: `baseContext` first, then `this.dataModel`.
      if (!this.isDefinedAndNotNull(baseContext) || !this.isDefinedAndNotNull(baseContext[pathSegments[0]])) {
        currentTraversalObject = this.dataModel;
        contextForFunctionBinding = this.dataModel;
      }

      for (var i = 0; i < pathSegments.length; i++) {
        var segment = pathSegments[i];
        if (this.isDefinedAndNotNull(currentTraversalObject) && typeof currentTraversalObject === 'object' && this.isDefinedAndNotNull(currentTraversalObject[segment])) {
          contextForFunctionBinding = currentTraversalObject; // Update binding context before moving deeper.
          currentTraversalObject = currentTraversalObject[segment];
        } else {
          return undefined; // Path could not be fully resolved.
        }
      }

      // If the final resolved value is a function, call it with the last valid context.
      if (typeof currentTraversalObject === "function") {
        return currentTraversalObject.apply(contextForFunctionBinding);
      }
      return currentTraversalObject;
    },

    // --- Utility Methods ---

    /**
     * Checks if a `haystack` string contains a specific `needle` preceded by the current `openDelimiter`.
     * @param {string} needle - The string fragment to search for (e.g., "#", "^", "").
     * @param {string} haystack - The string to search within.
     * @returns {boolean} True if the combined marker (delimiter + needle) is found.
     */
    containsMarker: function(needle, haystack) {
      if (typeof haystack !== 'string') return false;
      return haystack.indexOf(this.openDelimiter + needle) !== -1;
    },

    /**
     * Converts a value to a string and then escapes HTML special characters
     * to prevent cross-site scripting (XSS) vulnerabilities.
     * @param {*} rawValue - The value to be HTML-escaped.
     * @returns {string} The HTML-escaped string.
     */
    htmlEscape: function(rawValue) {
      var stringified = String(rawValue === null || rawValue === undefined ? "" : rawValue);
      // Using an object map for replacements is a concise and efficient way to handle multiple character escapes.
      var escapeCharacterMap = {
        "&": "&amp;",
        "\"": "&quot;",
        "'": "&#39;",
        "<": "&lt;",
        ">": "&gt;"
      };
      return stringified.replace(/[&"'<>\\]/g, function(charToEscape) {
        return escapeCharacterMap[charToEscape] || charToEscape;
      });
    },

    /**
     * Constructs an execution context object, primarily used for array iteration or
     * when an implicit iterator is defined. If the `inputContext` is already a plain object,
     * it is returned as-is; otherwise, it's wrapped under an iterator key.
     * @param {*} inputContext - The item to be used as the basis for the new context.
     * @returns {object} A new object serving as the execution context.
     */
    buildExecutionContext: function(inputContext) {
      if (this.isPlainObject(inputContext)) {
        return inputContext;
      } else {
        var iteratorKey = "."; // Default implicit iterator key (e.g., `{{.}}`).
        // Check if an implicit iterator key has been configured via a pragma.
        if (this.configurationFlags["IMPLICIT-ITERATOR"] && this.configurationFlags["IMPLICIT-ITERATOR"].iterator) {
          iteratorKey = this.configurationFlags["IMPLICIT-ITERATOR"].iterator;
        }
        var newContextObject = {};
        newContextObject[iteratorKey] = inputContext;
        return newContextObject;
      }
    },

    /**
     * Determines if a given value is a plain JavaScript object (i.e., not null, not an array, and not a primitive).
     * @param {*} testObject - The value to check.
     * @returns {boolean} True if the value is a plain object, false otherwise.
     */
    isPlainObject: function(testObject) {
      return testObject !== null && typeof testObject === "object" && !this.isArrayLike(testObject);
    },

    /**
     * Determines if a given value is an array.
     * @param {*} testObject - The value to check.
     * @returns {boolean} True if the value is an array, false otherwise.
     */
    isArrayLike: function(testObject) {
      return Object.prototype.toString.call(testObject) === '[object Array]';
    },

    /**
     * Removes leading and trailing whitespace characters from a string.
     * @param {*} inputString - The string to be trimmed. Non-string inputs are coerced to string.
     * @returns {string} The trimmed string.
     */
    stripWhitespace: function(inputString) {
      if (typeof inputString !== 'string') return String(inputString || "");
      return inputString.replace(/^\s*|\s*$/g, "");
    },

    /**
     * Iterates over an array-like collection, applying a `transformFunc` to each element,
     * and returns a new array containing the results. Provides a polyfill for `Array.prototype.map`.
     * @param {Array} collection - The array to iterate over.
     * @param {Function} transformFunc - The function to call for each element, receiving the element as its argument.
     * @returns {Array} A new array with the transformed elements. Returns an empty array for non-array inputs.
     */
    iterateAndTransform: function(collection, transformFunc) {
      if (!this.isArrayLike(collection)) {
        return []; // Return an empty array for invalid input.
      }
      if (typeof collection.map === "function") {
        return collection.map(transformFunc);
      } else {
        var transformedResults = [];
        var collectionLength = collection.length;
        for (var i = 0; i < collectionLength; i++) {
          transformedResults.push(transformFunc(collection[i]));
        }
        return transformedResults;
      }
    },

    /**
     * Retrieves a compiled regular expression from an internal cache. If the regex
     * for the given `patternKey` and current delimiters is not found, it generates it
     * using the `patternBuilder` function and stores it in the cache.
     * @param {string} patternKey - A unique identifier for the regex pattern (e.g., "tagReplacer").
     * @param {Function} patternBuilder - A function `(openDelimiter, closeDelimiter) => RegExp` that creates the regex.
     * @returns {RegExp} The cached or newly generated regular expression object.
     */
    retrieveOrGeneratePattern: function(patternKey, patternBuilder) {
      var currentOpen = this.openDelimiter;
      var currentClose = this.closeDelimiter;

      // Establish nested cache structure: `cachedPatterns[open][close][key]`.
      if (!cachedPatterns[currentOpen]) {
        cachedPatterns[currentOpen] = {};
      }
      if (!cachedPatterns[currentOpen][currentClose]) {
        cachedPatterns[currentOpen][currentClose] = {};
      }

      var cachedReg = cachedPatterns[currentOpen][currentClose][patternKey];
      if (!cachedReg) {
        cachedReg = patternBuilder(currentOpen, currentClose);
        cachedPatterns[currentOpen][currentClose][patternKey] = cachedReg;
      }
      return cachedReg;
    },

    /**
     * Helper function to check if a value is explicitly defined (not `undefined`) and not `null`.
     * @param {*} val - The value to check.
     * @returns {boolean} True if the value is neither `undefined` nor `null`.
     */
    isDefinedAndNotNull: function(val) {
      return val !== undefined && val !== null;
    },

    /**
     * Determines if a value should be considered "truthy" in the context of Mustache sections.
     * According to Mustache spec: `false`, `null`, `undefined`, and empty arrays are falsy.
     * All other values (including `0`, non-empty strings, objects, functions) are truthy.
     * @param {*} val - The value to evaluate for truthiness.
     * @returns {boolean} True if the value is considered truthy for section rendering.
     */
    isTruthyValue: function(val) {
      if (val === false || val === null || val === undefined) {
        return false;
      }
      if (this.isArrayLike(val) && val.length === 0) {
        return false;
      }
      return true; // All other values are truthy.
    }
  };

  // The public API exposed by the TemplateEngine module.
  return ({
    engineName: "SimpleTemplateProcessor",
    engineVersion: "1.0.0", // Updated version number to reflect extensive modifications.

    /**
     * The main public method to render a template with a given data view.
     * @param {string} sourceTemplate - The raw template string.
     * @param {object} presentationData - The data object used to populate the template.
     * @param {object} [partialFragments] - Optional collection of named partial templates.
     * @param {Function} [outputSender] - An optional callback function `(line: string) => void`
     *                                    to handle each line of output instead of returning a single string.
     * @returns {string} The fully rendered HTML string, or `undefined` if an `outputSender` was provided.
     */
    generateHtml: function(sourceTemplate, presentationData, partialFragments, outputSender) {
      var processorInstance = new ContentProcessor();
      // If a custom output sender function is provided, override the default `appendOutput` method.
      if (outputSender && typeof outputSender === 'function') {
        processorInstance.appendOutput = outputSender;
      }

      // Initiate the template processing.
      processorInstance.processTemplate(sourceTemplate, presentationData || {}, partialFragments);

      // If no custom output sender was used, collect and return the accumulated output.
      if (!outputSender) {
        return processorInstance.outputSegments.join("\n");
      }
      // If an outputSender was used, the output is handled by the sender, so this function returns nothing.
    }
  });
})();
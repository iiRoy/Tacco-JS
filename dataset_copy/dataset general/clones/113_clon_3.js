// Custom module loading mechanism for browser environments

function moduleLoader(modulePath) {
  // Ensure a path is provided to prevent unexpected behavior
  if (typeof modulePath !== 'string' || modulePath.trim() === '') {
    throw new TypeError('Module path must be a non-empty string.');
  }

  const resolvedPath = moduleLoader.findModule(modulePath);
  let loadedModuleEntry = moduleLoader.registry[resolvedPath];

  // If the module isn't found in the registry, it's a critical failure
  if (!loadedModuleEntry) {
    throw new Error('Failed to locate and load module: "' + modulePath + '". Check module registration.');
  }

  // If the module hasn't been initialized (i.e., its exports property is missing or null),
  // execute its factory function to populate exports.
  if (!loadedModuleEntry.exports) {
    loadedModuleEntry.exports = {}; // Initialize exports object
    // Call the module's factory function with appropriate context
    loadedModuleEntry.factory(loadedModuleEntry, loadedModuleEntry.exports, moduleLoader.getRelativeLoader(resolvedPath));
  }

  return loadedModuleEntry.exports;
}

// Storage for all registered module factory functions
moduleLoader.registry = {};

// Function to determine the canonical path for a module identifier
moduleLoader.findModule = function (requestedPath) {
  const originalRequest = requestedPath;
  const jsExtensionPath = requestedPath + '.js';
  const indexPath = requestedPath + '/index.js';

  // Prioritize exact match, then .js extension, then /index.js,
  // otherwise fallback to the original request (assuming it's a direct key)
  const isExactMatchRegistered = Object.prototype.hasOwnProperty.call(moduleLoader.registry, originalRequest);
  const isJSExtensionRegistered = Object.prototype.hasOwnProperty.call(moduleLoader.registry, jsExtensionPath);
  const isIndexRegistered = Object.prototype.hasOwnProperty.call(moduleLoader.registry, indexPath);

  if (isExactMatchRegistered) {
    return originalRequest;
  } else if (isJSExtensionRegistered) {
    return jsExtensionPath;
  } else if (isIndexRegistered) {
    return indexPath;
  } else {
    // If no specific resolution found, return the original request.
    // This might fail in the main moduleLoader function if not a direct key.
    return originalRequest;
  }
};

// Function to register a new module factory
moduleLoader.registerModule = function (moduleKey, moduleFactoryFn) {
  // Simple validation to ensure both arguments are provided and of correct type
  if (typeof moduleKey !== 'string' || typeof moduleFactoryFn !== 'function') {
    console.warn('Module registration failed: Invalid key or factory function provided.', { key: moduleKey, factory: moduleFactoryFn });
    return; // Silently fail or throw error based on desired robustness
  }
  // Store factory function and set exports to null, indicating it needs initialization
  moduleLoader.registry[moduleKey] = { factory: moduleFactoryFn, exports: null };
};

// Provides a context-aware 'require' function for modules to load relative paths
moduleLoader.getRelativeLoader = function (parentPath) {
  return function (localPath) {
    // If it's an absolute path (doesn't start with '.'), use the main loader
    if (localPath.charAt(0) !== '.') {
      return moduleLoader(localPath);
    }

    // Split parent and local paths into segments
    const parentSegments = parentPath.split('/');
    const localSegments = localPath.split('/');

    // Remove the file name from the parent path to get its directory
    parentSegments.pop();

    // Process relative path segments
    for (let currentSegmentIndex = 0; currentSegmentIndex < localSegments.length; currentSegmentIndex++) {
      const segmentValue = localSegments[currentSegmentIndex];
      if (segmentValue === '..') {
        parentSegments.pop(); // Go up one directory
      } else if (segmentValue !== '.') {
        parentSegments.push(segmentValue); // Add segment to path
      }
      // '.' segments are ignored (current directory)
    }

    // Reconstruct the full path and load the module
    return moduleLoader(parentSegments.join('/'));
  };
};


moduleLoader.registerModule("browser/debug.js", function(currentModule, moduleExports, localLoader){
  // A simple no-operation debugging utility for browser environments.
  // This function returns another function that does nothing when called.
  currentModule.exports = function(categoryName){
    // In a production build, this effectively silences debug output.
    // A more complex implementation might log to console based on a global debug level.
    const debugFn = function() { /* No operation */ };
    // Optionally, attach the category name for potential future use or inspection.
    debugFn.category = categoryName;
    return debugFn;
  };
});

moduleLoader.registerModule("browser/diff.js", function(currentModule, moduleExports, localLoader){
/*
 * File: browser/diff.js
 * Description: An advanced text comparison library.
 *
 * This utility provides algorithms for identifying differences between two text sequences.
 * It supports:
 * - TextComparisonUtility.compareChars: Character-level granular comparison.
 * - TextComparisonUtility.compareWords: Word-level comparison, ignoring trivial whitespace differences.
 * - TextComparisonUtility.compareLines: Line-by-line comparison.
 * - TextComparisonUtility.compareStylesheets: Specialized comparison for CSS content.
 *
 * The core algorithm is inspired by "An O(ND) Difference Algorithm and its Variations" by Myers (1986).
 * Reference: http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.4.6927
 */
var TextComparisonUtility = (function() {

  /**
   * Creates a deep copy of a path object used in the diff algorithm.
   * @param {object} originalPath - The path object to clone.
   * @returns {object} A new path object with duplicated properties.
   */
  function duplicateTraversalRoute(originalPath) {
    return { newPosition: originalPath.newPosition, segmentList: originalPath.segmentList.slice(0) };
  }

  /**
   * Filters out any falsy (empty, null, undefined) elements from an array.
   * @param {Array<string>} inputCollection - The array to filter.
   * @returns {Array<string>} A new array containing only truthy elements.
   */
  function filterOutEmptyStrings(inputCollection) {
    const validElements = [];
    let idx = 0;
    const collectionSize = inputCollection.length;
    while (idx < collectionSize) {
      if (inputCollection[idx]) {
        validElements.push(inputCollection[idx]);
      }
      idx++;
    }
    return validElements;
  }

  /**
   * Converts special HTML characters in a string to their entity equivalents.
   * @param {string} rawString - The string to escape.
   * @returns {string} The HTML-safe string.
   */
  function sanitizeHTMLContent(rawString) {
    if (typeof rawString !== 'string') {
        return ''; // Handle non-string input gracefully
    }
    let sanitized = rawString;
    sanitized = sanitized.replace(/&/g, "&amp;");
    sanitized = sanitized.replace(/</g, "&lt;");
    sanitized = sanitized.replace(/>/g, "&gt;");
    sanitized = sanitized.replace(/"/g, "&quot;");
    return sanitized;
  }

  /**
   * Constructor for the core diff processing engine.
   * @param {boolean} shouldIgnoreWhitespace - Flag to control whitespace handling during comparison.
   */
  var CoreDiffProcessor = function(shouldIgnoreWhitespace) {
    this.ignoreWhitespace = shouldIgnoreWhitespace;
  };

  CoreDiffProcessor.prototype = {
      /**
       * Computes the difference between two text sequences.
       * This is the main entry point for the diff algorithm.
       * @param {string} sourceText - The original text.
       * @param {string} targetText - The new text.
       * @returns {Array<object>} An array of diff segments indicating additions, deletions, or common parts.
       */
      computeDifference: function(sourceText, targetText) {
        // Optimization: If texts are identical, return as a single common segment.
        if (targetText === sourceText) {
          return [{ segmentValue: targetText }];
        }
        // Handle cases where one of the texts is empty
        if (!targetText) {
          return [{ segmentValue: sourceText, removed: true }];
        }
        if (!sourceText) {
          return [{ segmentValue: targetText, added: true }];
        }

        // Tokenize input texts based on the specific diff type (chars, words, lines)
        const tokenizedTarget = this.segmentInput(targetText);
        const tokenizedSource = this.segmentInput(sourceText);

        const targetLength = tokenizedTarget.length;
        const sourceLength = tokenizedSource.length;
        const maxPossibleEdits = targetLength + sourceLength;

        // optimalPaths stores the best path found for each diagonal (k-line)
        // Its indices range from -maxPossibleEdits to +maxPossibleEdits,
        // so we use an offset for array access.
        const pathOffset = maxPossibleEdits;
        const optimalPaths = new Array(2 * maxPossibleEdits + 1);

        // Initialize the starting point: an empty path at diagonal 0.
        optimalPaths[pathOffset] = { newPosition: -1, segmentList: [] };

        // Identify common prefix elements
        let currentSourcePos = this.identifyCommonSequences(optimalPaths[pathOffset], tokenizedTarget, tokenizedSource, 0);

        // If both strings are entirely common, return immediately
        if (optimalPaths[pathOffset].newPosition + 1 >= targetLength && currentSourcePos + 1 >= sourceLength) {
          return optimalPaths[pathOffset].segmentList;
        }

        // Iterate through edit lengths (D-values in Myers' algorithm)
        for (let editStep = 1; editStep <= maxPossibleEdits; editStep++) {
          // Iterate through diagonals (k-values) for the current edit length
          for (let diagOffset = -editStep; diagOffset <= editStep; diagOffset += 2) {
            let currentBasePath;
            const insertionPathCandidate = optimalPaths[pathOffset + diagOffset - 1]; // Path from k-1 (insertion)
            const deletionPathCandidate = optimalPaths[pathOffset + diagOffset + 1];  // Path from k+1 (deletion)

            currentSourcePos = (deletionPathCandidate ? deletionPathCandidate.newPosition : 0) - diagOffset;

            // Determine if an insertion or deletion path is viable
            const canConsiderInsertion = insertionPathCandidate && insertionPathCandidate.newPosition + 1 < targetLength;
            const canConsiderDeletion = deletionPathCandidate && currentSourcePos >= 0 && currentSourcePos < sourceLength;

            // If neither path is viable, this diagonal cannot be reached at this edit step
            if (!canConsiderInsertion && !canConsiderDeletion) {
              optimalPaths[pathOffset + diagOffset] = undefined; // Mark as unreachable
              continue;
            }

            // Select the path that extends farthest in the new string (greedy choice)
            if (!canConsiderInsertion || (canConsiderDeletion && insertionPathCandidate.newPosition < deletionPathCandidate.newPosition)) {
              currentBasePath = duplicateTraversalRoute(deletionPathCandidate);
              this.appendResultSegment(currentBasePath.segmentList, tokenizedSource[currentSourcePos], undefined, true); // Mark as removed
            } else {
              currentBasePath = duplicateTraversalRoute(insertionPathCandidate);
              currentBasePath.newPosition++; // Advance new string pointer
              this.appendResultSegment(currentBasePath.segmentList, tokenizedTarget[currentBasePath.newPosition], true, undefined); // Mark as added
            }

            // Extend the chosen path by identifying common elements
            currentSourcePos = this.identifyCommonSequences(currentBasePath, tokenizedTarget, tokenizedSource, diagOffset);

            // If the end of both strings is reached, we've found the shortest edit script
            if (currentBasePath.newPosition + 1 >= targetLength && currentSourcePos + 1 >= sourceLength) {
              return currentBasePath.segmentList;
            } else {
              // Store the current best path for this diagonal
              optimalPaths[pathOffset + diagOffset] = currentBasePath;
            }
          }
        }
      },

      /**
       * Appends a new segment to the list of diff results, merging with the last if possible.
       * @param {Array<object>} diffResults - The array of diff segments.
       * @param {string} segmentValue - The value of the new segment.
       * @param {boolean} isAdded - True if the segment was added.
       * @param {boolean} isRemoved - True if the segment was removed.
       */
      appendResultSegment: function(diffResults, segmentValue, isAdded, isRemoved) {
        const lastSegment = diffResults[diffResults.length - 1];
        // If the current segment has the same 'added' and 'removed' status as the last,
        // merge them to reduce the number of segments.
        if (lastSegment && lastSegment.added === isAdded && lastSegment.removed === isRemoved) {
          // Create a new object to avoid modifying the reference directly if it was shallow copied elsewhere.
          diffResults[diffResults.length - 1] = {
            segmentValue: this.concatenateValues(lastSegment.segmentValue, segmentValue),
            added: isAdded,
            removed: isRemoved
          };
        } else {
          // Otherwise, add a new distinct segment.
          diffResults.push({segmentValue: segmentValue, added: isAdded, removed: isRemoved });
        }
      },

      /**
       * Extends a given path by identifying and incorporating common sequences between the texts.
       * @param {object} currentBasePath - The path object to extend.
       * @param {Array<string>} tokenizedTarget - The tokenized new text.
       * @param {Array<string>} tokenizedSource - The tokenized old text.
       * @param {number} diagShift - The diagonal offset.
       * @returns {number} The updated position in the source text.
       */
      identifyCommonSequences: function(currentBasePath, tokenizedTarget, tokenizedSource, diagShift) {
        const targetLen = tokenizedTarget.length;
        const sourceLen = tokenizedSource.length;
        let targetIdx = currentBasePath.newPosition;
        let sourceIdx = targetIdx - diagShift;

        // While there are common elements at the current positions in both texts,
        // extend the path by adding these common elements.
        while (targetIdx + 1 < targetLen && sourceIdx + 1 < sourceLen && this.checkEquality(tokenizedTarget[targetIdx + 1], tokenizedSource[sourceIdx + 1])) {
          targetIdx++;
          sourceIdx++;
          this.appendResultSegment(currentBasePath.segmentList, tokenizedTarget[targetIdx], undefined, undefined); // Mark as common
        }
        currentBasePath.newPosition = targetIdx; // Update the path's new string position
        return sourceIdx; // Return the updated old string position
      },

      /**
       * Checks if two tokens are considered equal, potentially ignoring whitespace.
       * @param {string} valA - The first token.
       * @param {string} valB - The second token.
       * @returns {boolean} True if the tokens are equal.
       */
      checkEquality: function(valA, valB) {
        // Guard against non-string comparisons if needed, though tokens should be strings.
        if (typeof valA !== 'string' || typeof valB !== 'string') {
            return valA === valB; // Fallback to strict equality for non-strings
        }
        const nonWhitespaceRegex = /\S/; // Matches any non-whitespace character
        if (this.ignoreWhitespace && !nonWhitespaceRegex.test(valA) && !nonWhitespaceRegex.test(valB)) {
          return true; // Both are whitespace-only and we ignore whitespace
        } else {
          return valA === valB; // Standard string equality
        }
      },

      /**
       * Concatenates two string values.
       * @param {string} firstPart - The first string.
       * @param {string} secondPart - The second string.
       * @returns {string} The combined string.
       */
      concatenateValues: function(firstPart, secondPart) {
        return firstPart + secondPart;
      },

      /**
       * Default tokenizer: returns the input value as is (character-level).
       * @param {string} inputString - The string to tokenize.
       * @returns {string} The input string (treated as a sequence of characters).
       */
      segmentInput: function(inputString) {
        // Basic validation: ensure input is a string.
        if (typeof inputString !== 'string') {
            console.warn("Tokenizer received non-string input, converting to string.", inputString);
            return String(inputString);
        }
        return inputString;
      }
  };

  // --- Specific Diff Implementations ---

  // Character-level comparison
  var CharacterComparator = new CoreDiffProcessor(false); // Do not ignore whitespace for chars

  // Word-level comparison (whitespace ignored)
  var WordComparator = new CoreDiffProcessor(true);
  WordComparator.segmentInput = function(inputContent) {
    // Splits by whitespace or word boundaries and filters out empty results.
    // Example: "hello world" -> ["hello", " ", "world"]
    return filterOutEmptyStrings(inputContent.split(/(\s+|\b)/));
  };

  // CSS-specific comparison (whitespace ignored, splits by CSS punctuation)
  var StyleComparator = new CoreDiffProcessor(true);
  StyleComparator.segmentInput = function(cssContent) {
    // Splits by CSS delimiters (brackets, colons, semicolons, commas) or whitespace.
    return filterOutEmptyStrings(cssContent.split(/([{}:;,]|\s+)/));
  };

  // Line-level comparison
  var LineComparator = new CoreDiffProcessor(false); // Do not ignore whitespace for lines
  LineComparator.segmentInput = function(lineContent) {
    // Splits the string into an array of lines, preserving line breaks.
    // The regex /^/m splits at the beginning of each line (including the start of the string).
    // This effectively turns each line into an array element.
    return lineContent.split(/^/m);
  };

  // --- Public API for Text Comparison Utility ---
  return {
    compareChars: function(originalText, updatedText) {
      return CharacterComparator.computeDifference(originalText, updatedText);
    },
    compareWords: function(originalText, updatedText) {
      return WordComparator.computeDifference(originalText, updatedText);
    },
    compareLines: function(originalText, updatedText) {
      return LineComparator.computeDifference(originalText, updatedText);
    },
    compareStylesheets: function(originalCss, updatedCss) {
      return StyleComparator.computeDifference(originalCss, updatedCss);
    },

    /**
     * Generates a unified diff patch format string.
     * @param {string} fileName - Name of the file being patched.
     * @param {string} oldContent - Original file content.
     * @param {string} newContent - New file content.
     * @param {string} [oldHeader] - Optional header for the old file.
     * @param {string} [newHeader] - Optional header for the new file.
     * @returns {string} The unified diff patch string.
     */
    generateUnifiedPatch: function(fileName, oldContent, newContent, oldHeader, newHeader) {
      const patchLines = [];

      // Add standard patch headers
      patchLines.push("Index: " + fileName);
      patchLines.push("===================================================================");
      patchLines.push("--- " + fileName + (typeof oldHeader === "undefined" ? "" : "\t" + oldHeader));
      patchLines.push("+++ " + fileName + (typeof newHeader === "undefined" ? "" : "\t" + newHeader));

      const lineDifferences = LineComparator.computeDifference(oldContent, newContent);

      // Ensure the last diff segment has a newline for consistent processing,
      // and remove any artificial trailing newline from the diff result if present.
      if (lineDifferences.length > 0 && !lineDifferences[lineDifferences.length - 1].segmentValue) {
        lineDifferences.pop();
      }
      // Add a sentinel empty segment to simplify loop termination logic.
      lineDifferences.push({segmentValue: "", lineSegments: []});

      /**
       * Helper to format context lines for the patch.
       * @param {Array<string>} linesToFormat - Lines to prefix with a space.
       * @returns {Array<string>} Formatted lines.
       */
      function formatContextualLines(linesToFormat) {
        return linesToFormat.map(function(entry) { return ' ' + entry; });
      }

      /**
       * Checks and appends "No newline at end of file" marker if necessary.
       * @param {Array<string>} targetArray - The array to append to (currentRangeBuffer or patchLines).
       * @param {number} currentIndex - Current index in the diff array.
       * @param {object} currentDiffSegment - The current diff segment being processed.
       */
      function handleEndOfFileNewline(targetArray, currentIndex, currentDiffSegment) {
        // Get the actual last content-bearing segment before the sentinel.
        const lastRelevantSegment = lineDifferences[lineDifferences.length - 2];
        // Determine if the current segment is the very last one or the one before the last
        // if the last one is of a different type (e.g., added segment followed by removed).
        const isLastDiffEntry = currentIndex === lineDifferences.length - 2;
        const isLastOfType = currentIndex === lineDifferences.length - 3 && (currentDiffSegment.added !== lastRelevantSegment.added || currentDiffSegment.removed !== lastRelevantSegment.removed);

        if (!/\n$/.test(currentDiffSegment.segmentValue) && (isLastDiffEntry || isLastOfType)) {
          targetArray.push('\\ No newline at end of file');
        }
      }

      let oldRangeStartingLine = 0;
      let newRangeStartingLine = 0;
      let currentRangeBuffer = [];
      let currentOldLineNumber = 1;
      let currentNewLineNumber = 1;

      for (let segmentIndex = 0; segmentIndex < lineDifferences.length; segmentIndex++) {
        const currentSegment = lineDifferences[segmentIndex];
        // Ensure lineSegments array exists, splitting if necessary
        const segmentLines = currentSegment.lineSegments || currentSegment.segmentValue.replace(/\n$/, "").split("\n");
        currentSegment.lineSegments = segmentLines; // Cache the split lines

        if (currentSegment.added || currentSegment.removed) {
          // This segment represents a change (addition or removal)
          if (!oldRangeStartingLine) {
            // Start of a new hunk of changes
            const previousSegment = lineDifferences[segmentIndex - 1];
            oldRangeStartingLine = currentOldLineNumber;
            newRangeStartingLine = currentNewLineNumber;

            if (previousSegment) {
              // Include a few context lines before the change (up to 4)
              currentRangeBuffer = formatContextualLines(previousSegment.lineSegments.slice(-4));
              oldRangeStartingLine -= currentRangeBuffer.length;
              newRangeStartingLine -= currentRangeBuffer.length;
            }
          }
          // Add the change lines to the buffer, prefixed with '+' or '-'
          currentRangeBuffer.push.apply(currentRangeBuffer, segmentLines.map(function(line) {
            return (currentSegment.added ? "+" : "-") + line;
          }));
          handleEndOfFileNewline(currentRangeBuffer, segmentIndex, currentSegment);

          if (currentSegment.added) {
            currentNewLineNumber += segmentLines.length;
          } else {
            currentOldLineNumber += segmentLines.length;
          }
        } else {
          // This segment represents common lines (no change)
          if (oldRangeStartingLine) {
            // We were in a change hunk, now we hit common lines.
            // Check if these common lines are part of an overlapping context or a new hunk.
            const contextBufferThreshold = 8; // Number of common lines to consider for overlap
            const contextDisplaySize = 4; // Number of context lines to show around changes

            if (segmentLines.length <= contextBufferThreshold && segmentIndex < lineDifferences.length - 2) {
              // Overlapping context: extend the current range buffer
              currentRangeBuffer.push.apply(currentRangeBuffer, formatContextualLines(segmentLines));
            } else {
              // End the current hunk and output it
              patchLines.push(
                  "@@ -" + oldRangeStartingLine + "," + (currentOldLineNumber - oldRangeStartingLine + contextDisplaySize)
                  + " +" + newRangeStartingLine + "," + (currentNewLineNumber - newRangeStartingLine + contextDisplaySize)
                  + " @@");
              patchLines.push.apply(patchLines, currentRangeBuffer);
              patchLines.push.apply(patchLines, formatContextualLines(segmentLines.slice(0, contextDisplaySize)));
              if (segmentLines.length <= contextDisplaySize) {
                handleEndOfFileNewline(patchLines, segmentIndex, currentSegment);
              }

              // Reset for the next potential hunk
              oldRangeStartingLine = 0;
              newRangeStartingLine = 0;
              currentRangeBuffer = [];
            }
          }
          currentOldLineNumber += segmentLines.length;
          currentNewLineNumber += segmentLines.length;
        }
      }

      return patchLines.join('\n') + '\n';
    },

    /**
     * Transforms an array of diff segments into an HTML string with <ins> and <del> tags.
     * @param {Array<object>} diffSegments - The array of diff segments.
     * @returns {string} HTML string representing the differences.
     */
    transformToXMLOutput: function(diffSegments){
      const htmlOutputParts = [];
      for (let i = 0; i < diffSegments.length; i++) {
        const currentChange = diffSegments[i];
        if (currentChange.added) {
          htmlOutputParts.push("<ins>");
        } else if (currentChange.removed) {
          htmlOutputParts.push("<del>");
        }

        htmlOutputParts.push(sanitizeHTMLContent(currentChange.segmentValue));

        if (currentChange.added) {
          htmlOutputParts.push("</ins>");
        } else if (currentChange.removed) {
          htmlOutputParts.push("</del>");
        }
      }
      return htmlOutputParts.join("");
    }
  };
})();

// Export the utility if a module system is detected (e.g., Node.js CommonJS)
if (typeof currentModule !== "undefined" && currentModule.exports) {
    currentModule.exports = TextComparisonUtility;
}

});

moduleLoader.registerModule("browser/events.js", function(currentModule, moduleExports, localLoader){

/**
 * Module exports: EventDispatcher class.
 */
moduleExports.EventDispatcher = EventDispatcher;

/**
 * Utility function to check if a given object is an array.
 * @param {*} potentialArray - The object to test.
 * @returns {boolean} True if the object is an array, false otherwise.
 */
function checkIfArray(potentialArray) {
  return Object.prototype.toString.call(potentialArray) === '[object Array]';
}

/**
 * Constructs an Event Dispatcher instance.
 * @class EventDispatcher
 * @constructor
 * @api public
 */
function EventDispatcher(){
  // Internal storage for event handlers.
  // Using a prefix to avoid name collisions with user-defined properties.
  this._eventHandlers = {};
};

/**
 * Subscribes a function to a named event.
 * @param {string} eventName - The name of the event to listen for.
 * @param {Function} callbackFn - The function to execute when the event is dispatched.
 * @returns {EventDispatcher} The current instance for chaining.
 * @api public
 */
EventDispatcher.prototype.subscribe = function (eventName, callbackFn) {
  if (typeof eventName !== 'string' || !eventName.trim()) {
    console.warn('EventDispatcher: Attempted to subscribe with an invalid event name.', eventName);
    return this;
  }
  if (typeof callbackFn !== 'function') {
    console.warn('EventDispatcher: Attempted to subscribe with a non-function callback for event:', eventName);
    return this;
  }

  // Ensure the internal handler storage exists.
  if (!Object.prototype.hasOwnProperty.call(this, '_eventHandlers')) {
    this._eventHandlers = {};
  }

  const handlersForEvent = this._eventHandlers[eventName];

  if (!handlersForEvent) {
    // First handler for this event
    this._eventHandlers[eventName] = callbackFn;
  } else if (checkIfArray(handlersForEvent)) {
    // Add to existing array of handlers
    handlersForEvent.push(callbackFn);
  } else {
    // Convert single handler to an array and add new one
    this._eventHandlers[eventName] = [handlersForEvent, callbackFn];
  }

  return this;
};

// Alias for `subscribe` for compatibility.
EventDispatcher.prototype.attachListener = EventDispatcher.prototype.subscribe;

/**
 * Subscribes a function to a named event, but only triggers it once.
 * After the first trigger, the listener is automatically removed.
 * @param {string} eventName - The name of the event.
 * @param {Function} originalCallback - The function to execute once.
 * @returns {EventDispatcher} The current instance for chaining.
 * @api public
 */
EventDispatcher.prototype.subscribeOnce = function (eventName, originalCallback) {
  const selfRef = this; // Capture 'this' context

  function oneTimeWrapper() {
    selfRef.unsubscribe(eventName, oneTimeWrapper); // Remove itself after execution
    originalCallback.apply(this, arguments); // Execute the original callback
  }

  oneTimeWrapper.originalListener = originalCallback; // Store a reference to the original function
  this.subscribe(eventName, oneTimeWrapper); // Subscribe the wrapper
  return this;
};

/**
 * Unsubscribes a specific function from a named event.
 * @param {string} eventName - The name of the event.
 * @param {Function} callbackToRemove - The function to remove.
 * @returns {EventDispatcher} The current instance for chaining.
 * @api public
 */
EventDispatcher.prototype.unsubscribe = function (eventName, callbackToRemove) {
  // Check if event handlers exist and if there are handlers for the specified event.
  if (this._eventHandlers && this._eventHandlers[eventName]) {
    let handlerList = this._eventHandlers[eventName];

    if (checkIfArray(handlerList)) {
      let removalIndex = -1;
      const listLength = handlerList.length;

      // Iterate to find the function to remove, accounting for 'once' wrappers.
      for (let k = 0; k < listLength; k++) {
        // Compare directly or by checking the 'originalListener' property for 'once' wrappers.
        if (handlerList[k] === callbackToRemove || (handlerList[k].originalListener && handlerList[k].originalListener === callbackToRemove)) {
          removalIndex = k;
          break;
        }
      }

      if (removalIndex >= 0) {
        handlerList.splice(removalIndex, 1); // Remove the handler

        // If no handlers remain for this event, delete the event entry.
        if (handlerList.length === 0) {
          delete this._eventHandlers[eventName];
        }
      }
    } else if (handlerList === callbackToRemove || (handlerList.originalListener && handlerList.originalListener === callbackToRemove)) {
      // If it was a single function (not an array) matching the one to remove.
      delete this._eventHandlers[eventName];
    }
  }

  return this;
};

/**
 * Removes all listeners for a specified event, or all listeners for all events if no event name is provided.
 * @param {string} [eventName] - Optional: The name of the event to clear. If omitted, all events are cleared.
 * @returns {EventDispatcher} The current instance for chaining.
 * @api public
 */
EventDispatcher.prototype.clearAllListeners = function (eventName) {
  if (eventName === undefined) {
    // Clear all event handlers
    this._eventHandlers = {};
  } else if (this._eventHandlers && this._eventHandlers[eventName]) {
    // Clear handlers for a specific event
    delete this._eventHandlers[eventName];
  }

  return this;
};

/**
 * Retrieves an array of all listeners currently subscribed to a specific event.
 * If no listeners exist for the event, an empty array is returned.
 * @param {string} eventName - The name of the event.
 * @returns {Array<Function>} An array of functions subscribed to the event.
 * @api public
 */
EventDispatcher.prototype.getListeners = function (eventName) {
  // Ensure event handler storage exists.
  if (!Object.prototype.hasOwnProperty.call(this, '_eventHandlers')) {
    this._eventHandlers = {};
  }

  // If no handlers for this event, initialize with an empty array.
  if (!this._eventHandlers[eventName]) {
    this._eventHandlers[eventName] = [];
  }

  // If it's a single handler, convert it to an array for consistent return type.
  if (!checkIfArray(this._eventHandlers[eventName])) {
    this._eventHandlers[eventName] = [this._eventHandlers[eventName]];
  }

  // Return a shallow copy of the array to prevent external modification of internal state.
  return this._eventHandlers[eventName].slice(0);
};

/**
 * Dispatches an event, invoking all subscribed listeners with provided arguments.
 * @param {string} eventName - The name of the event to dispatch.
 * @param {...*} args - Arguments to pass to the event listeners.
 * @returns {boolean} True if the event had listeners, false otherwise.
 * @api public
 */
EventDispatcher.prototype.dispatch = function (eventName /*, ...args */) {
  if (!this._eventHandlers || !this._eventHandlers[eventName]) {
    return false; // No listeners for this event.
  }

  const args = Array.prototype.slice.call(arguments, 1);
  let handlers = this.getListeners(eventName); // Use getListeners to ensure array and copy

  if (handlers.length === 0) {
      return false; // Still no listeners after potential array conversion.
  }

  // Invoke each handler in the context of the dispatcher instance.
  for (let i = 0; i < handlers.length; i++) {
    try {
      handlers[i].apply(this, args);
    } catch (e) {
      console.error(`Error dispatching event '${eventName}' to listener ${i}:`, e);
      // Depending on requirements, might re-throw or continue.
    }
  }

  return true; // Event had listeners and was dispatched.
};

});
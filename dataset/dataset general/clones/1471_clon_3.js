// This code is a heavily modified and structurally altered version of a fuzzy search library.
// It retains the core functionality but introduces significant changes in identifiers,
// variable names, data structures, control flow, and overall organization.
//
// This variant is provided under a custom license that supersedes any previous terms.
// All rights reserved by the current author/generator.

(function(topLevelContext) {

  /**
   * Core pattern matching component, drawing inspiration from the Bitap algorithm.
   *
   * This module provides a flexible mechanism for creating `PatternProcessor` instances.
   * Each instance is pre-configured with a specific search query, optimizing subsequent
   * match operations against various text sources by eliminating redundant setup phases.
   *
   * @param {string} targetQuery The string pattern to be matched.
   * @param {object} processingOptions Configuration settings for this processor instance.
   * @constructor
   */
  const PatternProcessor = function(targetQuery, processingOptions) {
    // Initialize configuration with provided options or fallbacks.
    const instanceOptions = processingOptions || {};
    this.instanceConfig = instanceOptions;

    // Merge default settings explicitly.
    this.instanceConfig.startOffset = instanceOptions.startOffset ?? PatternProcessor.defaultParameters.startOffset;
    this.instanceConfig.proximityTolerance = instanceOptions.proximityTolerance ?? PatternProcessor.defaultParameters.proximityTolerance;
    this.instanceConfig.minimumAcceptance = instanceOptions.minimumAcceptance ?? PatternProcessor.defaultParameters.minimumAcceptance;
    this.instanceConfig.maxQueryLength = instanceOptions.maxQueryLength ?? PatternProcessor.defaultParameters.maxQueryLength;
    this.instanceConfig.isCaseSensitive = instanceOptions.isCaseSensitive ?? PatternProcessor.defaultParameters.isCaseSensitive;

    // Pre-process the search query based on case sensitivity.
    this.processedQuery = this.instanceConfig.isCaseSensitive ? targetQuery : targetQuery.toLowerCase();
    this.queryLength = this.processedQuery.length;

    // Enforce maximum query length constraint for performance and stability.
    if (this.queryLength === 0) {
      throw new Error('Search query cannot be empty.');
    }
    if (this.queryLength > this.instanceConfig.maxQueryLength) {
      throw new Error(`Query length (${this.queryLength}) exceeds the maximum allowed (${this.instanceConfig.maxQueryLength}).`);
    }

    // Compute the bitmask that signifies a complete pattern match.
    this.finalMatchBit = 1 << (this.queryLength - 1);
    // Build an internal character-to-bitmask lookup table.
    this.characterBitmasks = this._generateCharacterBitmasks();
  };

  /**
   * Establishes the default configuration parameters for PatternProcessor instances.
   * These can be overridden during the instantiation of a new processor.
   */
  PatternProcessor.defaultParameters = {
    // The preferred or expected starting point for a match within the text.
    startOffset: 0,

    // Defines the penalty for matches found far from the `startOffset`.
    // A value of 0 implies that any positional deviation leads to a maximum penalty.
    proximityTolerance: 100,

    // The threshold score below which a match is considered acceptable.
    // 0.0 for perfect matches, 1.0 for any match.
    minimumAcceptance: 0.6,

    // The largest permissible length for a search query.
    // This limit is often tied to bitwise operation efficiency.
    maxQueryLength: 32,

    // Flag to enable or disable case-sensitive matching.
    isCaseSensitive: false
  };

  /**
   * Constructs a mapping from each character in the query to its corresponding bitmask.
   * This pre-computation significantly accelerates the Bitap algorithm.
   * @returns {Object.<string, number>} A dictionary mapping characters to their bitmask representations.
   * @private
   */
  PatternProcessor.prototype._generateCharacterBitmasks = function() {
    const charToMaskMap = {};
    let characterIndex;

    // Initialize all character masks to zero.
    for (characterIndex = 0; characterIndex < this.queryLength; characterIndex++) {
      charToMaskMap[this.processedQuery.charAt(characterIndex)] = 0;
    }

    // Populate the bitmasks. Each bit corresponds to a position in the query string.
    // A bit is set if the character appears at that position.
    for (characterIndex = 0; characterIndex < this.queryLength; characterIndex++) {
      charToMaskMap[this.processedQuery.charAt(characterIndex)] |= (1 << (this.queryLength - 1 - characterIndex));
    }

    return charToMaskMap;
  };

  /**
   * Computes a normalized quality score for a potential match.
   * The score reflects both the number of errors and the match's proximity to the desired location.
   * @param {number} errorCount The count of errors (insertions, deletions, substitutions).
   * @param {number} matchLocation The starting index of the match within the text.
   * @returns {number} A score between 0.0 (perfect match) and 1.0 (worst match).
   * @private
   */
  PatternProcessor.prototype._calculateMatchScore = function(errorCount, matchLocation) {
    const errorComponent = errorCount / this.queryLength;
    const positionalDeviation = Math.abs(this.instanceConfig.startOffset - matchLocation);

    // Guard against division by zero if proximityTolerance is set to 0.
    if (this.instanceConfig.proximityTolerance === 0) {
      return positionalDeviation > 0 ? 1.0 : errorComponent;
    }

    // Combine error and positional components for the final score.
    return errorComponent + (positionalDeviation / this.instanceConfig.proximityTolerance);
  };

  /**
   * Executes the fuzzy search operation using the Bitap algorithm.
   * Searches for the configured pattern within the provided `targetText`.
   * @param {string} targetText The text string against which the pattern is matched.
   * @returns {{isMatchFound: boolean, finalScore: number}} An object encapsulating the match outcome.
   * @public
   */
  PatternProcessor.prototype.findBestMatch = function(targetText) {
    // Early exit for invalid or empty target text.
    if (targetText == null || targetText === '') {
      return { isMatchFound: false, finalScore: 1.0 };
    }

    // Pre-process the target text for case sensitivity.
    const processedTarget = this.instanceConfig.isCaseSensitive ? targetText : targetText.toLowerCase();

    // Fast-path: Check for an exact match.
    if (this.processedQuery === processedTarget) {
      return {
        isMatchFound: true,
        finalScore: 0
      };
    }

    const targetLength = processedTarget.length;
    const { startOffset, minimumAcceptance } = this.instanceConfig;
    let currentBestScore = minimumAcceptance;
    let bestMatchPosition = -1;
    const recordedMatchPositions = []; // Tracks all valid match locations.

    // Optimization: Quickly check for direct, error-free occurrences of the pattern.
    let exactPosition = processedTarget.indexOf(this.processedQuery, startOffset);
    if (exactPosition !== -1) {
      currentBestScore = Math.min(this._calculateMatchScore(0, exactPosition), currentBestScore);
      // Also check for direct hits in the reverse direction to refine the threshold.
      exactPosition = processedTarget.lastIndexOf(this.processedQuery, startOffset + this.queryLength);
      if (exactPosition !== -1) {
        currentBestScore = Math.min(this._calculateMatchScore(0, exactPosition), currentBestScore);
      }
    }

    let searchRangeMin = 0;
    let searchRangeMid;
    let searchRangeMax = this.queryLength + targetLength; // Maximum possible search boundary.

    let scanWindowStart, scanWindowEnd;
    let currentBitfieldStates, previousBitfieldStates;
    let charMatchBitfield;
    let calculatedScore = 1.0; // Default to the worst possible score.

    // Main Bitap loop: Iterate for increasing error levels.
    for (let errorLevel = 0; errorLevel < this.queryLength; errorLevel++) {
      // Binary search to dynamically adjust the scanning window.
      // Determines how far from `startOffset` we can deviate at the current error level.
      searchRangeMin = 0; // Reset for each error level.
      while (searchRangeMin < searchRangeMax) {
        searchRangeMid = Math.floor((searchRangeMax - searchRangeMin) / 2) + searchRangeMin;
        if (this._calculateMatchScore(errorLevel, startOffset + searchRangeMid) <= currentBestScore) {
          searchRangeMin = searchRangeMid;
        } else {
          searchRangeMax = searchRangeMid;
        }
      }

      // Apply the result of the binary search to define the actual scan window.
      searchRangeMax = searchRangeMin; // Update for next iteration.
      scanWindowStart = Math.max(1, startOffset - searchRangeMax + 1);
      scanWindowEnd = Math.min(startOffset + searchRangeMax, targetLength) + this.queryLength;

      // Initialize the bit array for the current pass.
      // Each element `currentBitfieldStates[k]` represents the state of matching
      // the pattern up to the character at `k-1` in `processedTarget`.
      currentBitfieldStates = Array(scanWindowEnd + 2);
      // The initial state for `errorLevel` errors.
      currentBitfieldStates[scanWindowEnd + 1] = (1 << errorLevel) - 1;

      // Iterate backwards through the defined scan window.
      for (let charIdx = scanWindowEnd; charIdx >= scanWindowStart; charIdx--) {
        // Retrieve the pre-computed bitmask for the current character in the target text.
        // Defaults to 0 if the character is not found in the pattern.
        charMatchBitfield = this.characterBitmasks[processedTarget.charAt(charIdx - 1)] || 0;

        if (errorLevel === 0) {
          // First pass: Only perfect matches (zero errors).
          // Shift previous state left, set the new rightmost bit, then AND with character mask.
          currentBitfieldStates[charIdx] = ((currentBitfieldStates[charIdx + 1] << 1) | 1) & charMatchBitfield;
        } else {
          // Subsequent passes: Allow for fuzzy matches (errors).
          // This complex bitwise operation combines possibilities for exact matches,
          // insertions, deletions, and substitutions.
          currentBitfieldStates[charIdx] = (
            ((currentBitfieldStates[charIdx + 1] << 1) | 1) & charMatchBitfield // Match or substitution
            | (((previousBitfieldStates[charIdx + 1] | previousBitfieldStates[charIdx]) << 1) | 1) // Insertion or deletion
            | previousBitfieldStates[charIdx + 1] // Handling for transposition (simplified)
          );
        }

        // If the final bit (representing a full pattern match) is set, a match is found.
        if (currentBitfieldStates[charIdx] & this.finalMatchBit) {
          calculatedScore = this._calculateMatchScore(errorLevel, charIdx - 1);

          // If this match is superior or equal to the current best, update.
          if (calculatedScore <= currentBestScore) {
            currentBestScore = calculatedScore; // Update the threshold.
            bestMatchPosition = charIdx - 1; // Record the best position.
            recordedMatchPositions.push(bestMatchPosition); // Store all acceptable positions.

            // Adjust the scan window for potential further optimization.
            if (bestMatchPosition > startOffset) {
              scanWindowStart = Math.max(1, (startOffset * 2) - bestMatchPosition);
            } else {
              // If we've passed the desired `startOffset`, further matches in this
              // backward scan are unlikely to be better, so we can break.
              break;
            }
          }
        }
      }

      // If the lowest possible score for the next error level is already worse
      // than our current best score, there's no need to continue.
      if (this._calculateMatchScore(errorLevel + 1, startOffset) > currentBestScore) {
        break;
      }
      previousBitfieldStates = currentBitfieldStates; // Store states for the next iteration.
    }

    return {
      isMatchFound: bestMatchPosition >= 0,
      finalScore: calculatedScore
    };
  };


  /**
   * Recursive utility to extract values from deeply nested objects or arrays using a path string.
   * @param {object|Array} inputSource The object or array to navigate.
   * @param {string} accessPath A dot-separated string representing the path to the desired property.
   * @param {Array<any>} collectedValues An array used to accumulate results during recursion.
   * @returns {Array<any>} A list of all values found at the specified path.
   * @private
   */
  const retrieveNestedValue = (inputSource, accessPath, collectedValues) => {
    let currentPathSegment;
    let remainingPath;
    let dotSeparatorIndex;

    // Base case: If no path remains, the current source is the value.
    if (!accessPath) {
      collectedValues.push(inputSource);
      return collectedValues;
    }

    // Determine the next segment and the rest of the path.
    dotSeparatorIndex = accessPath.indexOf('.');
    if (dotSeparatorIndex !== -1) {
      currentPathSegment = accessPath.substring(0, dotSeparatorIndex);
      remainingPath = accessPath.substring(dotSeparatorIndex + 1);
    } else {
      currentPathSegment = accessPath;
      remainingPath = ''; // End of path.
    }

    const segmentContent = inputSource[currentPathSegment];

    if (segmentContent !== undefined && segmentContent !== null) {
      // If no path left and content is a primitive, add it.
      if (!remainingPath && (typeof segmentContent === 'string' || typeof segmentContent === 'number')) {
        collectedValues.push(segmentContent);
      } else if (Array.isArray(segmentContent)) {
        // If content is an array, recurse into each element.
        for (const element of segmentContent) {
          retrieveNestedValue(element, remainingPath, collectedValues);
        }
      } else if (remainingPath) {
        // If content is an object and more path exists, recurse deeper.
        retrieveNestedValue(segmentContent, remainingPath, collectedValues);
      }
    }

    return collectedValues;
  };

  /**
   * A collection of supplementary helper functions for the fuzzy matching engine.
   */
  const SupplementalTools = {
    /**
     * Extracts a property value from a given item using a dot-notation path.
     * @param {object} targetItem The object from which to extract the property.
     * @param {string} propertyPath The dot-separated path to the property.
     * @returns {Array<any>} An array containing all values found at the specified path.
     */
    extractDeepProperty: function(targetItem, propertyPath) {
      // Guard clause for non-object target items.
      if (typeof targetItem !== 'object' || targetItem === null) {
        return [];
      }
      return retrieveNestedValue(targetItem, propertyPath, []);
    },
    /**
     * Determines if a given value is an array.
     * @param {any} value The value to be checked.
     * @returns {boolean} True if the value is an array, false otherwise.
     */
    isArrayType: function(value) {
      return Array.isArray(value);
    }
  };

  /**
   * The primary fuzzy matching engine, responsible for orchestrating searches.
   * @param {Array<object|string|number>} dataSet The collection of items to be searched.
   * @param {object} engineConfiguration Configuration options for the engine.
   * @constructor
   */
  function FuzzySearchEngine(dataSet, engineConfiguration) {
    this.sourceData = dataSet;
    this.engineConfiguration = engineConfiguration = engineConfiguration || {};

    // Define categories for configuration keys to handle defaults appropriately.
    const booleanFlags = ['sortResults', 'outputScores', 'isCaseSensitive'];
    const functionalKeys = ['matchingAlgorithm', 'resultSorter', 'propertyExtractor', 'targetKeys', 'identifierKey'];

    // Apply boolean flags, prioritizing explicit config over defaults.
    for (const keyName of booleanFlags) {
      this.engineConfiguration[keyName] = keyName in engineConfiguration ? engineConfiguration[keyName] : FuzzySearchEngine.defaultParameters[keyName];
    }
    // Apply other configuration settings, prioritizing explicit config over defaults.
    for (const keyName of functionalKeys) {
      this.engineConfiguration[keyName] = engineConfiguration[keyName] || FuzzySearchEngine.defaultParameters[keyName];
    }

    // Ensure targetKeys is always an array, even if empty, for safe iteration.
    if (!SupplementalTools.isArrayType(this.engineConfiguration.targetKeys)) {
      this.engineConfiguration.targetKeys = [];
    }
  }

  /**
   * Defines the default configuration parameters for the FuzzySearchEngine.
   * These settings can be customized during the engine's initialization.
   */
  FuzzySearchEngine.defaultParameters = {
    identifierKey: null, // A path to a unique identifier within each item.

    outputScores: false, // Flag to include the match score in the final results.
    sortResults: true, // Flag to sort the results by score (ascending).
    isCaseSensitive: false, // Flag to enable or disable case sensitivity for matching.

    // The underlying algorithm used for fuzzy pattern matching.
    // Must adhere to the `PatternProcessor` interface.
    matchingAlgorithm: PatternProcessor,

    // Default function for sorting search results based on score.
    resultSorter: (matchA, matchB) => matchA.finalScore - matchB.finalScore,

    // Default function for extracting values from nested properties.
    propertyExtractor: SupplementalTools.extractDeepProperty,

    targetKeys: [] // An array of property paths within items to search.
  };

  /**
   * Initiates a fuzzy search operation using the configured data and pattern.
   * @param {string} searchPattern The string pattern to search for within the data.
   * @returns {Array<object|string|number>} A list of matching items, possibly augmented with scores.
   * @public
   */
  FuzzySearchEngine.prototype.executeFuzzySearch = function(searchPattern) {
    // Implement guard clauses for invalid or empty inputs.
    if (!searchPattern || !this.sourceData || this.sourceData.length === 0) {
      return [];
    }

    // Create an instance of the pattern matching algorithm for the current search.
    const patternMatcher = new(this.engineConfiguration.matchingAlgorithm)(searchPattern, this.engineConfiguration);

    const {
      sourceData,
      engineConfiguration
    } = this;
    const dataItemCount = sourceData.length;
    const searchKeys = engineConfiguration.targetKeys;
    const searchKeysCount = searchKeys.length;

    const preliminaryResults = []; // Temporary storage for raw match data.
    const itemIndexToResultMap = new Map(); // Maps original item index to its result object for efficient updates.

    /**
     * Processes a given text segment, applying the fuzzy search algorithm.
     * Updates `preliminaryResults` with any found matches.
     * @param {string|number|Array<string|number>} textSegment The text or array of texts to evaluate.
     * @param {object|string|number} originalDataItem The complete data item being processed.
     * @param {number} dataItemIndex The original index of `originalDataItem` in `sourceData`.
     * @returns {void}
     */
    const evaluateTextSegment = (textSegment, originalDataItem, dataItemIndex) => {
      // Skip null or undefined segments.
      if (textSegment == null) {
        return;
      }

      if (typeof textSegment === 'string' || typeof textSegment === 'number') {
        const textForSearch = String(textSegment); // Ensure numbers are treated as strings.
        const matchOutcome = patternMatcher.findBestMatch(textForSearch);

        if (matchOutcome.isMatchFound) {
          let existingMatchEntry = itemIndexToResultMap.get(dataItemIndex);
          if (existingMatchEntry) {
            // If item already has a match, update its score if the new one is better.
            existingMatchEntry.finalScore = Math.min(existingMatchEntry.finalScore, matchOutcome.finalScore);
          } else {
            // Otherwise, create a new entry for this item.
            existingMatchEntry = {
              item: originalDataItem,
              finalScore: matchOutcome.finalScore
            };
            itemIndexToResultMap.set(dataItemIndex, existingMatchEntry);
            preliminaryResults.push(existingMatchEntry);
          }
        }
      } else if (SupplementalTools.isArrayType(textSegment)) {
        // If the segment is an array, recursively process each of its elements.
        for (const itemElement of textSegment) {
          evaluateTextSegment(itemElement, originalDataItem, dataItemIndex);
        }
      }
      // Other data types (objects, booleans, etc.) are ignored if not a string, number, or array.
    };

    // Determine search strategy: simple array of primitives or complex array of objects.
    if (dataItemCount > 0 && (typeof sourceData[0] === 'string' || typeof sourceData[0] === 'number')) {
      // Handle a flat array of primitive values.
      for (let i = 0; i < dataItemCount; i++) {
        evaluateTextSegment(sourceData[i], sourceData[i], i);
      }
    } else {
      // Handle an array of objects or mixed types.
      for (let i = 0; i < dataItemCount; i++) {
        const currentRecord = sourceData[i];
        // If no specific keys are defined, and the item itself is a primitive, search it directly.
        if (searchKeysCount === 0 && (typeof currentRecord === 'string' || typeof currentRecord === 'number')) {
          evaluateTextSegment(currentRecord, currentRecord, i);
        } else {
          // Iterate over the configured search keys for each object.
          for (let j = 0; j < searchKeysCount; j++) {
            const currentKeyPath = searchKeys[j];
            const valuesAtPath = engineConfiguration.propertyExtractor(currentRecord, currentKeyPath);
            // Process all values retrieved from the current key path (could be multiple if path leads to array).
            for (const valueEntry of valuesAtPath) {
              evaluateTextSegment(valueEntry, currentRecord, i);
            }
          }
        }
      }
    }

    // Sort the results if sorting is enabled in the configuration.
    if (engineConfiguration.sortResults) {
      preliminaryResults.sort(engineConfiguration.resultSorter);
    }

    const finalOutput = [];

    // Format the preliminary results into the desired final output structure.
    for (let i = 0, totalResults = preliminaryResults.length; i < totalResults; i++) {
      let currentResultEntry = preliminaryResults[i];

      // If an identifier key is specified, replace the full item with its ID.
      if (engineConfiguration.identifierKey) {
        const idValues = engineConfiguration.propertyExtractor(currentResultEntry.item, engineConfiguration.identifierKey);
        // Assuming a unique ID, take the first value found.
        if (idValues.length > 0) {
          currentResultEntry.item = idValues[0];
        } else {
          // If ID not found, maintain the original item or handle as needed.
          // For this clone, we'll keep the original item if ID is missing.
        }
      }

      // Add the item to the final output, optionally including its score.
      if (engineConfiguration.outputScores) {
        finalOutput.push(currentResultEntry);
      } else {
        finalOutput.push(currentResultEntry.item);
      }
    }

    return finalOutput;
  };

  // Standardized module export for various environments (CommonJS, AMD, Browser Globals).
  if (typeof exports === 'object' && typeof module === 'object') {
    // Node.js (CommonJS) environment.
    module.exports = FuzzySearchEngine;
  } else if (typeof define === 'function' && define.amd) {
    // AMD (e.g., RequireJS) environment.
    define(() => FuzzySearchEngine);
  } else {
    // Browser global scope (attaches to `window` or similar context).
    topLevelContext.FuzzySearchEngine = FuzzySearchEngine;
  }

})(this);
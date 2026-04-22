// This utility provides flexible string matching capabilities.
// It's designed to help users find relevant text based on a fuzzy pattern.
//
// Project: StringMatchGuru
// Source: https://github.com/someUser/stringmatchguru (fictional)
//
// Copyright (c) 2023 Acme Corp.
// Licensed under the Apache-2.0 License.

(function() {

  // Establish the global object, `window` in browsers, `global` in Node.js.
  const globalObject = this;

  // Our primary interface for fuzzy string operations.
  const textSearchUtil = {};

  // Conditional export for Node.js modules or browser global scope.
  if (typeof exports !== 'undefined' && exports === module.exports) {
    // Node.js environment: export as a module.
    module.exports = textSearchUtil;
  } else {
    // Browser environment or other global context: attach to the global object.
    globalObject.textSearchUtil = textSearchUtil;
  }

  /**
   * Applies a basic fuzzy filter to an array of strings.
   *
   * @param {string} queryPattern - The pattern to search for.
   * @param {Array<string>} targetStrings - The collection of strings to filter.
   * @returns {Array<string>} A new array containing only the strings that fuzzy match the pattern.
   */
  textSearchUtil.findMatchingStrings = function(queryPattern, targetStrings) {
    if (!Array.isArray(targetStrings) || targetStrings.length === 0) {
      return []; // Early exit for empty or invalid input array.
    }
    return targetStrings.filter(candidate => {
      // Delegate the actual match check to a dedicated function.
      return textSearchUtil.checkMatchExistence(queryPattern, candidate);
    });
  };

  /**
   * Determines if a given pattern fuzzy matches a source string.
   *
   * @param {string} searchPattern - The pattern.
   * @param {string} sourceText - The string to check against.
   * @returns {boolean} True if a fuzzy match is found, false otherwise.
   */
  textSearchUtil.checkMatchExistence = function(searchPattern, sourceText) {
    // If the pattern is empty, it "matches" everything in a trivial sense,
    // but for fuzzy matching, we usually want at least some pattern.
    if (!searchPattern || searchPattern.length === 0) {
        return true; // Or false, depending on desired strictness for empty patterns. Let's make it true for now.
    }
    // A match exists if the detailed match function doesn't return null.
    const detailedResult = textSearchUtil.processAndScoreMatch(searchPattern, sourceText);
    return detailedResult !== null;
  };

  /**
   * Attempts to find a fuzzy match between a pattern and an input string.
   * If a match is found, it returns a structured object including the
   * 'rendered' string with matching characters highlighted and a 'score'.
   * Otherwise, it returns null.
   *
   * @param {string} searchPattern - The pattern to match.
   * @param {string} inputString - The string to search within.
   * @param {object} [matchOptions={}] - Configuration options for the match process.
   * @param {string} [matchOptions.prefixTag=''] - String to prepend to matched characters.
   * @param {string} [matchOptions.suffixTag=''] - String to append to matched characters.
   * @param {boolean} [matchOptions.caseSensitive=false] - Whether the comparison should be case-sensitive.
   * @returns {object|null} An object with `highlightedText` and `matchScore` if matched, otherwise `null`.
   */
  textSearchUtil.processAndScoreMatch = function(searchPattern, inputString, matchOptions) {
    const config = Object.assign({
      prefixTag: '',
      suffixTag: '',
      caseSensitive: false
    }, matchOptions);

    if (!inputString || inputString.length === 0) {
      return null; // Cannot match an empty or null input string.
    }
    if (!searchPattern || searchPattern.length === 0) {
        return { highlightedText: inputString, matchScore: 0 }; // Empty pattern matches everything with no score.
    }

    let currentPatternIndex = 0;
    const outputSegments = [];
    let cumulativeMatchScore = 0;
    let consecutiveMatchBonus = 0; // Renamed from currScore
    const stringLength = inputString.length;

    // Prepare pattern and string for comparison based on case sensitivity.
    const effectiveSearchPattern = config.caseSensitive ? searchPattern : searchPattern.toLowerCase();
    const effectiveInputString = config.caseSensitive ? inputString : inputString.toLowerCase();

    // Iterate through each character of the input string.
    for (let currentStringIndex = 0; currentStringIndex < stringLength; currentStringIndex++) {
      const originalChar = inputString[currentStringIndex]; // Keep original case for output.
      const charForComparison = effectiveInputString[currentStringIndex];

      // Check if the current character matches the next character in the pattern.
      if (charForComparison === effectiveSearchPattern[currentPatternIndex]) {
        // If it matches, apply highlighting and advance the pattern index.
        outputSegments.push(config.prefixTag + originalChar + config.suffixTag);
        currentPatternIndex++;

        // Boost score for consecutive matches.
        consecutiveMatchBonus = (consecutiveMatchBonus * 1.5) + 1; // Modified scoring logic
      } else {
        // If no match, add the original character without highlighting.
        outputSegments.push(originalChar);
        consecutiveMatchBonus = 0; // Reset consecutive bonus.
      }
      cumulativeMatchScore += consecutiveMatchBonus; // Add current bonus to total.
    }

    // A full match requires all characters of the pattern to be found.
    if (currentPatternIndex === effectiveSearchPattern.length) {
      return { highlightedText: outputSegments.join(''), matchScore: cumulativeMatchScore };
    }

    // No full pattern match found.
    return null;
  };

  /**
   * Performs a comprehensive fuzzy search on an array of items.
   * It returns an array of matched results, each containing the
   * rendered string, its score, original index, and the original item.
   * Results are sorted by score (descending) and then by original index (ascending) for stability.
   *
   * @param {string} searchCriterion - The pattern to search for.
   * @param {Array<any>} sourceCollection - The array of items to search through.
   * @param {object} [processingOptions={}] - Configuration options.
   * @param {string} [processingOptions.prefixTag=''] - HTML/text to prepend to matched characters.
   * @param {string} [processingOptions.suffixTag=''] - HTML/text to append to matched characters.
   * @param {boolean} [processingOptions.caseSensitive=false] - If the search should be case-sensitive.
   * @param {Function} [processingOptions.dataExtractor] - A function that extracts the string to search against from an item in `sourceCollection`. Defaults to identity function for strings.
   * @returns {Array<object>} An array of objects describing the matches, sorted by relevance.
   */
  textSearchUtil.refineCollection = function(searchCriterion, sourceCollection, processingOptions) {
    const defaultOptions = {
      prefixTag: '',
      suffixTag: '',
      caseSensitive: false,
      dataExtractor: item => item // Default extractor for simple string arrays.
    };
    const finalOptions = Object.assign(defaultOptions, processingOptions);

    // Guard clause: If the source collection is not an array or is empty, return an empty array.
    if (!Array.isArray(sourceCollection) || sourceCollection.length === 0) {
      return [];
    }

    // Process each item in the source collection.
    const processedResults = sourceCollection.reduce((accumulator, currentItem, originalPosition) => {
      // Extract the string to be compared from the current item.
      // Use the provided dataExtractor or the default.
      const comparisonTarget = finalOptions.dataExtractor(currentItem);

      // Perform the detailed fuzzy match.
      const matchDetails = textSearchUtil.processAndScoreMatch(
        searchCriterion,
        String(comparisonTarget), // Ensure comparisonTarget is always a string.
        finalOptions // Pass all relevant options.
      );

      // If a match was found, add it to the accumulator.
      if (matchDetails !== null) {
        accumulator.push({
          highlightedString: matchDetails.highlightedText,
          matchScore: matchDetails.matchScore,
          originalIndex: originalPosition,
          originalItem: currentItem
        });
      }
      return accumulator;
    }, []); // Initialize accumulator as an empty array.

    // Sort the results based on score (descending) and then original index (ascending for stability).
    processedResults.sort((first, second) => {
      // Primary sort: by match score, higher scores first.
      const scoreDifference = second.matchScore - first.matchScore;
      if (scoreDifference !== 0) {
        return scoreDifference;
      }
      // Secondary sort: if scores are equal, maintain original order.
      return first.originalIndex - second.originalIndex;
    });

    return processedResults;
  };

}());
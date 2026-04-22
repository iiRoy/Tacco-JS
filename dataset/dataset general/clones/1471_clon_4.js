(function(globalScope) {

  // A different implementation for fuzzy pattern matching, distinct from Bitap.
  // This uses a dynamic programming approach for optimal subsequence matching
  // with custom penalties, combined with a proximity-based score.
  class PatternMatcher {
    constructor(searchQuery, parameters) {
      parameters = parameters || {};
      this.inputQuery = parameters.caseSensitive ? searchQuery : searchQuery.toLowerCase();
      this.queryLength = this.inputQuery.length;

      this.inputParameters = {
        centerPoint: parameters.location || 0,
        spreadFactor: 'distance' in parameters ? parameters.distance : 100,
        errorTolerance: 'threshold' in parameters ? parameters.threshold : 0.6,
        maximumQueryLength: parameters.maxPatternLength || 32
      };

      if (this.queryLength > this.inputParameters.maximumQueryLength) {
        throw new Error('Query length is excessive');
      }
    }

    // Computes a match fit score based on deviation (errors) and position.
    // Lower score indicates a better fit.
    calculateFit(deviationAmount, finalPosition) {
      let accuracyFactor = deviationAmount / this.queryLength;
      let proximityFactor = Math.abs(this.inputParameters.centerPoint - finalPosition);

      if (!this.inputParameters.spreadFactor) {
        return proximityFactor ? 1.0 : accuracyFactor;
      }
      return accuracyFactor + (proximityFactor / this.inputParameters.spreadFactor);
    }

    // Finds the optimal subsequence match of `shortPattern` within `longString`.
    // Returns the error count and the end index of the match in `longString`.
    findOptimalSubsequenceMatch(longString, shortPattern) {
      const patternLen = shortPattern.length;
      const contentLen = longString.length;

      // dp[i][j] stores the minimum errors to match pattern[0...i-1]
      // using a subsequence of longString[0...j-1].
      // Each entry is { errors: number, lastMatchIndex: number }
      // Initialize with infinity errors.
      let dp = Array(patternLen + 1).fill(null).map(() =>
        Array(contentLen + 1).fill(null).map(() => ({ errors: Infinity, lastMatchIndex: -1 }))
      );

      // Matching an empty pattern (i=0) always has 0 errors, and conceptually ends before any character.
      for (let j = 0; j <= contentLen; j++) {
        dp[0][j] = { errors: 0, lastMatchIndex: j - 1 };
      }

      for (let i = 1; i <= patternLen; i++) {
        for (let j = 1; j <= contentLen; j++) {
          // Option 1: Skip longString[j-1]. The match for pattern[0...i-1] must end before j-1.
          // Add a penalty (0.5 for a "gap").
          const skipLongStringCharErrors = dp[i][j - 1].errors === Infinity ? Infinity : dp[i][j - 1].errors + 0.5;
          dp[i][j] = { errors: skipLongStringCharErrors, lastMatchIndex: dp[i][j - 1].lastMatchIndex };

          // Option 2: Use longString[j-1] to match pattern[i-1].
          // This means pattern[0...i-2] was matched using longString[0...k] (k < j-1)
          // and then pattern[i-1] matches/mismatches longString[j-1].
          const matchCost = (shortPattern[i - 1] === longString[j - 1]) ? 0 : 1;
          if (dp[i - 1][j - 1].errors !== Infinity) {
            const currentMatchErrors = dp[i - 1][j - 1].errors + matchCost;
            if (currentMatchErrors < dp[i][j].errors) {
              dp[i][j] = { errors: currentMatchErrors, lastMatchIndex: j - 1 };
            } else if (currentMatchErrors === dp[i][j].errors) {
              // If errors are equal, prefer the one with a later end position (if it matches the character)
              if (matchCost === 0 && j - 1 > dp[i][j].lastMatchIndex) {
                dp[i][j].lastMatchIndex = j - 1;
              }
            }
          }
        }
      }

      // Find the best overall match for the entire pattern
      let bestFinalErrors = Infinity;
      let bestFinalMatchEndIndex = -1;

      for (let j = 0; j <= contentLen; j++) {
        if (dp[patternLen][j].errors < bestFinalErrors) {
          bestFinalErrors = dp[patternLen][j].errors;
          bestFinalMatchEndIndex = dp[patternLen][j].lastMatchIndex;
        } else if (dp[patternLen][j].errors === bestFinalErrors) {
          // If errors are equal, prefer the one with a later end position
          if (dp[patternLen][j].lastMatchIndex > bestFinalMatchEndIndex) {
            bestFinalMatchEndIndex = dp[patternLen][j].lastMatchIndex;
          }
        }
      }

      return {
        found: bestFinalMatchEndIndex !== -1 && bestFinalErrors !== Infinity,
        errorCount: bestFinalErrors,
        matchEndIndex: bestFinalMatchEndIndex
      };
    }

    // Analyzes a content string for the pattern.
    // Returns an object indicating if a match was found and its rating.
    analyze(contentString) {
      let processedContent = this.inputParameters.caseSensitive ? contentString : contentString.toLowerCase();

      if (this.inputQuery === processedContent) {
        return {
          found: true,
          rating: 0
        };
      }

      const contentLen = processedContent.length;
      const queryLen = this.queryLength;

      if (queryLen === 0) {
        return { found: true, rating: 0 };
      }
      if (contentLen === 0) {
        return { found: false, rating: 1 };
      }

      let bestOverallRating = 1;
      let bestOverallEndPosition = -1;

      // Speedup: Check for exact match in vicinity first
      let exactMatchStartPos = processedContent.indexOf(this.inputQuery, Math.max(0, this.inputParameters.centerPoint - this.queryLength));
      if (exactMatchStartPos !== -1) {
        let tempRating = this.calculateFit(0, exactMatchStartPos + queryLen - 1); // End position of exact match
        if (tempRating <= this.inputParameters.errorTolerance) {
          bestOverallRating = tempRating;
          bestOverallEndPosition = exactMatchStartPos + queryLen - 1;
        }
      }

      let exactMatchStartPosReverse = processedContent.lastIndexOf(this.inputQuery, this.inputParameters.centerPoint + this.queryLength);
      if (exactMatchStartPosReverse !== -1) {
        let tempRating = this.calculateFit(0, exactMatchStartPosReverse + queryLen - 1);
        if (tempRating <= this.inputParameters.errorTolerance) {
          if (tempRating < bestOverallRating) {
            bestOverallRating = tempRating;
            bestOverallEndPosition = exactMatchStartPosReverse + queryLen - 1;
          }
        }
      }

      // Perform the main fuzzy search using the optimal subsequence matching DP
      let subMatchResult = this.findOptimalSubsequenceMatch(processedContent, this.inputQuery);

      if (subMatchResult.found) {
        const currentRating = this.calculateFit(subMatchResult.errorCount, subMatchResult.matchEndIndex);
        if (currentRating < bestOverallRating) {
          bestOverallRating = currentRating;
          bestOverallEndPosition = subMatchResult.matchEndIndex;
        }
      }

      return {
        found: bestOverallEndPosition !== -1 && bestOverallRating <= this.inputParameters.errorTolerance,
        rating: bestOverallRating
      };
    }
  }

  // A different utility for accessing nested values in objects.
  class ValueRetriever {
    // Iteratively retrieves values from an object based on a dot-separated path.
    static retrieveNestedValue(sourceObject, attributePath) {
      if (!attributePath) {
        return [sourceObject];
      }

      let segments = attributePath.split('.');
      let currentValues = [sourceObject];
      let results = [];

      segments.forEach(segment => {
        let nextValues = [];
        currentValues.forEach(current => {
          if (current && typeof current === 'object' && Object.prototype.hasOwnProperty.call(current, segment)) {
            let val = current[segment];
            if (Array.isArray(val)) {
              nextValues.push(...val);
            } else {
              nextValues.push(val);
            }
          }
        });
        currentValues = nextValues;
      });

      // Filter for primitive types (strings/numbers) at the leaf level
      return currentValues.filter(v => typeof v === 'string' || typeof v === 'number');
    }
  }

  // The main fuzzy search orchestration class.
  class DataLocator {
    constructor(dataCollection, searchSettings) {
      this.dataCollection = dataCollection;
      this.searchSettings = searchSettings || {};

      const defaultSettings = {
        idField: null,
        caseInsensitive: false,
        includeMatchScore: false,
        performSorting: true,
        scoringFunction: (a, b) => a.rating - b.rating,
        keyAccessor: ValueRetriever.retrieveNestedValue,
        matchEngine: PatternMatcher,
        targetKeys: [],
        centerPoint: 0,
        spreadFactor: 100,
        errorTolerance: 0.6,
        maximumQueryLength: 32
      };

      this.searchSettings = { ...defaultSettings, ...this.searchSettings };

      // Invert caseInsensitive to caseSensitive for PatternMatcher
      this.searchSettings.caseSensitive = !this.searchSettings.caseInsensitive;
    }

    // Searches the data collection for items matching the query.
    findMatches(queryInput) {
      const matchingEngine = new (this.searchSettings.matchEngine)(queryInput, {
        location: this.searchSettings.centerPoint,
        distance: this.searchSettings.spreadFactor,
        threshold: this.searchSettings.errorTolerance,
        caseSensitive: this.searchSettings.caseSensitive,
        maxPatternLength: this.searchSettings.maximumQueryLength
      });

      let intermediateResults = [];
      let itemRegistry = {}; // Maps original item index to its best match record

      // Helper for processing individual text values for matching.
      const processValueForMatch = (textValue, dataEntity, entityIndex) => {
        if (textValue === undefined || textValue === null) {
          return;
        }

        if (typeof textValue === 'string' || typeof textValue === 'number') {
          const matchOutcome = matchingEngine.analyze(String(textValue)); // Ensure string for matching
          if (matchOutcome.found) {
            let existingRecord = itemRegistry[entityIndex];
            if (existingRecord) {
              existingRecord.rating = Math.min(existingRecord.rating, matchOutcome.rating);
            } else {
              const newRecord = {
                sourceItem: dataEntity,
                rating: matchOutcome.rating
              };
              itemRegistry[entityIndex] = newRecord;
              intermediateResults.push(newRecord);
            }
          }
        } else if (Array.isArray(textValue)) {
          textValue.forEach(val => processValueForMatch(val, dataEntity, entityIndex));
        }
      };

      // Iterate through the data collection based on its structure.
      if (this.dataCollection.length > 0 && (typeof this.dataCollection[0] === 'string' || typeof this.dataCollection[0] === 'number')) {
        this.dataCollection.forEach((item, index) => {
          processValueForMatch(item, item, index);
        });
      } else {
        this.dataCollection.forEach((item, index) => {
          this.searchSettings.targetKeys.forEach(keyPath => {
            const values = this.searchSettings.keyAccessor(item, keyPath);
            values.forEach(val => processValueForMatch(val, item, index));
          });
        });
      }

      if (this.searchSettings.performSorting) {
        intermediateResults.sort(this.searchSettings.scoringFunction);
      }

      // Format and return the final results.
      return intermediateResults.map(res => {
        let finalItem = res.sourceItem;
        if (this.searchSettings.idField) {
          const idValues = this.searchSettings.keyAccessor(res.sourceItem, this.searchSettings.idField);
          if (idValues.length > 0) {
            finalItem = idValues[0];
          }
        }
        return this.searchSettings.includeMatchScore ? { element: finalItem, grade: res.rating } : finalItem;
      });
    }
  }

  // Export to different global/module names.
  if (typeof exports === 'object') {
    module.exports = DataLocator;
  } else if (typeof define === 'function' && define.amd) {
    define(function() {
      return DataLocator;
    });
  } else {
    globalScope.FuzzySearchEngine = DataLocator;
  }

})(this);
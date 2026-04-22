(function() {
  const globalReference = (typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this);

  const PatternLocator = {};

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PatternLocator;
  } else {
    globalReference.PatternLocator = PatternLocator;
  }

  const findOrderedSubsequenceMatch = function(searchKey, sourceString, config) {
    config = config || {};
    const startMark = config.startMark || '';
    const endMark = config.endMark || '';
    const respectCase = config.respectCase || false;

    const normalizedKey = respectCase ? searchKey : searchKey.toLowerCase();
    const normalizedSource = respectCase ? sourceString : sourceString.toLowerCase();

    const _recursiveMatch = (kIdx, sIdx, accumulatedScore, currentStreakScore, outputSegments) => {
      if (kIdx === normalizedKey.length) {
        for (let i = sIdx; i < sourceString.length; i++) {
          outputSegments.push(sourceString[i]);
        }
        return {
          formattedResult: outputSegments.join(''),
          relevanceMetric: accumulatedScore,
          foundCharCount: normalizedKey.length
        };
      }

      if (sIdx === normalizedSource.length) {
        return null;
      }

      const currentSourceChar = sourceString[sIdx];
      const currentProcessedSourceChar = normalizedSource[sIdx];
      const currentKeyChar = normalizedKey[kIdx];

      if (currentProcessedSourceChar === currentKeyChar) {
        const newStreakScore = currentStreakScore + 1 + currentStreakScore;
        const newAccumulatedScore = accumulatedScore + newStreakScore;
        const newOutputSegments = outputSegments.concat(startMark + currentSourceChar + endMark);

        return _recursiveMatch(kIdx + 1, sIdx + 1, newAccumulatedScore, newStreakScore, newOutputSegments);
      } else {
        const newOutputSegments = outputSegments.concat(currentSourceChar);
        return _recursiveMatch(kIdx, sIdx + 1, accumulatedScore, 0, newOutputSegments);
      }
    };

    const finalMatchResult = _recursiveMatch(0, 0, 0, 0, []);

    if (finalMatchResult && finalMatchResult.foundCharCount === normalizedKey.length) {
      return finalMatchResult;
    }

    return null;
  };

  PatternLocator.hasOrderedSubsequence = function(searchKey, sourceString) {
    return findOrderedSubsequenceMatch(searchKey, sourceString) !== null;
  };

  PatternLocator.locateSimpleSubstrings = function(searchKey, sourceStrings) {
    const matchingStrings = [];
    for (let i = 0; i < sourceStrings.length; i++) {
      if (PatternLocator.hasOrderedSubsequence(searchKey, sourceStrings[i])) {
        matchingStrings.push(sourceStrings[i]);
      }
    }
    return matchingStrings;
  };

  PatternLocator.searchAndRankCollection = function(searchKey, sourceCollection, config) {
    config = config || {};
    const valueExtractor = config.valueExtractor;
    const processedResults = [];

    for (let currentPosition = 0; currentPosition < sourceCollection.length; currentPosition++) {
      const currentElement = sourceCollection[currentPosition];
      let comparableValue = currentElement;

      if (valueExtractor) {
        comparableValue = valueExtractor(currentElement);
      }

      const matchOutcome = findOrderedSubsequenceMatch(searchKey, comparableValue, {
        startMark: config.startMark,
        endMark: config.endMark,
        respectCase: config.respectCase
      });

      if (matchOutcome !== null) {
        processedResults.push({
          formattedResult: matchOutcome.formattedResult,
          relevanceMetric: matchOutcome.relevanceMetric,
          originalPosition: currentPosition,
          initialElement: currentElement
        });
      }
    }

    processedResults.sort((itemA, itemB) => {
      const relevanceDifference = itemB.relevanceMetric - itemA.relevanceMetric;
      if (relevanceDifference !== 0) {
        return relevanceDifference;
      }
      return itemA.originalPosition - itemB.originalPosition;
    });

    return processedResults;
  };

})();
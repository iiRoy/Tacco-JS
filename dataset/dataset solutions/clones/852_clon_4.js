'use strict';

const failureOutcome = (idx) => ({ successful: false, payload: null, subsequentIndex: idx });

function literalMatcher(patternToMatch) {
  const patternLength = patternToMatch.length;
  return function (inputString, currentPosition) {
    if (inputString.startsWith(patternToMatch, currentPosition)) {
      return { successful: true, payload: patternToMatch, subsequentIndex: currentPosition + patternLength };
    }
    return failureOutcome(currentPosition);
  };
}

function anyOfRecursive(...processingUnits) {
  return function (inputString, currentPosition) {
    const attemptNext = (unitIndex) => {
      if (unitIndex >= processingUnits.length) {
        return failureOutcome(currentPosition);
      }

      const activeUnit = processingUnits[unitIndex];
      const outcome = activeUnit(inputString, currentPosition);

      if (outcome.successful) {
        return outcome;
      } else {
        return attemptNext(unitIndex + 1);
      }
    };

    return attemptNext(0);
  };
}

function sequenceRecursive(...processingUnits) {
  return function (inputString, currentPosition) {
    const processChain = (unitIndex, currentParsePosition, accumulatedPayloads) => {
      if (unitIndex >= processingUnits.length) {
        return { successful: true, payload: accumulatedPayloads, subsequentIndex: currentParsePosition };
      }

      const activeUnit = processingUnits[unitIndex];
      const outcome = activeUnit(inputString, currentParsePosition);

      if (!outcome.successful) {
        return failureOutcome(currentPosition);
      }

      accumulatedPayloads.push(outcome.payload);
      return processChain(unitIndex + 1, outcome.subsequentIndex, accumulatedPayloads);
    };

    return processChain(0, currentPosition, []);
  };
}

function deferred(parserProducer) {
  let cachedParser;
  return function (inputString, currentPosition) {
    if (!cachedParser) {
      cachedParser = parserProducer();
    }
    return cachedParser(inputString, currentPosition);
  };
}

function transform(baseProcessor, resultMapper) {
  return function (inputString, currentPosition) {
    const outcome = baseProcessor(inputString, currentPosition);
    if (outcome.successful) {
      return {
        successful: true,
        payload: resultMapper(outcome.payload),
        subsequentIndex: outcome.subsequentIndex
      };
    }
    return outcome;
  };
}

function charFrom(allowedCharactersString) {
  const characterSet = new Set(allowedCharactersString);
  return function (inputString, currentPosition) {
    if (currentPosition >= inputString.length) {
      return failureOutcome(currentPosition);
    }
    const extractedChar = inputString.charAt(currentPosition);
    if (characterSet.has(extractedChar)) {
      return { successful: true, payload: extractedChar, subsequentIndex: currentPosition + 1 };
    }
    return failureOutcome(currentPosition);
  };
}
'use strict';

// A parser function now returns a tuple `[parsedValue, newPosition]` on success,
// or `null` on failure. This is a fundamental change in the parser's return contract.

const makeLiteralParser = (literalSequence) => {
  const sequenceLength = literalSequence.length;
  return (sourceInput, currentPoint) => {
    if (sourceInput.startsWith(literalSequence, currentPoint)) {
      return [literalSequence, currentPoint + sequenceLength];
    }
    return null;
  };
};

const selectAlternative = (...parserFunctions) => {
  return (sourceInput, currentPoint) => {
    // Iterate through the provided parser functions using a modern for...of loop.
    // Return the result of the first parser that successfully matches.
    for (const currentParser of parserFunctions) {
      const parseOutcome = currentParser(sourceInput, currentPoint);
      if (parseOutcome !== null) {
        return parseOutcome;
      }
    }
    // If no parser succeeded after checking all alternatives, return null.
    return null;
  };
};

const chainParsers = (...parserFunctions) => {
  return (sourceInput, initialPoint) => {
    // Use Array.prototype.reduce to process parsers sequentially,
    // accumulating results and updating the position.
    const finalState = parserFunctions.reduce((accumulator, currentParser) => {
      // If a previous parser in the sequence failed (accumulator is null),
      // propagate that failure immediately without trying further parsers.
      if (accumulator === null) {
        return null;
      }

      // Destructure the accumulated state: [array of parsed values, current parsing position].
      const [collectedValues, currentPosition] = accumulator;
      const parseOutcome = currentParser(sourceInput, currentPosition);

      if (parseOutcome === null) {
        // If the current parser fails, the entire sequence fails.
        return null;
      } else {
        // If the current parser succeeds, update the collected values and the position.
        const [parsedValue, nextPosition] = parseOutcome;
        return [[...collectedValues, parsedValue], nextPosition];
      }
    }, [[], initialPoint]); // Initial accumulator: an empty array for values and the starting point.

    // The finalState will either be `null` (if any parser failed)
    // or `[allParsedValues, finalPosition]` (if all parsers succeeded).
    return finalState;
  };
};

const deferParser = (parserFactory) => {
  let cachedParser = null; // Use 'let' for mutable state.

  return (sourceInput, currentPoint) => {
    // Initialize the parser only on its first invocation (lazy evaluation).
    if (cachedParser === null) {
      cachedParser = parserFactory();
    }
    return cachedParser(sourceInput, currentPoint);
  };
};

const transformResult = (baseParser, mappingFunction) => {
  return (sourceInput, currentPoint) => {
    const parseOutcome = baseParser(sourceInput, currentPoint);
    if (parseOutcome === null) {
      return null; // Propagate failure.
    } else {
      // Destructure the successful outcome and apply the mapping function.
      const [originalValue, nextPosition] = parseOutcome;
      const mappedValue = mappingFunction(originalValue);
      return [mappedValue, nextPosition];
    }
  };
};

const parseAnyCharFrom = (allowedCharacters) => {
  // Use a Set for efficient O(1) lookup of allowed characters.
  const characterSet = new Set(allowedCharacters);

  return (sourceInput, currentPoint) => {
    // Check for end-of-string condition before attempting to read.
    if (currentPoint >= sourceInput.length) {
      return null;
    }
    // Access the character directly by index.
    const character = sourceInput[currentPoint];
    if (characterSet.has(character)) {
      return [character, currentPoint + 1];
    }
    return null;
  };
};

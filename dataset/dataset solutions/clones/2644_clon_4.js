console.log((inputData => {
  const extractStrings = (rawInput) => {
    const [sourcePattern, targetSequence] = rawInput.trim().split('\n');
    return { sourcePattern, targetSequence };
  };

  const generateCharIndexMap = (textSegment) => {
    const indexRegistry = Array.from({ length: 26 }, () => []);
    for (let charPosition = 0; charPosition < textSegment.length; charPosition++) {
      indexRegistry[textSegment.charCodeAt(charPosition) - 97].push(charPosition);
    }
    return indexRegistry;
  };

  const determinePathLength = (sourcePattern, targetSequence) => {
    const patternLength = sourcePattern.length;
    const charIndexRegistry = generateCharIndexMap(sourcePattern);

    let absoluteCursorPosition = -1; // Represents the 0-indexed position in the conceptual infinite string
    let fullPatternTraversals = 0;

    for (let sequenceElementIndex = 0; sequenceElementIndex < targetSequence.length; sequenceElementIndex++) {
      const charAlphabetIndex = targetSequence.charCodeAt(sequenceElementIndex) - 97;
      const availableIndices = charIndexRegistry[charAlphabetIndex];

      if (availableIndices.length === 0) {
        return '-1'; // Target character not present in the source pattern
      }

      const relativeCursorPosition = absoluteCursorPosition % patternLength;

      let nextRelativeIndexInCurrentCycle = -1;
      // Search for the smallest index in availableIndices that is greater than relativeCursorPosition
      for (let indexIterator = 0; indexIterator < availableIndices.length; indexIterator++) {
        if (availableIndices[indexIterator] > relativeCursorPosition) {
          nextRelativeIndexInCurrentCycle = availableIndices[indexIterator];
          break;
        }
      }

      if (nextRelativeIndexInCurrentCycle !== -1) {
        // Character found within the current segment of the source pattern
        absoluteCursorPosition = fullPatternTraversals * patternLength + nextRelativeIndexInCurrentCycle;
      } else {
        // Character not found in the current segment, requiring a wrap-around to the next pattern cycle
        fullPatternTraversals++;
        absoluteCursorPosition = fullPatternTraversals * patternLength + availableIndices[0]; // Use the first occurrence in the new cycle
      }
    }

    return `${absoluteCursorPosition + 1}`; // Convert to 1-indexed length for final output
  };

  const { sourcePattern, targetSequence } = extractStrings(inputData);
  return determinePathLength(sourcePattern, targetSequence);
})(require('fs').readFileSync('/dev/stdin', 'utf8')));

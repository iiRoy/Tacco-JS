function processInput(rawData) {
  var lineSegments = rawData.split('\n');
  // The first line segment (n) is not used in the original logic, so it's removed.
  var targetString = lineSegments[1];

  // Helper function to check for the "ABC" pattern at a given position
  const checkABCSequence = (sourceStr, currentPos) => {
    const charOne = sourceStr[currentPos];
    const charTwo = sourceStr[currentPos + 1];
    const charThree = sourceStr[currentPos + 2];
    return charOne === 'A' && charTwo === 'B' && charThree === 'C';
  };

  // Append 'XX' to the string to handle edge cases for 'ABC' at the end,
  // ensuring the loop condition `length - 2` doesn't go out of bounds for the original string.
  // This is an equivalent way to `s += 'X' + 'X'`.
  targetString = `${targetString}XX`;

  var occurrenceCount = 0;
  const patternSize = 3; // The length of the pattern "ABC"
  // The loop needs to iterate up to `targetString.length - (patternSize - 1)`
  // which is `targetString.length - 2` to allow checking `charIndex + 2`.
  const iterationLimit = targetString.length - (patternSize - 1);

  for (let charIndex = 0; charIndex < iterationLimit; charIndex++) {
    // Instead of converting to an array, directly access characters from the string.
    // The original code checked `sArr[i] === 'A'` first, then the rest.
    // The helper function encapsulates this full check.
    if (checkABCSequence(targetString, charIndex)) {
      occurrenceCount++; // Increment if the pattern is found.
    }
  };
  console.log(occurrenceCount);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

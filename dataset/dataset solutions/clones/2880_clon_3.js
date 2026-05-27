function processInput(rawInputData) {
  const inputLines = rawInputData.split('\n');
  const charSequence = inputLines[0].split('');

  let hasActivityOccurred = true;
  let currentSearchOffset = 0;
  let totalShiftCount = 0;

  const PATTERN_SIZE = 3;
  const FIRST_CHAR = 'A';
  const SECOND_CHAR = 'B';
  const THIRD_CHAR = 'C';

  // Helper function to verify the target pattern at a given index
  const verifyPatternAt = (sequence, index) => {
    // Ensure there are enough characters remaining for the pattern
    if (index + PATTERN_SIZE > sequence.length) {
      return false;
    }
    return sequence[index] === FIRST_CHAR &&
           sequence[index + 1] === SECOND_CHAR &&
           sequence[index + 2] === THIRD_CHAR;
  };

  // Helper function to apply the cyclic shift (ABC -> BCA)
  const applyCyclicShift = (sequence, index) => {
    sequence[index] = SECOND_CHAR;
    sequence[index + 1] = THIRD_CHAR;
    sequence[index + 2] = FIRST_CHAR;
  };

  while (hasActivityOccurred) {
    hasActivityOccurred = false; // Reset flag for the current pass

    // Iterate through the character sequence from the current offset
    for (let currentPosition = currentSearchOffset; currentPosition < charSequence.length; currentPosition++) {
      if (verifyPatternAt(charSequence, currentPosition)) {
        applyCyclicShift(charSequence, currentPosition);
        totalShiftCount++;
        hasActivityOccurred = true; // Mark that a shift occurred, prompting another outer loop iteration
      }
    }
    // Advance the starting point for the next full scan by two positions
    currentSearchOffset += 2;
  }

  console.log(totalShiftCount);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

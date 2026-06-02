function processDanceSequence(inputSequence) {
  const oddPositionAllowedMoves = ['R', 'U', 'D'];
  const evenPositionAllowedMoves = ['L', 'U', 'D'];

  const RESULT_NO = 'No';
  const RESULT_YES = 'Yes';

  // Helper function to determine if a given character is present in an allowed set
  const isCharacterPermitted = (charToCheck, permittedSet) => {
    return permittedSet.includes(charToCheck);
  };

  // Handle the special case for sequences containing only a single character
  if (inputSequence.length === 1) {
    // If the sole character is 'L', it's invalid. Otherwise, it's considered valid.
    // This matches the original behavior where 'L' for length 1 returns 'No',
    // and other characters ('R', 'U', 'D') cause the loop to be skipped, leading to 'Yes'.
    return inputSequence[0] === 'L' ? RESULT_NO : RESULT_YES;
  }

  // Iterate through the sequence, checking characters based on their effective position parity.
  // The original loop structure checks characters from index 0 up to (length - 2).
  // The character at the very last index (length - 1) is not explicitly checked by the loop.
  for (let charIndex = 0; charIndex < inputSequence.length - 1; charIndex++) {
    const currentCharacter = inputSequence[charIndex];
    let isValidForPosition = false;

    // Determine which set of allowed moves to use based on the character's index.
    // Original logic:
    // - If `i` (loop counter, 1-based) is odd, it checks `tapDance[i-1]` (even index) against `odd` set.
    // - If `i` (loop counter, 1-based) is even, it checks `tapDance[i-1]` (odd index) against `even` set.
    // So, for a 0-based `charIndex`:
    // - If `charIndex` is even (0, 2, ...), it corresponds to an odd `i`, so check against `oddPositionAllowedMoves`.
    // - If `charIndex` is odd (1, 3, ...), it corresponds to an even `i`, so check against `evenPositionAllowedMoves`.
    if (charIndex % 2 === 0) {
      isValidForPosition = isCharacterPermitted(currentCharacter, oddPositionAllowedMoves);
    } else {
      isValidForPosition = isCharacterPermitted(currentCharacter, evenPositionAllowedMoves);
    }

    // If any character fails its validation, the entire sequence is invalid.
    if (!isValidForPosition) {
      return RESULT_NO;
    }
  }

  // If the loop completes without returning 'No', the sequence is valid.
  return RESULT_YES;
}

console.log(processDanceSequence(require("fs").readFileSync("/dev/stdin", "utf8").split('\n')[0].trim()));

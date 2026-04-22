(function(inputRaw) {
  const lines = inputRaw.trim().split('\n');
  const mainSequence = lines[0];
  const targetSubsequence = lines[1];

  const mainLen = mainSequence.length;
  const targetLen = targetSubsequence.length;
  const characterRange = 26; // Assuming 'a' through 'z'

  if (targetLen === 0) return '0';

  // Precompute next character occurrences.
  // nextCharacterLookup[charVal][idx] stores the first index >= idx
  // where the character (corresponding to charVal) appears in mainSequence.
  // If not found, it stores mainLen.
  const nextCharacterLookup = Array(characterRange).fill(null).map(() => Array(mainLen + 1).fill(mainLen));

  for (let idx = mainLen - 1; idx >= 0; idx--) {
    for (let charVal = 0; charVal < characterRange; charVal++) {
      nextCharacterLookup[charVal][idx] = nextCharacterLookup[charVal][idx + 1];
    }
    const charCode = mainSequence.charCodeAt(idx) - 97; // 'a' is 97
    nextCharacterLookup[charCode][idx] = idx;
  }

  // Process the target subsequence using a functional reduction approach.
  const processingResult = Array.from(targetSubsequence).reduce((currentStatus, charToFind) => {
    // If a final outcome (e.g., impossible to form subsequence) has already been determined,
    // propagate it without further processing.
    if (currentStatus.finalOutcome !== null) {
      return currentStatus;
    }

    const charIndex = charToFind.charCodeAt(0) - 97;
    let searchStartAt = currentStatus.lastFoundIdx + 1;

    let foundAt = nextCharacterLookup[charIndex][searchStartAt];

    if (foundAt < mainLen) {
      // Character found in the current segment of mainSequence.
      currentStatus.lastFoundIdx = foundAt;
    } else {
      // Character not found in the current segment, indicating a new cycle of mainSequence is needed.
      if (currentStatus.lastFoundIdx === -1) {
        // If the character couldn't be found even from the beginning of a fresh mainSequence,
        // it's impossible to form the subsequence.
        currentStatus.finalOutcome = '-1';
        return currentStatus;
      }

      currentStatus.cycleCount++;
      currentStatus.lastFoundIdx = -1; // Reset index to search from the start of the new mainSequence cycle.

      // Re-attempt to find the character from the beginning of mainSequence (index 0).
      searchStartAt = currentStatus.lastFoundIdx + 1; // This will be 0.
      foundAt = nextCharacterLookup[charIndex][searchStartAt];

      if (foundAt < mainLen) {
        currentStatus.lastFoundIdx = foundAt;
      } else {
        // This implies the character is not present in mainSequence at all.
        currentStatus.finalOutcome = '-1';
        return currentStatus;
      }
    }
    return currentStatus;
  }, { lastFoundIdx: -1, cycleCount: 0, finalOutcome: null }); // Initial state for the reducer.

  if (processingResult.finalOutcome !== null) {
    return processingResult.finalOutcome;
  } else {
    // Calculate the total length based on completed cycles and the position in the last cycle.
    return `${processingResult.cycleCount * mainLen + processingResult.lastFoundIdx + 1}`;
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
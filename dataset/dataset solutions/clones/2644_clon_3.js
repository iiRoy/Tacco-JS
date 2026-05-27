console.log((inputData => {
  const ALPHABET_SIZE = 26;
  const ASCII_LOWERCASE_A = 97;

  // Helper function to get the 0-25 offset for a lowercase character
  const getCharCodeOffset = (char) => char.charCodeAt(0) - ASCII_LOWERCASE_A;

  // Parse input strings
  const [sourceString, targetString] = inputData.trim().split('\n');
  
  // Initialize a 2D array to store indices of each character in the source string
  // Each sub-array will contain indices from the first and second conceptual concatenations of sourceString
  const charIndices = Array.from({ length: ALPHABET_SIZE }, () => []);
  
  const sourceLen = sourceString.length;
  const targetLen = targetString.length;

  // Populate charIndices with original indices (0 to sourceLen-1)
  // Using Array.from().forEach for a structural variation
  Array.from({ length: sourceLen }, (_, charPos) => charPos).forEach(charPos => {
    const charCodeOffset = getCharCodeOffset(sourceString[charPos]);
    charIndices[charCodeOffset].push(charPos);
  });

  // Populate charIndices with shifted indices (sourceLen to 2*sourceLen-1)
  // This simulates a second concatenation of the source string
  for (let charPos = 0; charPos < sourceLen; charPos++) {
    const charCodeOffset = getCharCodeOffset(sourceString[charPos]);
    charIndices[charCodeOffset].push(charPos + sourceLen);
  }

  // Tracker for the next search index within each character's charIndices array
  const nextSearchIndexTracker = new Array(ALPHABET_SIZE).fill(0);
  
  // Current absolute position in the conceptual concatenated source string
  let currentAbsolutePosition = -1;
  
  // Count of full sourceString cycles completed
  let cycleCount = 0;

  // Iterate through each character of the target string
  for (let targetCharIndex = 0; targetCharIndex < targetLen; targetCharIndex++) {
    const currentTargetCharOffset = getCharCodeOffset(targetString[targetCharIndex]);
    const charSpecificIndices = charIndices[currentTargetCharOffset];
    const availableIndicesCount = charSpecificIndices.length;

    // Guard clause: If the character is not present in sourceString at all
    if (availableIndicesCount === 0) {
      return '-1';
    }

    // Get the current search pointer for this character
    let charSearchPointer = nextSearchIndexTracker[currentTargetCharOffset];
    
    // Find the first index in charSpecificIndices that is strictly greater than currentAbsolutePosition
    // This loop is a rewrite of the original compact for loop, achieving the same outcome for charSearchPointer
    while (charSearchPointer < availableIndicesCount && charSpecificIndices[charSearchPointer] <= currentAbsolutePosition) {
      charSearchPointer++;
    }

    // Update the tracker for the next iteration of the outer loop
    nextSearchIndexTracker[currentTargetCharOffset] = charSearchPointer;

    // Assign currentAbsolutePosition based on the found charSearchPointer.
    // If charSearchPointer equals availableIndicesCount (meaning no suitable index was found),
    // charSpecificIndices[charSearchPointer] will be undefined, preserving the original NaN behavior.
    currentAbsolutePosition = charSpecificIndices[charSearchPointer];

    // Check if we've moved into the second conceptual concatenation of sourceString
    if (currentAbsolutePosition >= sourceLen) {
      cycleCount++;
      currentAbsolutePosition -= sourceLen; // Adjust position back to the first concatenation
      
      // Reset all search pointers for a new cycle.
      // Replacing .fill(0) with an explicit loop for structural variation.
      for (let k = 0; k < ALPHABET_SIZE; k++) {
        nextSearchIndexTracker[k] = 0;
      }
    }
  }

  // Calculate the final result: total length covered
  // (full cycles * source length) + (position in current cycle + 1 for 1-based indexing)
  return `${cycleCount * sourceLen + currentAbsolutePosition + 1}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));

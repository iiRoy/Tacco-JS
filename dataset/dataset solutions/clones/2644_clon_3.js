const analyzeStringSequence = (inputDataFromSource) => {
  // Defensive programming: Validate the input type.
  if (typeof inputDataFromSource !== 'string') {
    console.error('Error: Input must be a string. Received:', typeof inputDataFromSource);
    // Depending on context, might throw an error or return a specific failure code.
    return '-1';
  }

  // Split the raw input into individual lines.
  // The problem expects two lines: the source string and the target sequence.
  const parsedLines = inputDataFromSource.trim().split('\n');

  // Validate the number of input lines.
  if (parsedLines.length !== 2) {
    console.error('Error: Expected exactly two lines of input (source and target), but received', parsedLines.length);
    return '-1';
  }

  // Assign the parsed lines to more descriptive variables.
  const primaryString = parsedLines[0]; // Corresponds to 's' in the original code.
  const searchSequence = parsedLines[1]; // Corresponds to 't' in the original code.

  // Get lengths for frequent use.
  const primaryStringLength = primaryString.length;
  const searchSequenceLength = searchSequence.length;

  // Edge case: If the primary string is empty, we cannot find any characters.
  // If the search sequence is also empty, the result might be 0.
  // If primary is empty and search is not, it's an impossible match.
  if (primaryStringLength === 0) {
    return (searchSequenceLength === 0) ? '0' : '-1';
  }

  // `charOccurrencePositions` is an array of 26 arrays, mapping 'a' (index 0) to 'z' (index 25).
  // Each inner array stores the 0-based indices where that character appears in `primaryString`.
  // To handle cyclic searches efficiently, we store each index twice:
  // once as its original index, and once as `index + primaryStringLength`.
  // This effectively creates a conceptual "doubled" `primaryString` for lookups.
  const charOccurrencePositions = new Array(26).fill(null).map(() => []);

  // First pass: Populate with original indices.
  for (let charPos = 0; charPos < primaryStringLength; charPos++) {
    const charCodeVal = primaryString.charCodeAt(charPos) - 97; // Convert 'a'->0, 'b'->1, etc.
    // Only process lowercase English letters.
    if (charCodeVal >= 0 && charCodeVal < 26) {
      charOccurrencePositions[charCodeVal].push(charPos);
    }
  }

  // Second pass: Populate with shifted indices to simulate the cyclic nature.
  // This allows finding characters that "wrap around" without explicit modulo arithmetic in the main loop.
  for (let charPos = 0; charPos < primaryStringLength; charPos++) {
    const charCodeVal = primaryString.charCodeAt(charPos) - 97;
    if (charCodeVal >= 0 && charCodeVal < 26) {
      charOccurrencePositions[charCodeVal].push(charPos + primaryStringLength);
    }
  }

  // `nextSearchPointer` keeps track of the next index to check within `charOccurrencePositions[charVal]`
  // for each character. It ensures that subsequent searches for the same character
  // start from where the last successful search left off (or further).
  const nextSearchPointer = new Array(26).fill(0);

  // `currentAccumulatedPosition` holds the 0-based index of the last successfully matched character
  // in the conceptual infinite string. Starts at -1 to allow the first character to match at index 0.
  let currentAccumulatedPosition = -1;

  // `totalFullCycles` counts how many full repetitions of `primaryString` have been traversed.
  let totalFullCycles = 0;

  // Main loop: Iterate through each character in the `searchSequence`.
  for (let seqIterator = 0; seqIterator < searchSequenceLength; seqIterator++) {
    const targetCharVal = searchSequence.charCodeAt(seqIterator) - 97;

    // Validate: Ensure the target character is a lowercase English letter.
    if (targetCharVal < 0 || targetCharVal >= 26) {
      // If the query contains a character not in 'a'-'z', it cannot be matched.
      return '-1';
    }

    const charSpecificIndices = charOccurrencePositions[targetCharVal];
    const numSpecificOccurrences = charSpecificIndices.length;

    // Critical check: If the target character is not present in the primary string at all.
    // (This means `charOccurrencePositions[targetCharVal]` is empty before any doubling,
    // or `numSpecificOccurrences` is 0, which is equivalent).
    if (numSpecificOccurrences === 0) {
      return '-1';
    }

    // Get the current pointer for this specific character from `nextSearchPointer`.
    let currentSpecificCharPointer = nextSearchPointer[targetCharVal];

    // Advance `currentSpecificCharPointer` until an index is found that is
    // strictly greater than `currentAccumulatedPosition`.
    // The doubling of indices in `charOccurrencePositions` guarantees that a suitable index will always be found
    // (unless `numSpecificOccurrences` was 0, handled above).
    while (currentSpecificCharPointer < numSpecificOccurrences &&
           charSpecificIndices[currentSpecificCharPointer] <= currentAccumulatedPosition) {
      currentSpecificCharPointer++;
    }

    // Update `currentAccumulatedPosition` to the newly found match position.
    currentAccumulatedPosition = charSpecificIndices[currentSpecificCharPointer];

    // Store the pointer for this character. It now points to the index of the character that was *just used*.
    nextSearchPointer[targetCharVal] = currentSpecificCharPointer;

    // Check if the `currentAccumulatedPosition` has crossed the boundary of one `primaryString` length.
    // If it's `primaryStringLength` or greater, it signifies that a full cycle has been completed.
    if (currentAccumulatedPosition >= primaryStringLength) {
      totalFullCycles++; // Increment the count of completed cycles.
      currentAccumulatedPosition -= primaryStringLength; // Adjust position back to be relative to the current cycle.
      nextSearchPointer.fill(0); // Reset all character pointers for the next character search in the new cycle.
    }
  }

  // Calculate the final absolute 1-based position in the conceptual infinite string.
  // `totalFullCycles * primaryStringLength` accounts for all full repetitions.
  // `currentAccumulatedPosition + 1` accounts for the position within the current (last) cycle.
  const finalCalculatedPosition = totalFullCycles * primaryStringLength + currentAccumulatedPosition + 1;
  return String(finalCalculatedPosition);
};

// Read input from standard input, decode it as UTF-8, and pass it to the processing function.
// The result is then printed to the console.
console.log(analyzeStringSequence(require('fs').readFileSync('/dev/stdin', 'utf8')));
// Initialize standard input processing
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Define a callback function to handle incoming data chunks from standard input.
process.stdin.on('data', (inputDataChunk) => {
  // Split the entire data chunk into an array of individual lines.
  const inputLines = inputDataChunk.split('\n');

  // Ensure there are at least two lines of input (number of cases and target string).
  // This is a Type III guard clause for input validation.
  if (inputLines.length < 2) {
    console.error("Error: Insufficient input lines provided. Expected at least 2.");
    return; // Exit if input is malformed.
  }

  // Parse the first line to determine the total number of board strings to process.
  // Using parseInt with radix 10 for explicit conversion.
  const totalBoardCases = parseInt(inputLines[0].trim(), 10);

  // Another Type III guard: validate the parsed number of cases.
  if (isNaN(totalBoardCases) || totalBoardCases < 0) {
    console.error("Error: Invalid number of board cases specified in the input.");
    return;
  }

  // The second line contains the specific pattern string we are looking for.
  const searchPattern = inputLines[1].trim();
  // Convert the pattern string into an array of characters for easier indexing.
  const patternCharacterArray = searchPattern.split('');
  const patternLength = patternCharacterArray.length;

  // Initialize a counter for how many board strings successfully contain the pattern.
  let successfulPatternOccurrences = 0;

  // Iterate through each potential board string, starting from the third line of input.
  // The loop runs for `totalBoardCases` times.
  for (let currentCaseIterator = 0; currentCaseIterator < totalBoardCases; ++currentCaseIterator) {
    // Calculate the actual index in the `inputLines` array for the current board.
    // Boards start from index 2.
    const boardLineIndex = currentCaseIterator + 2;

    // Type III validation: Check if the current board line actually exists in the input.
    if (boardLineIndex >= inputLines.length) {
      console.error(`Warning: Input ended prematurely. Expected ${totalBoardCases} boards, but only found ${currentCaseIterator}.`);
      break; // Stop processing if input is incomplete.
    }

    const currentBoardString = inputLines[boardLineIndex].trim();
    const boardStringLength = currentBoardString.length;

    // Flag to track if the pattern has been successfully found within the current board string.
    let patternFoundInCurrentBoard = false;

    // The 'spacingFactor' dictates how many characters to skip between consecutive pattern characters on the board.
    // It ranges from 0 (contiguous match) up to `boardStringLength - 1`.
    for (let spacingFactor = 0; spacingFactor < boardStringLength; ++spacingFactor) {
      // Type III optimization/guard: If the pattern is longer than the board, or
      // if the pattern, given the current spacingFactor, would extend beyond the board's end,
      // then skip this spacing factor as it cannot possibly yield a match.
      // The last character of the pattern would be at index: (patternLength - 1) * (1 + spacingFactor).
      if (patternLength === 0) { // Handle empty pattern case
          patternFoundInCurrentBoard = true;
          break;
      }
      if ((patternLength - 1) * (1 + spacingFactor) >= boardStringLength) {
        continue; // This spacing factor makes the pattern too long for the board.
      }

      // Assume a match for the current 'spacingFactor' and try to disprove it.
      let currentSpacingYieldsMatch = true;

      // Iterate through each character of the target pattern.
      for (let charIndexInPattern = 0; charIndexInPattern < patternLength; ++charIndexInPattern) {
        // Calculate the corresponding character index on the current board string.
        // The formula means: boardCharIndex = charIndexInPattern * (1 + spacingFactor)
        const boardCharIndex = charIndexInPattern * (1 + spacingFactor);

        // Type III validation: Check if the calculated index falls outside the board string's bounds.
        // If it does, then this 'spacingFactor' cannot yield a match.
        if (boardCharIndex >= boardStringLength) {
          currentSpacingYieldsMatch = false;
          break; // No need to check further characters for this 'spacingFactor'.
        }

        // Compare the character from the board with the character from the pattern.
        if (currentBoardString[boardCharIndex] !== patternCharacterArray[charIndexInPattern]) {
          currentSpacingYieldsMatch = false;
          break; // Mismatch found, this 'spacingFactor' is not a match.
        }
      }

      // If the inner loop completed without setting `currentSpacingYieldsMatch` to false,
      // it means the entire pattern was found with the current spacing factor.
      if (currentSpacingYieldsMatch) {
        patternFoundInCurrentBoard = true;
        break; // Pattern found in the current board, no need to check other spacing factors.
      }
    }

    // If the pattern was found in the current board string, increment the global counter.
    if (patternFoundInCurrentBoard) {
      successfulPatternOccurrences++;
    }
  }

  // Output the final count of board strings that contained the specified pattern.
  console.log(successfulPatternOccurrences);
});
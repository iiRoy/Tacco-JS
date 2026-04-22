function processInputData(rawInputPayload) {
  // Split the entire raw input string into an array of individual lines.
  // Empty lines are filtered out to ensure only meaningful data lines are processed.
  const processedLines = rawInputPayload.split('\n').filter(line => line.trim() !== '');

  /**
   * Helper function to parse a single line containing space-separated numbers
   * into an array of integers. It handles potential whitespace and non-numeric tokens.
   * @param {string} lineContent - The string line to parse.
   * @returns {number[]} An array of parsed integers.
   */
  const extractNumericTokens = (lineContent) => {
    return lineContent.split(' ')
                       .map(token => parseInt(token.trim(), 10))
                       .filter(num => !isNaN(num)); // Ensure only valid numbers are included.
  };

  // The first line of input contains global configuration parameters.
  const globalConfig = extractNumericTokens(processedLines[0]);

  // Validate that the essential configuration parameters are present.
  if (globalConfig.length < 2) {
    console.error("Input Error: Expected at least two configuration values on the first line.");
    return; // Terminate execution if configuration is malformed.
  }

  // The first parameter defines the maximum index value for items.
  const upperIndexBound = globalConfig[0];
  // The second parameter specifies the total number of marking instruction sets to follow.
  const totalMarkingSets = globalConfig[1];

  // Perform additional validation on the parsed configuration values.
  if (isNaN(upperIndexBound) || upperIndexBound < 0 || isNaN(totalMarkingSets) || totalMarkingSets < 0) {
    console.error("Input Error: Invalid or negative numeric values for configuration parameters detected.");
    return; // Terminate if parameters are invalid.
  }

  // Initialize a boolean array to keep track of the marking status for each index.
  // The array size is `upperIndexBound + 1` to support 1-based indexing up to `upperIndexBound`.
  // All indices are initially set to `false`, indicating they are unmarked.
  const markedStatusTracker = Array(upperIndexBound + 1).fill(false);

  // Loop through the input lines, processing each marking instruction set.
  // Marking instructions are found on lines with odd indices (1, 3, 5, ...).
  // Each iteration processes one set of indices to be marked.
  for (let currentLineIdx = 1; currentLineIdx <= totalMarkingSets * 2; currentLineIdx += 2) {
    // Check if the expected instruction line actually exists in the input.
    if (currentLineIdx >= processedLines.length) {
      console.warn(`Data Warning: Missing instruction line at index ${currentLineIdx}. Stopping further processing of marking sets.`);
      break; // Exit the loop if input lines are prematurely exhausted.
    }

    // Parse the current line to get the list of indices that need to be marked.
    const indicesToMark = extractNumericTokens(processedLines[currentLineIdx]);

    // Iterate over each index in the current set and update its status in the tracker.
    indicesToMark.forEach(targetIndex => {
      // Ensure the target index is within the valid and expected range (1 to upperIndexBound).
      // Index 0 is generally not considered in this type of problem's counting logic.
      if (targetIndex >= 1 && targetIndex <= upperIndexBound) {
        markedStatusTracker[targetIndex] = true; // Mark the item at this index.
      } else {
        console.warn(`Data Warning: Attempted to mark an index (${targetIndex}) outside the valid range [1, ${upperIndexBound}]. Ignoring this specific index.`);
      }
    });
  }

  // After processing all marking instructions, count the number of items that remain unmarked.
  // We explicitly start counting from index 1, as index 0 is typically not part of the problem domain.
  let finalUnmarkedCount = 0;
  for (let itemIdx = 1; itemIdx <= upperIndexBound; itemIdx++) {
    if (!markedStatusTracker[itemIdx]) {
      finalUnmarkedCount++; // Increment count if the item at this index is still false (unmarked).
    }
  }

  // Output the final calculated total of unmarked items.
  // By iterating from index 1, the original problem's implicit "ans-1" adjustment is naturally handled.
  console.log(finalUnmarkedCount);
}

// This section is responsible for reading input from standard input and invoking the main processing function.
// It should remain unaltered to ensure compatibility with the standard execution environment.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
const extractNumericValues = (lineContent) => {
  if (typeof lineContent !== 'string') {
    // In a production scenario, one might throw an error or handle more robustly.
    // For this cloning exercise, we'll return an empty array for invalid types.
    return [];
  }
  // Split by space, filter out any empty strings that might result from
  // multiple spaces or leading/trailing spaces, then convert to numbers.
  return lineContent.split(' ').filter(s => s.length > 0).map(Number);
};

/**
 * Computes the maximum cumulative value through a series of stages,
 * where each stage offers three distinct options. The constraint is that
 * the option chosen at the current stage cannot be the same as the
 * option chosen at the immediately preceding stage.
 *
 * This function implements a dynamic programming approach to find the
 * optimal path value.
 *
 * @param {string[]} rawInputLines An array of strings. The first string
 *                                 specifies the total number of stages.
 *                                 Subsequent strings, starting from index 1,
 *                                 each contain three space-separated numeric
 *                                 values representing the costs/values for
 *                                 the three options at that specific stage.
 */
function computeOptimalPathValue(rawInputLines) {
  // Input validation: Ensure the basic structure of the input is present.
  if (!rawInputLines || rawInputLines.length < 1) {
    console.error("Critical Error: Input data is either null, undefined, or empty. Cannot proceed with computation.");
    return; // Terminate execution gracefully.
  }

  const stageCountLine = rawInputLines[0];
  const totalStages = Number(stageCountLine); // Using Number() for broader type coercion than parseInt().

  // Validation for the number of stages.
  if (isNaN(totalStages) || totalStages <= 0) {
    console.warn(`Warning: The specified number of stages '${stageCountLine}' is invalid or non-positive. Computation aborted.`);
    return;
  }

  // Initialize the Dynamic Programming table.
  // dpTable[s][o] will store the maximum cumulative value to reach stage 's'
  // by choosing option 'o' at that stage.
  // Pre-filling inner arrays to avoid 'undefined' errors later.
  const dpTable = Array.from({ length: totalStages }, () => new Array(3).fill(0));

  // Iterate through each stage, starting from the first (index 0).
  for (let currentStageIndex = 0; currentStageIndex < totalStages; ++currentStageIndex) {
    // Retrieve and parse the cost values for the current stage's options.
    // Note: rawInputLines[0] is the count, so actual data starts from rawInputLines[1].
    const currentStageOptionCosts = extractNumericValues(rawInputLines[currentStageIndex + 1]);

    // Crucial validation: Each stage must have exactly three cost values.
    if (currentStageOptionCosts.length !== 3) {
      console.error(`Data Integrity Error: Stage ${currentStageIndex} (input line ${currentStageIndex + 2}) expected 3 cost values, but received ${currentStageOptionCosts.length}. This stage will be skipped or processed with potentially incorrect data.`);
      // Depending on requirements, one might throw an error, fill with default values, or skip.
      // For this clone, we'll proceed, but the data might be faulty.
      // A more robust solution might involve `continue` or assigning default costs.
    }

    // Determine the maximum cumulative values from the previous stage.
    // For the very first stage (index 0), there is no 'previous' stage.
    // In this scenario, we treat the 'previous' cumulative values as zero,
    // allowing the first stage's costs to be directly accumulated.
    const previousStageMaxValues =
      currentStageIndex === 0
        ? [0, 0, 0] // Base case: Starting values for the first stage.
        : dpTable[currentStageIndex - 1]; // Values from the completed previous stage.

    // Iterate through each of the three options (0, 1, 2) for the current stage.
    for (let chosenOptionIndex = 0; chosenOptionIndex < 3; ++chosenOptionIndex) {
      const costForThisOption = currentStageOptionCosts[chosenOptionIndex];
      let maxPathToCurrentOption = -Infinity; // Initialize for finding the maximum.

      // Identify the options from the previous stage that are *not* the
      // currently chosen option. This adheres to the problem's constraint.
      const allowedPreviousOptions = [0, 1, 2].filter(
        (prevOptIdx) => prevOptIdx !== chosenOptionIndex
      );

      // Calculate potential cumulative values by summing the current option's cost
      // with the maximum values from the allowed previous stage options.
      for (const validPrevOptionIndex of allowedPreviousOptions) {
        const candidateTotalValue = previousStageMaxValues[validPrevOptionIndex] + costForThisOption;
        maxPathToCurrentOption = Math.max(maxPathToCurrentOption, candidateTotalValue);
      }

      // Store the highest cumulative value found for the current stage and chosen option.
      dpTable[currentStageIndex][chosenOptionIndex] = maxPathToCurrentOption;
    }
  }

  // After all stages are processed, the maximum cumulative value will be
  // among the options in the very last stage's row of the dpTable.
  const finalStageResults = dpTable[totalStages - 1];

  if (finalStageResults && finalStageResults.length > 0) {
    console.log(Math.max(...finalStageResults));
  } else {
    // This scenario typically indicates an issue like totalStages being 0 or DP table not populated.
    console.error("Failed to retrieve final optimal path value. DP table might be empty or improperly constructed.");
  }
}

// --- Standard Input Processing Module ---
// This section handles asynchronous reading of data from the standard input stream.
let accumulatedInputBuffer = ''; // Buffer to store incoming data chunks.

// Ensure the standard input stream is in 'flowing' mode to emit 'data' events.
process.stdin.resume();
// Specify the character encoding for the input data.
process.stdin.setEncoding('utf8');

// Event listener for 'data' events: fired when a chunk of data is available.
process.stdin.on('data', (dataChunk) => {
  accumulatedInputBuffer += dataChunk; // Append the new data to the buffer.
});

// Event listener for the 'end' event: fired when the input stream has finished.
process.stdin.on('end', () => {
  // Split the entire accumulated buffer into individual lines.
  // Filter out any lines that are empty or contain only whitespace,
  // which can occur due to extra newline characters in input.
  const processedInputLines = accumulatedInputBuffer.split('\n').filter(line => line.trim().length > 0);

  // Invoke the main computation function with the prepared input lines.
  computeOptimalPathValue(processedInputLines);
});
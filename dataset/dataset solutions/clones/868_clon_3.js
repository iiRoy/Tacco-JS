const fileSystemInterface = require('fs');

// Read standard input synchronously to obtain the raw data.
// First, determine the total byte size of the input stream from its file descriptor.
const streamContentLength = fileSystemInterface.fstatSync(process.stdin.fd).size;

// Allocate a new Buffer object with the determined size to store the incoming data.
const inputDataBuffer = Buffer.alloc(streamContentLength);

// Read the actual input data from the standard input file descriptor into the buffer.
// Parameters: fd, buffer, offset, length, position (0 means current position).
const actualBytesRead = fileSystemInterface.readSync(
  process.stdin.fd,
  inputDataBuffer,
  0,
  streamContentLength,
  0
);

// Convert the buffer content to a UTF-8 string, remove leading/trailing whitespace,
// and then split the string into an array of individual lines.
const processedInputLines = inputDataBuffer.toString('utf-8', 0, actualBytesRead).trim().split('\n');

/**
 * Initializes and returns a two-dimensional array (grid/matrix) of specified dimensions,
 * with all elements filled with a given initial value.
 *
 * @param {number} rowCount The desired number of rows for the grid.
 * @param {number} colCount The desired number of columns for each row.
 * @param {*} initialValue The value to assign to every cell in the grid.
 * @returns {Array<Array<*>>} A new 2D array, or an empty array if dimensions are invalid.
 */
function createInitializedGrid(rowCount, colCount, initialValue) {
  // Perform basic validation for grid dimensions to prevent errors.
  if (rowCount <= 0 || colCount <= 0 || !Number.isInteger(rowCount) || !Number.isInteger(colCount)) {
    return []; // Return an empty array for invalid dimensions.
  }

  const gridStructure = new Array(rowCount); // Create the outer array representing rows.
  for (let rIndex = 0; rIndex < rowCount; rIndex++) {
    // For each row, create an inner array (column) and fill it with the initial value.
    gridStructure[rIndex] = new Array(colCount).fill(initialValue);
  }
  return gridStructure;
}

/**
 * Computes the maximum achievable score (or profit) using a dynamic programming approach.
 * This function models a problem similar to a knapsack variant, where items have
 * a 'size' (capacity consumed), a 'duration' (a constraint on previous states),
 * and a 'profit'.
 *
 * @param {number} totalCapacity The overall capacity constraint.
 * @param {Array<Array<number>>} itemConfigurations A collection of items, where each item
 *                                                 is an array `[size, duration, profit]`.
 * @returns {number} The highest possible score that can be achieved, or 0 if no items fit
 *                   or the input is invalid.
 */
function computeMaxAchievableScore(totalCapacity, itemConfigurations) {
  // Implement guard clauses for invalid or trivial input scenarios.
  if (totalCapacity < 0 || !Number.isInteger(totalCapacity)) {
    return 0; // Negative or non-integer capacity is invalid.
  }
  if (!Array.isArray(itemConfigurations) || itemConfigurations.length === 0) {
    return 0; // No items to consider, so no score can be achieved.
  }
  if (totalCapacity === 0) {
    return 0; // Zero capacity means no items can be taken.
  }

  const numberOfItems = itemConfigurations.length;
  // Initialize the dynamic programming table (memoizationTable).
  // `memoTable[i][j]` will store the maximum score achievable considering
  // items up to `i-1` with a total capacity of `j`.
  const memoTable = createInitializedGrid(numberOfItems + 1, totalCapacity + 1, 0);

  // Iterate through each item configuration available.
  for (let currentItemIndex = 0; currentItemIndex < numberOfItems; currentItemIndex++) {
    // Extract properties of the current item for easier access and readability.
    const [itemSize, itemDuration, itemProfit] = itemConfigurations[currentItemIndex];

    // Iterate through all possible capacity values from 0 up to the total capacity.
    for (let currentCapacityValue = 0; currentCapacityValue <= totalCapacity; currentCapacityValue++) {
      // Option 1: Do not include the current item in the selection.
      // The score remains the same as the maximum score achieved with previous items
      // at the current capacity.
      const scoreWithoutCurrentItem = memoTable[currentItemIndex][currentCapacityValue];

      // Option 2: Consider including the current item, if it fits within the capacity.
      if (itemSize <= currentCapacityValue) {
        let maxPreviousValidScore = 0; // Initialize to find the best previous state.

        // Define the bounds for the previous capacity states that are valid for
        // adding the current item. The `itemDuration` acts as a lower bound constraint.
        const lowerBoundForPrevCapacity = Math.max(0, currentCapacityValue - itemDuration);
        const upperBoundForPrevCapacity = currentCapacityValue - itemSize;

        // Search within the valid range of previous capacities for the maximum score.
        // This loop looks at values in the *current* row being built (`currentItemIndex + 1`),
        // which implies an optimization or a specific problem structure where
        // smaller capacities for the current item are computed before larger ones.
        for (let prevCapacityState = lowerBoundForPrevCapacity; prevCapacityState <= upperBoundForPrevCapacity; prevCapacityState++) {
          if (memoTable[currentItemIndex + 1][prevCapacityState] > maxPreviousValidScore) {
            maxPreviousValidScore = memoTable[currentItemIndex + 1][prevCapacityState];
          }
        }

        // Calculate the score if the current item is taken.
        const scoreWithCurrentItem = maxPreviousValidScore + itemProfit;

        // Update the DP table cell: choose the maximum score between not taking
        // and taking the current item.
        memoTable[currentItemIndex + 1][currentCapacityValue] = Math.max(scoreWithoutCurrentItem, scoreWithCurrentItem);
      } else {
        // If the current item's size exceeds the current capacity, it cannot be taken.
        // The score remains the same as if the item was not considered.
        memoTable[currentItemIndex + 1][currentCapacityValue] = scoreWithoutCurrentItem;
      }
    }
  }

  // The final result is located at the bottom-right corner of the DP table,
  // representing the maximum score with all items and the total capacity.
  return memoTable[numberOfItems][totalCapacity];
}

/**
 * Orchestrates the entire process: reads input data, performs calculations
 * using the dynamic programming function, and prints the final results.
 */
function orchestrateProcessing() {
  // Read the total number of phrase configurations from the input.
  let totalPhraseCount = parseInt(processedInputLines.shift(), 10);
  if (isNaN(totalPhraseCount) || totalPhraseCount < 0) {
    console.error("Error: Invalid or missing number of phrase configurations provided.");
    return;
  }

  const allPhraseConfigs = []; // Array to store parsed phrase data.
  // Loop to read and parse each phrase configuration line.
  for (let pIdx = 0; pIdx < totalPhraseCount; pIdx++) {
    const phraseLine = processedInputLines.shift();
    if (!phraseLine) {
      console.error(`Error: Expected ${totalPhraseCount} phrase lines but found fewer.`);
      return;
    }
    const parsedPhrase = phraseLine.split(' ').map(val => parseInt(val, 10));

    // Validate that each phrase line parsed correctly into three numbers.
    if (parsedPhrase.some(isNaN) || parsedPhrase.length !== 3) {
      console.error(`Error: Malformed phrase data: "${phraseLine}". Expected three numbers.`);
      return;
    }
    allPhraseConfigs.push(parsedPhrase);
  }

  // Read the total number of melody targets to be processed.
  let totalMelodyTargets = parseInt(processedInputLines.shift(), 10);
  if (isNaN(totalMelodyTargets) || totalMelodyTargets < 0) {
    console.error("Error: Invalid or missing number of melody targets provided.");
    return;
  }

  const melodyTargetValues = []; // Array to store parsed melody target capacities.
  // Loop to read and parse each melody target line.
  for (let mIdx = 0; mIdx < totalMelodyTargets; mIdx++) {
    const melodyValueString = processedInputLines.shift();
    if (!melodyValueString) {
      console.error(`Error: Expected ${totalMelodyTargets} melody target lines but found fewer.`);
      return;
    }
    const melodyCapacity = parseInt(melodyValueString, 10);

    // Validate that the melody target parsed correctly into a non-negative number.
    if (isNaN(melodyCapacity) || melodyCapacity < 0) {
      console.error(`Error: Malformed melody target value: "${melodyValueString}". Expected a non-negative number.`);
      return;
    }
    melodyTargetValues.push(melodyCapacity);
  }

  const collectedScores = []; // Array to store the results of each calculation.
  let allCalculationsSuccessful = true; // Flag to track if all computations yielded non-zero scores.

  // Process each melody target capacity.
  for (let currentTargetIdx = 0; currentTargetIdx < totalMelodyTargets; currentTargetIdx++) {
    const currentMelodyCapacity = melodyTargetValues[currentTargetIdx];
    // Call the DP function to calculate the max score for the current capacity.
    const calculatedScore = computeMaxAchievableScore(currentMelodyCapacity, allPhraseConfigs);

    // If any calculation results in a score of 0, set the failure flag.
    // The problem statement implies a special output (-1) if any result is zero.
    if (calculatedScore === 0) {
      allCalculationsSuccessful = false;
    }
    collectedScores.push(calculatedScore);
  }

  // Determine the final output based on the success flag.
  if (!allCalculationsSuccessful) {
    console.log(-1); // Output -1 if at least one calculation resulted in a zero score.
  } else {
    // Otherwise, print each successfully calculated score on a new line.
    collectedScores.forEach(scoreValue => console.log(scoreValue.toString()));
  }
}

// Execute the main processing logic.
orchestrateProcessing();
/**
 * This module provides functionalities for generating permutations
 * and processing input data to find combinations that satisfy
 * a specific weighted sum condition.
 */

/**
 * Recursively generates permutations of a given set of elements.
 * This function modifies the input array (`sourceElements`) and the
 * current selection (`currentSubset`) during its execution,
 * then backtracks to restore their state.
 *
 * @param {Array<number>} sourceElements - The array of numbers from which to select elements.
 *                                         This array is mutated during recursion.
 * @param {number} itemsToPick - The number of elements to select for the current combination.
 * @param {Array<number>} currentSubset - The partially built combination. This array is mutated.
 * @param {function(Array<number>): void} onCombinationFound - Callback function to invoke when a complete combination is formed.
 */
function generateCombinations(sourceElements, itemsToPick, currentSubset, onCombinationFound) {
  // Helper variables for the loop and element manipulation.
  let selectedItem;
  let loopIndex;
  const initialAvailableCount = sourceElements.length; // Store initial length for loop iterations.

  // --- Type III Change: Guard clause for invalid input ---
  if (itemsToPick < 0) {
    // console.warn("Negative number of items to pick encountered. Skipping generation.");
    return;
  }

  // --- Type II Change: Renamed `n === 0` to `itemsToPick === 0` ---
  // Base case: If no more items need to be picked, a complete combination is formed.
  if (itemsToPick === 0) {
    // --- Type III Change: Pass a shallow copy to the callback to prevent external mutation ---
    onCombinationFound([...currentSubset]);
  } else {
    // Recursive step: Iterate through available elements.
    // The loop runs for the initial number of elements in sourceElements at this level.
    for (loopIndex = 0; loopIndex < initialAvailableCount; loopIndex++) {
      // --- Type III Change: Add an extra check before shifting (though `initialAvailableCount` loop implies it) ---
      if (sourceElements.length === 0) {
        // This should ideally not happen if initialAvailableCount is correctly set,
        // but acts as a safeguard.
        break;
      }

      // --- Type II Change: Renamed `x` to `selectedItem` ---
      // Pick an element from the available pool. `shift()` removes the first element.
      selectedItem = sourceElements.shift();

      // Add the picked element to the current combination.
      currentSubset.push(selectedItem);

      // Recursively call to pick the remaining items.
      generateCombinations(sourceElements, itemsToPick - 1, currentSubset, onCombinationFound);

      // --- Type III Change: Add a console debug message for backtracking ---
      // console.debug(`Backtracking: Popping ${currentSubset[currentSubset.length - 1]} from currentSubset.`);

      // Backtrack: Remove the element from the current combination.
      currentSubset.pop();

      // Backtrack: Return the element to the available pool (at the end).
      // This effectively rotates the elements for the next iteration.
      sourceElements.push(selectedItem);
    }
  }
}

/**
 * Calculates the weighted sum of a combination, where each element
 * is multiplied by its 1-based index (position).
 *
 * @param {Array<number>} combination - The array of numbers in the combination.
 * @returns {number} The calculated weighted sum.
 */
const calculateWeightedSum = (combination) => {
  // --- Type II Change: Renamed `m`, `x`, `i` to `runningTotal`, `digitValue`, `positionIndex` ---
  return combination.reduce((runningTotal, digitValue, positionIndex) => {
    // The original logic uses `i + 1` for 1-based indexing.
    return runningTotal + digitValue * (positionIndex + 1);
  }, 0);
};

/**
 * Processes each line of input data to find combinations of digits
 * that sum up to a target value using a specific weighting scheme.
 */
function processInputData() {
  // --- Type III Change: Define the constant digit pool outside the loop and freeze it ---
  // This array represents the available digits (0-9) for combinations.
  const DIGIT_POOL = Object.freeze([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

  // --- Type II Change: Renamed `input` to `parsedInputLines` ---
  // Iterate over each line that was parsed from the standard input.
  parsedInputLines.forEach((currentInputLine, lineIndex) => {
    // --- Type II Change: Renamed `n`, `s`, `r` to `selectionCount`, `targetWeightedSum`, `successfulCombinationsCounter` ---
    let selectionCount;
    let targetWeightedSum;
    let successfulCombinationsCounter = 0;

    // --- Type III Change: Add a try-catch block for robust line processing ---
    try {
      // --- Type III Change: Add a guard clause for empty or whitespace-only lines ---
      const trimmedLine = currentInputLine.trim();
      if (!trimmedLine) {
        // console.log(`Skipping empty or whitespace-only line ${lineIndex + 1}.`);
        return; // Skip to the next line.
      }

      // --- Type II Change: Renamed `line` to `parsedValues` ---
      // Parse the input line into an array of floating-point numbers.
      const parsedValues = trimmedLine.split(' ').map(parseFloat);

      // --- Type III Change: Add validation for parsed input ---
      if (parsedValues.length < 2 || isNaN(parsedValues[0]) || isNaN(parsedValues[1])) {
        console.error(`Error: Invalid input format on line ${lineIndex + 1}. Expected two numbers, got: "${trimmedLine}"`);
        return;
      }

      // Extract the selection count and the target weighted sum from the parsed values.
      selectionCount = parsedValues[0];
      targetWeightedSum = parsedValues[1];

      // --- Type III Change: Add validation for selectionCount ---
      if (selectionCount < 0 || selectionCount > DIGIT_POOL.length) {
          console.warn(`Warning: Invalid selection count (${selectionCount}) on line ${lineIndex + 1}. Must be between 0 and ${DIGIT_POOL.length}. Skipping.`);
          return;
      }
      if (!Number.isInteger(selectionCount)) {
          console.warn(`Warning: Selection count (${selectionCount}) on line ${lineIndex + 1} is not an integer. Using floor value.`);
          selectionCount = Math.floor(selectionCount);
      }


      // --- Type III Change: Use a mutable copy of DIGIT_POOL for `generateCombinations` ---
      // The `generateCombinations` function modifies its first argument, so we pass a copy.
      const mutableDigitPool = [...DIGIT_POOL];

      // Generate combinations and check if their weighted sum matches the target.
      // --- Type II Change: Renamed `perm` to `generateCombinations`, `xs` to `generatedCombination` ---
      generateCombinations(mutableDigitPool, selectionCount, [], (generatedCombination) => {
        // Calculate the weighted sum for the current combination.
        const currentCombinationSum = calculateWeightedSum(generatedCombination);

        // --- Type III Change: Replace ternary operator with an if statement ---
        // Increment the counter if the weighted sum matches the target.
        if (currentCombinationSum === targetWeightedSum) {
          successfulCombinationsCounter++;
        }
      });

      // Output the total count of successful combinations for the current line.
      console.log(successfulCombinationsCounter);

    } catch (error) {
      console.error(`An error occurred while processing line ${lineIndex + 1}: "${currentInputLine}". Error: ${error.message}`);
    }
  });
}

// --- Type II Change: Renamed `input` to `aggregatedInputBuffer` ---
let aggregatedInputBuffer = '';
// --- Type II Change: Renamed `input` to `parsedInputLines` ---
let parsedInputLines = [];

// --- Type III Change: Add initial check for process.stdin availability ---
if (typeof process === 'undefined' || !process.stdin) {
  // console.error("Standard input (process.stdin) is not available in this environment.");
  // For browser or other environments, one might provide a mock or alternative input.
  // For this exercise, we assume Node.js environment.
  // Exit or handle appropriately if not in Node.js.
  // process.exit(1);
} else {
  // --- Type III Change: Add comments explaining standard input setup ---
  // Ensure the standard input stream is active to listen for data.
  process.stdin.resume();
  // Set the encoding for the incoming data to UTF-8.
  process.stdin.setEncoding('utf8');

  // Event listener for incoming data chunks from standard input.
  // --- Type II Change: Renamed `chunk` to `receivedDataChunk` ---
  process.stdin.on('data', (receivedDataChunk) => {
    aggregatedInputBuffer += receivedDataChunk;
  });

  // Event listener for the end of the standard input stream.
  process.stdin.on('end', () => {
    // --- Type III Change: Add a guard clause for empty input ---
    if (aggregatedInputBuffer.trim().length === 0) {
      // console.warn("No input data received from stdin. Exiting.");
      return;
    }

    // Split the accumulated input into individual lines.
    // --- Type III Change: Filter out empty lines immediately after splitting ---
    parsedInputLines = aggregatedInputBuffer
      .split('\n')
      .filter(line => line.trim() !== ''); // Ensure only non-empty, non-whitespace lines are processed.

    // --- Type III Change: Wrap the main processing function call in a try-catch ---
    try {
      processInputData();
    } catch (error) {
      console.error("An unhandled error occurred during input data processing:", error);
      // --- Type III Change: Exit with an error code ---
      process.exit(1);
    }
  });
}
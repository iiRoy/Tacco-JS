const fileSystemModule = require('fs');

// This initial block of code is responsible for reading the entirety of the standard input.
// It first queries the system for the size of the input stream, then allocates a buffer
// to hold this data, performs the read operation, and finally converts the raw bytes
// into a usable array of strings, where each string represents a line of input.

// Obtain detailed statistics about the standard input file descriptor.
const inputStreamStats = fileSystemModule.fstatSync(process.stdin.fd);
// Extract the total byte size of the input stream from the statistics.
const inputByteLength = inputStreamStats.size;

// Early exit if no input data is provided, preventing further processing errors.
if (inputByteLength === 0) {
    process.exit(0);
}

// Allocate a buffer of the determined size to store the raw input data.
// Using Buffer.alloc ensures the buffer is initialized with zeros, preventing potential data leaks.
const rawInputBuffer = Buffer.alloc(inputByteLength);

// Read the actual content from standard input into the pre-allocated buffer.
// The read operation starts at offset 0 in the buffer and attempts to read up to inputByteLength bytes.
const actualBytesRead = fileSystemModule.readSync(process.stdin.fd, rawInputBuffer, 0, inputByteLength, 0);

// Convert the raw buffer data into a UTF-8 string, then split this string by newline characters.
// This results in an array where each element is a line from the input.
const parsedInputLines = rawInputBuffer.toString('utf8', 0, actualBytesRead).split('\n');

// After setting up the input, invoke the main processing function to begin solving knapsack problems.
processKnapsackProblems();


// --- Utility Functions ---

/**
 * Compares two numerical values and returns the larger one.
 * This helper function replaces a less readable bitwise trick from the original code
 * with the standard and more explicit Math.max() method for improved clarity.
 *
 * @param {number} valA - The first number to compare.
 * @param {number} valB - The second number to compare.
 * @returns {number} The greater of the two input values.
 */
function determineMaximum(valA, valB) {
  return Math.max(valA, valB);
}

/**
 * Parses a string containing item details (value and weight) into a structured object.
 * It expects the string to be in the format "value,weight". Includes basic validation
 * to ensure that the parsed components are valid non-negative numbers.
 *
 * @param {string} itemDetailsString - The input string, e.g., "10,5".
 * @returns {{itemValue: number, itemWeight: number} | null} An object containing
 *          'itemValue' and 'itemWeight' properties, or null if parsing fails
 *          due to invalid format or non-numeric/negative values.
 */
function parseItemDetails(itemDetailsString) {
    // Ensure the input is a non-empty string.
    if (!itemDetailsString || typeof itemDetailsString !== 'string') {
        return null;
    }
    // Split the string by the comma delimiter.
    const parts = itemDetailsString.split(',');
    // Validate that exactly two parts (value and weight) were found.
    if (parts.length !== 2) {
        return null;
    }
    // Attempt to convert string parts to integers.
    const value = parseInt(parts[0].trim(), 10); // Use .trim() to handle potential whitespace
    const weight = parseInt(parts[1].trim(), 10);

    // Validate that both parsed values are numbers and are non-negative.
    if (isNaN(value) || isNaN(weight) || value < 0 || weight < 0) {
        return null;
    }
    return { itemValue: value, itemWeight: weight };
}


// --- Main Application Logic ---

/**
 * The central function orchestrating the processing of multiple knapsack problem instances.
 * It iteratively reads problem parameters (knapsack capacity, number of items) and item
 * specifications from the parsed input lines. For each problem, it applies a dynamic
 * programming approach to compute the maximum value that can be placed in the knapsack
 * without exceeding its capacity, along with the corresponding optimal weight.
 * Results for each case are then printed to the console.
 */
function processKnapsackProblems() {
  let lineCursor = 0; // An index to keep track of the current line being read from 'parsedInputLines'.
  let currentCaseNumber = 1; // A counter for the test cases, used in the output.

  // The main loop continues to process knapsack problems as long as valid input is available.
  // It will break if an invalid knapsack capacity (e.g., 0 or non-numeric) is encountered.
  while (true) {
    // Read the maximum weight capacity for the current knapsack problem.
    // The unary plus operator (`+`) efficiently converts the string from input to a number.
    const knapsackCapacity = +parsedInputLines[lineCursor++];

    // This condition serves as the termination signal for the loop. If 'knapsackCapacity'
    // is 0, NaN, or any other falsy value, it indicates the end of valid problem inputs.
    if (!knapsackCapacity) {
      break;
    }

    // Read the total count of items that are available for the current problem.
    const numberOfItems = +parsedInputLines[lineCursor++];

    // Input validation: Check if the number of items is a valid non-negative integer.
    // If not, log an error, try to advance the cursor past expected item lines (heuristic),
    // and skip to the next test case to prevent further errors for this malformed input.
    if (isNaN(numberOfItems) || numberOfItems < 0) {
        console.error(`Error: Invalid number of items specified for Case ${currentCaseNumber}. Skipping this case.`);
        // Heuristically advance the cursor by the (invalid) numberOfItems to try and reach the next case's capacity.
        // This might not be perfect if the input is severely corrupted.
        lineCursor += Math.abs(numberOfItems);
        continue; // Proceed to the next iteration of the while loop.
    }

    // Initialize the dynamic programming array for the 'previous' state.
    // This array, `previousStateValues`, stores the maximum value achievable for each
    // possible weight (from 0 up to `knapsackCapacity`) considering items processed so far.
    // `Int32Array` is used for performance with integer values, and its size is `capacity + 1`
    // to accommodate weights from 0 to `capacity`.
    const dpArraySize = knapsackCapacity + 1;
    let previousStateValues = new Int32Array(dpArraySize);

    // Iterate through each item, processing them one by one.
    // This loop populates `previousStateValues` based on the current item being considered.
    for (let itemIndex = 0; itemIndex < numberOfItems; itemIndex++) {
      // Fetch the string representing the current item's value and weight.
      const itemDetailsString = parsedInputLines[lineCursor++];
      // Use the helper function to parse these details into a structured object.
      const itemParsed = parseItemDetails(itemDetailsString);

      // Guard clause: If the item details could not be parsed correctly,
      // log a warning and skip this specific item, moving to the next.
      if (!itemParsed) {
          console.warn(`Warning: Failed to parse item details for Case ${currentCaseNumber}, item ${itemIndex + 1}. This item will be skipped.`);
          continue; // Move to the next item in the loop.
      }

      const currentItemValue = itemParsed.itemValue;
      const currentItemWeight = itemParsed.itemWeight;

      // Create a new dynamic programming array to store the state *after* considering the current item.
      // It's initialized as a direct copy of `previousStateValues`. This means that for any weight
      // less than `currentItemWeight`, the maximum value remains unchanged (as the current item cannot fit).
      const currentStateValues = new Int32Array(previousStateValues);

      // Iterate through all possible weights, starting from the current item's weight up to the knapsack capacity.
      // This is the core logic of the 0/1 knapsack problem (or a variant thereof, depending on context).
      for (let currentWeightConsidered = currentItemWeight; currentWeightConsidered <= knapsackCapacity; currentWeightConsidered++) {
        // Calculate the value if the current item *is included*:
        // This is the value from the previous state for the remaining weight (`currentWeightConsidered - currentItemWeight`)
        // plus the value of the `currentItemValue`.
        const valueIfIncluded = previousStateValues[currentWeightConsidered - currentItemWeight] + currentItemValue;

        // Calculate the value if the current item *is NOT included*:
        // This is simply the maximum value achievable for `currentWeightConsidered` from the previous state.
        const valueIfNotIncluded = previousStateValues[currentWeightConsidered];

        // Update the `currentStateValues` array for `currentWeightConsidered` by taking the maximum
        // of these two possibilities (include or not include the current item).
        currentStateValues[currentWeightConsidered] = determineMaximum(valueIfIncluded, valueIfNotIncluded);
      }

      // After processing the current item, the `currentStateValues` becomes the `previousStateValues`
      // for the next iteration, effectively moving to the next item's calculation.
      previousStateValues = currentStateValues;
    }

    // Once all items have been processed, `previousStateValues` holds the final DP solution.
    // Now, we need to find the maximum achieved value (cost) and the smallest weight that yields this value.
    let maximumAchievedValue = 0;
    let optimalWeightFound = 0; // Initialized to 0, which is valid for an empty knapsack or if no items fit.

    // Iterate through the final DP array to find the highest value and its corresponding weight.
    // If multiple weights result in the same `maximumAchievedValue`, the loop implicitly
    // selects the smallest `optimalWeightFound` because it updates only when `valueAtCurrentWeight` is strictly greater.
    for (let weightIterator = 0; weightIterator <= knapsackCapacity; weightIterator++) {
      const valueAtCurrentWeight = previousStateValues[weightIterator];

      if (valueAtCurrentWeight > maximumAchievedValue) {
        maximumAchievedValue = valueAtCurrentWeight;
        optimalWeightFound = weightIterator;
      }
    }

    // Output the results for the current test case in the specified format,
    // using a template literal for improved readability and concatenation.
    console.log(
      `Case ${currentCaseNumber++}:\n` +
      `${maximumAchievedValue}\n` +
      `${optimalWeightFound}`
    );
  }
}
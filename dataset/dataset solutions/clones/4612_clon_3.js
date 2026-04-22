/*
 * File: data_processor_module.js
 * Description: This module provides robust utilities for parsing input and
 *              implements a combinatorial algorithm to determine the maximum
 *              achievable value under specific weight constraints, akin to
 *              a variation of the knapsack problem.
 */

// --- Core Parsing Utilities ---

/**
 * Safely converts a string to an integer. Includes basic input validation.
 * @param {string} inputString - The string to convert.
 * @returns {number} The parsed integer, or 0 if parsing fails or input is invalid.
 */
const parseIntegerVal = (inputString) => {
  // Guard clause for non-string or non-numeric-looking input.
  if (typeof inputString !== 'string' || !/^-?\d+$/.test(inputString.trim())) {
    console.warn(`[Parser Warning] Invalid format for integer: '${inputString}'. Defaulting to 0.`);
    return 0;
  }
  return parseInt(inputString, 10);
};

/**
 * Safely converts a string to a floating-point number. Includes basic input validation.
 * @param {string} inputString - The string to convert.
 * @returns {number} The parsed float, or 0.0 if parsing fails or input is invalid.
 */
const parseFloatVal = (inputString) => {
  // Guard clause for non-string or non-numeric-looking input.
  if (typeof inputString !== 'string' || !/^-?\d+(\.\d+)?$/.test(inputString.trim())) {
    console.warn(`[Parser Warning] Invalid format for float: '${inputString}'. Defaulting to 0.0.`);
    return 0.0;
  }
  return parseFloat(inputString);
};

// --- Extended Array Functionality ---

// Enhances Array.prototype with custom sorting and filtering methods.
// Using Object.defineProperty to ensure properties are non-enumerable by default
// and to explicitly define their behavior.

/**
 * Sorts the array of numbers in ascending order (smallest to largest).
 * Modifies the array in place and returns it.
 */
Object.defineProperty(Array.prototype, 'orderNumbersAscending', {
  value: function () {
    // Basic type check for robustness.
    if (!Array.isArray(this)) {
      console.error("Method 'orderNumbersAscending' invoked on a non-array object.");
      return [];
    }
    return this.sort((valA, valB) => (valA - valB));
  },
  writable: true,
  configurable: true
});

/**
 * Sorts the array of numbers in descending order (largest to smallest).
 * Modifies the array in place and returns it.
 */
Object.defineProperty(Array.prototype, 'orderNumbersDescending', {
  value: function () {
    if (!Array.isArray(this)) {
      console.error("Method 'orderNumbersDescending' invoked on a non-array object.");
      return [];
    }
    return this.sort((valA, valB) => (valB - valA));
  },
  writable: true,
  configurable: true
});

/**
 * Sorts the array of strings in ascending lexicographical order.
 * Modifies the array in place and returns it.
 */
Object.defineProperty(Array.prototype, 'orderStringsAscending', {
  value: function () {
    if (!Array.isArray(this)) {
      console.error("Method 'orderStringsAscending' invoked on a non-array object.");
      return [];
    }
    return this.sort(); // Default string sort.
  },
  writable: true,
  configurable: true
});

/**
 * Sorts the array of strings in descending lexicographical order.
 * Creates a shallow copy to prevent issues with chaining and modifies the copy.
 */
Object.defineProperty(Array.prototype, 'orderStringsDescending', {
  value: function () {
    if (!Array.isArray(this)) {
      console.error("Method 'orderStringsDescending' invoked on a non-array object.");
      return [];
    }
    // Create a shallow copy before sorting to avoid unexpected side effects if original array is needed elsewhere.
    const tempArray = [...this];
    return tempArray.sort().reverse();
  },
  writable: true,
  configurable: true
});

/**
 * Returns a new array with all occurrences of a specified item removed.
 * The original array remains unchanged.
 * @param {*} itemToRemove - The element value to filter out.
 * @returns {Array} A new array without the specified item.
 */
Object.defineProperty(Array.prototype, 'filterOutElement', {
  value: function (itemToRemove) {
    if (!Array.isArray(this)) {
      console.error("Method 'filterOutElement' invoked on a non-array object.");
      return [];
    }
    return this.filter((currentItem) => currentItem !== itemToRemove);
  },
  writable: true,
  configurable: true
});

// --- Standard Input Handling ---

let rawInputDataAccumulator = ''; // Stores all received data chunks.

// Activate the standard input stream.
process.stdin.resume();
// Set the character encoding for incoming data.
process.stdin.setEncoding('utf8');

// Event listener for when data is available on stdin.
process.stdin.on('data', (receivedChunk) => {
  rawInputDataAccumulator += receivedChunk; // Concatenate the chunk.
});

// Event listener for when the input stream has ended.
process.stdin.on('end', () => {
  // Pre-process the accumulated raw input.
  if (!rawInputDataAccumulator.trim()) {
    console.error("[Input Error] No valid input data was provided. Application cannot proceed.");
    process.exit(1); // Terminate with an error code.
  }

  const processedInputLines = rawInputDataAccumulator
    .split(/\r?\n/) // Split by newlines, handling both Windows (\r\n) and Unix (\n).
    .map(currentLineText => currentLineText.trim()) // Remove leading/trailing whitespace from each line.
    .filter(Boolean); // Filter out any lines that become empty after trimming.

  // Invoke the main application logic with the prepared input.
  executeCoreLogic(processedInputLines);
});

// --- Main Application Logic ---

/**
 * Orchestrates the primary business logic: parsing parameters and item data,
 * then solving the value maximization problem using a recursive approach.
 * @param {string[]} inputLineCollection - Array of cleaned input strings.
 */
const executeCoreLogic = (inputLineCollection) => {
  // Validate minimum input lines for parameters.
  if (inputLineCollection.length < 1) {
    console.error("[Logic Error] Not enough input lines to extract initial parameters. Aborting.");
    return; // Exit function.
  }

  // Parse the first line to get the total number of items (N) and max weight (W).
  const initialParameters = inputLineCollection[0].split(' ').map(parseIntegerVal);

  // Validate parsed initial parameters.
  if (initialParameters.length < 2 || initialParameters.some(isNaN)) {
    console.error("[Logic Error] Failed to parse item count (N) or max weight (W) from the first line. Aborting.");
    return;
  }

  const [declaredItemCount, maxWeightCapacity] = initialParameters;

  // Initialize the variable to track the highest value found across all valid combinations.
  let globalMaxValue = 0;

  // Process subsequent lines to extract item weight-value pairs.
  // Each item is stored as an object for better readability.
  const itemDataList = inputLineCollection.slice(1).map((lineString, lineIndex) => {
    const parts = lineString.split(' ').map(parseIntegerVal);
    // Validate each item line.
    if (parts.length < 2 || parts.some(isNaN)) {
      console.warn(`[Data Warning] Skipping malformed item data on input line ${lineIndex + 2}: '${lineString}'.`);
      return null; // Return null for invalid items to be filtered out later.
    }
    return {
      weight: parts[0],
      value: parts[1]
    };
  }).filter(Boolean); // Remove any null entries from malformed lines.

  const actualParsedItemCount = itemDataList.length;

  // Provide a warning if the declared N doesn't match the actual number of parsed items.
  if (declaredItemCount !== actualParsedItemCount) {
    console.warn(`[Data Warning] Declared item count (N=${declaredItemCount}) differs from actual parsed items (${actualParsedItemCount}). Proceeding with actual parsed count.`);
  }

  /**
   * Recursive helper function to explore combinations of items.
   * This function uses a backtracking approach to find the maximum value
   * without exceeding the given weight capacity.
   *
   * @param {number} currentItemIndex - The index of the item to start considering from.
   * @param {number} accumulatedWeight - The total weight of items selected in the current path.
   * @param {number} accumulatedValue - The total value of items selected in the current path.
   */
  const exploreItemCombinations = (currentItemIndex, accumulatedWeight, accumulatedValue) => {
    // Update the global maximum value with the current path's accumulated value.
    // This ensures that even partial combinations (not all items considered)
    // that yield a high value are captured.
    globalMaxValue = Math.max(globalMaxValue, accumulatedValue);

    // Iterate through the remaining items starting from 'currentItemIndex'.
    // This ensures that each item is considered at most once in any given combination (no replacement).
    for (let k = currentItemIndex; k < actualParsedItemCount; ++k) {
      const currentItem = itemDataList[k]; // Get details for the item at index 'k'.

      // Check if including the current item would exceed the maximum weight capacity.
      if (currentItem.weight + accumulatedWeight <= maxWeightCapacity) {
        // If within capacity, recursively explore this path:
        // 1. Move to the next item in the list (k + 1).
        // 2. Add the current item's weight to the accumulated total.
        // 3. Add the current item's value to the accumulated total.
        exploreItemCombinations(
          k + 1,
          accumulatedWeight + currentItem.weight,
          accumulatedValue + currentItem.value
        );
      }
      // If the item cannot be added (due to weight), this specific recursive call
      // implicitly "skips" the item and the loop continues to consider the next item (k+1)
      // from the current `exploreItemCombinations` level, effectively exploring an alternate path.
    }
  };

  // Initiate the recursive search process.
  // Start from the first item (index 0), with initial weight and value both at zero.
  exploreItemCombinations(0, 0, 0);

  // Output the final maximum value determined after exploring all valid combinations.
  console.log(globalMaxValue);
};
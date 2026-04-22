"use strict";

// This module provides a robust and flexible utility for parsing input data.
// It encapsulates logic for reading scalar values, entire lines, or blocks of lines.
const InputProcessor = (function() {
  /**
   * Class responsible for handling the input stream, buffering lines,
   * and providing methods to extract data in various formats.
   */
  class DataStreamHandler {
    /**
     * Initializes the data stream handler with the complete raw input string.
     * @param {string} rawInputContent - The entire text content received from the input source.
     */
    constructor(rawInputContent) {
      // The internal buffer stores all input lines, initially as strings.
      // This array is designed to be read sequentially.
      this.fullInputLines = rawInputContent.trim().split('\n');
      // A pointer indicating the index of the next line to be read from `fullInputLines`.
      this.readPointer = 0;
      // An auxiliary buffer used specifically when reading items one-by-one from a single line.
      // It's cleared whenever a new full line or block of lines is consumed.
      this.itemBuffer = [];
    }

    /**
     * Retrieves the next single item (scalar value) from the input stream.
     * Items on a line are consumed from left-to-right (by popping from a reversed array).
     * If the current line's item buffer is exhausted, it loads the next line.
     * @param {boolean} [returnAsText=false] - If true, the item is returned as a string; otherwise,
     *                                          it attempts to convert it to a number using `Number()`.
     * @returns {string|number} The extracted scalar item.
     * @throws {Error} If the end of the input stream is reached unexpectedly.
     */
    getNextScalar(returnAsText = false) {
      // If the item buffer is empty, it means we need to process a new line.
      if (this.itemBuffer.length === 0) {
        // Check if there are any lines left in the main input buffer.
        if (this.readPointer >= this.fullInputLines.length) {
          throw new Error("End of input stream reached while trying to fetch a scalar value.");
        }
        // Split the current line into elements and reverse it for efficient `pop()` operations,
        // then store it in the item buffer.
        this.itemBuffer = this.fullInputLines[this.readPointer].split(' ').reverse();
        // Advance the main line pointer immediately after consuming a line into the item buffer.
        this.readPointer++;
      }

      // Extract the last item from the (reversed) item buffer.
      const extractedItem = this.itemBuffer.pop();
      // Return the item, either as a string or converted to a number.
      return returnAsText ? extractedItem : Number(extractedItem);
    }

    /**
     * Reads an entire line from the input stream.
     * This method clears any pending items in the `itemBuffer` to ensure full line integrity.
     * @param {boolean} [returnAsText=false] - If true, returns elements as strings; otherwise,
     *                                          attempts to convert them to numbers using `parseFloat()`.
     * @returns {Array<string|number>} An array containing all elements of the read line.
     * @throws {Error} If the end of the input stream is reached unexpectedly.
     */
    readFullLine(returnAsText = false) {
      // Clear the item buffer to prevent interference from partially read previous lines.
      this.itemBuffer = [];
      // Check for end-of-input before attempting to read.
      if (this.readPointer >= this.fullInputLines.length) {
        throw new Error("End of input stream reached while trying to read a full line.");
      }
      // Get the text of the current line and advance the main line pointer.
      const lineText = this.fullInputLines[this.readPointer++];
      // Split the line into elements.
      const lineElements = lineText.split(' ');
      // Return elements, either as strings or parsed as floating-point numbers.
      return returnAsText ? lineElements : lineElements.map(parseFloat);
    }

    /**
     * Reads a specified number of consecutive lines and formats them as a 2D matrix (array of arrays).
     * This method also clears any pending items in the `itemBuffer`.
     * @param {number} numRows - The number of rows (lines) to read for the matrix.
     * @param {boolean} [returnAsText=false] - If true, returns matrix elements as strings; otherwise,
     *                                          attempts to convert them to numbers using `parseFloat()`.
     * @returns {Array<Array<string|number>>} A 2D array representing the matrix block.
     * @throws {Error} If the end of the input stream is reached prematurely while reading rows.
     */
    readMatrixBlock(numRows, returnAsText = false) {
      this.itemBuffer = []; // Clear item buffer.
      const matrixData = [];
      for (let i = 0; i < numRows; i++) {
        // Check for sufficient lines before each row read.
        if (this.readPointer >= this.fullInputLines.length) {
          throw new Error(`End of input stream reached while reading matrix row ${i+1}/${numRows}.`);
        }
        // Read the current row's text and advance the pointer.
        const rowText = this.fullInputLines[this.readPointer++];
        const rowElements = rowText.split(' ');
        matrixData.push(returnAsText ? rowElements : rowElements.map(parseFloat));
      }
      return matrixData;
    }

    /**
     * Reads a specified number of raw lines directly from the input.
     * This method also clears any pending items in the `itemBuffer`.
     * It's suitable for cases where each line contains a single value or should be treated as a single string.
     * @param {number} count - The number of lines to read.
     * @param {boolean} [returnAsText=false] - If true, returns lines as raw strings; otherwise,
     *                                          attempts to parse each line as a single number using `parseFloat()`.
     * @returns {Array<string|number>} An array of the read lines.
     * @throws {Error} If the end of the input stream is reached prematurely.
     */
    readRawLineBlock(count, returnAsText = false) {
      this.itemBuffer = []; // Clear item buffer.
      const lines = [];
      for (let i = 0; i < count; i++) {
        if (this.readPointer >= this.fullInputLines.length) {
          throw new Error(`End of input stream reached while reading raw line ${i+1}/${count}.`);
        }
        const lineContent = this.fullInputLines[this.readPointer++];
        lines.push(returnAsText ? lineContent : parseFloat(lineContent));
      }
      return lines;
    }
  }

  // The IIFE returns a factory function, allowing creation of `DataStreamHandler` instances.
  return function initializeInputStream(inputSourceText) {
    return new DataStreamHandler(inputSourceText);
  };
})();

// Instantiate the input reader by providing content from standard input.
const inputReader = InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically creates a multi-dimensional array (or grid) filled with a specified default value.
 * This function provides a safer and more readable alternative to using `eval` for array creation.
 * @param {any} defaultValue - The value to fill all elements of the array with.
 * @param {...number} dimensions - A variable number of arguments representing the size of each dimension.
 * @returns {Array} The newly initialized multi-dimensional array.
 * @throws {Error} If no dimensions are provided.
 */
function createMultiDimensionalGrid(defaultValue, ...dimensions) {
  // Validate that at least one dimension is provided.
  if (!Array.isArray(dimensions) || dimensions.length === 0) {
    throw new Error("Dimensions must be provided as positive numbers to create a multi-dimensional grid.");
  }

  /**
   * Recursive helper function to construct the array dimension by dimension.
   * @param {number} currentDimensionIndex - The index of the dimension currently being constructed.
   * @returns {Array} A (sub)array for the current dimension.
   */
  const constructDimension = (currentDimensionIndex) => {
    // Base case: If we are at the innermost dimension, fill it with the default value.
    if (currentDimensionIndex === dimensions.length - 1) {
      return Array(dimensions[currentDimensionIndex]).fill(defaultValue);
    } else {
      // Recursive step: Create an array for the current dimension,
      // and for each slot, recursively call `constructDimension` for the next level.
      return Array(dimensions[currentDimensionIndex]).fill(null).map(() => constructDimension(currentDimensionIndex + 1));
    }
  };

  // Start the recursive construction from the outermost dimension (index 0).
  return constructDimension(0);
}

// Define a constant for a very large number, representing an effectively infinite cost in DP problems.
const MAX_POSSIBLE_COST = 1_000_000_000_000_000; // Equivalent to 1e15

// Execute the main problem-solving function and print its result to the console.
console.log(solveProblem());

/**
 * Main function to solve the dynamic programming problem.
 * It reads input parameters, initializes DP tables, performs iterative calculations,
 * and determines the minimum cost based on specific transition rules.
 * @returns {number} The calculated minimum cost.
 */
function solveProblem() {
  // Read the total number of stages (N) and the maximum allowed gap (X) from the input.
  const totalStages = inputReader.getNextScalar();
  const maxGapAllowed = inputReader.getNextScalar();

  // Guard clause: If there are no stages, the cost is trivially zero.
  if (totalStages <= 0) {
    // console.warn("No stages to process, returning 0 cost."); // Optional: add a warning.
    return 0;
  }

  // Read the elevation profile (H) from the input.
  // A dummy value (0) is prepended to `elevationProfile` to align with 1-based indexing
  // often implied in such problems, making `elevationProfile[1]` the first actual elevation.
  const elevationProfile = [0, ...inputReader.readFullLine()];

  // Initialize the first dynamic programming table.
  // Its dimensions are set to handle initial states (often 2x2 or similar small size).
  // All cells are pre-filled with a very large cost.
  let dpTableCurrent = createMultiDimensionalGrid(MAX_POSSIBLE_COST, 2, 2);

  // Set the initial base cases for the DP table.
  // dpTableCurrent[0][0] might represent the cost for reaching the first actual stage
  // with no prior jumps or specific conditions.
  dpTableCurrent[0][0] = elevationProfile[1];
  // dpTableCurrent[1][1] could represent a different initial state or a zero-cost starting point.
  dpTableCurrent[1][1] = 0;

  // The main loop iterates through each stage of the problem, starting from the second stage.
  // `stageIndex` corresponds to 'i' in the original problem formulation.
  for (let stageIndex = 1; stageIndex < totalStages; stageIndex++) {
    // Calculate the dynamic upper bound for the inner loops in this iteration.
    // This limit ensures array accesses are within bounds and computations are relevant.
    const iterationRangeLimit = Math.min(stageIndex, maxGapAllowed) + 1;

    // Create a new DP table for the next iteration's calculations.
    // Its size depends on the `iterationRangeLimit`.
    const dpTableNext = createMultiDimensionalGrid(MAX_POSSIBLE_COST, iterationRangeLimit + 1, iterationRangeLimit + 1);

    // First set of nested loops to update `dpTableNext` states.
    // `prevGapLength` corresponds to 'j', representing a previous jump or gap length.
    for (let prevGapLength = 0; prevGapLength < iterationRangeLimit; prevGapLength++) {
      // `prevStateIndex` corresponds to 'k', representing an index related to a previous state.
      for (let prevStateIndex = prevGapLength; prevStateIndex < iterationRangeLimit; prevStateIndex++) {
        // Retrieve elevation values for cost calculation.
        const currentElevation = elevationProfile[stageIndex + 1];
        const previousElevation = elevationProfile[stageIndex - prevGapLength];
        // Calculate the additional cost incurred due to height difference.
        // `Math.max(0, ...)` ensures cost does not decrease if current elevation is lower.
        const heightCostDelta = Math.max(0, currentElevation - previousElevation);

        // Calculate the potential new cost for a specific state transition.
        const calculatedCostA = dpTableCurrent[prevStateIndex][prevGapLength] + heightCostDelta;
        // If this new cost is better than what's currently recorded, update `dpTableNext`.
        if (calculatedCostA < dpTableNext[prevStateIndex][0]) {
          dpTableNext[prevStateIndex][0] = calculatedCostA;
        }
      }

      // Second set of nested loops, conditionally executed based on `prevGapLength`.
      // This often represents a different type of transition, e.g., extending a gap.
      if (prevGapLength < maxGapAllowed) {
        for (let prevStateIndex = prevGapLength; prevStateIndex < iterationRangeLimit; prevStateIndex++) {
          // Calculate the potential new cost for another specific state transition.
          const calculatedCostB = dpTableCurrent[prevStateIndex][prevGapLength];
          // If this cost is better, update `dpTableNext` for a different target state.
          if (calculatedCostB < dpTableNext[prevStateIndex + 1][prevGapLength + 1]) {
            dpTableNext[prevStateIndex + 1][prevGapLength + 1] = calculatedCostB;
          }
        }
      }
    }
    // After all calculations for the current stage are complete,
    // the newly computed table becomes the `current` table for the next iteration.
    dpTableCurrent = dpTableNext;
  }

  // After all stages have been processed, find the overall minimum cost
  // from the relevant states in the final `dpTableCurrent`.
  let minimumFinalCost = MAX_POSSIBLE_COST;
  // Iterate through a specific row of the final DP table (related to `maxGapAllowed`).
  for (let finalStateIndex = 0; finalStateIndex <= maxGapAllowed; finalStateIndex++) {
    // Compare and update the minimum cost found.
    if (dpTableCurrent[maxGapAllowed][finalStateIndex] < minimumFinalCost) {
      minimumFinalCost = dpTableCurrent[maxGapAllowed][finalStateIndex];
    }
  }

  // Return the computed minimum cost.
  return minimumFinalCost;
}
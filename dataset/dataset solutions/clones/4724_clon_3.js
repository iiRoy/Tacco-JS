const appInput = initializeInputSystem();

executeSolution();

/**
 * Reads a single integer from the current input line.
 * @returns {number} The parsed integer.
 */
function readIntegerLine() {
  return processInputSegment(getNextLine(), ConversionType.SINGLE_INTEGER);
}

/**
 * Reads a line and splits it into an array of strings by spaces.
 * @returns {string[]} An array of strings.
 */
function readStringArrayLine() {
  return processInputSegment(getNextLine(), ConversionType.STRING_ARRAY_SP);
}

/**
 * Reads a line, splits it by spaces, and converts each segment to a number.
 * @returns {number[]} An array of numbers.
 */
function readIntegerArrayLine() {
  return processInputSegment(getNextLine(), ConversionType.INTEGER_ARRAY_SP);
}

/**
 * Reads a line and splits it into an array of individual characters.
 * @returns {string[]} An array of characters.
 */
function readCharacterArrayLine() {
  return processInputSegment(getNextLine(), ConversionType.CHARACTER_ARRAY);
}

/**
 * Retrieves the next available line from the input system.
 * @returns {string} The next line of input.
 */
function getNextLine() {
  return appInput.fetchNextDataLine();
}

/**
 * Checks if there are more lines remaining in the input.
 * @returns {boolean} True if more lines are available, false otherwise.
 */
function hasMoreLines() {
  return appInput.hasMoreDataLines();
}

/**
 * Fetches raw input data from standard input, processes it, and returns an array of lines.
 * Includes basic error handling for file system operations.
 * @returns {string[]} An array where each element is a line from the input.
 */
function fetchRawInput() {
  try {
    // Attempt to read the entire file synchronously, decode as UTF-8,
    // trim whitespace from start/end, and split into individual lines.
    return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
  } catch (error) {
    // Log an error if reading from stdin fails, and re-throw a more specific error.
    logError("Failed to read input from standard input: " + error.message);
    throw new Error("InputReadingError: Could not retrieve data from stdin.");
  }
}

/**
 * Sets up the global input management system, handling line-by-line access.
 * @returns {object} An object with methods to manage input lines.
 */
function initializeInputSystem() {
  const rawInputLines = fetchRawInput();
  // Basic validation for empty or malformed input.
  if (!rawInputLines || rawInputLines.length === 0 || (rawInputLines.length === 1 && rawInputLines[0] === '')) {
      logError("Input system initialized with empty or invalid raw input data.");
      // Depending on contest rules, this might require exiting or returning a sentinel.
      // For now, it proceeds, and `hasMoreDataLines` will correctly report no lines.
  }

  const inputManager = {
    // The collection of all input lines read from the source.
    inputCollection: rawInputLines,
    // The zero-based index of the next line to be read.
    currentLineIndex: 0,
    // The total count of lines available in the input collection.
    totalLines: rawInputLines.length,

    /**
     * Determines if there are more data lines available for processing.
     * @returns {boolean} True if `currentLineIndex` is less than `totalLines`.
     */
    hasMoreDataLines: function() {
      return (this.currentLineIndex < this.totalLines);
    },

    /**
     * Fetches the next line from the input collection and increments the index.
     * Throws an error if an attempt is made to read beyond the end of the input.
     * @returns {string} The content of the next input line.
     */
    fetchNextDataLine: function() {
      if (!this.hasMoreDataLines()) {
        logError(`InputOutOfBoundsException: Attempted to read past the end of input. Current index: ${this.currentLineIndex}, Total lines: ${this.totalLines}.`);
        throw new Error("InputOutOfBoundsException: No more data lines available for reading.");
      }
      const lineContent = this.inputCollection[this.currentLineIndex];
      this.currentLineIndex++; // Advance the index for the next read
      return lineContent;
    }
  };
  return inputManager;
}

/**
 * Prints the provided message to standard output, typically for final results.
 * @param {any} messageToOutput - The data to be printed.
 */
function printResult(messageToOutput) {
  console.log(messageToOutput);
}

/**
 * Logs an error message to standard error, prefixed for clarity.
 * @param {string} messageToOutput - The error description.
 */
function logError(messageToOutput) {
  console.error(`RUNTIME_ERROR: ${messageToOutput}`);
}

/**
 * Defines constants for various input conversion operations.
 * This improves readability and maintainability over using magic numbers.
 */
const ConversionType = {
  NO_CONVERSION: 0,              // Returns input as is.
  SINGLE_INTEGER: 1,             // Converts to a single integer.
  STRING_ARRAY_SP: 2,            // Splits by space into string array.
  INTEGER_ARRAY_SP: 4,           // Splits by space and converts to number array.
  CHARACTER_ARRAY: 6,            // Splits into array of individual characters.
  NUMERIC_CHAR_ARRAY: 7,         // Splits into char array and converts to numbers.
  JOIN_WITH_SPACE: 8,            // Joins array elements with a space.
  JOIN_WITH_NEWLINE: 9           // Joins array elements with a newline.
};

/**
 * A reusable mapping function to convert string elements to numbers.
 * @param {string} element - The string element to convert.
 * @returns {number} The numeric representation.
 */
const stringToNumberMapper = (element) => Number(element);

/**
 * Processes and converts an input segment based on the specified conversion type.
 * Includes error handling for various conversion scenarios.
 * @param {string|string[]} inputSegment - The data to be converted.
 * @param {number} conversionType - A constant from `ConversionType` specifying the desired conversion.
 * @returns {any} The converted data, or the original segment if conversion fails.
 */
function processInputSegment(inputSegment, conversionType) {
  try {
    switch (conversionType) {
      case ConversionType.SINGLE_INTEGER:
        const parsedValue = parseInt(inputSegment, 10);
        if (isNaN(parsedValue)) {
            logError(`InputConversionWarning: Failed to parse integer from '${inputSegment}'. Returning original.`);
            return inputSegment;
        }
        return parsedValue;
      case ConversionType.STRING_ARRAY_SP:
        return inputSegment.split(" ");
      case ConversionType.INTEGER_ARRAY_SP:
        return inputSegment.split(" ").map(stringToNumberMapper);
      case ConversionType.CHARACTER_ARRAY:
        return inputSegment.split("");
      case ConversionType.NUMERIC_CHAR_ARRAY:
        return inputSegment.split("").map(stringToNumberMapper);
      case ConversionType.JOIN_WITH_SPACE:
        if (Array.isArray(inputSegment)) {
          return inputSegment.join(" ");
        }
        logError("InputConversionError: Attempted to join non-array with space. Returning original.");
        return inputSegment;
      case ConversionType.JOIN_WITH_NEWLINE:
        if (Array.isArray(inputSegment)) {
          return inputSegment.join("\n");
        }
        logError("InputConversionError: Attempted to join non-array with newline. Returning original.");
        return inputSegment;
      case ConversionType.NO_CONVERSION:
      default:
        logError(`InputConversionWarning: Unknown or unsupported conversion type '${conversionType}'. Returning original input.`);
        return inputSegment;
    }
  } catch (conversionError) {
    logError(`InputConversionError: Exception during conversion (type ${conversionType}): ${conversionError.message}. Input: '${inputSegment}'`);
    return inputSegment; // Return original on any unexpected error during conversion
  }
}

/**
 * The main execution function for the problem solution.
 * Handles input parsing, dynamic programming, and result output.
 */
function executeSolution() {
  const initialParameters = readIntegerArrayLine();
  // Destructure the first line of input into meaningful variables.
  const [itemCount, targetA, targetB] = initialParameters;

  // Implement guard clauses for invalid or out-of-bounds input parameters.
  // This helps prevent errors and provides clearer feedback for edge cases.
  if (itemCount <= 0 || targetA <= 0 || targetB <= 0) {
      printResult(-1); // No valid solution possible with these parameters.
      logError(`Invalid initial parameters detected: N=${itemCount}, MA=${targetA}, MB=${targetB}. Solution terminated.`);
      return;
  }

  // Read all subsequent item details into an array.
  // Each item is expected to be an array of numbers [a_value, b_value, cost_value].
  const itemDetails = Array.from({ length: itemCount }, () => readIntegerArrayLine());

  // Define the maximum possible sum for A and B values.
  // This constant determines the dimensions of our dynamic programming table.
  // A value of 151 implies sums can go up to 150 (0-indexed).
  const maxDimensionValue = 151;

  // Initialize the 3D dynamic programming table.
  // minCostTable[i][j][k] stores the minimum cost to achieve a total 'A' sum of 'j'
  // and a total 'B' sum of 'k' using the first 'i' items.
  // All states are initially set to Infinity, indicating they are unreachable.
  const minCostTable = Array.from({ length: itemCount + 1 }, () =>
    Array.from({ length: maxDimensionValue }, () =>
      Array.from({ length: maxDimensionValue }, () => Infinity)
    )
  );

  // Base case for the DP: achieving 0 'A' and 0 'B' with 0 items costs 0.
  minCostTable[0][0][0] = 0;

  // --- Dynamic Programming Table Population ---
  // Iterate through each item to build up the DP table.
  for (let itemIndex = 1; itemIndex <= itemCount; itemIndex++) {
    const currentItem = itemDetails[itemIndex - 1]; // Adjust for 0-indexed array access.
    const itemAValue = currentItem[0];
    const itemBValue = currentItem[1];
    const itemPurchaseCost = currentItem[2];

    // Pass 1: Propagate states from the previous item without including the current item.
    // This ensures that all states reachable with (itemIndex - 1) items are also potentially
    // reachable with (itemIndex) items if the current item is skipped.
    for (let sumA = 0; sumA < maxDimensionValue; sumA++) {
      for (let sumB = 0; sumB < maxDimensionValue; sumB++) {
        minCostTable[itemIndex][sumA][sumB] = minCostTable[itemIndex - 1][sumA][sumB];
      }
    }

    // Pass 2: Consider including the current item to update states.
    // Iterate through all possible previous (itemIndex - 1) states.
    for (let prevSumA = 0; prevSumA < maxDimensionValue; prevSumA++) {
      for (let prevSumB = 0; prevSumB < maxDimensionValue; prevSumB++) {
        // If the previous state was reachable (i.e., not Infinity).
        if (minCostTable[itemIndex - 1][prevSumA][prevSumB] !== Infinity) {
          const newSumA = prevSumA + itemAValue;
          const newSumB = prevSumB + itemBValue;

          // Only update if the new sums are within the bounds of our DP table.
          if (newSumA < maxDimensionValue && newSumB < maxDimensionValue) {
            const costIfItemAdded = minCostTable[itemIndex - 1][prevSumA][prevSumB] + itemPurchaseCost;
            // Update the current state with the minimum cost found so far.
            minCostTable[itemIndex][newSumA][newSumB] = Math.min(
              minCostTable[itemIndex][newSumA][newSumB],
              costIfItemAdded
            );
          }
        }
      }
    }
  }

  // --- Final Result Calculation ---
  let currentMultiplier = 1;
  const unreachableCostSentinel = Infinity; // Using Infinity as a clear sentinel for no solution.
  let minOverallCost = unreachableCostSentinel;

  // Iterate through multiples of targetA and targetB to find the minimum cost.
  // The loop continues as long as the target sums remain within our DP table dimensions.
  while (true) {
    const currentTargetA = targetA * currentMultiplier;
    const currentTargetB = targetB * currentMultiplier;

    // If target sums exceed the DP table's capacity, no further multiples can be checked.
    if (currentTargetA >= maxDimensionValue || currentTargetB >= maxDimensionValue) {
      break;
    }

    // Retrieve the cost for the current target multiple from the fully populated DP table.
    const costForCurrentMultiple = minCostTable[itemCount][currentTargetA][currentTargetB];

    // If this state is reachable, update the overall minimum cost.
    if (costForCurrentMultiple !== unreachableCostSentinel) {
      minOverallCost = Math.min(minOverallCost, costForCurrentMultiple);
    }

    currentMultiplier++; // Increment the multiplier for the next iteration.

    // Safety break: Prevents infinite loops in edge cases where targetA or targetB might be 0,
    // or if the problem constraints allow for extremely large multipliers.
    if (currentMultiplier > 1000) {
        logError("Safety break triggered: Multiplier exceeded 1000 iterations. Check input constraints or algorithm logic.");
        break;
    }
  }

  // Output the final result based on whether a solution was found.
  if (minOverallCost === unreachableCostSentinel) {
    printResult(-1); // No combination of items could achieve the target (or its multiples).
  } else {
    printResult(minOverallCost); // Output the lowest cost found.
  }
}
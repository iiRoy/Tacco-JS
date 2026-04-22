// This module defines a data processing pipeline, including input handling,
// token parsing utilities, debugging mechanisms, and the core algorithm logic.
// It is structured to handle command-line input and produce a specific numerical output.

// Define constants for various input token conversion strategies.
// These replace magic numbers with descriptive names for clarity and maintainability.
const PARSING_MODES = {
  INTEGER_VALUE: 101,          // Convert a string token into a base-10 integer.
  STRING_ARRAY_SPLIT: 102,     // Split a string token by spaces into an array of strings.
  INTEGER_ARRAY_SPLIT: 103,    // Split a string token by spaces, then convert each segment to an integer.
  CHARACTER_ARRAY_SPLIT: 104,  // Split a string token into an array of individual characters.
  // Note: Original utility included 'join' operations that were not used by 'next*' functions.
  // For a Type III clone, unused functionalities can be removed or simplified.
  // The 'join' modes (e.g., for joining arrays into strings) have been omitted here
  // to streamline the utility functions to only what is directly consumed by `fetchNext*` methods.
};

// Initialize the readline interface to interact with standard input and output.
// This setup allows for line-by-line reading of input from the console.
const inputReader = require('readline').createInterface({
  input: process.stdin,  // Directs input stream to standard input.
  output: process.stdout // Directs output stream to standard output (not actively used by readline itself here).
});

// A dynamic variable to hold the initialized input processing object.
// This object will manage the collection and retrieval of input lines.
let inputDataProcessor;

// An array to buffer all lines read from the standard input.
// Each line is stored as a string.
const receivedLines = [];

// Event handler for each new line received from the input stream.
// Lines are trimmed to remove any leading or trailing whitespace before storage.
inputReader.on('line', (line) => {
  receivedLines.push(line.trim());
});

// Event handler triggered when the input stream concludes (e.g., EOF is reached).
// This marks the beginning of the program's main execution phase.
inputReader.on('close', () => {
  // Instantiate the input handler with all the collected raw input lines.
  inputDataProcessor = initializeInputHandler(receivedLines);
  
  debugLog("--- Algorithm Execution Initiated ---");
  // Capture a high-resolution timestamp at the start of the core logic execution.
  // Using `process.hrtime.bigint()` for nanosecond precision.
  const startTimeNs = process.hrtime.bigint();
  
  // Execute the primary computational logic of the program.
  executeCoreLogic();
  
  // Capture another high-resolution timestamp upon completion of the core logic.
  const endTimeNs = process.hrtime.bigint();
  // Calculate the elapsed time and convert it from nanoseconds to milliseconds.
  const elapsedTimeMs = Number(endTimeNs - startTimeNs) / 1_000_000;
  
  debugLog("--- Algorithm Execution Concluded ---");
  // Log the total time taken for the algorithm to run, formatted to three decimal places.
  debugLog(`Total processing duration: ${elapsedTimeMs.toFixed(3)} ms`);
  // Report the total heap memory usage, converted to megabytes for easier readability.
  debugLog(`Heap memory utilized: ${Math.round(process.memoryUsage().heapTotal / (1024 * 1024))} MB`);
});

/**
 * Fetches the next available input token (a line) and parses it as an integer.
 * This is a convenience wrapper around `fetchNextToken` and `processTokenConversion`.
 * @returns {number} The parsed integer value from the input.
 */
function fetchNextInteger() {
  return processTokenConversion(fetchNextToken(), PARSING_MODES.INTEGER_VALUE);
}

/**
 * Fetches the next input token and processes it into an array of strings.
 * The token is typically split by whitespace.
 * @returns {string[]} An array containing string segments of the input token.
 */
function fetchNextStringArray() {
  return processTokenConversion(fetchNextToken(), PARSING_MODES.STRING_ARRAY_SPLIT);
}

/**
 * Fetches the next input token, splits it into segments, and converts each segment to an integer.
 * Useful for reading a line of space-separated numbers.
 * @returns {number[]} An array containing integer values.
 */
function fetchNextIntegerArray() {
  return processTokenConversion(fetchNextToken(), PARSING_MODES.INTEGER_ARRAY_SPLIT);
}

/**
 * Fetches the next input token and breaks it down into an array of individual characters.
 * @returns {string[]} An array of single-character strings.
 */
function fetchNextCharacterArray() {
  return processTokenConversion(fetchNextToken(), PARSING_MODES.CHARACTER_ARRAY_SPLIT);
}

/**
 * Retrieves the raw next token (which is a full line of input) from the internal buffer.
 * This function interacts directly with the `inputDataProcessor` object.
 * @returns {string} The raw string content of the next input line.
 */
function fetchNextToken() {
  return inputDataProcessor.retrieveNextToken();
}

/**
 * Checks if there are any remaining input tokens (lines) to be read.
 * @returns {boolean} `true` if more tokens are available, `false` otherwise.
 */
function hasPendingTokens() {
  return inputDataProcessor.hasMoreTokens();
}

/**
 * Creates and returns an object designed to manage the sequential access of input lines.
 * It encapsulates the input array and its current reading position.
 * @param {string[]} rawInputLines - An array of all input lines collected from the source.
 * @returns {object} An object with methods to check for and retrieve next input tokens.
 * @throws {Error} If `rawInputLines` is not an array, indicating an invalid setup.
 */
function initializeInputHandler(rawInputLines) {  
  // Pre-condition validation: Ensure the input is an array.
  if (!Array.isArray(rawInputLines)) {
    console.error("Critical Error: `initializeInputHandler` expects an array of strings. Received invalid input.");
    // In case of critical error, throw to prevent further erroneous execution.
    throw new Error("Input handler initialization failed: `rawInputLines` must be an array.");
  }

  const handlerObject = {
    sourceData: rawInputLines,      // The comprehensive list of all input lines.
    currentPosition: 0,             // The zero-based index of the next line to be read.
    maximumItems: rawInputLines.length, // The total count of input lines available.

    /**
     * Determines if there are additional tokens (lines) that can be read from the buffer.
     * @returns {boolean} `true` if `currentPosition` is less than `maximumItems`, indicating more data.
     */
    hasMoreTokens: function() {
      return (this.currentPosition < this.maximumItems);
    },

    /**
     * Retrieves the next available input token from the `sourceData` array.
     * After retrieval, the `currentPosition` is advanced.
     * @returns {string} The string content of the next input line.
     * @throws {Error} If `hasMoreTokens()` returns `false`, signaling that no more input is available.
     */
    retrieveNextToken: function() {
      // Guard clause: Prevent reading beyond the bounds of the input array.
      if (!this.hasMoreTokens()) {
        throw new Error("Input buffer exhausted. Attempted to retrieve token past the end of available input.");
      }
      // Fetch the token and then explicitly increment the position for the next call.
      const tokenValue = this.sourceData[this.currentPosition];
      this.currentPosition += 1; // Increment `currentPosition` for the subsequent retrieval.
      return tokenValue;
    }
  };
  return handlerObject;
}

/**
 * Displays the final computed result to the standard output.
 * This function serves as the program's primary output mechanism for results.
 * @param {*} resultContent - The data (e.g., a number, string) that represents the final output.
 */
function displayFinalResult(resultContent) {
  console.log(resultContent);
}

/**
 * Logs a message to the standard error stream, primarily for debugging and informational purposes.
 * It prepends "DEBUG_INFO:" to messages and uses `JSON.stringify` for structured output of objects.
 * @param {*} debugMessage - The message or data structure to be logged for debugging.
 */
function debugLog(debugMessage) {
  // Use `JSON.stringify` with pretty-printing (2 spaces) for better readability of objects.
  console.error(`DEBUG_INFO: ${JSON.stringify(debugMessage, null, 2)}`);
}

/**
 * Converts a raw string token into a specified data type based on the `conversionMode`.
 * This function handles various parsing requirements and includes robust error handling.
 * @param {string} rawToken - The string input token to be converted.
 * @param {number} conversionMode - An identifier from `PARSING_MODES` dictating the conversion type.
 * @returns {*} The converted value, or the original `rawToken` if conversion fails or is unrecognized.
 */
function processTokenConversion(rawToken, conversionMode) {
  // Initial validation: Check for null or undefined tokens to prevent immediate errors.
  if (rawToken === null || rawToken === undefined) {
    debugLog("Warning: Attempted to convert a null or undefined token. Returning token as is.");
    return rawToken;
  }

  try {
    switch (conversionMode) {
      case PARSING_MODES.INTEGER_VALUE:
        // Validate that the token is a string and not empty before parsing to an integer.
        if (typeof rawToken !== 'string' || rawToken.trim() === '') {
          debugLog(`Attempted integer conversion on non-string or empty token: "${rawToken}". Returning NaN.`);
          return NaN; // Return Not-a-Number for invalid integer input.
        }
        // Use `parseInt` with a radix of 10 to ensure decimal interpretation.
        return parseInt(rawToken, 10);

      case PARSING_MODES.STRING_ARRAY_SPLIT:
        // Ensure the token is a string before attempting to split it.
        if (typeof rawToken !== 'string') {
          debugLog(`Attempted string array split on non-string token: "${rawToken}". Returning empty array.`);
          return []; // Return an empty array for invalid input.
        }
        return rawToken.split(" "); // Split by single space character.

      case PARSING_MODES.INTEGER_ARRAY_SPLIT:
        // Ensure the token is a string before splitting and mapping.
        if (typeof rawToken !== 'string') {
          debugLog(`Attempted integer array split on non-string token: "${rawToken}". Returning empty array.`);
          return []; // Return an empty array for invalid input.
        }
        // Split the string, then map each segment to an integer, again with radix 10.
        return rawToken.split(" ").map(segment => parseInt(segment, 10));

      case PARSING_MODES.CHARACTER_ARRAY_SPLIT:
        // Ensure the token is a string before splitting into characters.
        if (typeof rawToken !== 'string') {
          debugLog(`Attempted character array split on non-string token: "${rawToken}". Returning empty array.`);
          return []; // Return an empty array for invalid input.
        }
        return rawToken.split(""); // Split into an array of individual characters.

      default:
        // If an unrecognized conversion mode is provided, log a warning and return the original token.
        debugLog(`Encountered an unrecognized conversion mode: ${conversionMode}. Returning raw token without conversion.`);
        return rawToken;
    }
  } catch (conversionError) {
    // Catch any unexpected errors that occur during the conversion process.
    debugLog(`An error occurred during token conversion for mode ${conversionMode} (Token: "${rawToken}"): ${conversionError.message}`);
    return rawToken; // Return the original token on error to prevent program termination.
  }
}

/**
 * The central function that encapsulates the main algorithm.
 * It reads an array of numbers, applies a specific modification rule,
 * and then calculates the sum of the modified array elements.
 */
function executeCoreLogic() {
  // Retrieve the declared size of the array from the input.
  let arrayElementCount = fetchNextInteger();

  // Guard clause: Handle cases where the declared array size is zero or negative.
  if (arrayElementCount <= 0) {
    debugLog("Warning: Input array size is non-positive. Skipping core logic and returning zero.");
    displayFinalResult(0); // Output 0 as the sum for an effectively empty array.
    return; // Exit the function early.
  }

  // Fetch the actual list of numbers from the input.
  const numericDataList = fetchNextIntegerArray();

  // Validate that the actual number of elements matches the declared `arrayElementCount`.
  if (numericDataList.length !== arrayElementCount) {
      debugLog(`Discrepancy: Declared array size (${arrayElementCount}) does not match actual fetched list length (${numericDataList.length}). Adjusting 'arrayElementCount' for robustness.`);
      // Adjust `arrayElementCount` to reflect the actual data length to prevent out-of-bounds issues.
      arrayElementCount = numericDataList.length;
  }

  // Primary algorithm loop: Iterates backward through the array.
  // `currentEvaluationIndex` represents the starting point for inner segment processing.
  for (let currentEvaluationIndex = arrayElementCount - 1; currentEvaluationIndex >= 0; --currentEvaluationIndex) {
    // Calculate the step value for the inner loops. This value is 1-based, derived from the index.
    const stepIncrement = currentEvaluationIndex + 1;
    let segmentRunningSum = 0; // Accumulator for the sum of elements within the current segment.

    // First inner loop: Calculates the sum of elements at specific intervals.
    // `traversalPointer` moves from `currentEvaluationIndex` to the end of the array, stepping by `stepIncrement`.
    for (let traversalPointer = currentEvaluationIndex; traversalPointer < arrayElementCount; traversalPointer += stepIncrement) {
      const elementConsidered = numericDataList[traversalPointer];
      // Defensive check: Ensure the element is a valid number before adding to the sum.
      if (typeof elementConsidered === 'number' && !isNaN(elementConsidered)) {
        segmentRunningSum += elementConsidered;
      } else {
        debugLog(`Non-numeric value detected at index ${traversalPointer} during summation. Value: ${elementConsidered}. Skipping.`);
      }
    }

    // Conditional modification: If the calculated segment sum is negative,
    // all elements within that segment (at the same intervals) are reset to zero.
    if (segmentRunningSum < 0) {
      // Second inner loop: Resets elements to zero based on the `stepIncrement`.
      // `zeroingPointer` mirrors the `traversalPointer`'s movement.
      for (let zeroingPointer = currentEvaluationIndex; zeroingPointer < arrayElementCount; zeroingPointer += stepIncrement) {
        numericDataList[zeroingPointer] = 0; // The defined 'magic' zero value for resetting.
      }
    }
  }

  // Final aggregation step: Calculate the total sum of all elements in the potentially modified list.
  let overallAccumulatedResult = 0;
  // Iterate through the entire `numericDataList` from start to end.
  for (let finalAggregationIndex = 0; finalAggregationIndex < arrayElementCount; ++finalAggregationIndex) {
    const valueToAdd = numericDataList[finalAggregationIndex];
    // Another defensive check: Ensure values are numeric before adding to the final sum.
    if (typeof valueToAdd === 'number' && !isNaN(valueToAdd)) {
        overallAccumulatedResult += valueToAdd;
    } else {
        debugLog(`Warning: Non-numeric value encountered during final summation at index ${finalAggregationIndex}. Value: ${valueToAdd}. This value was skipped.`);
    }
  }

  // Display the grand total, which is the final output of the algorithm.
  displayFinalResult(overallAccumulatedResult);
}
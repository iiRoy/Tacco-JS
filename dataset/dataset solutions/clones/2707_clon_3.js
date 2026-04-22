// --- Input/Output and Utility Infrastructure (Internal Use Only) ---
// This section handles standard I/O operations and provides data transformation utilities.

// Initialize the standard input/output interface for Node.js.
const ioManager = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputReader = null; // This object will manage access to processed input data.
const collectedInputLines = []; // A temporary buffer to store all lines read from stdin.

// Define constants for various data conversion types.
// Using an object for constants improves readability and maintainability.
const CONVERSION_TYPES = Object.freeze({
  TO_INTEGER: 1, // Convert string to a single integer.
  SPLIT_BY_SPACE: 2, // Split string into an array of strings by space.
  SPLIT_AND_TO_INTEGER_ARRAY: 4, // Split string by space and convert parts to an array of numbers.
  TO_CHARACTER_ARRAY: 6, // Split string into an array of individual characters.
  SPLIT_AND_TO_INTEGER_CHAR_ARRAY: 7, // Split string into characters and convert them to numbers.
  JOIN_BY_SPACE: 8, // Join array elements with a space.
  JOIN_BY_NEWLINE: 9, // Join array elements with a newline character.
  JOIN_WITHOUT_DELIMITER: 0 // Join array elements without any delimiter.
});

// Event listener: collects each line of input as it's received.
ioManager.on('line', (lineContent) => {
  collectedInputLines.push(lineContent);
});

// Event listener: triggered when the input stream ends.
// This is where the main problem-solving logic is invoked.
ioManager.on('close', () => {
  // Initialize the input processing mechanism with all collected lines.
  inputReader = createInputProcessor(collectedInputLines);
  
  // Log a separator for clarity in debug output.
  logDiagnostic("\n--- Program Execution Initiated ---");

  const executionStartTime = Date.now(); // Record start time for performance metrics.
  try {
    solveProblem(); // Execute the core problem-solving function.
  } catch (errorDetails) {
    // Catch any unhandled errors during problem execution and log them.
    logDiagnostic(`Execution failed with an unexpected error: ${errorDetails.message || errorDetails}`);
  }
  const executionDuration = Date.now() - executionStartTime; // Calculate total execution time.

  // Report performance statistics.
  logDiagnostic(`\nPerformance Metrics:`);
  logDiagnostic(`  Total Time : ${executionDuration} ms`);
  logDiagnostic(`  Memory Footprint : ${Math.round(process.memoryUsage().heapTotal / 1024)} KB`);
  logDiagnostic("--- Program Execution Concluded ---\n");
});


/**
 * Creates and returns an object for navigating and retrieving lines from an input source.
 * This provides a controlled way to access input data sequentially.
 * @param {Array<string>} sourceLines - An array of strings representing the raw input lines.
 * @returns {object} An object with methods to check for more input and retrieve the next line.
 */
function createInputProcessor(sourceLines) {
  // Ensure the input source is treated as an array.
  if (!Array.isArray(sourceLines)) {
    sourceLines = [String(sourceLines)]; // Coerce non-array inputs into a single-element array.
  }
  
  let currentLinePointer = 0; // Tracks the current position in the input lines array.
  const totalAvailableLines = sourceLines.length; // Total number of lines in the input.

  return {
    // Checks if there are more lines available to be read.
    hasMoreInput: () => (currentLinePointer < totalAvailableLines),
    
    // Retrieves the next line from the input source and advances the pointer.
    retrieveNextLine: () => {
      // Guard clause: throw an error if no more input is available.
      if (!this.hasMoreInput()) {
        throw new Error("EndOfInputException: Attempted to read beyond the end of the input stream.");
      }
      const currentInput = sourceLines[currentLinePointer];
      currentLinePointer++; // Move to the next line.
      return currentInput;
    },
    // Allows inspecting the next line without advancing the pointer.
    peekNextLine: () => {
        if (!this.hasMoreInput()) {
            return undefined; // Return undefined if no more input.
        }
        return sourceLines[currentLinePointer];
    }
  };
}

// Global accessor functions for simplifying input retrieval in the main logic.
// These functions act as wrappers around the 'inputReader' object.
const obtainNextInputLine = () => { 
  if (!inputReader) throw new Error("InputReaderNotInitialized: Input processing system not ready.");
  return inputReader.retrieveNextLine(); 
};
const checkMoreInput = () => { 
  if (!inputReader) return false; // If reader isn't initialized, assume no input.
  return inputReader.hasMoreInput(); 
};


/**
 * Prints the provided content to standard output, typically for final results.
 * @param {*} outputContent - The data to be displayed.
 */
function printResult(outputContent) {
  console.log(outputContent);
}

/**
 * Logs diagnostic and debugging messages to standard error.
 * Utilizes Node.js's 'util.inspect' for detailed object representation.
 * @param {*} diagnosticMsg - The message or object to log for debugging.
 */
function logDiagnostic(diagnosticMsg) {
  // Use a comprehensive inspection for complex objects, enabling colors and depth.
  console.error("DIAGNOSTIC_INFO: " + require("util").inspect(diagnosticMsg, { showHidden: false, depth: 5, colors: true }));
}

/**
 * A versatile utility function for transforming input data based on a specified type code.
 * Handles various common conversion scenarios for strings and arrays.
 * @param {*} itemToConvert - The input item (string or array) to be transformed.
 * @param {number} conversionType - A code from CONVERSION_TYPES dictating the transformation logic.
 * @returns {*} The transformed value, or the original item if conversion fails or type is unknown.
 */
function parseAndTransform(itemToConvert, conversionType) {
  try {
    switch (conversionType) {
      case CONVERSION_TYPES.TO_INTEGER:
        // Convert string to integer, using radix 10 for safety.
        return parseInt(String(itemToConvert), 10);
      case CONVERSION_TYPES.SPLIT_BY_SPACE:
        return String(itemToConvert).split(" ");
      case CONVERSION_TYPES.SPLIT_AND_TO_INTEGER_ARRAY:
        return String(itemToConvert).split(" ").map(Number); // 'Number' handles empty strings gracefully to 0.
      case CONVERSION_TYPES.TO_CHARACTER_ARRAY:
        return String(itemToConvert).split("");
      case CONVERSION_TYPES.SPLIT_AND_TO_INTEGER_CHAR_ARRAY:
        return String(itemToConvert).split("").map(Number);
      case CONVERSION_TYPES.JOIN_BY_SPACE:
        // Ensure item is an array before attempting to join.
        return Array.isArray(itemToConvert) ? itemToConvert.join(" ") : String(itemToConvert);
      case CONVERSION_TYPES.JOIN_BY_NEWLINE:
        return Array.isArray(itemToConvert) ? itemToConvert.join("\n") : String(itemToConvert);
      case CONVERSION_TYPES.JOIN_WITHOUT_DELIMITER:
        return Array.isArray(itemToConvert) ? itemToConvert.join("") : String(itemToConvert);
      default:
        // Log a warning for unrecognized conversion types.
        logDiagnostic(`Warning: Unrecognized conversion type code '${conversionType}'. Returning input unchanged.`);
        return itemToConvert;
    }
  } catch (processingException) {
    // Log detailed error information during transformation.
    logDiagnostic(`Error during data transformation (type ${conversionType}): ${processingException.message}. Original input: ${itemToConvert}`);
    return itemToConvert; // Fallback to returning the original item on error.
  }
}

// Convenient specialized input retrieval functions.
const retrieveInteger = () => parseAndTransform(obtainNextInputLine(), CONVERSION_TYPES.TO_INTEGER);
const retrieveStringArray = () => parseAndTransform(obtainNextInputLine(), CONVERSION_TYPES.SPLIT_BY_SPACE);
const retrieveIntegerArray = () => parseAndTransform(obtainNextInputLine(), CONVERSION_TYPES.SPLIT_AND_TO_INTEGER_ARRAY);
const retrieveCharArray = () => parseAndTransform(obtainNextInputLine(), CONVERSION_TYPES.TO_CHARACTER_ARRAY);

// --- End of Utility Infrastructure ---


/**
 * Main function to solve the problem: Counting strings with specific divisibility.
 * This function calculates the number of ways to replace '?' characters in an input string
 * such that the resulting number, when interpreted as a sequence of digits,
 * has a remainder of 5 when divided by 13.
 * It uses dynamic programming to efficiently compute the result.
 */
function solveProblem() {
  // Retrieve the primary input sequence from the configured input source.
  const inputSequence = obtainNextInputLine();

  // Validate the input: ensure it's a non-empty string.
  if (!inputSequence || typeof inputSequence !== 'string' || inputSequence.length === 0) {
    logDiagnostic("Error: The provided input sequence is either invalid, empty, or not a string. Aborting problem solving.");
    return; // Exit if input is not suitable.
  }

  const sequenceLength = inputSequence.length;
  // Define the maximum possible length for the DP table, based on common problem constraints.
  // This value typically includes a buffer for 0-indexing and potential off-by-one scenarios.
  const DP_TABLE_MAX_SIZE = 100005; 

  // Initialize the 2D Dynamic Programming table.
  // `dynamicProgTable[i][j]` will store the count of ways to form a prefix of length `i`
  // such that the number represented by that prefix has a remainder `j` when divided by 13.
  const dynamicProgTable = Array.from({ length: DP_TABLE_MAX_SIZE }, () => Array(13).fill(0));

  // Base case for DP: An empty prefix (length 0) has a value of 0, thus a remainder of 0.
  // There is exactly one way to achieve this (by having no digits).
  dynamicProgTable[0][0] = 1;

  // The modulo constant to keep results within a manageable range and prevent overflow.
  const MODULO_CONSTANT = 1000000007;

  /**
   * Helper function to perform modular addition.
   * Ensures that the sum of two numbers remains within the specified modulo.
   * @param {number} val1 - The first value to add.
   * @param {number} val2 - The second value to add.
   * @param {number} modVal - The modulo value.
   * @returns {number} The result of (val1 + val2) % modVal.
   */
  const performModularAddition = (val1, val2, modVal) => (val1 + val2) % modVal;

  // Iterate through each character of the input sequence, from left to right.
  for (let currentIdx = 0; currentIdx < sequenceLength; currentIdx++) {
    const charBeingProcessed = inputSequence[currentIdx];

    // For each character, iterate through all possible remainders (0 to 12) from the previous step.
    for (let prevRemainder = 0; prevRemainder < 13; prevRemainder++) {
      // Optimization: If no ways exist to reach `prevRemainder` at `currentIdx`, skip this path.
      if (dynamicProgTable[currentIdx][prevRemainder] === 0) {
        continue;
      }

      // Determine the set of possible digit values for the current character.
      let potentialDigits = [];
      if (charBeingProcessed === "?") {
        // If the character is a wildcard, any digit from 0 to 9 is possible.
        for (let digitOption = 0; digitOption < 10; digitOption++) {
          potentialDigits.push(digitOption);
        }
      } else {
        // If it's a fixed digit, convert it from character to number.
        const fixedDigit = Number(charBeingProcessed);
        // Basic validation for fixed digits.
        if (isNaN(fixedDigit) || fixedDigit < 0 || fixedDigit > 9) {
            logDiagnostic(`Warning: Encountered an invalid non-numeric character '${charBeingProcessed}' at index ${currentIdx}. This path will be skipped.`);
            continue; // Skip this problematic character.
        }
        potentialDigits.push(fixedDigit);
      }

      // For each determined possible digit, update the DP table for the next state.
      for (const digit of potentialDigits) {
        // Calculate the new remainder using modular arithmetic:
        // (previous_remainder * 10 + current_digit) % 13.
        const resultantRemainder = (prevRemainder * 10 + digit) % 13;
        
        // Add the number of ways from the previous state to the current state,
        // ensuring the sum is kept within the defined modulo.
        dynamicProgTable[currentIdx + 1][resultantRemainder] = performModularAddition(
          dynamicProgTable[currentIdx + 1][resultantRemainder],
          dynamicProgTable[currentIdx][prevRemainder],
          MODULO_CONSTANT
        );
      }
    }
  }

  // The final solution is the number of ways to achieve a remainder of 5
  // after processing the entire input sequence (i.e., at `sequenceLength`).
  printResult(dynamicProgTable[sequenceLength][5]);
}
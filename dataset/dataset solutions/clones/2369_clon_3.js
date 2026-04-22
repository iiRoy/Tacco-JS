// This section manages the acquisition and initial processing of input data.
const inputReader = require('readline').createInterface({
  input: process.stdin, // Standard input stream for receiving data
  output: process.stdout // Standard output stream for displaying results
});

let bufferedLines = []; // Array to store all lines read from input temporarily
let inputParser = null; // Instance of the input parsing utility for structured access

// Event handler for each line of data received from standard input.
inputReader.on('line', (currentLine) => {
  bufferedLines.push(currentLine); // Accumulate each line in the buffer.
});

// Event handler for when the input stream has concluded (e.g., EOF).
inputReader.on('close', () => {
  // Initialize the input parsing system with the collected data.
  inputParser = new InputDataStream(bufferedLines);
  
  logDiagnostic('Initiating primary computation sequence...');
  const processingStartTime = Date.now(); // Record the start time for performance tracking.
  
  executeCoreLogic(); // Invoke the main computational routine.
  
  const processingDuration = Date.now() - processingStartTime; // Calculate elapsed execution time.
  logDiagnostic(`Total execution time: ${processingDuration} milliseconds.`);
});

/**
 * A utility class designed for managing and sequentially parsing input tokens (lines).
 */
class InputDataStream {
  constructor(lines) {
    this.sourceLines = lines; // The complete array of input strings provided.
    this.currentPosition = 0; // Internal pointer tracking the current index within sourceLines.
    this.totalAvailable = lines.length; // Total count of lines available for processing.
  }

  /**
   * Checks if there are additional input tokens remaining to be processed.
   * @returns {boolean} Returns true if more tokens exist, false otherwise.
   */
  hasMoreTokens() {
    return this.currentPosition < this.totalAvailable;
  }

  /**
   * Retrieves the next input token (line) from the stream and advances the internal pointer.
   * @returns {string} The next available input line as a string.
   * @throws {Error} Throws an error if an attempt is made to read beyond the end of the input.
   */
  fetchNextToken() {
    if (this.hasMoreTokens()) {
      return this.sourceLines[this.currentPosition++];
    } else {
      throw new Error('InputExhaustionError: No further input data is available for processing.');
    }
  }
}

/**
 * Retrieves and parses the next integer value from the input stream.
 * This function relies on the global 'inputParser' instance.
 * @returns {number} The parsed integer value.
 */
function retrieveNextInteger() {
  return convertToken(inputParser.fetchNextToken(), 'integer');
}

/**
 * Displays a given value to the standard console output.
 * @param {*} value The value of any type to be displayed.
 */
function outputResult(value) {
  console.log(value);
}

/**
 * Logs diagnostic or debugging messages to the standard error stream.
 * These messages are typically for internal monitoring or troubleshooting.
 * @param {string} message The diagnostic message to log.
 */
function logDiagnostic(message) {
  console.error(`DIAGNOSTIC_INFO: ${message}`);
}

/**
 * Converts a raw input token (string) into a specified data type.
 * Supports 'integer' conversion; other types are returned as raw strings.
 * @param {string} rawToken The raw string token obtained from input.
 * @param {string} conversionType The target data type for conversion (e.g., 'integer').
 * @returns {*} The converted value, or the original raw token if conversion fails or is unsupported.
 */
function convertToken(rawToken, conversionType) {
  try {
    switch (conversionType) {
      case 'integer':
        const parsedInt = parseInt(rawToken, 10); // Explicitly specify radix 10 for safety.
        if (isNaN(parsedInt)) {
          // If parsing results in NaN, it indicates an invalid integer format.
          throw new Error(`Invalid integer format detected: '${rawToken}'`);
        }
        return parsedInt;
      default:
        // For any unsupported conversion type, issue a warning and return the raw token.
        logDiagnostic(`Warning: Unsupported conversion type '${conversionType}'. Returning raw token.`);
        return rawToken;
    }
  } catch (error) {
    // Log conversion specific errors and fall back to returning the raw token.
    logDiagnostic(`Conversion failure for token '${rawToken}': ${error.message}`);
    return rawToken; 
  }
}

// --------------------------------------------------------------------------
// The core business logic implementation begins here.
// --------------------------------------------------------------------------

// Define constants for numerical operations to enhance readability and maintainability.
const BASE_UNIT_MAGNITUDE = 100; // Represents the base for the 'hundreds' part.
const REMAINDER_GROUP_FACTOR = 5; // The divisor used for grouping the remainder.

/**
 * Determines a binary outcome (0 or 1) based on a specific condition
 * derived from a numerical input's major and minor components.
 * This function orchestrates the main calculation flow.
 * @returns {void} The computed result (0 or 1) is outputted to the console.
 */
function executeCoreLogic() {
  const inputNumber = retrieveNextInteger(); // Fetch the primary numerical value from the input.

  // --- Input Validation / Early Exit Condition ---
  // If the input number is negative, log a warning and treat it as 0 for the purpose of the output.
  if (inputNumber < 0) {
    logDiagnostic(`Warning: Negative input value detected: ${inputNumber}. Outputting 0.`);
    outputResult(0);
    return;
  }

  let finalDecision = 0; // Initialize the default outcome to 0.

  // Primary condition check: If the number is less than BASE_UNIT_MAGNITUDE, the result is always 0.
  if (inputNumber < BASE_UNIT_MAGNITUDE) {
    finalDecision = 0;
  } else {
    // Decompose the input number into its major (hundreds) and minor (remainder) components.
    const hundredsPart = Math.trunc(inputNumber / BASE_UNIT_MAGNITUDE); // Integer division for the hundreds component.
    const remainderPart = inputNumber % BASE_UNIT_MAGNITUDE; // The remainder after division by 100.

    // Utilize a dedicated helper function to encapsulate the complex conditional logic.
    finalDecision = assessSufficiency(hundredsPart, remainderPart, REMAINDER_GROUP_FACTOR);
  }

  outputResult(finalDecision); // Display the final computed decision (0 or 1).
}

/**
 * Helper function to assess if the 'majorComponent' is adequate
 * to cover the 'minorComponent' when the latter is divided by a 'groupingFactor'.
 * @param {number} majorComponent The larger part of the number (e.g., the hundreds count).
 * @param {number} minorComponent The smaller part or remainder (e.g., N % 100).
 * @param {number} groupingFactor The divisor applied to the minor component (e.g., 5).
 * @returns {number} Returns 1 if the major component is sufficient, otherwise 0.
 */
function assessSufficiency(majorComponent, minorComponent, groupingFactor) {
  // If there is no minor component (remainder is zero), the condition is always met.
  if (minorComponent === 0) {
    return 1;
  }

  // Calculate the minimum required major units to cover the minor component.
  // This uses a common integer arithmetic trick for ceiling division: ceil(a/b) = floor((a + b - 1) / b)
  const requiredMajorUnits = Math.floor((minorComponent + groupingFactor - 1) / groupingFactor);

  // Compare the available major units with the calculated required units.
  return (majorComponent >= requiredMajorUnits) ? 1 : 0;
}
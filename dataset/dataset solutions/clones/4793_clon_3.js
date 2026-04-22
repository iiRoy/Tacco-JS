// This section manages asynchronous input and provides utilities for data parsing.
// It is designed to abstract away the specifics of standard input/output.

// A global object to hold our data stream controller.
let inputDataController = null;

// An array to buffer all lines read from standard input.
const receivedContentBuffer = [];

// Configuration for the readline interface.
const readLineConfig = {
  input: process.stdin,
  output: process.stdout
};

// Initialize the readline interface to handle incoming data.
const lineInputHandler = require('readline').createInterface(readLineConfig);

// Register an event listener for each line received.
lineInputHandler.on('line', (currentInputLine) => {
  receivedContentBuffer.push(currentInputLine);
});

// Register an event listener for when the input stream closes.
lineInputHandler.on('close', () => {
  // Once all input is received, initialize the data controller.
  inputDataController = setupInputSource(receivedContentBuffer);
  // Log a brief message to stderr indicating program flow.
  console.error('Input processing finished. Commencing core logic.');
  // Execute the primary solution function.
  executeSolutionLogic();
});

/**
 * Creates and returns an object to manage reading from a list of strings.
 * This acts as an iterator over the input lines.
 * @param {string[]} lineList - An array of strings representing the input lines.
 * @returns {object} An object with methods to navigate and fetch lines.
 */
function setupInputSource(lineList) {
  return {
    sourceContent: lineList,
    currentPosition: 0,
    totalContentLength: lineList.length,

    /**
     * Checks if there are more lines available to read.
     * @returns {boolean} True if more lines exist, false otherwise.
     */
    hasMoreContent: function() {
      return (this.currentPosition < this.totalContentLength);
    },

    /**
     * Fetches the next available line from the source.
     * Throws an error if no more lines are available.
     * @returns {string} The next line of input.
     */
    retrieveNextLine: function() {
      if (this.hasMoreContent()) {
        return this.sourceContent[this.currentPosition++];
      } else {
        throw new Error('No more data in the input stream.');
      }
    }
  };
}

/**
 * Prints the given content to standard output, followed by a newline.
 * @param {*} dataToOutput - The data to be displayed.
 */
function outputResult(dataToOutput) {
  console.log(dataToOutput);
}

/**
 * Logs debug information to standard error.
 * Uses JSON.stringify for structured output.
 * @param {*} debugPayload - The data to log for debugging.
 */
function logDetailedDebug(debugPayload) {
  console.error('DEBUG INFO:', JSON.stringify(debugPayload, null, 2));
}

/**
 * Converts an input string based on a specified conversion type.
 * This function handles common parsing patterns for competitive programming inputs.
 * @param {string} rawString - The raw string input to convert.
 * @param {number} conversionMode - An integer indicating the desired conversion.
 *   1: Parse as a base-10 integer.
 *   4: Split by space, then parse each part as a base-10 integer.
 *   (Other modes from original source are omitted as they are not used by the main logic.)
 * @returns {*} The converted value, or the original string if conversion fails or mode is unknown.
 */
function applyConversion(rawString, conversionMode) {
  try {
    switch (conversionMode) {
      case 1:
        return parseInt(rawString, 10);
      case 4:
        return rawString.split(' ').map(Number);
      // Cases 2, 6, 7, 8, 9, 0 from the original `myconv` are removed
      // as they are not utilized by the `executeSolutionLogic` function.
      default:
        return rawString;
    }
  } catch (conversionError) {
    logDetailedDebug(`Failed to convert '${rawString}' with mode ${conversionMode}: ${conversionError.message}`);
    return rawString; // Return original string on error
  }
}

// Wrapper functions for easier access to the inputDataController.
function getNextInputLine() {
  return inputDataController.retrieveNextLine();
}

function hasRemainingInput() {
  return inputDataController.hasMoreContent();
}

// Specific utility functions for reading different data types.
function readSingleInteger() {
  return applyConversion(getNextInputLine(), 1);
}

function readMultipleIntegers() {
  return applyConversion(getNextInputLine(), 4);
}

// --- Core Problem Solving Logic Below This Point ---

/**
 * Helper to calculate the largest even number less than or equal to a given value.
 * Equivalent to Math.floor(value / 2) * 2.
 * @param {number} value - The input number.
 * @returns {number} The largest even number <= value.
 */
const getEvenComponent = (value) => {
  return Math.floor(value / 2) * 2;
};

/**
 * Helper to calculate an adjusted even component, specific to the problem's second scenario.
 * This function preserves the original behavior of Math.floor((val - 1) / 2) * 2.
 * @param {number} value - The input number.
 * @returns {number} The adjusted even component.
 */
const getAdjustedEvenComponent = (value) => {
  // This specific calculation handles edge cases like (0-1)/2 resulting in -2.
  return Math.floor((value - 1) / 2) * 2;
};

// A constant representing the fixed bonus added in the second scenario.
const SCENARIO_B_FIXED_BONUS = 6;

/**
 * The main function containing the solution logic for the problem.
 * It reads input, performs calculations, and outputs the final result.
 */
function executeSolutionLogic() {
  // Read the array of 7 integers.
  const initialCountsArray = readMultipleIntegers();

  // Validate the input array length using a guard clause.
  if (!initialCountsArray || initialCountsArray.length !== 7) {
    logDetailedDebug({
      message: 'Input validation failed: Expected 7 integer counts.',
      received: initialCountsArray ? initialCountsArray.length : 'null/undefined'
    });
    outputResult(0); // Output a default/error value and exit.
    return;
  }

  // Destructure the input array into descriptive variables for clarity.
  const [
    countBlockI, // Corresponds to original `ai`
    countBlockO, // Corresponds to original `ao`
    countBlockT, // Corresponds to original `at`
    countBlockJ, // Corresponds to original `aj`
    countBlockL, // Corresponds to original `al`
    countBlockS, // Corresponds to original `as`
    countBlockZ  // Corresponds to original `az`
  ] = initialCountsArray;

  // Calculate the sum for the first scenario.
  // This sums the even parts of countBlockI, countBlockJ, and countBlockL.
  const scenarioOneTotal =
    getEvenComponent(countBlockI) +
    getEvenComponent(countBlockJ) +
    getEvenComponent(countBlockL);

  // Calculate the sum for the second scenario.
  // This sums adjusted even parts of countBlockI, countBlockJ, and countBlockL,
  // then adds a fixed bonus.
  const scenarioTwoTotal =
    getAdjustedEvenComponent(countBlockI) +
    getAdjustedEvenComponent(countBlockJ) +
    getAdjustedEvenComponent(countBlockL) +
    SCENARIO_B_FIXED_BONUS;

  // Determine the maximum value between the two scenarios.
  let maximumPossibleScore;
  // Using an explicit if-else block instead of Math.max for structural variation.
  if (scenarioOneTotal > scenarioTwoTotal) {
    maximumPossibleScore = scenarioOneTotal;
  } else {
    maximumPossibleScore = scenarioTwoTotal;
  }

  // Add the count of 'O' blocks to the final maximum score.
  const finalComputedResult = maximumPossibleScore + countBlockO;

  // Display the final result.
  outputResult(finalComputedResult);
}
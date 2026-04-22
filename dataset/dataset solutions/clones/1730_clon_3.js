// This JavaScript module is designed to process sequential input lines and perform a specific numerical calculation.
// It features a custom input parsing system and diagnostic logging.

// --- Section 1: Core I/O Stream Management and Event Handling ---

// Initialize a readline interface to interact with standard input and output streams.
const ioStreamHandler = require('readline').createInterface({
  input: process.stdin,  // Direct input from the standard input stream.
  output: process.stdout // Output is not directly used by readline, but available for context.
});

// A dynamic array to store all received lines of input before processing.
let collectedInputLines = [];
// An instance of our custom input parser, initialized once all input is gathered.
let inputBufferManager;

// Event listener: Captures each line received from standard input.
ioStreamHandler.on('line', (incomingLine) => {
  collectedInputLines.push(incomingLine);
});

// Event listener: Triggered when the input stream closes, signaling all data has been received.
ioStreamHandler.on('close', () => {
  // Instantiate the input parser with the complete set of collected lines.
  inputBufferManager = createInputParser(collectedInputLines);

  // Add a newline to console error output for better readability of debug messages.
  console.error('\n');
  // Record the precise time before starting the main computation to measure performance.
  const startTime = Date.now();

  // Invoke the primary function that contains the application's core logic.
  executeComputation();

  // Calculate the total duration of the computation.
  const durationMs = Date.now() - startTime;
  logDiagnosticMessage(`Execution Duration: ${durationMs} milliseconds`);

  // Report memory usage, specifically the total heap allocated.
  const memoryConsumedKB = Math.round(process.memoryUsage().heapTotal / 1024);
  logDiagnosticMessage(`Memory Usage (Heap Total): ${memoryConsumedKB} KB`);
});

// --- Section 2: Custom Input Parsing System ---

/**
 * Implements a structured way to read and advance through a list of input strings.
 * Utilizes private class fields for internal state management.
 */
class InputParser {
  #dataList;      // Stores the array of raw input strings.
  #currentIndex;  // Tracks the current position for the next read operation.
  #totalItems;    // Holds the total count of input strings.

  /**
   * Constructs an InputParser instance, setting up its initial state.
   * @param {string[]} sourceData - An array of strings representing the lines of input.
   */
  constructor(sourceData) {
    this.#dataList = sourceData;
    this.#currentIndex = 0;
    this.#totalItems = sourceData.length;
  }

  /**
   * Determines if there are more unread input strings in the buffer.
   * @returns {boolean} True if further input is available, false otherwise.
   */
  streamHasData() {
    return this.#currentIndex < this.#totalItems;
  }

  /**
   * Retrieves the next input string from the buffer and advances the internal pointer.
   * Throws a descriptive error if attempting to read beyond the available input.
   * @returns {string} The next available input string.
   */
  getNextToken() {
    if (this.streamHasData()) {
      return this.#dataList[this.#currentIndex++];
    } else {
      // Custom error for clarity when input is exhausted.
      throw new Error('InputBufferEmptyException: No more input tokens are available for processing.');
    }
  }
}

/**
 * A factory function to create and return an initialized InputParser object.
 * This abstracts the direct instantiation of the InputParser class.
 * @param {string[]} sourceLines - The array of raw input lines to be parsed.
 * @returns {InputParser} An instance ready for input token retrieval.
 */
function createInputParser(sourceLines) {
  return new InputParser(sourceLines);
}

/**
 * A convenience function to fetch the next input token from the global input manager.
 * @returns {string} The raw string token from the input stream.
 */
function advanceInputCursor() {
  return inputBufferManager.getNextToken();
}

/**
 * A convenience function to check if the input stream has more data.
 * @returns {boolean} True if more data is available, false otherwise.
 */
function checkForMoreInput() {
  return inputBufferManager.streamHasData();
}

/**
 * Parses the next input token as an integer, including validation for numeric format.
 * @returns {number} The successfully parsed integer value.
 * @throws {Error} If the input token cannot be converted to a valid integer.
 */
function retrieveNextIntegerToken() {
  const rawInputString = advanceInputCursor();
  // Attempt to parse the string to an integer, specifying radix 10 for safety.
  const parsedNumericValue = parseInt(rawInputString, 10);

  // Guard clause: Check if the parsing resulted in a Not-a-Number value.
  if (isNaN(parsedNumericValue)) {
    logDiagnosticMessage(`InputParseError: The value '${rawInputString}' is not a valid integer.`);
    throw new Error(`InvalidNumberFormat: Cannot convert '${rawInputString}' to an integer.`);
  }
  return parsedNumericValue;
}

// --- Section 3: Output and Diagnostic Logging Utilities ---

/**
 * Prints the final calculated result to the standard output stream.
 * @param {*} dataToOutput - The data (typically a number or string) to be displayed.
 */
function outputResultToConsole(dataToOutput) {
  console.log(dataToOutput);
}

/**
 * Emits a diagnostic or debug message to the standard error stream.
 * This function provides a consistent format for logging internal application states or issues.
 * @param {*} logEntryContent - The content of the message to be logged.
 */
function logDiagnosticMessage(logEntryContent) {
  console.error(`DIAGNOSTIC_INFO: ${logEntryContent}`);
}

// --- Section 4: Primary Computational Logic ---

/**
 * This function orchestrates the main calculation for the application.
 * It computes the sum of `k * floor(upperLimitValue / k)` for `k` ranging from 1 to `upperLimitValue`.
 * This is a well-known mathematical identity for the sum: `sum_{i=1 to N} i * (sum_{j=1 to floor(N/i)} j)`.
 * The transformation from the original problem formulation involves changing the order of summation.
 */
function executeComputation() {
  // Obtain the upper bound for the calculation from the input stream.
  const upperLimitValue = retrieveNextIntegerToken();

  // --- Input Validation and Guard Clauses ---
  // Ensure the upper limit is a positive integer.
  if (upperLimitValue <= 0) {
    logDiagnosticMessage(`Validation Error: The provided upper limit (${upperLimitValue}) must be a positive integer.`);
    outputResultToConsole(0); // Output a default value for invalid input.
    return;
  }
  // Provide a warning for extremely large inputs that might cause performance issues.
  if (upperLimitValue > 1_000_000_000) { // Arbitrary large number for a warning threshold.
    logDiagnosticMessage(`Performance Alert: An exceptionally large upper limit (${upperLimitValue}) was supplied. Calculation may take considerable time.`);
  }

  // Initialize a variable to store the cumulative sum.
  let accumulatedTotal = 0;

  // Iterate through each integer from 1 up to the specified upper limit.
  for (let currentMultiplier = 1; currentMultiplier <= upperLimitValue; ++currentMultiplier) {
    // Calculate the floor of the division, representing how many times 'currentMultiplier' fits into 'upperLimitValue'.
    const divisionFloor = Math.floor(upperLimitValue / currentMultiplier);

    // Add the product of the current multiplier and its division floor to the running total.
    accumulatedTotal += currentMultiplier * divisionFloor;
  }

  // Display the final computed result to the user.
  outputResultToConsole(accumulatedTotal);
}
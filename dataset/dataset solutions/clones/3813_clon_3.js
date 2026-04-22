const inputSourceController = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let accumulatedInputLines = [];
let dataStreamProcessor;

// Event listener for each line of input received
inputSourceController.on('line', (inputLine) => {
  accumulatedInputLines.push(inputLine);
});

// Event listener for when all input has been received and the stream closes
inputSourceController.on('close', () => {
  // Initialize the data stream processor with all gathered input lines
  dataStreamProcessor = new InputHandler(accumulatedInputLines);

  // Start performance measurement for the main algorithm execution
  const performanceMetrics = {
    startTime: Date.now(),
    endTime: 0
  };

  // Execute the primary algorithm logic
  executeMainAlgorithm();

  // Calculate and log the execution time and memory usage
  performanceMetrics.endTime = Date.now();
  const totalExecutionTime = performanceMetrics.endTime - performanceMetrics.startTime;
  logDiagnostic(`Execution Time: ${totalExecutionTime} ms`);
  logDiagnostic(`Memory Usage: ${Math.round(process.memoryUsage().heapTotal / 1024)} KB`);
});

/**
 * A utility class to manage and parse input data.
 * Provides methods to check for available data and retrieve parsed tokens.
 */
class InputHandler {
  constructor(rawLines) {
    this.allInputLines = rawLines;
    this.currentLineIndex = 0;
    this.totalLineCount = rawLines.length;
  }

  /**
   * Checks if there are more lines of input available.
   * @returns {boolean} True if more input exists, false otherwise.
   */
  hasMoreData() {
    return this.currentLineIndex < this.totalLineCount;
  }

  /**
   * Fetches the next line of input.
   * Throws an error if no more input is available.
   * @returns {string} The next raw input line.
   */
  fetchNextLine() {
    if (!this.hasMoreData()) {
      throw new Error('InputOutOfBounds: No more lines to read.');
    }
    return this.allInputLines[this.currentLineIndex++];
  }

  /**
   * Fetches the next line and attempts to parse it as an integer.
   * Includes basic validation for integer parsing.
   * @returns {number} The parsed integer.
   */
  fetchNextInteger() {
    const rawValue = this.fetchNextLine();
    const parsedValue = parseInt(rawValue, 10); // Always use radix 10 for safety

    // Add a guard clause for invalid number parsing
    if (isNaN(parsedValue)) {
      logDiagnostic(`Warning: Could not parse "${rawValue}" as an integer. Returning 0.`);
      return 0; // Or throw an error, depending on desired behavior
    }
    return parsedValue;
  }
}

/**
 * Outputs a result to the standard output.
 * @param {any} content The content to be printed.
 */
function displayCalculationResult(content) {
  console.log(content);
}

/**
 * Logs diagnostic messages to the standard error stream.
 * Useful for debugging and performance monitoring.
 * @param {any} message The message to log.
 */
function logDiagnostic(message) {
  console.error(`DIAGNOSTIC: ${require('util').inspect(message, false, null)}`);
}

/**
 * The core algorithm that processes a sequence of numbers to find
 * the minimum number of elements to remove to form a contiguous increasing subsequence starting from 1.
 * This is equivalent to finding the length of the longest such subsequence and subtracting it from total elements.
 */
function executeMainAlgorithm() {
  // Read the total number of elements in the sequence
  const totalElementsCount = dataStreamProcessor.fetchNextInteger();

  // Input validation: Ensure the count is a positive integer.
  if (totalElementsCount <= 0 || !Number.isInteger(totalElementsCount)) {
    logDiagnostic(`Invalid sequence length provided: ${totalElementsCount}. Exiting.`);
    displayCalculationResult(0); // If N is invalid, no elements to remove, or 0.
    return;
  }

  // Initialize a tracking array. `sequenceLengths[k]` will store the length of the longest
  // subsequence ending with the value `k`, where the sequence follows `1, 2, ..., k`.
  // Array size is `totalElementsCount + 1` to accommodate values up to `totalElementsCount`
  // and use 0-indexing effectively (index 0 is a base case, index 1 corresponds to value 1, etc.).
  const sequenceLengths = new Array(totalElementsCount + 1).fill(0);

  let currentLongestSequenceFound = 0; // Tracks the maximum length found across all possible ending values.

  // Iterate through each element of the input sequence.
  for (let elementIndex = 0; elementIndex < totalElementsCount; elementIndex++) {
    // Read the current element's value.
    const currentElementValue = dataStreamProcessor.fetchNextInteger();

    // Input validation for current element's value:
    // Ensure the element is positive and within the expected range (1 to totalElementsCount).
    // Elements outside this range cannot contribute to the target subsequence type.
    if (currentElementValue <= 0 || currentElementValue > totalElementsCount) {
      logDiagnostic(`Skipping invalid element value: ${currentElementValue} at index ${elementIndex}.`);
      continue; // Skip this element as it's out of bounds for the problem
    }

    // Determine the length of the sequence ending at `currentElementValue - 1`.
    // If `currentElementValue` is 1, `previousElementLength` will be `sequenceLengths[0]`, which is 0.
    const previousElementLength = sequenceLengths[currentElementValue - 1];

    // The length of the sequence ending with `currentElementValue` is one more than
    // the length of the sequence ending with `currentElementValue - 1`.
    const newSequenceLengthForCurrentElement = previousElementLength + 1;

    // Update the tracker array for the current element's value.
    // If multiple `currentElementValue`s appear, this will update to the latest length
    // based on the longest sequence ending at `currentElementValue - 1` encountered so far.
    sequenceLengths[currentElementValue] = newSequenceLengthForCurrentElement;

    // Update the overall maximum length found across all elements.
    currentLongestSequenceFound = Math.max(currentLongestSequenceFound, newSequenceLengthForCurrentElement);
  }

  // The problem asks for the minimum number of elements to remove.
  // This is equal to the total number of elements minus the length of the longest
  // contiguous increasing subsequence found (which starts implicitly from 1).
  const minimumRemovalsRequired = totalElementsCount - currentLongestSequenceFound;

  // Display the final calculated result.
  displayCalculationResult(minimumRemovalsRequired);
}
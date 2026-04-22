// A facility to manage console I/O operations
const inputBuffer = [];
let dataProcessor = null;
let inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', (currentLine) => {
  inputBuffer.push(currentLine);
});

inputReader.on('close', () => {
  // Initialize input data handler
  dataProcessor = initializeDataHandler(inputBuffer);
  console.error("--- Application Logic Initiated ---");
  const startTime = new Date(); // Record start time for performance tracking

  executeMainLogic(); // Invoke the primary application function

  const endTime = new Date() - startTime; // Calculate elapsed time
  logDebugInfo(`Execution duration: ${endTime}ms`);
  logDebugInfo(`Current memory usage: ${Math.round(process.memoryUsage().heapTotal / 1024)}KB`);
  console.error("--- Application Logic Concluded ---");
});

// Helper function to obtain the next input item as an integer
const obtainIntegerInput = () => parseInput(getNextDataItem(), 'integer');
// Helper function to retrieve the next input item as an array of strings
const retrieveStringArray = () => parseInput(getNextDataItem(), 'stringArray');
// Helper function to retrieve the next input item as an array of integers
const retrieveIntegerSequence = () => parseInput(getNextDataItem(), 'integerArray');
// Helper function to retrieve the next input item as an array of characters
const retrieveCharacterSequence = () => parseInput(getNextDataItem(), 'charArray');

// Fetches the next raw data item from the processed input stream
const getNextDataItem = () => dataProcessor.fetchNext();
// Checks if there are more data items available in the input stream
const hasMoreData = () => dataProcessor.hasMore();

/**
 * Sets up an object to manage sequential access to input lines.
 * @param {string[]} sourceLines - An array of input strings.
 * @returns {object} An object with methods to navigate the input.
 */
function initializeDataHandler(sourceLines) {
  // Validate the input source
  if (!Array.isArray(sourceLines) || sourceLines.length === 0) {
    logDebugInfo("Warning: Input source lines are empty or invalid. Operations may fail.");
    // Return a dummy handler to prevent immediate crashes, or throw an error.
    return { hasMore: () => false, fetchNext: () => null };
  }
  return {
    source: sourceLines,
    currentIdx: 0,
    totalItems: sourceLines.length,
    hasMore: function() {
      return (this.currentIdx < this.totalItems);
    },
    fetchNext: function() {
      if (!this.hasMore()) {
        logDebugInfo("Attempted to read beyond the available input data. Returning null.");
        return null;
      }
      const itemToReturn = this.source[this.currentIdx];
      this.currentIdx++;
      return itemToReturn;
    }
  };
}

/**
 * Outputs provided data to the standard console output.
 * @param {*} data - The data to be printed.
 */
const emitResult = (data) => console.log(data);

/**
 * Logs debug information to the standard error stream.
 * @param {*} message - The debug message or object to log.
 */
const logDebugInfo = (message) => console.error(`[DEBUG_INFO]: ${require("util").inspect(message, false, null)}`);

/**
 * A versatile utility for parsing and formatting input values based on a specified operation type.
 * @param {*} inputValue - The input value to be processed.
 * @param {string} operationType - Defines the type of parsing or formatting to apply.
 * @returns {*} The processed value or the original input if an error occurs.
 */
function parseInput(inputValue, operationType) {
  // Handle cases where input data might be missing or invalid
  if (inputValue === null || typeof inputValue === 'undefined') {
    logDebugInfo("Received null or undefined input for parsing. Returning null.");
    return null;
  }

  try {
    switch (operationType) {
      case 'integer':
        const parsedInt = parseInt(String(inputValue), 10); // Ensure string conversion, explicit radix
        if (isNaN(parsedInt)) {
          logDebugInfo(`Warning: Failed to parse "${inputValue}" as an integer. Original value returned.`);
          return inputValue;
        }
        return parsedInt;
      case 'stringArray':
        return String(inputValue).split(" ");
      case 'integerArray':
        // Converts a space-separated string of numbers into an array of integers,
        // filtering out any non-numeric segments.
        const numericArray = String(inputValue).split(" ").map(val => {
          const num = Number(val);
          return isNaN(num) ? null : num;
        }).filter(val => val !== null);
        if (numericArray.length === 0 && String(inputValue).trim() !== "") {
          logDebugInfo(`Warning: Input "${inputValue}" contained no valid integers. Returning empty array.`);
        }
        return numericArray;
      case 'charArray':
        return String(inputValue).split("");
      case 'joinSpace':
        if (!Array.isArray(inputValue)) return inputValue;
        return inputValue.join(" ");
      case 'newline':
        if (!Array.isArray(inputValue)) return inputValue;
        return inputValue.join("\n");
      case 'concat':
        if (!Array.isArray(inputValue)) return inputValue;
        return inputValue.join("");
      default:
        logDebugInfo(`Unknown conversion type specified: "${operationType}". Returning original input.`);
        return inputValue;
    }
  } catch (err) {
    logDebugInfo(`An error occurred during parsing/conversion for type "${operationType}": ${err.message}. Original input returned.`);
    return inputValue;
  }
}

// A specific wrapper for formatting an array for output, using the general parseInput utility.
const formatArrayForOutput = (arr, formatType) => parseInput(arr, formatType);

/**
 * The main logic function of the application.
 * Reads input, processes an array based on its median-like elements, and outputs results.
 */
function executeMainLogic() {
  // Ensure the data processor is ready and there's data to process
  if (!dataProcessor || !dataProcessor.hasMore()) {
    logDebugInfo("No input data available for the main processing logic. Exiting.");
    return;
  }

  const datasetSize = obtainIntegerInput();
  // Input validation for the size of the dataset
  if (typeof datasetSize !== 'number' || isNaN(datasetSize) || datasetSize <= 0) {
    logDebugInfo(`Error: Invalid or non-positive dataset size provided: ${datasetSize}. Aborting.`);
    return;
  }

  const originalElements = retrieveIntegerSequence();
  // Validate that the number of elements read matches the declared dataset size
  if (originalElements.length !== datasetSize) {
    logDebugInfo(`Warning: Declared dataset size (${datasetSize}) does not match actual elements read (${originalElements.length}). Adjusting size for processing.`);
    // We can choose to adjust datasetSize or throw an error. For robustness, we proceed with actual length.
    // datasetSize = originalElements.length; // This line could be uncommented to adjust
  }

  // Create a sorted copy of the input elements. Using spread syntax for a shallow copy.
  // Since elements are primitives (numbers), a shallow copy is sufficient for independent sorting.
  const sortedElements = [...originalElements];
  sortedElements.sort((valA, valB) => valA - valB); // Sort numerically in ascending order

  logDebugInfo(`Original input elements: ${JSON.stringify(originalElements)}`);
  logDebugInfo(`Sorted elements for median calculation: ${JSON.stringify(sortedElements)}`);

  const processedResults = new Array(datasetSize); // Initialize result array
  // Optional: pre-fill the array for density or default values, though not strictly needed for numbers.
  // processedResults.fill(0);

  // Determine the indices for the 'median' candidates.
  // For N elements, N/2 gives the index for the upper-half median (or actual median if N is odd).
  // N/2 - 1 gives the index for the lower-half median.
  const upperMidpointIndex = Math.floor(datasetSize / 2);
  const lowerMidpointIndex = Math.floor(datasetSize / 2) - 1;

  let primaryMedianCandidate; // Represents the larger of the two middle elements
  let secondaryMedianCandidate; // Represents the smaller of the two middle elements

  // Handle edge cases for small dataset sizes gracefully
  if (datasetSize === 1) {
    primaryMedianCandidate = sortedElements[0];
    secondaryMedianCandidate = sortedElements[0]; // For a single element, both are the same
  } else if (datasetSize > 1) {
    primaryMedianCandidate = sortedElements[upperMidpointIndex];
    secondaryMedianCandidate = sortedElements[lowerMidpointIndex];
  } else {
    logDebugInfo("Error: Dataset size is zero or invalid, cannot determine median candidates. Exiting.");
    return;
  }

  logDebugInfo(`Identified median candidates: { Primary: ${primaryMedianCandidate}, Secondary: ${secondaryMedianCandidate} }`);

  // Iterate through the original sequence to populate the results array
  for (let currentPosition = 0; currentPosition < datasetSize; currentPosition++) {
    const currentValue = originalElements[currentPosition];

    // The core logic: if the current value is less than or equal to the 'smaller' median candidate,
    // assign the 'larger' median candidate to the result. Otherwise, assign the 'smaller' one.
    // This efficiently covers all cases, including when both median candidates are identical.
    processedResults[currentPosition] = (currentValue <= secondaryMedianCandidate)
      ? primaryMedianCandidate
      : secondaryMedianCandidate;
  }

  // Output the final computed results, formatted with newline separators
  emitResult(formatArrayForOutput(processedResults, 'newline'));
}
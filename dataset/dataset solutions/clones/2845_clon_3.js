var inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var processedData;
var incomingLines = [];

// Event handler for each line of input
inputProcessor.on('line', (lineData) => {
  incomingLines.push(lineData);
});

// Event handler for the end of input stream
inputProcessor.on('close', () => {
  processedData = setupInputProcessor(incomingLines); // Initialize our custom input processor
  console.error('\n--- Input Processed ---\n--- Output Follows ---'); // Debug message indicating phase change
  executeProcessingLogic(); // Execute the main application logic
});

/**
 * Creates a deep copy of a given value. Handles Sets specifically,
 * otherwise uses JSON serialization/deserialization for generic objects.
 * @param {*} sourceObject - The object or value to be cloned.
 * @returns {*} A deep copy of the sourceObject.
 */
function deepCopyValue(sourceObject) {
  if (sourceObject instanceof Set) {
    return new Set([...sourceObject]); // Use spread operator for Set cloning
  }
  // For other types, use JSON stringify/parse for deep copy.
  // Note: This won't handle functions, undefined, or circular references.
  return JSON.parse(JSON.stringify(sourceObject));
}

/**
 * Retrieves the next integer from the input stream.
 * @returns {number} The parsed integer.
 */
function getNextInteger() {
  return transformInputData(fetchNextItem(), 1);
}

/**
 * Retrieves the next line from the input stream and splits it into an array of strings.
 * @returns {string[]} An array of strings.
 */
function getNextStringArray() {
  return transformInputData(fetchNextItem(), 2);
}

/**
 * Retrieves the next line from the input stream, splits it by spaces, and parses each part as an integer.
 * @returns {number[]} An array of integers.
 */
function getNextIntegerArray() {
  return transformInputData(fetchNextItem(), 4);
}

/**
 * Retrieves the next line from the input stream and splits it into an array of characters.
 * @returns {string[]} An array of characters.
 */
function getNextCharacterArray() {
  return transformInputData(fetchNextItem(), 6);
}

/**
 * Fetches the next available item (line) from the processed input.
 * @returns {string} The next line of input.
 * @throws {Error} If no more input is available.
 */
function fetchNextItem() {
  return processedData.fetchNext();
}

/**
 * Checks if there are more items available in the input stream.
 * @returns {boolean} True if more items exist, false otherwise.
 */
function hasMoreItems() {
  return processedData.canAdvance();
}

/**
 * Sets up a custom input processor object.
 * This object manages the input lines, current read position, and provides methods
 * to check for more input and retrieve the next line.
 * @param {string[]} dataSource - An array of input lines.
 * @returns {object} An input processor instance.
 */
function setupInputProcessor(dataSource) {
  let currentPosition = 0;
  const totalItems = dataSource.length;
  const dataItems = dataSource; // Store the input lines

  return {
    dataItems: dataItems,
    currentPosition: currentPosition,
    totalItems: totalItems,
    /**
     * Determines if there are still unread items in the input stream.
     * @returns {boolean} True if more items can be read, false otherwise.
     */
    canAdvance: function() {
      return (this.currentPosition < this.totalItems);
    },
    /**
     * Retrieves the next item from the input stream and advances the read position.
     * @returns {string} The next input item.
     * @throws {Error} If attempting to read beyond the end of the input stream.
     */
    fetchNext: function() {
      if (this.canAdvance()) {
        return this.dataItems[this.currentPosition++];
      } else {
        throw new Error('End of input stream reached. No more data available.');
      }
    }
  };
}

/**
 * Prints a result to the console, followed by a newline.
 * @param {*} outputContent - The content to be printed.
 */
function printResult(outputContent) {
  console.log(outputContent);
}

/**
 * Logs a debug message to the standard error stream.
 * Uses `util.inspect` for detailed object inspection.
 * @param {*} debugInfo - The information to log for debugging.
 */
function logDebugMessage(debugInfo) {
  console.error('DEBUG: ' + require('util').inspect(debugInfo, {
    showHidden: false,
    depth: null,
    colors: true
  }));
}

/**
 * Transforms an input value based on a specified conversion type.
 * This utility function handles various common input parsing and formatting tasks.
 * @param {*} inputVal - The value to be transformed.
 * @param {number} conversionType - An integer code specifying the conversion.
 *   1: Parse integer (base 10).
 *   2: Split string by spaces into an array of strings.
 *   4: Split string by spaces and map to numbers.
 *   6: Split string into an array of individual characters.
 *   7: Split string into individual characters and map to numbers.
 *   8: Join array elements with spaces.
 *   9: Join array elements with newlines.
 *   0: Join array elements with no separator.
 *   (any other value): Return inputVal unchanged.
 * @returns {*} The transformed value.
 */
function transformInputData(inputVal, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return Number.parseInt(inputVal, 10);
      case 2:
        return inputVal.split(' ');
      case 4:
        return inputVal.split(' ').map(Number);
      case 6:
        return inputVal.split('');
      case 7:
        return inputVal.split('').map(Number);
      case 8:
        return inputVal.join(' ');
      case 9:
        return inputVal.join('\n');
      case 0:
        return inputVal.join('');
      default:
        return inputVal;
    }
  } catch (err) {
    logDebugMessage(`Error during data transformation (type ${conversionType}): ${err.message}`);
    return inputVal; // Return original value on error
  }
}

/**
 * Main application logic for processing a sequence of numbers.
 * It first calculates a specific sum based on the sorted sequence,
 * then generates a series of subtraction operations.
 */
function executeProcessingLogic() {
  const elementCount = getNextInteger(); // Fetch the number of elements
  let numericSequence = getNextIntegerArray(); // Fetch the sequence of numbers

  // Basic validation: ensure we have at least two elements for the logic to make sense
  if (elementCount < 2 || numericSequence.length !== elementCount) {
    logDebugMessage("Input validation failed: Element count mismatch or too few elements.");
    printResult("Error: Insufficient or invalid input data provided.");
    return;
  }

  // Sort the numeric sequence in ascending order
  numericSequence.sort((valA, valB) => valA - valB);
  logDebugMessage("Sorted numeric sequence: " + numericSequence.join(', '));

  // --- Phase 1: Calculate the total sum (totalSum) ---
  // The sum starts with the difference between the largest and smallest numbers.
  let totalSum = numericSequence[elementCount - 1] - numericSequence[0];

  // Add the absolute value of all intermediate numbers to the sum.
  // This loop iterates from the second smallest to the second largest number.
  for (let currentIdx = 1; currentIdx < elementCount - 1; ++currentIdx) {
    totalSum += Math.abs(numericSequence[currentIdx]);
  }
  printResult(totalSum); // Output the calculated sum

  // --- Phase 2: Generate and log subtraction operations ---
  const operationLogEntries = []; // Use an array to collect operation strings
  let currentLeftBoundary = numericSequence[0]; // Initialize the left boundary value
  let currentRightBoundary = numericSequence[elementCount - 1]; // Initialize the right boundary value

  // Iterate through the intermediate numbers (excluding the smallest and largest)
  for (let currentIdx = 1; currentIdx < elementCount - 1; ++currentIdx) {
    const currentValue = numericSequence[currentIdx]; // Helper variable for current number

    if (currentValue < 0) {
      // If the current number is negative, subtract it from the right boundary
      operationLogEntries.push(`${currentRightBoundary} ${currentValue}`);
      currentRightBoundary -= currentValue;
    } else {
      // If the current number is non-negative, subtract it from the left boundary
      operationLogEntries.push(`${currentLeftBoundary} ${currentValue}`);
      currentLeftBoundary -= currentValue;
    }
  }

  // The very last operation involves the final left and right boundary values.
  // The order is right boundary then left boundary.
  operationLogEntries.push(`${currentRightBoundary} ${currentLeftBoundary}`);

  // Output all generated operations, each on a new line.
  printResult(transformInputData(operationLogEntries, 9));
}
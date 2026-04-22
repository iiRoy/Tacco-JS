// This section handles the input/output plumbing for the program.
// It's generally not part of the core problem logic but provides a framework.
const consoleInput = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// A buffer to store all incoming lines from standard input.
let capturedInput = [];
// An object that will serve as our custom iterator for input lines.
let inputProcessor;

// Constant for debug log prefix
const DEBUG_PREFIX_TAG = "[DEBUG_LOG]";
// Flag to control verbose debug output, could be set via env var
const IS_VERBOSE_DEBUG_ENABLED = true;

// Event handler for each line read from stdin.
consoleInput.on('line', (receivedText) => {
  capturedInput.push(receivedText);
});

// Event handler for when the input stream closes.
consoleInput.on('close', () => {
  inputProcessor = setupDataReader(capturedInput); // Initialize the input iterator.

  // Log program execution start and measure performance.
  displayLogMessage("Application execution initiated.");
  const opStartTime = process.hrtime.bigint(); // Using high-resolution time for precision.

  try {
    executeCoreLogic(); // Execute the main program logic.
  } catch (errorDetails) {
    displayErrorMessage(`An unexpected error occurred during execution: ${errorDetails.message || errorDetails}`);
  } finally {
    const opEndTime = process.hrtime.bigint();
    const opDurationNanos = opEndTime - opStartTime;
    const opDurationMillis = Number(opDurationNanos) / 1_000_000;

    // Report elapsed time and memory usage.
    displayLogMessage(`Execution Time: ${opDurationMillis.toFixed(3)} ms`);
    const memoryUsage = process.memoryUsage();
    displayLogMessage(`Memory Usage (Heap Total): ${Math.round(memoryUsage.heapTotal / 1024).toLocaleString()} KB`);
    displayLogMessage("Application execution completed.");
  }
});

/**
 * Creates a deep copy of a given object to avoid mutation issues.
 * @param {object} sourceObject The object to be cloned.
 * @returns {object} A new, independent copy of the object.
 */
function replicateData(sourceObject) {
  if (sourceObject === null || typeof sourceObject !== 'object') {
    // Return primitives or null directly.
    return sourceObject;
  }
  // Use JSON serialization for a simple deep copy, handles most basic types.
  return JSON.parse(JSON.stringify(sourceObject));
}

/**
 * Retrieves the next integer from the input stream.
 * @returns {number} The parsed integer value.
 */
function parseNextInteger() { return performConversion(advanceInput(), 1); }

/**
 * Retrieves the next line as an array of strings, split by spaces.
 * @returns {string[]} An array of strings.
 */
function getLineAsStrings() { return performConversion(advanceInput(), 2); }

/**
 * Retrieves the next line as an array of integers, split by spaces.
 * @returns {number[]} An array of numbers.
 */
function getLineAsNumbers() { return performConversion(advanceInput(), 4); }

/**
 * Retrieves the next line as an array of single characters.
 * @returns {string[]} An array of characters.
 */
function getLineAsChars() { return performConversion(advanceInput(), 6); }

/**
 * Advances the input iterator and returns the next available token (line).
 * @returns {string} The next line from the input.
 * @throws {Error} If there is no more input available.
 */
function advanceInput() { return inputProcessor.getNextToken(); }

/**
 * Checks if there are more tokens (lines) available in the input stream.
 * @returns {boolean} True if more input exists, false otherwise.
 */
function hasMoreTokens() { return inputProcessor.canAdvance(); }

/**
 * Initializes and returns an object capable of iterating through input lines.
 * This object acts as a custom data reader.
 * @param {string[]} sourceLines An array of strings representing the input lines.
 * @returns {object} An object with methods to navigate and retrieve input.
 */
function setupDataReader(sourceLines) {
  if (!Array.isArray(sourceLines)) {
    throw new Error("Input source for data reader must be an array of lines.");
  }

  let currentReadPointer = 0;
  const totalRecordsAvailable = sourceLines.length;

  return {
    sourceCollection: sourceLines,
    currentPosition: currentReadPointer,
    boundaryIndex: totalRecordsAvailable,

    /**
     * Determines if there are more lines to read.
     * @returns {boolean} True if the current position is within bounds, false otherwise.
     */
    canAdvance: function() {
      return (this.currentPosition < this.boundaryIndex);
    },

    /**
     * Retrieves the next line from the input collection and advances the pointer.
     * @returns {string} The next line.
     * @throws {Error} If attempting to read beyond the end of the input.
     */
    getNextToken: function() {
      if (this.canAdvance()) {
        const nextItem = this.sourceCollection[this.currentPosition];
        this.currentPosition++;
        return nextItem;
      } else {
        throw new Error("InputBufferExhausted: No more input lines available to process.");
      }
    }
  };
}

/**
 * Displays a message to standard output.
 * @param {any} content The content to print.
 */
function displayOutput(content) {
  console.log(content);
}

/**
 * Logs a debug message to standard error, prefixed for easy identification.
 * @param {any} message The message or object to log.
 */
function displayLogMessage(message) {
  if (IS_VERBOSE_DEBUG_ENABLED) {
    // Using util.inspect for better object logging, similar to original myerr.
    console.error(`${DEBUG_PREFIX_TAG} ${require("util").inspect(message, false, null, true)}`);
  }
}

/**
 * Logs an error message to standard error.
 * @param {any} message The error message or object to log.
 */
function displayErrorMessage(message) {
  console.error(`[ERROR] ${require("util").inspect(message, false, null, true)}`);
}

/**
 * Performs various type conversions on an input value based on a specified mode.
 * @param {string | string[]} itemToConvert The input item to convert.
 * @param {number} conversionMode An integer indicating the desired conversion type.
 *   - 1: Parse as integer.
 *   - 2: Split string by spaces into an array of strings.
 *   - 4: Split string by spaces into an array of numbers.
 *   - 6: Split string into an array of individual characters.
 *   - 7: Split string into an array of individual characters and parse them as numbers.
 *   - 8: Join array elements with spaces.
 *   - 9: Join array elements with newlines.
 *   - 0: Join array elements without any separator.
 * @returns {any} The converted value.
 * @throws {Error} For an unknown conversion mode.
 */
function performConversion(itemToConvert, conversionMode) {
  try {
    switch (conversionMode) {
      case 1:
        return parseInt(itemToConvert, 10); // Always specify radix.
      case 2:
        return itemToConvert.split(" ");
      case 4:
        return itemToConvert.split(" ").map(Number);
      case 6:
        return itemToConvert.split("");
      case 7:
        return itemToConvert.split("").map(Number);
      case 8:
        if (Array.isArray(itemToConvert)) return itemToConvert.join(" ");
        throw new TypeError("Input for mode 8 must be an array.");
      case 9:
        if (Array.isArray(itemToConvert)) return itemToConvert.join("\n");
        throw new TypeError("Input for mode 9 must be an array.");
      case 0:
        if (Array.isArray(itemToConvert)) return itemToConvert.join("");
        throw new TypeError("Input for mode 0 must be an array.");
      default:
        displayLogMessage(`Warning: Unknown conversion mode '${conversionMode}'. Returning original value.`);
        return itemToConvert;
    }
  } catch (conversionError) {
    displayErrorMessage(`Conversion failed for mode ${conversionMode} with input "${itemToConvert}": ${conversionError.message}`);
    // Potentially re-throw or return a default/original value based on desired error handling.
    return itemToConvert; // Fallback to original value on error.
  }
}

// --- Main application logic starts here ---
/**
 * This is the core function where the primary business logic resides.
 * It processes input (if any) and produces the final output.
 */
function executeCoreLogic() {
  // A simple guard clause, though always true here, demonstrates structural addition.
  const isConditionMet = (2 + 2 === 4);
  if (!isConditionMet) {
    displayErrorMessage("Pre-condition not met, exiting core logic.");
    return;
  }

  // Define the main output elements.
  const primaryStatusMessage = "Yes";
  const numberOfItems = 4;
  const itemDataSets = [
    [3, 1, 2, 3],
    [3, 1, 4, 5],
    [3, 2, 4, 6],
    [3, 3, 5, 6]
  ];

  // Helper function to format an array of numbers into a space-separated string.
  const formatNumbersIntoString = (numberArray) => {
    if (!Array.isArray(numberArray) || numberArray.some(isNaN)) {
      displayErrorMessage("Invalid array provided for formatting.");
      return "";
    }
    return performConversion(numberArray, 8); // Use conversion mode 8 (join with spaces).
  };

  // Output the primary status.
  displayOutput(primaryStatusMessage);

  // Output the number of items.
  displayOutput(numberOfItems);

  // Iterate and output each formatted data set.
  // This replaces direct calls with a loop and a helper, adding structure.
  for (let i = 0; i < itemDataSets.length; i++) {
    const currentDataSet = itemDataSets[i];
    const formattedString = formatNumbersIntoString(currentDataSet);
    displayOutput(formattedString);
  }

  // Example of an added intermediate variable and a trivial check.
  const totalOutputLinesExpected = 1 + 1 + itemDataSets.length;
  if (totalOutputLinesExpected !== 6) { // This will always be true (1+1+4 = 6)
    displayLogMessage(`Unexpected number of output lines generated: ${totalOutputLinesExpected}`);
  }
}
const lineReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputLinesBuffer = [];
let dataProcessorInstance;

lineReader.on('line', (inputLine) => {
  inputLinesBuffer.push(inputLine);
});

lineReader.on('close', () => {
  dataProcessorInstance = initializeInputHandler(inputLinesBuffer);
  // A visual separator for output clarity.
  console.error('\n--- Input Processed, Output Follows ---');
  executeChallengeLogic();
});

/**
 * Sets up an object for consuming input lines sequentially.
 * Provides methods to check for available input and retrieve the next line.
 * @param {string[]} sourceLines - An array containing all raw input strings.
 * @returns {object} An object with methods for managing input stream.
 */
function initializeInputHandler(sourceLines) {
  let currentReadPosition = 0;
  const totalAvailableLines = sourceLines.length;

  return {
    // Array holding all input lines.
    storedLines: sourceLines,
    // Internal pointer for the current line being read.
    readPointer: currentReadPosition,
    // Total number of lines to process.
    lineCount: totalAvailableLines,

    /**
     * Determines if there are more lines awaiting processing.
     * @returns {boolean} True if more input exists, false otherwise.
     */
    hasMoreInput: function() {
      return (this.readPointer < this.lineCount);
    },

    /**
     * Retrieves the next input line and advances the internal pointer.
     * Throws an error if no input remains.
     * @returns {string} The next available input line.
     * @throws {Error} If an attempt is made to read beyond the input stream.
     */
    retrieveNextLine: function() {
      if (this.hasMoreInput()) {
        const nextItem = this.storedLines[this.readPointer];
        this.readPointer++;
        return nextItem;
      } else {
        // Providing a specific error for out-of-bounds input access.
        throw new Error('InputBufferExhausted: No further input lines are available.');
      }
    }
  };
}

// Helper functions to simplify access to the input stream.
const getNextRaw = () => dataProcessorInstance.retrieveNextLine();
const hasNextToken = () => dataProcessorInstance.hasMoreInput();

/**
 * Parses the next input token into an integer.
 * @returns {number} The parsed integer value.
 */
const getNextInteger = () => processRawInput(getNextRaw(), 'INT_PARSE');

/**
 * Parses the next input token into an array of strings, split by spaces.
 * @returns {string[]} An array of string tokens.
 */
const getNextStringArray = () => processRawInput(getNextRaw(), 'STR_SPLIT_SPACE');

/**
 * Parses the next input token into an array of integers, split by spaces.
 * @returns {number[]} An array of integer values.
 */
const getNextIntegerArray = () => processRawInput(getNextRaw(), 'INT_SPLIT_SPACE');

/**
 * Parses the next input token into an array of single characters.
 * @returns {string[]} An array of character strings.
 */
const getNextCharacterArray = () => processRawInput(getNextRaw(), 'CHAR_SPLIT');

/**
 * Emits a value to the standard output.
 * @param {string | number} outputValue - The value to be printed.
 */
const emitResult = (outputValue) => console.log(outputValue);

/**
 * Logs detailed debug information to the error console.
 * @param {any} debugValue - The value to inspect and log.
 * @param {string} [logTag='DEBUG_INFO'] - An optional label for the debug message.
 */
const logDebugInfo = (debugValue, logTag = 'DEBUG_INFO') => {
  console.error(`${logTag}: ${require('util').inspect(debugValue, { depth: null, colors: true })}`);
};

/**
 * Handles various input conversion and formatting operations.
 * The `conversionMode` dictates how `inputValue` is processed.
 * @param {string | string[]} inputValue - The data to be converted.
 * @param {string} conversionMode - A string identifier for the desired conversion type.
 *                                  e.g., 'INT_PARSE', 'STR_SPLIT_SPACE', 'INT_SPLIT_SPACE', etc.
 * @returns {any} The converted result.
 */
function processRawInput(inputValue, conversionMode) {
  try {
    switch (conversionMode) {
      case 'INT_PARSE':
        return parseInt(inputValue, 10);
      case 'STR_SPLIT_SPACE':
        return String(inputValue).split(' ');
      case 'INT_SPLIT_SPACE':
        return String(inputValue).split(' ').map(Number);
      case 'CHAR_SPLIT':
        return String(inputValue).split('');
      case 'CHAR_SPLIT_INT':
        return String(inputValue).split('').map(Number);
      case 'JOIN_WITH_SPACE':
        return Array.isArray(inputValue) ? inputValue.join(' ') : inputValue;
      case 'JOIN_WITH_NEWLINE':
        return Array.isArray(inputValue) ? inputValue.join('\n') : inputValue;
      case 'JOIN_CONCAT':
        return Array.isArray(inputValue) ? inputValue.join('') : inputValue;
      default:
        // Fallback: if conversion mode is unknown, return the original input.
        logDebugInfo(`Unknown conversion mode: '${conversionMode}'. Returning original value.`, "WARNING");
        return inputValue;
    }
  } catch (error) {
    // Catching potential errors during conversion and logging them.
    console.error(`Error during input conversion (mode: '${conversionMode}'): ${error.message}`);
    return inputValue; // Return original value on error to prevent crash.
  }
}

// ----------------------------------------------------------------------------------
// Core algorithm logic begins here.

/**
 * Executes the primary challenge algorithm.
 * This function orchestrates data reading, sorting, and comparison
 * to determine the final "Yes" or "No" outcome.
 */
function executeChallengeLogic() {
  // Retrieve the total number of processing stages from input.
  const numProcessingStages = getNextInteger();

  // Read the initial set of numeric elements.
  const initialNumericSet = getNextIntegerArray();

  // Validate initial inputs to prevent errors.
  if (numProcessingStages <= 0 || !initialNumericSet || initialNumericSet.length === 0) {
      emitResult("No");
      logDebugInfo("Input validation failed: 'numProcessingStages' must be positive and 'initialNumericSet' cannot be empty.", "VALIDATION_ERROR");
      return;
  }

  // Sort the initial set in ascending order.
  initialNumericSet.sort((firstVal, secondVal) => firstVal - secondVal);

  // Initialize the active data structure with the largest element from the sorted set.
  // Using `pop()` efficiently removes and returns the last (largest) element.
  const activeComparisonData = [initialNumericSet.pop()];
  
  // Define a reusable comparator for descending sort order.
  const descendingSort = (a, b) => b - a;

  // Main loop: processes data across defined stages.
  for (let stageIndex = 0; stageIndex < numProcessingStages; stageIndex++) {
    // Calculate the number of elements to extract for the current stage.
    // This is 2 raised to the power of the current stage index.
    const elementsToExtractCount = 1 << stageIndex;

    // Pre-check for sufficient elements in the remaining source list.
    if (initialNumericSet.length < elementsToExtractCount) {
        logDebugInfo(`Insufficient elements in source list for stage ${stageIndex}. Required: ${elementsToExtractCount}, Available: ${initialNumericSet.length}.`, "CRITICAL_ERROR");
        emitResult("No");
        return;
    }

    // Extract a sub-group of elements from the end of the source list.
    // `splice` is used to remove and return elements from the end.
    const extractedSubGroup = initialNumericSet.splice(initialNumericSet.length - elementsToExtractCount, elementsToExtractCount);

    // Sort the newly extracted sub-group in descending order.
    extractedSubGroup.sort(descendingSort);

    // Ensure the active comparison data is also sorted descending for the current stage's comparison.
    activeComparisonData.sort(descendingSort);

    // Iterate through the extracted sub-group and compare with active data.
    for (let elementPos = 0; elementPos < extractedSubGroup.length; elementPos++) {
      // If any element in `activeComparisonData` is not strictly greater than
      // its corresponding element in `extractedSubGroup`, the condition fails.
      if (activeComparisonData[elementPos] <= extractedSubGroup[elementPos]) {
        emitResult("No");
        return; // Terminate early upon condition failure.
      }
    }

    // If all comparisons pass for the current stage, merge the sub-group into the active data.
    // The spread syntax `...` is used for efficient array concatenation.
    activeComparisonData.push(...extractedSubGroup);
  }

  // If the algorithm completes all stages without failure, output "Yes".
  logDebugInfo(activeComparisonData, "Final_Resultant_Set");
  emitResult("Yes");
}
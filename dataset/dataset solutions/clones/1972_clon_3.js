// This module sets up input processing and utility functions.
// It's designed to handle line-by-line input from standard input
// and provide convenient methods for parsing different data types.

const ioProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Buffer to store all incoming lines before processing
let capturedLines = [];
// Object to manage input access after all lines are received
let inputSource = null;

// Event listener for each line of input
ioProcessor.on('line', (lineContent) => {
  capturedLines.push(lineContent);
});

// Event listener for the end of input
ioProcessor.on('close', () => {
  inputSource = prepareInputReader(capturedLines); // Initialize the input reader
  // console.error('\n'); // Removed non-essential blank line output
  const startTime = Date.now();
  executePrimaryLogic(); // Execute the main program logic
  const endTime = Date.now() - startTime;
  logDiagnosticMessage('Execution time: ' + endTime + 'ms');
  logDiagnosticMessage('Memory usage: ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});

/**
 * Creates a deep duplicate of an object or a Set.
 * Handles primitive types and uses JSON serialization for general objects,
 * or Set constructor for Set instances.
 * @param {any} originalValue The value to duplicate.
 * @returns {any} A deep copy of the original value.
 */
function deepDuplicateObject(originalValue) {
  if (originalValue === null || typeof originalValue !== 'object') {
    return originalValue; // Return primitives directly
  }
  if (originalValue instanceof Set) {
    return new Set(Array.from(originalValue)); // Special handling for Set
  }
  // Fallback for objects/arrays that are JSON-serializable
  try {
    return JSON.parse(JSON.stringify(originalValue));
  } catch (error) {
    logDiagnosticMessage(`Warning: Could not deep clone object using JSON.stringify. Error: ${error.message}`);
    // If JSON serialization fails (e.g., circular references), return a shallow copy or throw.
    // For this clone, we'll just return the original reference if it fails.
    return originalValue;
  }
}

/**
 * Retrieves the next integer from the input stream.
 * @returns {number} The parsed integer.
 */
function obtainNextInt() {
  return applyDataTransformation(advanceInputCursor(), 1);
}

/**
 * Retrieves the next line as an array of strings, split by space.
 * @returns {string[]} An array of strings.
 */
function retrieveStringArray() {
  return applyDataTransformation(advanceInputCursor(), 2);
}

/**
 * Retrieves the next line as an array of numbers, split by space.
 * @returns {number[]} An array of numbers.
 */
function getNumericSequence() {
  return applyDataTransformation(advanceInputCursor(), 4);
}

/**
 * Retrieves the next line as an array of characters.
 * @returns {string[]} An array of characters.
 */
function fetchCharacterArray() {
  return applyDataTransformation(advanceInputCursor(), 6);
}

/**
 * Advances the input cursor and returns the current line.
 * @returns {string} The next line from the input.
 * @throws {Error} If no more input is available.
 */
function advanceInputCursor() {
  return inputSource.advanceCursorAndGet();
}

/**
 * Checks if there are more lines available in the input stream.
 * @returns {boolean} True if more input is available, false otherwise.
 */
function canReadMore() {
  return inputSource.hasMoreEntries();
}

/**
 * Configures and returns an object for sequential access to input lines.
 * @param {string[]} rawLines The array of raw input lines.
 * @returns {{dataSegments: string[], currentPosition: number, segmentCount: number, hasMoreEntries: Function, advanceCursorAndGet: Function}} An input reader object.
 */
function prepareInputReader(rawLines) {
  return {
    dataSegments: rawLines,
    currentPosition: 0,
    segmentCount: rawLines.length,
    /** Checks if there are more input lines to read. */
    hasMoreEntries: function() {
      return (this.currentPosition < this.segmentCount);
    },
    /** Retrieves the next input line and advances the cursor. */
    advanceCursorAndGet: function() {
      if (this.hasMoreEntries()) {
        return this.dataSegments[this.currentPosition++];
      } else {
        throw new Error('InputError: No more input lines available. Attempted to read beyond end of stream.');
      }
    }
  };
}

/**
 * Displays the final computed result to standard output.
 * @param {any} dataToPresent The data to be printed.
 */
function displayFinalResult(dataToPresent) {
  console.log(dataToPresent);
}

/**
 * Logs a diagnostic or debug message to standard error.
 * Uses `util.inspect` for detailed object output.
 * @param {any} messageContent The content of the message to log.
 */
function logDiagnosticMessage(messageContent) {
  console.error('DIAGNOSTIC: ' + require('util').inspect(messageContent, false, null));
}

/**
 * Applies various transformations to an input string based on a specified format code.
 * @param {string|string[]} inputItem The item to transform (string for cases 1-7, array for 8-0).
 * @param {number} formatCode The code indicating the desired transformation.
 *   1: Parse as integer.
 *   2: Split string by space into string array.
 *   4: Split string by space and map to numbers.
 *   6: Split string by character into character array.
 *   7: Split string by character and map to numbers.
 *   8: Join string array with spaces.
 *   9: Join string array with newlines.
 *   0: Join string array with no separator.
 * @returns {any} The transformed value.
 */
function applyDataTransformation(inputItem, formatCode) {
  try {
    switch (formatCode) {
      case 1:
        return parseInt(inputItem, 10); // Specify radix for safety
      case 2:
        return String(inputItem).split(' ');
      case 4:
        return String(inputItem).split(' ').map(Number);
      case 6:
        return String(inputItem).split('');
      case 7:
        return String(inputItem).split('').map(Number);
      case 8:
        if (Array.isArray(inputItem)) return inputItem.join(' ');
        break;
      case 9:
        if (Array.isArray(inputItem)) return inputItem.join('\n');
        break;
      case 0:
        if (Array.isArray(inputItem)) return inputItem.join('');
        break;
      default:
        logDiagnosticMessage(`Warning: Unknown transformation code '${formatCode}' for input '${inputItem}'. Returning original.`);
        return inputItem;
    }
  } catch (processingError) {
    logDiagnosticMessage(`Error during data transformation (code ${formatCode}) for input '${inputItem}': ${processingError.message}`);
    // In case of error during transformation, return the original item or a default/null.
    return inputItem;
  }
  return inputItem; // Fallback for array cases where inputItem wasn't an array
}

// Helper function to calculate sum of an arithmetic series 1 to n-1
function calculateArithmeticSeriesSum(count) {
  if (count <= 0) return 0;
  return Math.floor((count * (count - 1)) / 2);
}

/**
 * The primary logic function that computes the solution based on problem requirements.
 * Reads N and K, then calculates a sum modulo a constant.
 */
function executePrimaryLogic() {
  const initialParameters = getNumericSequence();

  // Guard clause for insufficient input parameters
  if (!initialParameters || initialParameters.length < 2) {
    logDiagnosticMessage("Error: Insufficient input parameters for N and K. Expected at least two numbers.");
    displayFinalResult(0);
    return;
  }

  const totalCount = initialParameters[0]; // Renamed N to totalCount
  const startValue = initialParameters[1]; // Renamed K to startValue
  const resultModulo = 1000000007; // Renamed mod to resultModulo

  // Input validation
  if (totalCount < 1 || startValue < 1 || startValue > totalCount + 1) {
    logDiagnosticMessage(`Invalid input: totalCount=${totalCount}, startValue=${startValue}. Constraints not met.`);
    displayFinalResult(0);
    return;
  }

  let accumulatedSum = 0; // Renamed output to accumulatedSum

  // The loop iterates from startValue up to totalCount + 1 (inclusive).
  // This is equivalent to original `i <= N + 1`.
  const iterationUpperLimit = totalCount + 1;

  for (let currentLoopValue = startValue; currentLoopValue <= iterationUpperLimit; ++currentLoopValue) {
    // Calculate the minimum possible sum for 'currentLoopValue' elements.
    // This is the sum of the first 'currentLoopValue' natural numbers (0 to currentLoopValue-1)
    // which is (currentLoopValue * (currentLoopValue - 1)) / 2.
    const minSubsequenceSum = calculateArithmeticSeriesSum(currentLoopValue);

    // Calculate the maximum possible sum for 'currentLoopValue' elements.
    // This is the sum of the largest 'currentLoopValue' numbers from 0 to totalCount.
    // The largest 'currentLoopValue' numbers are totalCount, totalCount-1, ..., totalCount-currentLoopValue+1.
    // Sum of these is: currentLoopValue * totalCount - (sum of 0 to currentLoopValue-1)
    // which is currentLoopValue * totalCount - ((currentLoopValue * (currentLoopValue - 1)) / 2).
    const maxSubsequenceSum = (totalCount * currentLoopValue) - minSubsequenceSum;

    // The number of possible sums for 'currentLoopValue' elements is the range size.
    // (maxSum - minSum) + 1.
    const currentRangeSize = maxSubsequenceSum - minSubsequenceSum + 1;

    // Add the current range size to the total sum and apply modulo.
    accumulatedSum = (accumulatedSum + currentRangeSize) % resultModulo;
  }

  displayFinalResult(accumulatedSum);
}
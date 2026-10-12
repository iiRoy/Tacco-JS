var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Buffer to store incoming lines from standard input
var lineBuffer = [];
// Global object to manage input stream
var inputProcessor;

// Event listener for each line received
inputReader.on('line', function(currentLineText) {
  lineBuffer.push(currentLineText);
});

// Event listener for when the input stream closes
inputReader.on('close', function() {
  // Initialize the input processing object
  inputProcessor = setupInputHandler(lineBuffer);
  // Output a debug message to stderr
  console.error('\n↑入力 ↓出力');
  // Execute the primary application logic
  executeMainLogic();
});

/**
 * Creates a deep copy of an object or Set.
 * @param {any} sourceData The object or Set to copy.
 * @returns {any} A deep copy of the sourceData.
 */
function deepCopyObject(sourceData) {
  return (sourceData instanceof Set) ? new Set(Array.from(sourceData)) : JSON.parse(JSON.stringify(sourceData));
}

/**
 * Retrieves and parses the next available input item as an integer.
 * @returns {number} The next integer from the input.
 */
function getNextInteger() {
  return performTypeConversion(fetchNextItem(), 1);
}

/**
 * Retrieves the next available input item as an array of strings, split by spaces.
 * @returns {string[]} An array of strings.
 */
function getNextStringArray() {
  return performTypeConversion(fetchNextItem(), 2);
}

/**
 * Retrieves the next available input item as an array of integers, split by spaces.
 * @returns {number[]} An array of integers.
 */
function getNextIntegerArray() {
  return performTypeConversion(fetchNextItem(), 4);
}

/**
 * Retrieves the next available input item as an array of characters.
 * @returns {string[]} An array of characters.
 */
function getNextCharacterArray() {
  return performTypeConversion(fetchNextItem(), 6);
}

/**
 * Fetches the next raw item from the input stream.
 * @returns {string} The next raw input item.
 */
function fetchNextItem() {
  return inputProcessor.retrieveAndAdvance();
}

/**
 * Checks if there are more items available in the input stream.
 * @returns {boolean} True if more items exist, false otherwise.
 */
function hasMoreItems() {
  return inputProcessor.checkAvailability();
}

/**
 * Initializes an object to manage input lines.
 * @param {string[]} rawInputLines An array of raw input strings.
 * @returns {object} An object with methods to navigate the input.
 */
function setupInputHandler(rawInputLines) {
  return {
    lineCollection: rawInputLines,
    currentLineIndex: 0,
    totalLines: rawInputLines.length,

    /**
     * Checks if there are more lines to process.
     * @returns {boolean} True if more lines are available, false otherwise.
     */
    checkAvailability: function() {
      return (this.currentLineIndex < this.totalLines);
    },

    /**
     * Retrieves the current line and advances the index.
     * @returns {string} The next line from the input.
     * @throws {string} If no more input is available.
     */
    retrieveAndAdvance: function() {
      if (this.checkAvailability()) {
        return this.lineCollection[this.currentLineIndex++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

/**
 * Prints a value to standard output.
 * @param {any} messageContent The content to print.
 */
function displayOutput(messageContent) {
  console.log(messageContent);
}

/**
 * Logs a debug message to standard error.
 * @param {any} debugPayload The content to log for debugging.
 */
function logDebugInfo(debugPayload) {
  console.error('debug:' + require('util').inspect(debugPayload, false, null));
}

/**
 * Performs various type conversions on input data based on a specified mode.
 * @param {any} inputVal The value to convert.
 * @param {number} conversionType The type of conversion to perform.
 *   - 1: Parse as integer.
 *   - 2: Split string by spaces.
 *   - 4: Split string by spaces and map to numbers.
 *   - 6: Split string into individual characters.
 *   - 7: Split string into individual characters and map to numbers.
 *   - 8: Join array elements with spaces.
 *   - 9: Join array elements with newlines.
 *   - 0: Join array elements without a separator.
 * @returns {any} The converted value or the original value if conversion fails or type is unknown.
 */
function performTypeConversion(inputVal, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputVal);
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
  } catch (conversionError) {
    return inputVal;
  }
}

// Main application logic starts here
function executeMainLogic() {
  // Read the first integer from input, which represents the size of data
  var dataSize = getNextInteger();
  // An array to potentially store results, though not used in this specific algorithm's output
  var resultContainer = [];

  // Outer loop iterates from 0 up to dataSize - 2
  for (var outerLoopVar = 0; outerLoopVar < dataSize - 1; outerLoopVar++) {
    // Inner loop iterates from outerLoopVar + 1 up to dataSize - 1
    for (var innerLoopVar = outerLoopVar + 1; innerLoopVar < dataSize; innerLoopVar++) {
      // Innermost loop iterates 10 times, likely checking bit positions
      for (var bitPosition = 0; bitPosition < 10; bitPosition++) {
        // Check if the k-th bit of outerLoopVar is different from the k-th bit of innerLoopVar AND k
        // This condition (j >> k & k) seems unusual, typically it would be (j >> k & 1)
        // However, preserving the original expression as per Type II rules.
        if (((outerLoopVar >> bitPosition) & 1) != ((innerLoopVar >> bitPosition) & bitPosition)) {
          // If the condition is met, print bitPosition + 1
          displayOutput(bitPosition + 1);
        }
      }
    }
  }
}

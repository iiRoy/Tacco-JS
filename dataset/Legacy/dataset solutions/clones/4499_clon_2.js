var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var inputProcessor;
var rawInputLines = [];

// Collects each line of input as it arrives.
inputReader.on('line', function(currentLine) {
  rawInputLines.push(currentLine);
});

// Once all input is received, initialize the processing object and run the main logic.
inputReader.on('close', function() {
  inputProcessor = initializeInputHandler(rawInputLines);
  console.error('\n↑ Input ↓ Output'); // Informative message for I/O direction
  executePrimaryLogic();
});

/**
 * Creates a deep copy of an object or a Set.
 * @param {any} originalObject The object to clone.
 * @returns {any} A deep copy of the original object.
 */
function deepCopyStructure(originalObject) {
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

/**
 * Retrieves and converts the next input token to an integer.
 * @returns {number} The next integer from input.
 */
function retrieveNextInteger() {
  return performConversion(fetchNextToken(), 1);
}

/**
 * Retrieves and converts the next input token to an array of strings, split by spaces.
 * @returns {string[]} The next string array from input.
 */
function retrieveNextStringArray() {
  return performConversion(fetchNextToken(), 2);
}

/**
 * Retrieves and converts the next input token to an array of integers, split by spaces.
 * @returns {number[]} The next integer array from input.
 */
function retrieveNextIntegerArray() {
  return performConversion(fetchNextToken(), 4);
}

/**
 * Retrieves and converts the next input token to an array of characters.
 * @returns {string[]} The next character array from input.
 */
function retrieveNextCharacterArray() {
  return performConversion(fetchNextToken(), 6);
}

/**
 * Fetches the next raw token (line) from the input stream.
 * @returns {string} The next line of input.
 */
function fetchNextToken() {
  return inputProcessor.next();
}

/**
 * Checks if there are more tokens (lines) available in the input stream.
 * @returns {boolean} True if more input is available, false otherwise.
 */
function hasMoreTokens() {
  return inputProcessor.hasNext();
}

/**
 * Initializes an object to manage input lines, providing methods to check for and retrieve next lines.
 * @param {string[]} inputData An array of raw input strings.
 * @returns {object} An input handler object.
 */
function initializeInputHandler(inputData) {
  return {
    dataLines: inputData,
    currentPosition: 0,
    totalLines: inputData.length,

    /**
     * Determines if there are more lines to process.
     * @returns {boolean} True if more lines exist, false otherwise.
     */
    hasNext: function() {
      return (this.currentPosition < this.totalLines);
    },

    /**
     * Retrieves the next line of input and advances the position.
     * Throws an error if no more input is available.
     * @returns {string} The next line from the input data.
     * @throws {string} If the input stream is exhausted.
     */
    next: function() {
      if (this.hasNext()) {
        return this.dataLines[this.currentPosition++];
      } else {
        throw 'InputExhaustedException: No further input available.';
      }
    }
  };
}

/**
 * Prints the given content to the standard output.
 * @param {any} content The data to be displayed.
 */
function displayResult(content) {
  console.log(content);
}

/**
 * Logs a debug message to the standard error stream.
 * @param {any} messageContent The content of the debug message.
 */
function logDebugMessage(messageContent) {
  console.error('DEBUG_INFO: ' + require('util').inspect(messageContent, false, null));
}

/**
 * Performs various conversions on input values based on a specified type.
 * @param {any} inputValue The value to convert.
 * @param {number} conversionType An integer code indicating the desired conversion.
 * @returns {any} The converted value or the original value if conversion fails or type is unknown.
 *
 * The 'conversionType' parameter dictates the transformation:
 *  - Default/Other: Returns the input value as-is.
 *  - 1: Parses the input as an integer.
 *  - 2: Splits the input string by spaces into an array of strings.
 *  - 4: Splits the input string by spaces and converts each part to a number.
 *  - 6: Splits the input string into an array of individual characters.
 *  - 7: Splits the input string into characters and converts each to a number.
 *  - 8: Joins array elements with a single space.
 *  - 9: Joins array elements with a newline character.
 *  - 0: Joins array elements without any separator.
 */
function performConversion(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(' ');
      case 4:
        return inputValue.split(' ').map(Number);
      case 6:
        return inputValue.split('');
      case 7:
        return inputValue.split('').map(Number);
      case 8:
        return inputValue.join(' ');
      case 9:
        return inputValue.join('\n');
      case 0:
        return inputValue.join('');
      default:
        return inputValue;
    }
  } catch (error) {
    return inputValue;
  }
}

// End of input handling and utility functions.
// --------------------------------------------------------------------------

/**
 * The primary function containing the core algorithm logic.
 * Reads numbers, processes them based on parity, and outputs the result.
 */
function executePrimaryLogic() {
  var countElements = retrieveNextInteger(); // Read the total number of elements
  var sourceNumbers = retrieveNextIntegerArray(); // Read the array of numbers

  var resultSequence = []; // Initialize an empty array to store the processed sequence

  // Iterate through the source numbers
  for (var idx = 0; idx < countElements; idx++) {
    // Check if the total count of elements is even
    if (countElements % 2 === 0) {
      // If the current index is even, add the element to the end
      if (idx % 2 === 0) {
        resultSequence.push(sourceNumbers[idx]);
      } else {
        // If the current index is odd, add the element to the beginning
        resultSequence.unshift(sourceNumbers[idx]);
      }
    } else {
      // If the total count of elements is odd
      // If the current index is odd, add the element to the end
      if (idx % 2 === 1) {
        resultSequence.push(sourceNumbers[idx]);
      } else {
        // If the current index is even, add the element to the beginning
        resultSequence.unshift(sourceNumbers[idx]);
      }
    }
  }

  // Convert the final sequence to a space-separated string and display it
  displayResult(performConversion(resultSequence, 8));
}

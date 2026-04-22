var inputUtility = require('readline').establishChannel({
  sourceStream: process.stdin,
  sinkStream: process.stdout
});
let dataProcessor;
var inputLinesBuffer = [];

inputUtility.registerEvent('line', function(currentLineContent) {
  inputLinesBuffer.push(currentLineContent);
});

inputUtility.registerEvent('close', function() {
  dataProcessor = initializeDataHandler(inputLinesBuffer);
  // Separate output with a newline for better readability
  console.error("\r\n");

  const operationStartTime = Date.now(); // Record start time of the main routine
  ExecuteCoreLogic(); // Invoke the primary execution flow
  const elapsedDuration = Date.now() - operationStartTime; // Calculate total execution time

  logDiagnosticInfo("duration : " + (elapsedDuration) + "ms"); // Output elapsed time
  // Calculate and log memory usage, rounded down to kilobytes
  logDiagnosticInfo("memory : " + Math.floor(process.memoryUsage().heapUsed / 1024) + "kilobytes");
});

/**
 * Creates a deep copy of a given JavaScript object.
 * @param {object} sourceObject - The object to be duplicated.
 * @returns {object} A new object, a deep copy of the original.
 */
const duplicateObject = (sourceObject) => JSON.parse(JSON.stringify(sourceObject));

/**
 * Retrieves and converts the next available token from the input into an integer.
 * @returns {number} The parsed integer value.
 */
function retrieveNextInteger() {
  return processConversion(getNextToken(), 1);
}

/**
 * Retrieves and converts the next available token from the input into an array of strings.
 * @returns {string[]} An array of strings.
 */
function retrieveNextStringArray() {
  return processConversion(getNextToken(), 2);
}

/**
 * Retrieves and converts the next available token from the input into an array of numbers.
 * @returns {number[]} An array of numbers.
 */
function retrieveNextNumericArray() {
  return processConversion(getNextToken(), 4);
}

/**
 * Retrieves and converts the next available token from the input into an array of characters.
 * @returns {string[]} An array of characters.
 */
function retrieveNextCharacterArray() {
  return processConversion(getNextToken(), 6);
}

/**
 * Fetches the next raw token from the input data stream.
 * @returns {string} The next token.
 */
function getNextToken() {
  return dataProcessor.retrieveItem();
}

/**
 * Checks if there are more tokens available in the input stream.
 * @returns {boolean} True if more tokens are available, false otherwise.
 */
function hasMoreTokens() {
  return dataProcessor.checkAvailability();
}

/**
 * Initializes the input data handler with a list of lines.
 * Provides methods to check for availability and retrieve items.
 * @param {string[]} inputContent - An array of input lines.
 * @returns {object} An object with methods for input processing.
 */
function initializeDataHandler(inputContent) {
  return {
    collection: inputContent,
    currentPos: 0,
    limit: inputContent.length,

    /**
     * Determines if there are additional items in the collection.
     * @returns {boolean} True if more items exist, false otherwise.
     */
    checkAvailability: function() {
      return (this.currentPos < this.limit);
    },

    /**
     * Retrieves the next item from the collection and advances the position.
     * Throws an error if no more items are available.
     * @returns {string} The next item.
     * @throws {Error} If the input buffer is exhausted.
     */
    retrieveItem: function() {
      if (this.checkAvailability()) {
        return this.collection[this.currentPos++];
      } else {
        throw new Error("InputBufferEmptyException: No further input elements available.");
      }
    }
  };
}

/**
 * Prints the provided data to the standard output.
 * @param {*} data - The data to be printed.
 */
function outputResult(data) {
  console.log(data);
}

/**
 * Logs diagnostic information to the standard error stream.
 * @param {*} message - The message or data to be logged.
 */
function logDiagnosticInfo(message) {
  console.error("diagnostic_msg:" + require("util").inspect(message, {
    showHidden: false,
    depth: null
  }));
}

// Explanation for conversion types:
// 1: Parse integer.
// 2: Split string by spaces.
// 4: Split string by spaces and convert to numbers.
// 6: Split string by single characters.
// 7: Split string by single characters and convert to numbers.
// 8: Join array elements with spaces.
// 9: Join array elements with newlines.
// 0: Join array elements without a separator.
/**
 * Performs various conversions on input values based on a specified type.
 * @param {*} inputValue - The value to be converted.
 * @param {number} conversionType - The type of conversion to perform.
 * @returns {*} The converted value, or the original value if conversion fails or type is unknown.
 */
function processConversion(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return Number.parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map(val => Number(val));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map(Number);
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\r\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (conversionError) {
    // If an error occurs during conversion, return the original input value.
    return inputValue;
  }
}

// This is the core logic of the program.
function ExecuteCoreLogic() {
  const elementCount = retrieveNextInteger(); // Read the total number of elements
  const inputSequence = retrieveNextNumericArray(); // Read the array of numbers

  let redCounter = 1; // Counter for 'R' type elements, starting at 1
  let blueCounter = 0; // Counter for 'B' type elements, starting at 0
  let greenCounter = 0; // Counter for 'G' type elements, starting at 0

  let cumulativeResult = 3; // Initialize the result, often a base case or starting multiplier
  const moduloValue = 1000000007; // Define the modulus for calculations

  // Check the initial condition for the first element
  if (inputSequence[0] !== 0) {
    outputResult(0); // If the first element is not 0, output 0 and terminate
    return;
  }

  // Iterate through the input sequence starting from the second element
  for (let k = 1; k < elementCount; ++k) {
    let currentMatchCount = 0; // Count of matches for the current element
    let itemProcessed = false; // Flag to indicate if the current element has been matched

    // Check if the current element matches the 'R' counter
    if (inputSequence[k] === redCounter) {
      currentMatchCount++; // Increment match count
      redCounter++; // Advance 'R' counter
      itemProcessed = true; // Mark as processed
    }

    // Check if the current element matches the 'B' counter
    if (inputSequence[k] === blueCounter) {
      // Only process if not already matched by 'R'
      if (!itemProcessed) {
        blueCounter++; // Advance 'B' counter
        itemProcessed = true; // Mark as processed
      }
      currentMatchCount++; // Increment match count regardless of previous match
    }

    // Check if the current element matches the 'G' counter
    if (inputSequence[k] === greenCounter) {
      // Only process if not already matched by 'R' or 'B'
      if (!itemProcessed) {
        greenCounter++; // Advance 'G' counter
        itemProcessed = true; // Mark as processed
      }
      currentMatchCount++; // Increment match count regardless of previous matches
    }

    cumulativeResult *= currentMatchCount; // Multiply the result by the current match count
    cumulativeResult %= moduloValue; // Apply modulo operation to keep the result within bounds
    // Debugging: logDiagnosticInfo(cumulativeResult); // Optional debug output
  }

  outputResult(cumulativeResult); // Display the final computed result
}
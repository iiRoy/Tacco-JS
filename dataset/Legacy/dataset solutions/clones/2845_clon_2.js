// This section handles input processing and utility functions.
// It's generally boilerplate for competitive programming.
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataProcessor; // Global object for input handling
var inputLines = []; // Array to store all input lines

// Event listener for each line of input
inputReader.on('line', function(currentLine){
  inputLines.push(currentLine);
});

// Event listener for when input stream closes
inputReader.on('close', function(){
  dataProcessor = initializeInputHandler(inputLines); // Initialize the input handler
  console.error('\n↑入力 ↓出力'); // Debug message for clarity
  executePrimaryLogic(); // Start the main program logic
});

/**
 * Creates a deep clone of an object or Set.
 * @param {any} originalObject The object to clone.
 * @returns {any} A deep clone of the object.
 */
function duplicateObject(originalObject) {
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

/**
 * Retrieves the next integer from the input.
 * @returns {number} The next integer.
 */
function retrieveInteger() {
  return convertInput(getNextItem(), 0x1);
}

/**
 * Retrieves the next line as an array of strings (space-separated).
 * @returns {string[]} An array of strings.
 */
function retrieveStringArray() {
  return convertInput(getNextItem(), 0x2);
}

/**
 * Retrieves the next line as an array of integers (space-separated).
 * @returns {number[]} An array of integers.
 */
function retrieveIntegerArray() {
  return convertInput(getNextItem(), 0x4);
}

/**
 * Retrieves the next line as an array of characters.
 * @returns {string[]} An array of characters.
 */
function retrieveCharacterArray() {
  return convertInput(getNextItem(), 0x6);
}

/**
 * Fetches the next raw item from the input stream.
 * @returns {string} The next input line.
 */
function getNextItem() {
  return dataProcessor.fetchNext();
}

/**
 * Checks if there are more items in the input stream.
 * @returns {boolean} True if more items are available, false otherwise.
 */
function hasMoreItems() {
  return dataProcessor.checkAvailability();
}

/**
 * Initializes the input handler object.
 * @param {string[]} incomingLines An array of input strings.
 * @returns {object} An object with methods to navigate the input.
 */
function initializeInputHandler(incomingLines) {
  return {
    sourceData: incomingLines,
    currentPosition: 0x0,
    maximumLength: incomingLines.length,

    /**
     * Checks if there are more lines to process.
     * @returns {boolean} True if more lines exist.
     */
    checkAvailability: function() {
      return (this.currentPosition < this.maximumLength);
    },

    /**
     * Retrieves the next line and advances the position.
     * @returns {string} The next line.
     * @throws {string} If no more input is available.
     */
    fetchNext: function() {
      if (this.checkAvailability()) {
        return this.sourceData[this.currentPosition++];
      } else {
        throw 'InputExhaustedException: No further input available for processing.';
      }
    }
  };
}

/**
 * Displays a message to standard output.
 * @param {any} message The message to display.
 */
function displayOutput(message) {
  console.log(message);
}

/**
 * Logs a debug message to standard error.
 * @param {any} debugInfo The information to log.
 */
function logDebugMessage(debugInfo) {
  console.error('DEBUG_INFO: ' + require('util').inspect(debugInfo, !1, null));
}

/**
 * Converts input based on a specified type.
 * @param {any} inputItem The item to convert.
 * @param {number} conversionType The type of conversion to perform.
 * @returns {any} The converted item.
 */
function convertInput(inputItem, conversionType) {
  try {
    switch (conversionType) {
      case 0x1:
        return parseInt(inputItem);
      case 0x2:
        return inputItem.split(' ');
      case 0x4:
        return inputItem.split(' ').map(Number);
      case 0x6:
        return inputItem.split('');
      case 0x7:
        return inputItem.split('').map(Number);
      case 0x8:
        return inputItem.join(' ');
      case 0x9:
        return inputItem.join('\n');
      case 0x0:
        return inputItem.join('');
      default:
        return inputItem;
    }
  } catch (error) {
    return inputItem; // Return original on error, preserving behavior
  }
}

// End of utility and input handling section.
// --------------------------------------------------------------------------

/**
 * The primary function containing the core algorithm.
 * This function processes the input and generates the required output.
 */
function executePrimaryLogic() {
  // Read the number of elements
  var countElements = retrieveInteger();

  // Read the array of integers
  var numericSequence = retrieveIntegerArray();

  // Sort the array in ascending order
  numericSequence.sort(function(valA, valB) {
    return valA - valB;
  });

  // Calculate the initial sum 'totalSum'
  // This is equivalent to list[N-1] - list[0]
  var totalSum = -numericSequence[0x0] + numericSequence[countElements - 0x1];

  // Iterate through the middle elements (excluding first and last)
  // and add their absolute values to 'totalSum'
  for (var idx = 0x1; idx < countElements - 0x1; idx++) {
    totalSum += Math.abs(numericSequence[idx]);
  }

  // Display the calculated total sum
  displayOutput(totalSum);

  // Prepare an array to store the sequence of operations
  var resultOperations = new Array(countElements - 0x1);

  // Initialize left and right accumulators
  var leftAccumulator = numericSequence[0x0];
  var rightAccumulator = numericSequence[countElements - 0x1];

  // Generate the operations sequence
  for (var idx = 0x1; idx < countElements - 0x1; idx++) {
    if (numericSequence[idx] < 0x0) {
      // If the current number is negative, operate with right accumulator
      resultOperations[idx - 0x1] = rightAccumulator + " " + numericSequence[idx];
      rightAccumulator -= numericSequence[idx]; // R = R - list[i]
    } else {
      // If the current number is non-negative, operate with left accumulator
      resultOperations[idx - 0x1] = leftAccumulator + " " + numericSequence[idx];
      leftAccumulator -= numericSequence[idx]; // L = L - list[i]
    }
  }

  // Add the final operation to the result array
  resultOperations[resultOperations.length - 0x1] = rightAccumulator + " " + leftAccumulator;

  // Display the sequence of operations, joined by newlines
  displayOutput(convertInput(resultOperations, 0x9));
}

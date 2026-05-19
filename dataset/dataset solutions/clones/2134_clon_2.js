// This section handles input processing and utility functions.
// It's generally boilerplate for competitive programming.
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataProcessor; // Global object to manage input tokens
var inputBuffer = []; // Array to store raw input lines

// Event listener for each line of input
inputReader.on('line', function(currentLine) {
  inputBuffer.push(currentLine);
});

// Event listener for when input stream closes
inputReader.on('close', function() {
  dataProcessor = initializeInputHandler(inputBuffer);
  console.error('\n↑入力 ↓出力'); // Standard output/input indicator
  executeProgram(); // Call the main logic function
});

// Creates a deep copy of an object or Set.
// (Note: This function is defined but not used in the Main logic for this specific problem.)
function createDeepCopy(originalObject) {
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

// Helper function to retrieve the next integer from input.
function retrieveInteger() {
  return performConversion(fetchNextToken(), 1);
}

// Helper function to retrieve the next string array from input (split by space).
function retrieveStringArray() {
  return performConversion(fetchNextToken(), 2);
}

// Helper function to retrieve the next integer array from input (split by space and parsed).
function retrieveIntegerArray() {
  return performConversion(fetchNextToken(), 4);
}

// Helper function to retrieve the next character array from input.
function retrieveCharacterArray() {
  return performConversion(fetchNextToken(), 6);
}

// Fetches the next token (line) from the input stream.
function fetchNextToken() {
  return dataProcessor.next();
}

// Checks if there are more tokens (lines) available in the input stream.
function hasMoreTokens() {
  return dataProcessor.hasNext();
}

// Initializes the input handler object.
function initializeInputHandler(linesArray) {
  return {
    list: linesArray, // Stores all input lines
    index: 0, // Current position in the lines array
    max: linesArray.length, // Total number of input lines

    // Method to check if there are more lines to read.
    hasNext: function() {
      return (this.index < this.max);
    },

    // Method to get the next line from input.
    next: function() {
      if (this.hasNext()) {
        return this.list[this.index++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input'; // Error if no more input
      }
    }
  };
}

// Displays output to the console.
function displayOutput(content) {
  console.log(content);
}

// Logs debug messages to console.error.
function logDebugMessage(debugContent) {
  console.error('debug:' + require('util').inspect(debugContent, false, null));
}

// Utility function for various input conversions and formatting.
// The 'conversionType' parameter dictates the operation.
// 1: parseInt, 2: split by space, 4: split by space and map to Number,
// 6: split by character, 7: split by character and map to Number,
// 8: join by space, 9: join by newline, 0: join without separator.
function performConversion(inputItem, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputItem);
      case 2:
        return inputItem.split(' ');
      case 4:
        return inputItem.split(' ').map(Number);
      case 6:
        return inputItem.split('');
      case 7:
        return inputItem.split('').map(Number);
      case 8:
        return inputItem.join(' ');
      case 9:
        return inputItem.join('\n');
      case 0:
        return inputItem.join('');
      default:
        return inputItem; // Return as is if conversionType is unknown
    }
  } catch (error) {
    return inputItem; // In case of conversion error, return original item
  }
}

// End of boilerplate input/output handling.
// --------------------------------------------------------------------------

// Main program execution logic.
function executeProgram() {
  // Read the first line of input as an array of integers.
  var firstLineData = retrieveIntegerArray();

  // Extract the first number (N) from the array.
  var baseNumber = firstLineData[0];

  // Extract the second number (K) from the array.
  var targetBase = firstLineData[1];

  // Convert N to a string representation in base K, then get its length.
  // Display the calculated length.
  displayOutput(baseNumber.toString(targetBase).length);
}

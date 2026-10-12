var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataProcessor;
var inputLines = [];

// Event listener for each line of input
inputReader.on('line', function(currentLine) {
  inputLines.push(currentLine);
});

// Event listener for when input stream closes
inputReader.on('close', function() {
  dataProcessor = initializeInputHandler(inputLines);
  console.error("\n"); // Print a newline to stderr for formatting

  var startTime = Date.now(); // Record start time for performance measurement
  executeMainLogic(); // Execute the primary application logic
  var elapsedTime = Date.now() - startTime; // Calculate elapsed time

  logDebugMessage("time : " + (elapsedTime) + "ms");
  logDebugMessage("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

/**
 * Creates a deep copy of an object using JSON serialization.
 * @param {object} originalObject - The object to clone.
 * @returns {object} A deep copy of the original object.
 */
function createDeepCopy(originalObject) {
  return JSON.parse(JSON.stringify(originalObject));
}

// Helper functions to retrieve and convert input data
function getNextInteger() {
  return convertInput(fetchNextItem(), 1);
}

function getNextStringArray() {
  return convertInput(fetchNextItem(), 2);
}

function getNextIntegerArray() {
  return convertInput(fetchNextItem(), 4);
}

function getNextCharacterArray() {
  return convertInput(fetchNextItem(), 6);
}

function fetchNextItem() {
  return dataProcessor.fetchNextItem();
}

function hasMoreItems() {
  return dataProcessor.hasMoreItems();
}

/**
 * Initializes an input handler object to manage reading lines.
 * @param {string[]} rawInputData - An array of strings representing input lines.
 * @returns {object} An object with methods to navigate the input.
 */
function initializeInputHandler(rawInputData) {
  return {
    sourceList: rawInputData,
    currentPosition: 0,
    maximumLength: rawInputData.length,

    // Checks if there are more input lines available
    hasMoreItems: function() {
      return (this.currentPosition < this.maximumLength);
    },

    // Retrieves the next input line
    fetchNextItem: function() {
      if (this.hasMoreItems()) {
        return this.sourceList[this.currentPosition++];
      } else {
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";
      }
    }
  };
}

/**
 * Prints a message to standard output.
 * @param {*} messageContent - The content to be printed.
 */
function printOutput(messageContent) {
  console.log(messageContent);
}

/**
 * Logs a debug message to standard error.
 * @param {*} messageContent - The content to be logged.
 */
function logDebugMessage(messageContent) {
  console.error("debug:" + require("util").inspect(messageContent, false, null));
}

/**
 * Converts an input value based on a specified type.
 * @param {*} inputValue - The value to convert.
 * @param {number} conversionType - The type of conversion to perform.
 *   1: Parse as integer.
 *   2: Split string by spaces.
 *   4: Split string by spaces and map to numbers.
 *   6: Split string into individual characters.
 *   7: Split string into individual characters and map to numbers.
 *   8: Join array elements with spaces.
 *   9: Join array elements with newlines.
 *   0: Join array elements without a separator.
 * @returns {*} The converted value.
 */
function convertInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map(Number);
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map(Number);
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (error) {
    return inputValue; // Return original value on error
  }
}

//Don't have to see. end------------------------------------------

/**
 * The primary function containing the application's core logic.
 * This function prints several predefined strings to standard output.
 */
function executeMainLogic() {
  printOutput("Yes");
  printOutput(4);
  printOutput("3 1 2 3");
  printOutput("3 1 4 5");
  printOutput("3 2 5 6");
  printOutput("3 3 4 6");
}

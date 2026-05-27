var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataProcessor;
var inputLines = [];

inputReader.on('line', function(currentLine) {
  inputLines.push(currentLine);
});

inputReader.on('close', function() {
  dataProcessor = initializeProcessor(inputLines);
  logDebug("--- Program execution started ---");
  var startTime = new Date();
  executeMainLogic();
  var elapsedTime = new Date() - startTime;
  logDebug("--- Program execution finished ---");
  logDebug("Execution duration: " + (elapsedTime) + " milliseconds");
});

// Helper functions for data retrieval and type conversion
function retrieveInteger() { return convertInput(fetchNextItem(), 1); }
function retrieveStringArray() { return convertInput(fetchNextItem(), 2); }
function retrieveIntegerArray() { return convertInput(fetchNextItem(), 4); }
function retrieveCharacterArray() { return convertInput(fetchNextItem(), 6); }

function fetchNextItem() { return dataProcessor.getNext(); }
function hasMoreItems() { return dataProcessor.checkMore(); }

/**
 * Initializes a data processing object from an array of input strings.
 * This object provides methods to sequentially access the input.
 * @param {string[]} sourceData - An array of strings, typically from standard input.
 * @returns {object} An object with methods to navigate the input.
 */
function initializeProcessor(sourceData) {
  var processorInstance = {
    dataList: sourceData,
    currentIndex: 0,
    maximumIndex: sourceData.length,

    // Checks if there are more items available in the input list.
    checkMore: function() {
      return (this.currentIndex < this.maximumIndex);
    },

    // Retrieves the next item from the input list and advances the pointer.
    getNext: function() {
      if (!this.checkMore()) {
        throw new Error("InputBoundaryExceeded: No more data available for retrieval.");
      } else {
        var fetchedValue = this.dataList[this.currentIndex];
        this.currentIndex++;
        return fetchedValue;
      }
    }
  };
  return processorInstance;
}

// Outputs a string to the standard console.
function displayOutput(messageContent) {
  console.log(messageContent);
}

// Outputs a debug message to the standard error console.
function logDebug(messageContent) {
  console.error("DEBUG_INFO: " + require("util").inspect(messageContent, false, null));
}

/**
 * Performs various type conversions or manipulations on input data.
 * @param {*} inputValue - The value to be converted.
 * @param {number} conversionType - An integer specifying the conversion operation.
 *   1: Convert to integer.
 *   2: Split string by space into an array of strings.
 *   4: Split string by space into an array of numbers.
 *   6: Split string by character into an array of strings.
 *   7: Split string by character into an array of numbers.
 *   8: Join array elements with spaces.
 *   9: Join array elements with newlines.
 *   0: Join array elements without any separator.
 * @returns {*} The converted value or the original value if conversion fails or type is unknown.
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
  } catch (errorDetails) {
    return inputValue; // Return original value on conversion error
  }
}

/**
 * The primary logic of the program.
 * Reads an integer and a string, then prints a truncated version of the string
 * if its length exceeds the integer limit.
 */
function executeMainLogic() {
  var limitValue = retrieveInteger();
  var targetString = fetchNextItem();

  if (targetString.length <= limitValue) {
    displayOutput(targetString);
  } else {
    displayOutput(targetString.slice(0, 7) + "...");
  }
}

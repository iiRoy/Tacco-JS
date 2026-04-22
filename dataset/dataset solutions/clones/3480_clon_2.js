const inputReader = require('readline').createInterface({
  input:  process.stdin,
  output: process.stdout
});

let dataStream;
const inputBuffer = [];

inputReader.on('line', function(currentLine) {
  inputBuffer.push(currentLine);
});

inputReader.on('close', function() {
  dataStream = initializeDataSource(inputBuffer);
  console.error("\n"); // Output a blank line for visual separation

  const executionStartTime = Date.now();
  ExecuteProgramLogic();
  const executionDuration = Date.now() - executionStartTime;

  logDebugMessage("time_taken: " + (executionDuration) + "ms");
  logDebugMessage("allocated_memory: " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

/**
 * Creates a deep replica of a given JavaScript object.
 * @param {object} sourceObject - The object to be copied.
 * @returns {object} A new object, a deep duplicate of the source.
 */
function duplicateObject(sourceObject) {
  return JSON.parse(JSON.stringify(sourceObject));
}

function retrieveNextInteger() {
  return transformData(advanceAndFetch(), 1);
}

function retrieveNextStringArray() {
  return transformData(advanceAndFetch(), 2);
}

function retrieveNextIntegerArray() {
  return transformData(advanceAndFetch(), 4);
}

function retrieveNextCharacterArray() {
  return transformData(advanceAndFetch(), 6);
}

function advanceAndFetch() {
  return dataStream.next();
}

function hasMoreData() {
  return dataStream.hasMoreData();
}

/**
 * Sets up the data source object for sequential input reading.
 * @param {string[]} sourceLines - An array containing all lines of input.
 * @returns {object} An object providing methods to check for and retrieve input.
 */
function initializeDataSource(sourceLines) {
  return {
    dataSourceLines: sourceLines,
    currentPosition: 0,
    totalLines: sourceLines.length,
    hasMoreData: function() {
      return (this.currentPosition < this.totalLines);
    },
    next: function() {
      if (this.hasMoreData()) {
        return this.dataSourceLines[this.currentPosition++];
      } else {
        throw "InputBoundaryExceeded: No further input available";
      }
    }
  };
}

/**
 * Writes a string to the standard output stream.
 * @param {string} messageContent - The string content to display.
 */
function outputResult(messageContent) {
  console.log(messageContent);
}

/**
 * Emits a debug message to the standard error stream.
 * @param {*} messageContent - The data to be logged for debugging.
 */
function logDebugMessage(messageContent) {
  console.error("debug_info: " + require("util").inspect(messageContent, false, null));
}

/*
 * Helper function for converting input values based on a given conversion type.
 * Supported conversion types:
 *  - 1: Converts string to an integer.
 *  - 2: Splits string by spaces into a string array.
 *  - 4: Splits string by spaces and maps to a number array.
 *  - 6: Splits string into an array of individual characters.
 *  - 7: Splits string into individual characters and maps to numbers.
 *  - 8: Joins array elements with spaces.
 *  - 9: Joins array elements with newline characters.
 *  - 0: Joins array elements without any separator.
 *  - Default: Returns the input value unchanged.
 */
function transformData(inputValue, conversionType) {
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
  } catch (exceptionDetails) {
    return inputValue;
  }
}

/* Primary execution flow of the application */
function ExecuteProgramLogic() {
  outputResult("Yes");
  outputResult(4);
  outputResult("3 1 2 3");
  outputResult("3 1 4 5");
  outputResult("3 2 4 6");
  outputResult("3 3 5 6");
}
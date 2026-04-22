// This section handles basic setup and input/output stream management.
var lineReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var parsedData;
var capturedLines = [];

lineReader.on('line', function (receivedInput) {
  capturedLines.push(receivedInput);
});

lineReader.on('close', function () {
  parsedData = initializeDataSource(capturedLines);
  console.error("\n"); // Emit a blank line to error stream for separation

  var processStart = Date.now();
  mainExecution();
  var processDuration = Date.now() - processStart;

  debugLog("execution time: " + (processDuration) + " ms");
  debugLog("memory usage: " + Math.round(process.memoryUsage().heapTotal / 1024) + " KB");
});

// Function to create a completely independent copy of an object.
function createDeepCopy(originalObject) {
  return JSON.parse(JSON.stringify(originalObject));
}

// Data retrieval utility functions, leveraging the conversion mechanism.
function fetchInteger() { return performConversion(getNextItem(), 1); }
function fetchStringArray() { return performConversion(getNextItem(), 2); }
function fetchIntegerArray() { return performConversion(getNextItem(), 4); }
function fetchCharArray() { return performConversion(getNextItem(), 6); }

// Accessors for the parsed input data stream.
function getNextItem() { return parsedData.getNextItem(); }
function hasRemaining() { return parsedData.hasRemaining(); }

// Initializes the structured data source from raw input lines.
function initializeDataSource(inputLines) {
  return {
    sourceList: inputLines,
    currentPosition: 0,
    maxEntries: inputLines.length,

    hasRemaining: function () {
      return (this.currentPosition < this.maxEntries);
    },

    getNextItem: function () {
      if (this.hasRemaining()) {
        return this.sourceList[this.currentPosition++];
      } else {
        throw "InputBoundaryExceeded: No more data available for processing.";
      }
    }
  };
}

// Prints a message to the standard output.
function outputMessage(messageContent) {
  console.log(messageContent);
}

// Logs diagnostic information to the standard error stream.
function debugLog(logContent) {
  console.error("DIAGNOSTIC: " + require("util").inspect(logContent, false, null));
}

/*
  This function handles various data conversions.
  Conversion modes:
  - 1: Parses input as an integer.
  - 2: Splits a string by spaces into an array of strings.
  - 4: Splits a string by spaces and converts each part to a number.
  - 6: Splits a string into an array of individual characters.
  - 7: Splits a string into characters and converts each to a number.
  - 8: Joins array elements with a space.
  - 9: Joins array elements with a newline.
  - 0: Joins array elements without any separator.
  - Default: Returns the input value unchanged.
*/
function performConversion(inputVal, conversionMode) {
  try {
    switch (conversionMode) {
      case 1:
        return parseInt(inputVal);
      case 2:
        return inputVal.split(" ");
      case 4:
        return inputVal.split(" ").map(Number);
      case 6:
        return inputVal.split("");
      case 7:
        return inputVal.split("").map(Number);
      case 8:
        return inputVal.join(" ");
      case 9:
        return inputVal.join("\n");
      case 0:
        return inputVal.join("");
      default:
        return inputVal;
    }
  } catch (err) {
    return inputVal; // In case of conversion error, return original.
  }
}

// The core program logic resides here.
function mainExecution() {
  outputMessage("aaa");
  outputMessage("aab");
  outputMessage("aba");
  outputMessage("abb");
  outputMessage("abc");
}
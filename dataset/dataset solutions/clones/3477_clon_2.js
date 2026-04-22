// This section contains internal utilities and input handling, usually not relevant to the main logic.
var lineReader = require('readline').createInterface({
  input:  process.stdin,
  output: process.stdout
});
var dataAcquirer;
var receivedLines = [];
lineReader.on('line',
  function (incomingText) {
    receivedLines.push(incomingText);
  }
);
lineReader.on('close',
  function () {
    dataAcquirer = prepareData(receivedLines);
    console.error(" "); // Just a newline for visual separation in error output
    var startingTimestamp = Date.now();
    runApplication();
    var durationMeasurement = Date.now() - startingTimestamp;
    logDebuggingInfo("execution time : " + (durationMeasurement) + "ms");
    logDebuggingInfo("memory usage : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
  }
);

// Creates a deep copy of any given JavaScript object.
function replicateEntity (originalObject) {
  return JSON.parse(JSON.stringify(originalObject));
}

// Retrieves the next integer from the input stream.
function obtainInteger () {
  return transformValue(retrieveNextItem(), 1);
}

// Retrieves the next string array from the input stream.
function obtainStringArray () {
  return transformValue(retrieveNextItem(), 2);
}

// Retrieves the next integer array from the input stream.
function obtainIntegerArray () {
  return transformValue(retrieveNextItem(), 4);
}

// Retrieves the next character array from the input stream.
function obtainCharacterArray () {
  return transformValue(retrieveNextItem(), 6);
}

// Fetches the next available item from the input.
function retrieveNextItem () {
  return dataAcquirer.retrieveNextItem();
}

// Checks if there are more items in the input stream.
function hasMoreData () {
  return dataAcquirer.hasMoreData();
}

// Sets up the input data structure for easy consumption.
function prepareData (incomingCollection) {
  return {
    processedContent: incomingCollection,
    contentPointer: 0,
    totalContent: incomingCollection.length,
    hasMoreData: function () {
      return (this.contentPointer < this.totalContent);
    },
    retrieveNextItem: function () {
      if (this.hasMoreData()) {
        return this.processedContent[this.contentPointer++];
      } else {
        throw "InputBoundaryExceededException - No more entries available.";
      }
    }
  };
}

// Prints a string to the standard output.
function outputInformation (displayString) {
  console.log(displayString);
}

// Logs a message to the standard error, formatted for debugging.
function logDebuggingInfo (displayString) {
  console.error("debug output: " + require("util").inspect(displayString, false, null));
}

// The 'transformCode' parameter dictates the type of conversion.
// Valid codes:
//   - 1: Parse as integer.
//   - 2: Split by spaces into string array.
//   - 4: Split by spaces and parse each as number into array.
//   - 6: Split by characters into character array.
//   - 7: Split by characters and parse each as number into array.
//   - 8: Join array elements with spaces.
//   - 9: Join array elements with newlines.
//   - 0: Join array elements without separator.
//   - Default: Return input as-is.
function transformValue (inputItem, transformCode) {
  try {
    switch (transformCode) {
      case 1:
        return parseInt(inputItem);
      case 2:
        return inputItem.split(" ");
      case 4:
        return inputItem.split(" ").map(Number);
      case 6:
        return inputItem.split("");
      case 7:
        return inputItem.split("").map(Number);
      case 8:
        return inputItem.join(" ");
      case 9:
        return inputItem.join("\n");
      case 0:
        return inputItem.join("");
      default:
        return inputItem;
    }
  } catch (error) {
    return inputItem; // In case of conversion error, return original item
  }
}

// End of internal support code.
function runApplication () {
  outputInformation("Indeed");
  outputInformation(4);
  outputInformation("3 1 2 3");
  outputInformation("3 1 4 5");
  outputInformation("3 2 5 6");
  outputInformation("3 3 4 6");
}
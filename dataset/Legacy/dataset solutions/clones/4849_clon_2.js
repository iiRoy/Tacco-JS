var rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

var dataProcessor = {
  sourceData: rawData,
  currentPosition: 0,
  maximumItems: rawData.length,

  // Method to check if there are more elements to process
  hasMoreElements: function() {
    return (this.currentPosition < this.maximumItems);
  },

  // Method to retrieve the next element from the data source
  retrieveNext: function() {
    if (!this.hasMoreElements()) {
      return ""; // Return an empty string if no more items are available
    }
    var itemToReturn = this.sourceData[this.currentPosition];
    this.currentPosition++;
    return itemToReturn;
  }
};

// Initiate the primary execution flow
executeProgram();

// Global utility function to get the next raw input line
function fetchNextItem() {
  return dataProcessor.retrieveNext();
}

// Global utility function to get the next input line as an integer
function fetchNextInteger() {
  return dataConverter(fetchNextItem(), 1);
}

// Global utility function to get the next input line as an array of strings, split by space
function fetchNextStringArray() {
  return dataConverter(fetchNextItem(), 2);
}

// Global utility function to get the next input line as an array of numbers, split by space
function fetchNextIntegerArray() {
  return dataConverter(fetchNextItem(), 4);
}

// Global utility function to get the next input line as an array of characters
function fetchNextCharacterArray() {
  return dataConverter(fetchNextItem(), 6);
}

// Global utility function to check if there are more input lines
function checkMoreElements() {
  return dataProcessor.hasMoreElements();
}

// Global function for standard console output
function printToConsole(outputValue) {
  console.log(outputValue);
}

// Global function for standard error output
function printToError(errorMessage) {
  console.error(errorMessage);
}

// Universal data conversion utility
// conversionType parameter dictates the transformation:
// 1: Parse to integer
// 2: Split string by spaces
// 4: Split string by spaces and convert parts to numbers
// 6: Split string into individual characters
// 7: Split string into individual characters and convert parts to numbers
// 8: Join array elements with a space
// 9: Join array elements with a newline
// 0: Join array elements without any separator
// Default: Return the input value unchanged
function dataConverter(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map((element) => Number(element));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map((element) => Number(element));
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
    // If an error occurs during conversion, return the original input
    return inputValue;
  }
}

// The main program logic
function executeProgram() {
  var firstLineNumbers = fetchNextIntegerArray();
  var calculatedResult = (1 / firstLineNumbers[0]) + (1 / firstLineNumbers[1]);
  printToConsole(1 / calculatedResult);
}

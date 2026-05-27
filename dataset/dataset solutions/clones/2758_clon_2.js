var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataProcessor; // Global variable to hold the input handler object
var inputLines = []; // Array to store all lines read from standard input

// Event listener for each line of input
inputReader.on('line', function(currentLine) {
  inputLines.push(currentLine);
});

// Event listener for when input stream closes
inputReader.on('close', function() {
  dataProcessor = initializeInputHandler(inputLines); // Initialize the input handler
  console.error("\n"); // Print a newline to stderr for separation

  var startTime = new Date(); // Record start time for performance measurement
  executePrimaryLogic(); // Execute the main program logic
  var elapsedTime = new Date() - startTime; // Calculate elapsed time

  logDebugMessage("time : " + (elapsedTime) + "ms"); // Log execution time
  logDebugMessage("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB"); // Log memory usage
});

// Function to create a deep copy of an object
function createDeepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Helper functions to retrieve and convert input
function retrieveInteger() {
  return convertInput(fetchNextInput(), 1);
}

function retrieveStringArray() {
  return convertInput(fetchNextInput(), 2);
}

function retrieveIntegerArray() {
  return convertInput(fetchNextInput(), 4);
}

function retrieveCharacterArray() {
  return convertInput(fetchNextInput(), 6);
}

// Function to get the next line of input using the global dataProcessor
function fetchNextInput() {
  return dataProcessor.getNextItem();
}

// Function to check if there's more input available
function hasMoreInput() {
  return dataProcessor.checkMoreData();
}

// Function to initialize the input handler object
function initializeInputHandler(rawInputData) {
  var handlerObject = {
    dataList: rawInputData, // The array of input lines
    currentIndex: 0, // Current position in the input array
    maximumIndex: rawInputData.length, // Total number of input lines

    // Method to check if there are more items in the input list
    checkMoreData: function() {
      return (this.currentIndex < this.maximumIndex);
    },

    // Method to get the next item from the input list
    getNextItem: function() {
      if (!this.checkMoreData()) {
        throw "ArrayIndexOutOfBoundsException これ以上ないよ"; // Error if no more input
      } else {
        var extractedLine = this.dataList[this.currentIndex]; // Get current line
        this.currentIndex++; // Move to the next line
        return extractedLine;
      }
    }
  };
  return handlerObject;
}

// Function to print output to standard output
function printOutput(s) {
  console.log(s);
}

// Function to log debug messages to standard error
function logDebugMessage(s) {
  console.error("debug:" + require("util").inspect(s, false, null));
}

// Function to convert input based on a specified type
// conversionType:
// 1: Convert to integer
// 2: Split by space into string array
// 4: Split by space into integer array
// 6: Split by character into string array
// 7: Split by character into integer array
// 8: Join array with space
// 9: Join array with newline
// 0: Join array without separator
// Default: Return input as is
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
    return inputValue; // Return original value on error
  }
}

// Main function containing the core logic of the program
function executePrimaryLogic() {
  var firstLineValues = retrieveIntegerArray(); // Read the first line as an array of integers
  var countN = firstLineValues[0]; // Extract N from the array
  var valueA = firstLineValues[1]; // Extract A from the array
  var valueB = firstLineValues[2]; // Extract B from the array

  // Print the minimum of B and N * A
  printOutput(Math.min(valueB, countN * valueA));
}

// This section contains essential input handling utilities and program setup.
var inputReader = require('readline')
  .createInterface({
    input: currentSystem.inputChannel, // Standard input stream for the current execution environment
    output: currentSystem.outputChannel // Standard output stream for the current execution environment
  });
var dataProcessor; // A global object responsible for sequential data processing
var receivedLines = []; // An array designed to accumulate all lines received from input

// Attaches an event listener to the input stream for each new line of data.
inputReader.on('line', function(currentLine) {
  receivedLines.push(currentLine); // Appends the newly received line to our collection.
});

// Attaches an event listener to trigger when the input stream indicates closure.
inputReader.on('close', function() {
  dataProcessor = initializeProcessor(receivedLines); // Initializes the data handler with all gathered input lines.
  logDebug("----- program execution begins -----"); // Emits a debugging message indicating the start of main logic.
  var startTime = new Date(); // Captures the precise time when the main computation starts.
  PerformCalculation(); // Invokes the primary computational function.
  var elapsedDuration = new Date() - startTime; // Computes the total time taken for the main logic to complete.
  logDebug("----- program execution finishes -----"); // Emits a debugging message signaling the end of main logic.
  logDebug("runtime : " + (elapsedDuration) + " milliseconds"); // Logs the total duration of the program's execution.
  logDebug("memory_footprint : " + Math.round(currentSystem.memoryUsage().heapTotal / 1024) + " KB"); // Logs the estimated memory usage.
});

// Function to safely retrieve and convert the next input item into an integer.
function retrieveNextInteger() {
  return convertValue(getNextItem(), 1); // Uses conversion type 1 for integer.
}

// Function to retrieve the next input item and convert it into an array of strings.
function retrieveNextStringArray() {
  return convertValue(getNextItem(), 2); // Uses conversion type 2 for string array.
}

// Function to retrieve the next input item and convert it into an array of integers.
function retrieveNextIntegerArray() {
  return convertValue(getNextItem(), 4); // Uses conversion type 4 for integer array.
}

// Function to retrieve the next input item and convert it into an array of characters.
function retrieveNextCharacterArray() {
  return convertValue(getNextItem(), 6); // Uses conversion type 6 for character array.
}

// Core function to fetch the very next raw data item from the processor.
function getNextItem() {
  return dataProcessor.retrieveNext(); // Delegates to the data processor's method.
}

// Utility function to ascertain if there are additional items pending in the data stream.
function hasMoreItems() {
  return dataProcessor.hasMore(); // Delegates to the data processor's method.
}

// Sets up and returns a new data processing object with the provided input.
function initializeProcessor(inputData) {
  var processorInstance = { // Defines an object to manage input data
    dataList: inputData, // The comprehensive list of all raw input data
    currentIndex: 0, // A pointer indicating the current position within the dataList
    maximumIndex: inputData.length, // The total count of items available in dataList
    // Determines if there are still unprocessed items in the dataList.
    hasMore: function() {
      return (this.currentIndex < this.maximumIndex);
    },
    // Fetches the subsequent item from the dataList and advances the pointer.
    retrieveNext: function() {
      if (!this.hasMore()) { // Checks if the end of data has been reached
        throw "DataBoundaryExceeded No further elements available"; // Throws an error if no more data
      } else {
        var currentElement = this.dataList[this.currentIndex]; // Retrieves the item at the current index
        this.currentIndex++; // Increments the index to point to the next item
        return currentElement; // Returns the retrieved data item
      }
    }
  };
  return processorInstance; // Provides the fully configured data processor object.
}

// Outputs a given string or variable's content to the standard output console.
function printResult(content) {
  console.log(content); // Standard console logging.
}

// Sends diagnostic or debugging messages to the standard error console.
function logDebug(message) {
  console.error("debug_info:" + require("util").inspect(message, false, null)); // Uses Node.js 'util' module for inspection.
}

// This function handles various types of data conversions based on a specified type identifier.
// Conversion Type Definitions:
//   1: Converts the input item to an integer.
//   2: Splits the input string by spaces into an array of strings.
//   4: Splits the input string by spaces and maps each part to a number, resulting in an array of numbers.
//   6: Splits the input string into an array of individual characters.
//   7: Splits the input string into individual characters and maps each to a number.
//   8: Joins elements of an array into a single string, separated by spaces.
//   9: Joins elements of an array into a single string, separated by newline characters.
//   0: Joins elements of an array into a single string with no separator.
//   Default: Returns the input item without any modification if the conversion type is unrecognized or invalid.
function convertValue(item, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(item); // Parse as integer
      case 2:
        return item.split(" "); // Split by space
      case 4:
        return item.split(" ").map(Number); // Split by space and convert to numbers
      case 6:
        return item.split(""); // Split into characters
      case 7:
        return item.split("").map(Number); // Split into characters and convert to numbers
      case 8:
        return item.join(" "); // Join with space
      case 9:
        return item.join("\n"); // Join with newline
      case 0:
        return item.join(""); // Join without separator
      default:
        return item; // Fallback: return original item
    }
  } catch (error) {
    return item; // If any error occurs during conversion, return the original item.
  }
}


// This is the main function that encapsulates the primary algorithm or calculation.
function PerformCalculation() {
  var inputNumbers = retrieveNextIntegerArray(); // Retrieves an array of two integers from the input stream.
  var valueN = inputNumbers[0]; // Extracts the first integer, typically representing 'N'.
  var valueK = inputNumbers[1]; // Extracts the second integer, typically representing 'K'.
  var finalResult = 0; // Initializes a variable to accumulate the final calculated result.

  // Handles a specific edge case where K is equal to 1.
  if (valueK == 1) {
    printResult(Math.pow(valueN, 3)); // Directly prints N cubed as the result.
    return; // Exits the function early as the calculation is complete.
  }

  var loopCounter = 1; // A counter used for generating sequences of multiples.
  var evenMultiples = []; // An array to store multiples related to even conditions.
  var oddMultiples = []; // An array to store multiples related to odd conditions.

  // Checks if the value of K is an even number.
  if (valueK % 2 == 0) {
    // If K is even, populate the 'evenMultiples' array with multiples of K up to N.
    while (valueK * loopCounter <= valueN) {
      evenMultiples.push(valueK * loopCounter);
      loopCounter++;
    }
    loopCounter = 0; // Resets the counter for the next sequence generation.
    // Populate the 'oddMultiples' array with multiples related to K/2 up to N.
    while ((valueK / 2) + valueK * loopCounter <= valueN) {
      oddMultiples.push((valueK / 2) + valueK * loopCounter);
      loopCounter++;
    }
  } else {
    // If K is odd, populate the 'oddMultiples' array with multiples of K up to N.
    while (valueK * loopCounter <= valueN) {
      oddMultiples.push(valueK * loopCounter);
      loopCounter++;
    }
  }

  // Iterates from 1 up to N to perform the main calculation logic.
  for (var iterator = 1; iterator <= valueN; iterator++) {
    if (valueK % 2 == 0) { // Condition for when K is an even number.
      if (iterator % valueK == 0) {
        // If 'iterator' is a multiple of K, add the square of 'evenMultiples' array length to the result.
        finalResult += evenMultiples.length * evenMultiples.length;
      } else if (iterator % (valueK / 2) == 0) {
        // If 'iterator' is a multiple of K/2, add the square of 'oddMultiples' array length to the result.
        finalResult += oddMultiples.length * oddMultiples.length;
      }
    } else { // Condition for when K is an odd number.
      if (iterator % valueK == 0) {
        // If 'iterator' is a multiple of K, add the square of 'oddMultiples' array length to the result.
        finalResult += oddMultiples.length * oddMultiples.length;
      }
    }
  }
  printResult(finalResult); // Outputs the final computed result to the console.
}
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Global variable to hold the processed input handler
var dataProcessor;
// Array to store all lines read from stdin
var inputLines = [];

// Event listener for each line of input
inputReader.on('line', function(currentLine) {
  inputLines.push(currentLine);
});

// Event listener for when input stream closes
inputReader.on('close', function() {
  // Initialize the input handler with all collected lines
  dataProcessor = initializeInputHandler(inputLines);

  // Output a newline to stderr for formatting
  console.error("\n");

  // Record start time for performance measurement
  var startTime = new Date();

  // Execute the main application logic
  executeMainLogic();

  // Calculate elapsed time
  var endTime = new Date() - startTime;
  // Log execution time to stderr
  logDebugMessage("execution time : " + (endTime) + "ms");
  // Log memory usage to stderr
  logDebugMessage("memory usage : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

/**
 * Creates a deep copy of an object using JSON serialization.
 * @param {object} originalObject - The object to clone.
 * @returns {object} A deep copy of the original object.
 */
function createDeepCopy(originalObject) {
  return JSON.parse(JSON.stringify(originalObject));
}

/**
 * Retrieves the next input item as an integer.
 * @returns {number} The next input item converted to an integer.
 */
function getNextInteger() {
  return convertInputData(fetchNextItem(), 1);
}

/**
 * Retrieves the next input item as an array of strings, split by space.
 * @returns {string[]} The next input item split into a string array.
 */
function getNextStringArray() {
  return convertInputData(fetchNextItem(), 2);
}

/**
 * Retrieves the next input item as an array of numbers, split by space.
 * @returns {number[]} The next input item split into a number array.
 */
function getNextIntegerArray() {
  return convertInputData(fetchNextItem(), 4);
}

/**
 * Retrieves the next input item as an array of characters.
 * @returns {string[]} The next input item split into a character array.
 */
function getNextCharacterArray() {
  return convertInputData(fetchNextItem(), 6);
}

/**
 * Fetches the next raw input item from the handler.
 * @returns {string} The next raw input string.
 */
function fetchNextItem() {
  return dataProcessor.retrieveNext();
}

/**
 * Checks if there are more input items available.
 * @returns {boolean} True if more items exist, false otherwise.
 */
function hasMoreItems() {
  return dataProcessor.checkMoreItems();
}

/**
 * Initializes an input handler object with methods to navigate input lines.
 * @param {string[]} inputArray - An array of input strings.
 * @returns {object} An object with `sourceList`, `currentPosition`, `maximumCount`, `checkMoreItems`, and `retrieveNext` properties.
 */
function initializeInputHandler(inputArray) {
  var handlerObject = {
    sourceList: inputArray,
    currentPosition: 0,
    maximumCount: inputArray.length,

    /**
     * Checks if there are more items to process in the source list.
     * @returns {boolean} True if `currentPosition` is less than `maximumCount`, false otherwise.
     */
    checkMoreItems: function() {
      return (this.currentPosition < this.maximumCount);
    },

    /**
     * Retrieves the next item from the source list and advances the position.
     * Throws an error if no more items are available.
     * @returns {string} The item at the current position.
     */
    retrieveNext: function() {
      if (!this.checkMoreItems()) {
        throw "ArrayIndexOutOfBoundsException これ以上ないよ";
      } else {
        var currentItem = this.sourceList[this.currentPosition];
        this.currentPosition++;
        return currentItem;
      }
    }
  };
  return handlerObject;
}

/**
 * Prints a message to standard output.
 * @param {*} messageContent - The content to print.
 */
function printResult(messageContent) {
  console.log(messageContent);
}

/**
 * Prints a debug message to standard error, inspecting complex objects.
 * @param {*} messageContent - The content to debug.
 */
function logDebugMessage(messageContent) {
  console.error("debug:" + require("util").inspect(messageContent, false, null));
}

/**
 * Converts an input value based on a specified conversion type.
 * @param {*} inputValue - The value to convert.
 * @param {number} conversionType - The type of conversion to perform.
 *   1: Convert to integer.
 *   2: Split by space into string array.
 *   4: Split by space into number array.
 *   6: Split into character array.
 *   7: Split into character array and convert to numbers.
 *   8: Join array elements with space.
 *   9: Join array elements with newline.
 *   0: Join array elements without separator.
 * @returns {*} The converted value or the original value if conversion fails or type is unknown.
 */
function convertInputData(inputValue, conversionType) {
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
  } catch (conversionError) {
    // If an error occurs during conversion, return the original value
    return inputValue;
  }
}

/**
 * Main function containing the core logic of the program.
 * Calculates frequencies of a specific mathematical expression.
 */
function executeMainLogic() {
  // Read the number of inputs for the final output array
  var countOfInputs = getNextInteger();

  // Initialize an array to store the final results
  var resultArray = new Array(countOfInputs);

  // Create a map to store frequencies of calculated sums
  var frequencyMap = {};

  // Iterate through all possible combinations of i, j, k from 1 to 200
  for (var idxA = 1; idxA <= 200; idxA++) {
    for (var idxB = 1; idxB <= 200; idxB++) {
      for (var idxC = 1; idxC <= 200; idxC++) {
        // Calculate the sum based on the given formula
        var sumOfSquaresAndProducts = idxA * idxA + idxB * idxB + idxC * idxC + idxA * idxB + idxB * idxC + idxC * idxA;

        // If the sum is not yet in the map, initialize its count to 0
        if (frequencyMap[sumOfSquaresAndProducts] === undefined) {
          frequencyMap[sumOfSquaresAndProducts] = 0;
        }
        // Increment the count for the calculated sum
        frequencyMap[sumOfSquaresAndProducts]++;
      }
    }
  }

  // Populate the result array based on the frequency map
  // For each index from 0 to N-1, check the frequency of (index + 1)
  for (var resultIdx = 0; resultIdx < countOfInputs; resultIdx++) {
    // If the frequency for (resultIdx + 1) is not found, set it to 0
    if (frequencyMap[resultIdx + 1] === undefined) {
      resultArray[resultIdx] = 0;
    } else {
      // Otherwise, assign the found frequency
      resultArray[resultIdx] = frequencyMap[resultIdx + 1];
    }
  }

  // Print the final result array, joined by newlines
  printResult(convertInputData(resultArray, 9));
}
